import { NextResponse } from "next/server";
import { runWithTools, type ChatInputMessage } from "@/ai/tools/agent";
import { tools } from "@/ai/tools/notion/definition";

type IncomingMsg = { role?: string; content?: string };

const CHAT_SYSTEM_PROMPT = `You are ApplyIQ, a helpful assistant for job search and applications.

**Tools (how to use them)**
- The runtime invokes tools for you. **Never** write JSON tool calls, \`{"name": "search_jobs", ...}\`, or "here is the function call" in your reply—those are not executed. Use the model's **tool-calling** mechanism only; then answer in plain language after tool results arrive.
- When the user asks about jobs they applied to, call \`search_jobs\` with \`limit\` set to how many jobs they asked for (e.g. "3 most recent" → limit: 3). For recency, use \`sort_property: "date_applied"\` and descending order (newest first) when supported.

**After \`search_jobs\` returns JSON**
- Answer using **only** the fields in that JSON (\`job_results\`). Do not invent companies, roles, or descriptions.
- Each job may include \`tech_stack\`: an array of objects with a \`name\` field. If the user asks for **most common / most used technologies across** those jobs, count occurrences of each technology **name** across all returned jobs' \`tech_stack\` arrays, then report the top ones (with counts if helpful). \`search_jobs\` does not pre-aggregate—you compute this from the returned rows.
- If they asked for **job descriptions**, include the full \`job_description\` text for each job (or clearly labeled excerpts if they asked for a summary only).
- Format as a **numbered list** when listing jobs. For each job use clear labels, for example:
  1. **Company:** … **Role:** … **Date applied:** … **Job description:** …
- Do **not** respond with generic industry analysis, "competitiveness," or broad insights unless the user explicitly asked for analysis or comparison. Do not substitute a lecture when they asked for a concrete list with descriptions.
- Keep the reply focused on what they requested.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const model = typeof body.model === "string" ? body.model : "qwen3:latest";
    const raw = body.messages;
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const mapped: ChatInputMessage[] = (raw as IncomingMsg[]).map((m) => {
      const role =
        m.role === "assistant" || m.role === "system" || m.role === "user"
          ? m.role
          : "user";
      return {
        role,
        content: typeof m.content === "string" ? m.content : "",
      };
    });

    const hasSystem = mapped.some((m) => m.role === "system");
    const messages: ChatInputMessage[] = hasSystem
      ? mapped
      : [{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...mapped];

    console.log("[api/chat]");
    const reply = await runWithTools(model, messages, tools);

    console.log("reply: ", reply);
    return NextResponse.json({ reply });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Chat failed";
    console.error("[api/chat]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
