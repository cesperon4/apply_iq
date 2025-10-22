import { InferenceClient } from "@huggingface/inference";

export async function generateAnswer(
  resume: File | null,
  jobDescription: string,
  question: string
): Promise<string> {
  console.log("hello");
  if (!resume || !question) return "Resume and question are required";

  const resumeText = await resume.text();
  const cleanResume = resumeText.replace(/\s+/g, " ").trim();

  const prompt = `You are an expert career counselor and understand exactly what tech companies are looking for when it comes to application questions asked.
  use the provided resume, job description along with the specific question being asked to create a short and concise answer that will attract a hiring managers
  interest.
  
  RESUME: ${cleanResume}

  JOB DESCRIPTION: ${jobDescription}

  Question: ${question}

  INSTRUCTIONS:
  1. Write a short and concise answer to the question asked utilizing information from the resume and job description.
  2. Show enthusiasm and professionalism.
  3. Highlight resume experience where you see fit.
  `;

  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

  const hfResponse = await client.chatCompletion({
    provider: "hyperbolic",
    model: "meta-llama/llama-3.1-8b-instruct",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  console.log("hfResponse: ", hfResponse);

  const rawMessage = hfResponse.choices?.[0]?.message?.content || "No response";

  console.log("raw message: ", rawMessage);

  const message = rawMessage
    .replace(/<\|.*?\|>/g, "")
    .replace(/^\s*analysis\s*/i, "")
    .replace(/^\s*final\s*/i, "")
    // split into paragraphs
    .split(/\n{2,}/)
    .map((para) => `<p>${para.trim()}</p>`)
    .join("");

  console.log("job answer: ", message);

  return message;
}
