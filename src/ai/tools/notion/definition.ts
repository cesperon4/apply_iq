import type { Tool } from "ollama";

export const tools = [
  {
    type: "function",
    function: {
      name: "search_jobs",
      description:
        "List full job application records from Notion (job_description, company, position, date_applied, tech_stack, etc.). Use when the user wants **details**: job text, companies, roles, descriptions, or a readable list of applications. For 'N most recent' applications, set limit to N and sort_property to date_applied (newest first). **Do not use** when the main question is **how many jobs** mention a technology, tech frequency, or counts across applications—use search_tech_occurrences instead. Does not pre-compute tech statistics.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description:
              "How many jobs to return (e.g. 4 for 'four most recent'). Use 0 for no cap (all rows, paginated server-side).",
          },
          sort_property: {
            type: "string",
            description: "Notion property to sort by, e.g. date_applied.",
          },
          sort_direction: {
            type: "string",
            description: "ascending or descending (or asc / desc).",
          },
          company: {
            type: "string",
            description: "Name of the company that the user has applied to",
          },
        },
        required: [] as string[],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_tech_occurrences",
      description:
        "Aggregate **technology usage** over job applications: how many jobs mention a tech, or counts per technology name in tech_stack. Use when the user asks **how many jobs** require, use, or mention a technology (e.g. TypeScript), **how often** a tech appears, frequency across **N recent** applications, or overall tech tallies. Set limit to N when they say 'N recent' or 'last N applications'. Pass technology when they name a specific tech. **Do not use** when they only want job listings or descriptions without tech statistics—use search_jobs.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description:
              "How many applications to include in the window (e.g. 3 for 'three recent applications'). Use 0 for all rows (server-side).",
          },
          sort_property: {
            type: "string",
            description: "Notion property to sort by, e.g. date_applied.",
          },
          sort_direction: {
            type: "string",
            description: "ascending or descending (or asc / desc).",
          },
          company: {
            type: "string",
            description:
              "Filter to applications at a company (title contains).",
          },
        },
        required: [] as string[],
      },
    },
  },
] as unknown as Tool[];
