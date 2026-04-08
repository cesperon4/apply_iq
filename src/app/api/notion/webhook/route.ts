import { NextRequest, NextResponse } from "next/server";

//route - /app/api/notion-webhook/route.ts
import crypto from "crypto";

const NOTION_SECRET = process.env.NOTION_WEBHOOK_SECRET || "your_secret";

export async function POST(req: NextRequest) {
  const body = await req.text(); // keep as text for signature verification
  const signature = req.headers.get("notion-signature") || "";

  // 1️⃣ Verify signature (important for production)
  const hash = crypto
    .createHmac("sha256", NOTION_SECRET)
    .update(body)
    .digest("base64");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2️⃣ Parse JSON
  const payload = JSON.parse(body);
  console.log("Notion webhook received:", payload);

  // 3️⃣ Check for page.created
  if (payload.type === "page.created") {
    const pageId = payload.entity.id;
    console.log("New page created:", pageId);
    // You can fetch full page data here (Step 3)
  }

  return NextResponse.json({ ok: true });
}
