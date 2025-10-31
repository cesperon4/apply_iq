interface generateAnswerPromptArgs {
  jobDescription: string;
}

export function extractJobInfoPrompt({
  jobDescription,
}: generateAnswerPromptArgs): string {
  return `
    Extract the following information from the job description below:

    Job description: """
    ${jobDescription}
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
