import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/** Single source of truth for Ollama structured output + Zod validation. */
export const coverLetterOutputSchema = z.object({
  job_description_years_of_experience: z
    .number()
    .describe("Years of experience asked for in the job posting, or 0 if not stated."),
  job_description_company: z
    .string()
    .describe(
      'Hiring company or product name exactly as in the job description (e.g. the place you are applying to). If unclear, use empty string "". Never use placeholder words like Default, Company, Unknown, or N/A here.',
    ),
  job_description_position: z
    .string()
    .describe("Job title from the posting, or empty string."),
  job_compensation: z
    .string()
    .describe("Compensation if stated in posting, else empty string."),
  job_tech_stack: z
    .array(z.string())
    .describe("Tech keywords from the job description."),
  /** Full cover letter text (greeting through sign-off) as one string. */
  body: z
    .string()
    .describe(
      "Full cover letter. Past employers must match EXCERPTS only (e.g. Woodard & Curran). Never claim you worked at Default unless that exact employer appears in excerpts.",
    ),
});

export type CoverLetterOutput = z.infer<typeof coverLetterOutputSchema>;

/** JSON Schema for Ollama `format` (object, not string). */
export const coverLetterJsonSchema = zodToJsonSchema(coverLetterOutputSchema, {
  $refStrategy: "none",
}) as Record<string, unknown>;
