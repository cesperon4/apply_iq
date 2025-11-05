import { NextRequest, NextResponse } from "next/server";
// import { InferenceClient } from "@huggingface/inference";
import { generateAnswerPrompt } from "@/lib/prompts/generate-answer-prompt";

import ollama from "ollama";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const GeneratedAnswerSchema = z.object({
  body: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resume = formData.get("resume") as File;
    const job_description = formData.get("job_description") as string;
    const question = formData.get("jobQuestion") as string;

    if (!resume || !question)
      return NextResponse.json({
        coverLetter: "Resume and question are required",
      });

    const resumeText = await resume.text();
    const cleanResume = resumeText.replace(/\s+/g, " ").trim();

    const prompt = generateAnswerPrompt({
      resume: cleanResume,
      job_description,
      question,
    });

    const result = await ollama.chat({
      model: "qwen3:latest",
      messages: [{ role: "user", content: prompt }],
      format: zodToJsonSchema(GeneratedAnswerSchema), // optional structured output
    });

    const data = GeneratedAnswerSchema.parse(
      JSON.parse(result.message.content)
    );

    return NextResponse.json({
      data: data,
      success: true,
      message: "Answer generated successfully",
    });

    //Ollama call

    //Huggin Face implementation
    // const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

    // const hfResponse = await client.chatCompletion({
    //   provider: "hyperbolic",
    //   model: "meta-llama/Llama-3.3-70B-Instruct",
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    // });

    // const rawMessage =
    //   hfResponse.choices?.[0]?.message?.content || "No response";

    // const message = rawMessage
    //   .replace(/<\|.*?\|>/g, "")
    //   .replace(/^\s*analysis\s*/i, "")
    //   .replace(/^\s*final\s*/i, "")
    //   // split into paragraphs
    //   .split(/\n{2,}/)
    //   .map((para) => `<p>${para.trim()}</p>`)
    //   .join("");

    // return NextResponse.json({ message });
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
