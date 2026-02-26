import Groq from 'groq-sdk';

import { ParseError } from '@/lib/errors';
import { resumeDataSchema, type ResumeData } from '@/types';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new ParseError('Groq API key is not configured');
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
  "projects": [{"name": "string", "description": "string", "url": "string or omit", "technologies": ["string"] or omit, "bullets": ["string"] or omit}],
  "certifications": ["string"] or omit,
  "languages": ["string"] or omit
}

Rules:
- Map all section headings semantically (e.g., "Work History" → experience, "Technical Skills" → skills)
- Normalize dates to readable formats (e.g., "Jan 2023", "2023")
- Keep bullet points concise
- If a section is missing, use empty arrays
- Return ONLY the JSON object, no extra text

Resume text:
---
${rawText}
---`;
}

export async function extractResumeFields(rawText: string): Promise<ResumeData> {
  const groq = getGroqClient();
  const prompt = buildExtractionPrompt(rawText);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const json = completion.choices[0]?.message?.content;

    if (!json) {
      throw new ParseError('No response received from Groq');
    }

    const parsed = JSON.parse(json);
    return resumeDataSchema.parse(parsed);
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
