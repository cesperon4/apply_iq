import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { extractJobInfoPrompt } from "@/lib/prompts/extract-job-info-prompt";

// type extractionResponseKeys = "company" | "postion" | "years_experience";

// interface extractionResponseKeys {
//   company: string;
//   postion: string;
//   years_experience: string;
// }

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobDescription = formData.get("jobDescription") as string;
    if (!jobDescription)
      return NextResponse.json({
        coverLetter: "Resume and question are required",
      });

    const prompt = extractJobInfoPrompt({
      jobDescription,
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

    // Optional: fallback for bad output
    const match = rawMessage.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};

    return NextResponse.json({ parsed });
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
