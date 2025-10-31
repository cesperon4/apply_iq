import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

interface coverLetterPromptArgs {
  resume: string;
  jobDescription: string;
}

const CoverLetterSchema = z.object({
  greeting: z.string(),
  body: z.string(),
  closing: z.string(),
});

const schemaJson = zodToJsonSchema(CoverLetterSchema);

export const coverLetterPrompt = ({
  resume,
  jobDescription,
}: coverLetterPromptArgs): string => {
  return `You are an expert career counselor and cover letter writer.

  Your task: Write a professional 4-paragraph cover letter **using only verified information from the RESUME**.  
  Use the JOB DESCRIPTION **only to determine relevance and tone**, not to invent or assume facts.

  RESUME (Ground Truth — only use this for factual content):
  ${resume}

  JOB DESCRIPTION (Reference — use only for context and relevance):
  ${jobDescription}

  STRICT INSTRUCTIONS:
  1. All experience, skills, and achievements **must come from the RESUME**.  
    - Never infer or assume years of experience from the job description.  
    - If the resume lacks a detail (e.g. exact years), **omit or generalize** naturally (e.g. "with experience in..." instead of "with 5+ years...").
  2. Tailor the letter to the role described in the JOB DESCRIPTION, but **do not fabricate** qualifications.
  3. Write in a professional, confident, and concise tone.
  4. Address it to "Hiring Manager" unless a specific name is given.
  5. End with a brief, confident closing sentence.

  OUTPUT FORMAT:
  Respond as JSON matching this schema: ${JSON.stringify(schemaJson)}

  Example style:
  {
    "greeting": "Dear Hiring Manager,",
    "body": "I'm excited to apply for the Frontend Engineer role...",
    "closing": "Thank you for your time and consideration..."
  }`;
};
