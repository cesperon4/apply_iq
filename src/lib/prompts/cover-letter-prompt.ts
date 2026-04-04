import { coverLetterJsonSchema } from "@/lib/schemas/cover-letter-output";

type promptArgs = {
  /** Reserved: inject full resume text into the prompt when re-enabled. */
  resume?: string;
  excerpts?: string;
  job_description: string;
  /** When set, close the letter with this exact name (two lines: Best regards, / name). */
  candidate_name?: string;
};

export const coverLetterPrompt = ({
  resume: _resume,
  excerpts,
  job_description,
  candidate_name,
}: promptArgs): string => {
  void _resume;

  const ragBlock = excerpts?.trim()
    ? `
RELEVANT RESUME EXCERPTS (ground truth for facts — retrieved from the candidate's resume index):
${excerpts}`
    : "";

  const excerptRules = excerpts?.trim()
    ? `
**EXCERPTS ARE MANDATORY TO USE:** The RELEVANT RESUME EXCERPTS block is the primary source of concrete detail. Your \`body\` must explicitly draw on it: name real employers, clients, or projects that appear there; reference specific technologies, systems, or outcomes (e.g. metrics, regions, agency names) when they appear in excerpts. Do **not** write a short generic letter that only restates the job title—substantiate claims with multiple details pulled from the excerpts (aim for **at least 4–6 distinct factual anchors** drawn from excerpts: names, tools, domains, or outcomes).`
    : "";

  const signOffRules = candidate_name?.trim()
    ? `
**SIGN-OFF (required):** End \`body\` with two lines exactly in this form (use this full name):
Best regards,
${candidate_name.trim()}
Never use bracket placeholders like [Your Name].`
    : `
**SIGN-OFF:** End \`body\` with "Best regards," or "Sincerely," then a new line and your full name **only** if a real full name appears in the EXCERPTS; otherwise end with "Best regards," or "Sincerely," alone—never \`[Your Name]\` or similar.`;

  return `You are an expert career counselor and cover letter writer.

Task: Write a **substantial** professional cover letter using **only** facts supported by the **RELEVANT RESUME EXCERPTS** below (when present). The \`body\` must be **at least ~400 words** (aim **450–650 words**). **Under-length** letters that read like a single short paragraph are unacceptable—use **five to seven paragraphs** (greeting line, then several body paragraphs, then closing). Structure: opening (fit + motivation), **two or more paragraphs** with concrete stories from excerpts (employers, tools, outcomes), one paragraph on collaboration or customer impact if supported by excerpts, closing motivation, then sign-off. Use the JOB DESCRIPTION to match **role type** and tone—do not invent employers, metrics, tools, or responsibilities that are not grounded in the excerpts.

${excerptRules}
${signOffRules}

${ragBlock}

JOB DESCRIPTION (match tone and requirements; quote company name only if it appears clearly here):
${job_description}

STRICT INSTRUCTIONS:
1. **Facts:** Skills, employers, outcomes, and numbers must come only from the EXCERPTS above. If something is unclear, generalize safely (e.g. "experience with…") rather than guessing.
2. **Grounding in excerpts:** When EXCERPTS are provided, at least **half** of the body paragraphs should cite specific, checkable details from them (company or agency names, product or project names, stack items, or quantified results). Avoid vague lines like "various projects" or "software development" without tying them to excerpt content.
3. **Banned filler (never output these):** Do not use bracketed fake sources such as \`[Job Posting Platform]\`, \`[Company]\`, \`[Location]\`, or "as advertised on [any site]." Do not mention Indeed, LinkedIn, or job boards unless the JOB DESCRIPTION explicitly names them.
4. **"Default" vs employers:** The JOB DESCRIPTION may use **Default** as the hiring company or product. Do **not** treat **Default** as your past employer. **Past job titles** must match EXCERPTS only (e.g. software engineer, developer)—never write **"As a [Support Engineer] at [Woodard & Curran]"** by copying the **posting's title** into your past role. Say instead: "In my engineering role at Woodard & Curran, I …" and describe support-like work without falsely claiming your past title was Support Engineer unless EXCERPTS say so. For the opening line, prefer **"this Support Engineer opportunity"** or **"this role"** over repeating **"at Default"** if it sounds awkward.
5. **Company name (letter prose):** Do not use generic placeholders like "Company" as a real employer. If the posting employer is unclear, write neutrally ("this role", "the team", "your organization").
6. **Role fit:** Mirror the job: if the role is support, customer success, or solutions, emphasize troubleshooting, communication, reliability, and user impact—not only backend architecture. If it is engineering-heavy, emphasize building and systems. Bridge past titles to this role in one clear sentence when they differ—without inventing titles.
7. **Depth over brevity:** Prefer **several** concrete examples (from excerpts) over one thin paragraph. Develop **multiple** employers or projects when excerpts support it.
8. **Readability:** Use **multiple paragraphs** in \`body\` with a **blank line** between each paragraph (in JSON, encode paragraph breaks as newline characters). Varied sentence length; no buzzword stuffing. Paraphrase excerpts into natural letter prose—do not paste bullet text verbatim.
9. **Tone:** Professional, warm, confident; open with "Dear Hiring Manager," unless the posting names a contact.
10. **Sign-off line:** The line after "Sincerely," or "Best regards," must be **only** a real person's **first and last name** (two words, e.g. Jane Doe). **Never** use a fragment of an agency or project name from EXCERPTS as your name (e.g. never "Water Supply", "Bay Area", "Conservation", "Engineering", or "Default").
11. **Closing:** Thank the reader, express interest in next steps, then the sign-off per **SIGN-OFF** rules above—**never** \`[Your Name]\`.

OUTPUT FORMAT:
Respond with **only** valid JSON matching this schema (same shape Ollama will enforce). Put the **entire** cover letter (greeting through sign-off) in \`body\` as one string. Extract \`job_description_company\`, \`job_description_position\`, \`job_compensation\`, \`job_description_years_of_experience\`, and \`job_tech_stack\` from the JOB DESCRIPTION where possible; use reasonable defaults (empty string, 0, []) only if missing.

Schema:
${JSON.stringify(coverLetterJsonSchema)}`;
};
