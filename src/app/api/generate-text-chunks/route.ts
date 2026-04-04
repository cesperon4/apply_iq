import { NextRequest, NextResponse } from "next/server";
import { chunkResumeText, prepareResumeForEmbeddings } from "@/lib/resume-text";

export const runtime = "nodejs";

async function extractRawText(file: File): Promise<string> {
  if (file.type === "text/plain") {
    return file.text();
  }
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }
  throw new Error("Unsupported file type. Use PDF or TXT.");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file", data: "", chunks: [] },
        { status: 400 },
      );
    }

    let raw = await extractRawText(file);
    raw = raw.replace(/www\.enhancv\.com[\s\S]*/g, "");

    if (!raw.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "No text found in file.",
          data: "",
          chunks: [],
        },
        { status: 422 },
      );
    }

    const {
      cleaned,
      text: textWithSections,
      sections,
    } = prepareResumeForEmbeddings(raw);

    const wordChunks = chunkResumeText(cleaned, 150, 20);


    return NextResponse.json({
      success: true,
      message: "Resume extracted, cleaned, and chunked",
      data: cleaned,
      text: textWithSections,
      sections,
      chunks: wordChunks,
    });
  } catch (e) {
    console.error("generate-text-chunks:", e);
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Extraction failed",
        data: "",
        chunks: [],
      },
      { status: 500 },
    );
  }
}
