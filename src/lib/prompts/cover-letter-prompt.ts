import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

interface coverLetterPromptArgs {
  resume: string;
  job_description: string;
}

const CoverLetterSchema = z.object({
  greeting: z.string(),
  body: z.string(),
  closing: z.string(),
});

const schemaJson = zodToJsonSchema(CoverLetterSchema);

export const coverLetterPrompt = ({
  resume,
  job_description,
}: coverLetterPromptArgs): string => {
  return `You are an expert career counselor and cover letter writer.

Task: Write a professional 4-paragraph cover letter **using only verified information from the RESUME**.  
Use the JOB DESCRIPTION **to guide relevance, tone, and emphasis**, but do **not** invent or assume facts.

RESUME (Ground Truth — only use this for factual content):
${resume}

JOB DESCRIPTION (Reference — use only for context and relevance):
${job_description}

STRICT INSTRUCTIONS:
1. Base all experience, skills, and achievements **solely on the RESUME**.  
   - Do not infer details not present (e.g., years, metrics).  
   - If the resume lacks a detail, **generalize naturally** (e.g., "experienced in..." instead of "5+ years in...").
2. Tailor phrasing and examples to the role, but **do not copy resume sentences verbatim**.  
   - Use natural, flowing language that reads like a cover letter, not a bullet list.
3. Write in a professional, confident, and concise tone.
4. Address it to "Hiring Manager" unless a specific name is given.
5. End with a brief, confident closing sentence.

OUTPUT FORMAT:
Respond as JSON matching this schema: ${JSON.stringify(schemaJson)}

Example style:
{
  "greeting": "Dear Hiring Manager,",
  "body": "I'm excited to apply for the Frontend Engineer role. My experience building React applications and optimizing user interfaces aligns closely with your needs...",
  "closing": "Thank you for your time and consideration; I look forward to the opportunity to contribute."
}`;
};
