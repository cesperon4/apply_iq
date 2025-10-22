import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;
    const question = formData.get("jobQuestion") as string;
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
  4. Focus on experience from Wooard & Currant and not Pathloom.
  4. Please make sure your reply is in a format that is ready to copy and paste into application, excluding any irrelevant text.
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

    const rawMessage =
      hfResponse.choices?.[0]?.message?.content || "No response";

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

    return NextResponse.json({ message });
  } catch (error) {
    console.error("💥 Error generating cover letter:", error);
    return NextResponse.json(
      {
        coverLetter:
          "An error occurred while generating the cover letter. Please try again later.",
      },
      { status: 500 }
    );
  }
}
