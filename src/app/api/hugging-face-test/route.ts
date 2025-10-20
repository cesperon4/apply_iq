import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

export async function POST(req: NextRequest) {
  try {
    const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
    const chatCompletion = await client.chatCompletion({
      provider: "hyperbolic",
      model: "Qwen/Qwen3-Next-80B-A3B-Instruct",
      messages: [
        {
          role: "user",
          content:
            "Please write me a cover letter for a job at google my name is Christian Esperon and I am a software engineer and have been for 3 + years, make this cover letter professional and ready to copy and paste your response directly to the application, also please don't include any place holders.",
        },
      ],
    });

    const message =
      chatCompletion.choices?.[0]?.message?.content || "No response";
    console.log("message: ", message);
    return NextResponse.json({ message });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
