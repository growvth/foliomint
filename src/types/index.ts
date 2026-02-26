import { z } from 'zod';

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
  location: z.string().optional(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  bullets: z.array(z.string()).optional(),
});

export const resumeDataSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Project = z.infer<typeof projectSchema>;

export type SubscriptionStatus = 'free' | 'active' | 'cancelled' | 'past_due';

export type ThemePreference = 'light' | 'dark' | 'system';

export type PortfolioTheme = 'classic' | 'neubrutalism';

export interface UserPreferences {
  theme: ThemePreference;
}

export interface PortfolioContent extends ResumeData {
  customSections?: Array<{
    title: string;
    content: string;
  }>;
}
