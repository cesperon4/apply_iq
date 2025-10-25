import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { generateAnswerPrompt } from "@/lib/prompts/generate-answer-prompt";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;
    const question = formData.get("jobQuestion") as string;
    if (!resume || !question)
      return NextResponse.json({
        coverLetter: "Resume and question are required",
      });

    const resumeText = await resume.text();
    const cleanResume = resumeText.replace(/\s+/g, " ").trim();

    const prompt = generateAnswerPrompt({
      resume: cleanResume,
      jobDescription,
      question,
    });

    const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

    const hfResponse = await client.chatCompletion({
      provider: "hyperbolic",
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawMessage =
      hfResponse.choices?.[0]?.message?.content || "No response";

    const message = rawMessage
      .replace(/<\|.*?\|>/g, "")
      .replace(/^\s*analysis\s*/i, "")
      .replace(/^\s*final\s*/i, "")
      // split into paragraphs
      .split(/\n{2,}/)
      .map((para) => `<p>${para.trim()}</p>`)
      .join("");

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
