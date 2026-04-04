import type { AppliedJobsArgs } from "@/types/notion.types";

function num(raw: unknown): number {
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/** Normalize model output (strings, extra keys like `sort`) into our Notion query args. */
export function parseAppliedJobsArgs(raw: unknown): AppliedJobsArgs {
  if (raw == null || typeof raw !== "object") {
    return { limit: 0 };
  }
  const o = raw as Record<string, unknown>;

  const limit = num(o.limit);

  let sort_property: string | undefined =
    typeof o.sort_property === "string" ? o.sort_property : undefined;
  let sort_direction: string | undefined =
    typeof o.sort_direction === "string" ? o.sort_direction : undefined;

  const company: string | undefined =
    typeof o.company === "string" ? o.company : undefined;

  const technology: string | undefined =
    typeof o.technology === "string" ? o.technology : undefined;

  if (typeof o.sort === "string") {
    const parts = o.sort.trim().split(/\s+/);
    if (parts.length >= 1) sort_property = parts[0];
    if (parts.length >= 2) sort_direction = parts.slice(1).join(" ");
  }

  if (sort_direction === "desc") sort_direction = "descending";
  if (sort_direction === "asc") sort_direction = "ascending";

  return {
    limit,
    sort_property,
    sort_direction,
    company,
    technology,
  };
}
