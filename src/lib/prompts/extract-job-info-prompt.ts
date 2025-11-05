interface generateAnswerPromptArgs {
  job_description: string;
}

export function extractJobInfoPrompt({
  job_description,
}: generateAnswerPromptArgs): string {
  return `
    Extract the following information from the job description below:

    Job description: """
    ${job_description}
    """

    Return a JSON object with keys:
    {
    "company": "company name",
    "position": "position title",
    "years_experience": "required years of experience as a number or range"
    }

    Do not return anything else.
    `;
}
