import { z } from "zod";

const tech = z.object({ name: z.string() });

export const GetNotionSearchArgs = z.object({
  company: z.string(),
  position: z.string(),
  job_description: z.string(),
  years_of_experience: z.string(),
  compensation: z.string(),
  tech_stack: z.array(tech),
});
