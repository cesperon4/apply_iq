import { type Message, type Tool } from "ollama";
import { ollama } from "@/lib/clients/ollama";
import { toolHandlers } from "@/ai/tools/tool-handlers";

/** Ollama requires `content: string`; callers may omit empty turns in case a run occurs
 * with no message and a tool call. */
export type ChatInputMessage = Omit<Message, "content"> & { content?: string };

function parseToolArgs(call: { function: { arguments: unknown } }): unknown {
  const raw = call.function.arguments;
  if (typeof raw === "string") return JSON.parse(raw || "{}");
  if (raw && typeof raw === "object") return raw;
  return {};
}

/** When the model returns empty content, format the last search_jobs tool payload. */
function replyFromLastToolJson(messages: Message[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "tool" || !m.content) continue;
    try {
      const parsed = JSON.parse(m.content) as { job_results?: unknown };
      const jobs = parsed.job_results;
      if (!Array.isArray(jobs)) continue;
      if (jobs.length === 0) {
        return "No job applications were found in your Notion database.";
      }
      const maxDesc = 12_000;
      const lines = jobs.map((j: Record<string, unknown>, idx: number) => {
        const company = String(j.company ?? "—");
        const position = String(j.position ?? "—");
        const date = j.date_applied != null ? String(j.date_applied) : "";
        let desc = String(j.job_description ?? "").trim();
        if (desc.length > maxDesc) {
          desc = `${desc.slice(0, maxDesc)}\n\n[Description truncated]`;
        }
        const descBlock = desc
          ? `\n**Job description:**\n${desc}`
          : "\n**Job description:** (none stored)";
        return [
          `### ${idx + 1}. ${position} — ${company}`,
          date ? `**Date applied:** ${date}` : "",
          descBlock,
        ]
          .filter(Boolean)
          .join("\n");
      });
      return `Here are the jobs from your database:\n\n${lines.join("\n\n---\n\n")}`;
    } catch {
      continue;
    }
  }
  return null;
}

function finalAssistantText(msg: Message, messages: Message[]): string {
  const content = (msg.content ?? "").trim();
  if (content) return msg.content ?? "";

  const thinking = (msg as Message & { thinking?: string }).thinking?.trim();
  if (thinking) return thinking;

  const fromTool = replyFromLastToolJson(messages);
  if (fromTool) return fromTool;

  return "I couldn't produce a text reply. Please try again or check the server logs.";
}

export async function runWithTools(
  model: string,
  inputMessages: ChatInputMessage[],
  tools: Tool[],
) {
  const messages: Message[] = inputMessages.map((m) => ({
    ...m,
    content: m.content ?? "",
  }));

  const maxRounds = 8;
  for (let i = 0; i < maxRounds; i++) {
    const response = await ollama.chat({
      model,
      messages,
      tools,
      think: false,
    });

    const msg = response.message;
    if (!msg.tool_calls?.length) {
      return finalAssistantText(msg, messages);
    }

    messages.push({
      role: "assistant",
      content: msg.content ?? "",
      tool_calls: msg.tool_calls,
    });

    for (const call of msg.tool_calls) {
      console.log("envoking call: ", call);
      const name = call.function.name;
      const args = parseToolArgs(call);
      console.log("passing args: ", args);
      const fn = toolHandlers[name];
      if (!fn) {
        messages.push({
          role: "tool",
          content: JSON.stringify({ error: `Unknown tool: ${name}` }),
        });
        continue;
      }
      const result = await fn(args);
      messages.push({
        role: "tool",
        content: result,
      });
    }
  }
  throw new Error("Tool loop limit exceeded");
}
