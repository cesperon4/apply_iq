interface coverLetterPromptArgs {
  resume: string;
  jobDescription: string;
}

export const coverLetterPrompt = ({
  resume,
  jobDescription,
}: coverLetterPromptArgs): string => {
  return `You are an expert career counselor and cover letter writer. Create a professional, personalized cover letter based on the following resume and job description.
Generate only the body of the letter, starting directly with the greeting: "Dear Hiring Manager"

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Write a compelling 3 paragraph cover letter tailored to the role.
2. Use examples from the resume that match job requirements.
3. Show enthusiasm and professionalism.
4. Address it to "Hiring Manager" unless a specific name is given.
5. End with a confident closing.

COVER LETTER:`;
};
