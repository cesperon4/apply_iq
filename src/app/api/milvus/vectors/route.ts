import { NextRequest, NextResponse } from "next/server";
import { milvusClient } from "@/lib/clients/milvus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection_name, embeddings } = body;

    if (!Array.isArray(embeddings)) {
      return NextResponse.json(
        { error: "Expected body.rows or body.embeddings to be an array" },
        { status: 400 },
      );
    }

    const res = await milvusClient.insert({
      collection_name: collection_name,
      data: embeddings,
    });

    if (res.status.code !== 0)
      throw new Error(res.status.reason || "Milvus insert failed");

    return NextResponse.json({
      data: res.IDs,
      success: true,
      message: "success",
    });
  } catch (err) {
    console.log("POST[api/vectors]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Insert failed" },
      { status: 500 },
    );
  }
}
