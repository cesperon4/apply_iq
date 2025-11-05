interface generateAnswerPromptArgs {
  resume: string;
  job_description: string;
  question: string;
}

export function generateAnswerPrompt({
  resume,
  job_description,
  question,
}: generateAnswerPromptArgs): string {
  return `You are an expert career counselor and understand exactly what tech companies are looking for when it comes to application questions asked.
  use the provided resume, job description along with the specific question being asked to create a short and concise answer that will attract a hiring managers
  interest.
  
  RESUME: ${resume}

  JOB DESCRIPTION: ${job_description}

  Question: ${question}

  INSTRUCTIONS:
  1. Write a short and concise answer to the question asked utilizing information from the resume and job description.
  2. Show enthusiasm and professionalism.
  3. Highlight resume experience where you see fit.
  4. Focus on experience from Wooard & Currant and not Pathloom.
  4. Please make sure your reply is in a format that is ready to copy and paste into application, excluding any irrelevant text.
  `;
}
