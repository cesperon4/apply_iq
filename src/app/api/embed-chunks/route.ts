import { NextRequest, NextResponse } from "next/server";
import { embedChunks } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chunks = body.chunks as unknown;
    if (!Array.isArray(chunks) || !chunks.every((c) => typeof c === "string")) {
      return NextResponse.json(
        { error: "Expected JSON body: { chunks: string[] }" },
        { status: 400 },
      );
    }
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "chunks must be a non-empty string array" },
        { status: 400 },
      );
    }

    const embeddings = await embedChunks(chunks);
    return NextResponse.json({
      model: "nomic-embed-text",
      count: embeddings.length,
      embeddings,
    });
  } catch (e) {
    console.error("embed-chunks:", e);
    return NextResponse.json(
      { error: "Failed to compute embeddings. Is Ollama running?" },
      { status: 500 },
    );
  }
}
