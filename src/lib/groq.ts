import Groq from 'groq-sdk';

import { ParseError } from '@/lib/errors';
import { resumeDataSchema, type ResumeData } from '@/types';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new ParseError('Resume parsing is not available right now. Please try again later.');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function buildExtractionPrompt(rawText: string): string {
  return `You are a resume parser. Extract structured data from the following resume text and return ONLY valid JSON matching this schema:

{
  "name": "string",
  "profileImageUrl": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "website": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "bio": "string or null (professional summary/objective)",
  "skills": ["string"],
  "experience": [{"company": "string", "role": "string", "startDate": "string", "endDate": "string or omit if current", "bullets": ["string"], "location": "string or omit"}],
  "education": [{"institution": "string", "degree": "string", "field": "string or omit", "startDate": "string", "endDate": "string or omit", "gpa": "string or omit"}],
  "projects": [{"name": "string", "description": "string or null", "url": "string or omit", "technologies": ["string"] or omit, "bullets": ["string"]}],
  "certifications": ["string"] or omit,
  "languages": ["string"] or omit,
  "awards": ["string"] or omit,
  "extracurricular": [{"title": "string", "bullets": ["string"]}] or omit,
  "otherSections": [{"title": "string", "bullets": ["string"]}] or omit
}

Rules:
- The "name" field MUST be the person's full name (e.g., "John Doe"), not a section heading like "Contact", "Profile", "About", etc.
- "profileImageUrl" is optional and usually unavailable in resume text exports. Use null unless an explicit personal image URL is present.
- When the resume comes from LinkedIn or similar, the name is usually the prominent personal name at the top of the document. Use that as "name".
- Do NOT set "name" to labels or entire sidebars such as "Contact", "Profile", or other section titles.
- Contact fields ("email", "phone", "location", "website", "linkedin", "github") should come from explicit contact/profile info, not from project descriptions.
- Set "website" ONLY when the URL is clearly the person's own site/portfolio/homepage/blog.
- Do NOT use a project/product/company URL as "website" unless the resume explicitly states it is the person's site.
- If a URL belongs to a specific project, place it in that project's "url" field instead.
- If "website" is ambiguous, return null.
- Map all section headings semantically (e.g., "Work History" → experience, "Technical Skills" → skills)
- Normalize dates to readable formats (e.g., "Jan 2023", "2023")
- Keep bullet points concise
- If a section is missing, use empty arrays
- PROJECTS (critical): For EVERY project, you MUST populate "bullets" with one entry per bullet line from the resume. Do not merge multiple bullets into "description".
- PROJECTS: "description" is optional — at most ONE short sentence (or null). Never paste an entire bullet list into "description".
- PROJECTS: Put stack/tech keywords in "technologies" only when the resume lists them as technologies for that project; otherwise omit "technologies".
- AWARDS: Map sections titled Awards, Honors, Achievements, Recognition to "awards" as a flat list of strings.
- EXTRACURRICULAR: Map sections titled Extracurricular, Activities, Leadership, Volunteering (when not a job) to "extracurricular" as subsections: each subsection has its own "title" and "bullets".
- OTHER SECTIONS: If the resume has a labeled section that does not fit above (e.g., Publications, Patents, Volunteer, Courses), put it in "otherSections" as {"title": "<section heading>", "bullets": [...]}. Prefer first-class fields when obvious.
- Return ONLY the JSON object, no extra text

Resume text:
---
${rawText}
---`;
}

function sanitizeWebsiteField(data: Record<string, unknown>, rawText: string): Record<string, unknown> {
  const website = typeof data.website === 'string' ? data.website.trim() : null;
  if (!website) return data;

  const projects = Array.isArray(data.projects) ? data.projects : [];
  const projectUrls = new Set(
    projects
      .map((project) =>
        project && typeof project === 'object' && typeof (project as { url?: unknown }).url === 'string'
          ? (project as { url: string }).url.trim()
          : null,
      )
      .filter((url): url is string => Boolean(url)),
  );

  if (!projectUrls.has(website)) {
    return data;
  }

  // If the same URL appears as a project URL and there is no explicit "website/homepage/portfolio" cue near it,
  // prefer leaving website empty to avoid misclassifying project links as personal websites.
  const escapedWebsite = website.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const websitePattern = new RegExp(
    `(website|portfolio|homepage|personal\\s+site|blog)\\s*[:\\-]?\\s*${escapedWebsite}`,
    'i',
  );

  if (!websitePattern.test(rawText)) {
    data.website = null;
  }

  return data;
}

/** When the model merges bullets into description, split on semicolons as a generic recovery step. */
function normalizeProjectBullets(data: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(data.projects)) return data;

  data.projects = data.projects.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const p = item as Record<string, unknown>;
    const bullets = Array.isArray(p.bullets)
      ? p.bullets.map((b) => String(b).trim()).filter(Boolean)
      : [];
    const desc = typeof p.description === 'string' ? p.description.trim() : '';

    if (bullets.length === 0 && desc.includes(';')) {
      const parts = desc.split(';').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return { ...p, bullets: parts, description: null };
      }
    }

    return { ...p, bullets };
  });

  return data;
}

export async function extractResumeFields(rawText: string): Promise<ResumeData> {
  const groq = getGroqClient();
  const prompt = buildExtractionPrompt(rawText);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'groq/compound-mini',
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const json = completion.choices[0]?.message?.content;

    if (!json) {
      throw new ParseError('No response received from Groq');
    }

    const parsed = JSON.parse(json) as Record<string, unknown>;
    const sanitized = normalizeProjectBullets(sanitizeWebsiteField(parsed, rawText));
    return resumeDataSchema.parse(sanitized);
  } catch (error) {
    if (error instanceof ParseError) throw error;

    if (error instanceof Groq.APIError && error.status === 429) {
      throw new ParseError(
        'AI parsing is temporarily unavailable due to rate limits. Your resume text has been saved for manual editing.',
      );
    }

    throw new ParseError(
      `Failed to parse resume with AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
