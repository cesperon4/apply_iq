import { NextResponse } from "next/server";
import { milvusClient } from "@/lib/clients/milvus";

export async function GET() {
  const res = await milvusClient.listCollections();

  return NextResponse.json({
    data: res,
    success: true,
    message: "success",
  });
}
