/**
 * PDF resume cleanup and word-based chunking for embeddings.
 */

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SECTION_HEADERS = [
  "WORK EXPERIENCE",
  "PROFESSIONAL EXPERIENCE",
  "EMPLOYMENT HISTORY",
  "EXPERIENCE",
  "EDUCATION",
  "SKILLS",
  "PROJECTS",
  "LINKS",
  "SUMMARY",
  "OBJECTIVE",
  "CONTACT",
].sort((a, b) => b.length - a.length);

const HEADER_PATTERN = SECTION_HEADERS.map(escapeRegex).join("|");

function repairBrokenEmails(s: string): string {
  let t = s;
  let prev = "";
  while (prev !== t) {
    prev = t;
    t = t.replace(/([a-zA-Z0-9._%+-])\s+(?=[a-zA-Z0-9._%+-]*@)/g, "$1");
  }
  t = t.replace(/\.(co)\s+(m)\b/gi, ".com");
  t = t.replace(/\.(c)\s+(om)\b/gi, ".com");
  t = t.replace(/gmail\.co\s+m\b/gi, "gmail.com");
  t = t.replace(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (m) =>
    m.replace(/\s+/g, ""),
  );
  return t;
}

function normalizeUrls(s: string): string {
  return s.replace(/(https?:\/\/[^\s]+)/g, (url) =>
    url
      .replace(/[\u00a0\u200b\u200c\u200d\ufeff]/g, "")
      .replace(/\s+/g, "")
      .replace(/-\s+(\d)/g, "-$1"),
  );
}

function normalizeTechTerms(s: string): string {
  return s
    .replace(/\bGraph\s+Q\s*L(?=[A-Za-z]|\b)/gi, "GraphQL")
    .replace(/\bType\s+Script\b/gi, "TypeScript")
    .replace(/\bJava\s+Script\b/gi, "JavaScript")
    .replace(/GraphQLAPIstoAzureFunctions/gi, "GraphQL APIs to Azure Functions")
    .replace(/\bGraphQLAPIsto\b/gi, "GraphQL APIs to")
    .replace(/\bGraphQLAPIs\b/gi, "GraphQL APIs")
    .replace(/\bGraphQLto\b/gi, "GraphQL to");
}

function normalizeSkillToken(token: string): string {
  const lower = token.toLowerCase();
  if (lower === "typescript") return "TypeScript";
  if (lower === "javascript") return "JavaScript";
  if (lower === "graphql") return "GraphQL";
  return token;
}

function formatLabeledSkills(s: string): string {
  return s.replace(
    /\b(Frontend|Backend|Devops\/\s*Cloud|Devops)\s*:\s*([^:]+?)(?=\s+(?:Frontend|Backend|Devops|LINKS|EDUCATION|EXPERIENCE|PROJECTS)\b)/gi,
    (_m, label: string, items: string) => {
      const clean = items
        .trim()
        .replace(/^[-–—•\s]+/g, "")
        .split(/\s+/)
        .map((t) => t.replace(/^[-–—•]+/, "").trim())
        .filter((t) => t.length > 0 && !/^[-–—•,]+$/.test(t))
        .map(normalizeSkillToken)
        .join(", ");
      return `${label.trim()}: ${clean}`;
    },
  );
}

/** Normalize PDF text for downstream LLM / embedding use. */
export function cleanResumeText(text: string): string {
  let s = text
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .replace(/\n/g, " ");

  s = s.replace(/={3,}/g, " ").replace(/\s*=\s*=\s*/g, " ");

  s = s.replace(/\bSoftwareEngineer\b/g, "Software Engineer");
  s = s.replace(/(?<=[A-Z])SoftwareEngineer(?=[a-z])/g, "Software Engineer ");
  s = s.replace(
    /([A-Z]{2,})(SoftwareEngineer)(?=[a-zA-Z0-9._%+-]+@)/g,
    "$1 Software Engineer ",
  );
  s = s.replace(
    /([A-Z]{2,})(SoftwareEngineer)(?=[a-z])/g,
    "$1 Software Engineer ",
  );

  s = s.replace(/([A-Z]{2,})(Software Engineer)/g, "$1 $2");
  s = s.replace(/([A-Z]{2,})(Software)\b/g, "$1 $2");

  s = s.replace(/E\s+ngineer/gi, "Engineer");

  s = repairBrokenEmails(s);
  s = s.replace(/-\s+(\d)(?=[\w.-]*\.[a-z]{2,}\b)/gi, "-$1");
  s = s.replace(/https?:\/\/[^\s]+/g, (url) => url.replace(/-\s+(\d)/g, "-$1"));

  s = s.replace(/(\d{10,})([a-zA-Z0-9._%+-]+@)/g, "$1 $2");
  s = s.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(https?:\/\/)/g,
    "$1 $2",
  );

  s = s.replace(/anddeployedGraphQL/gi, "and deployed GraphQL");
  s = s.replace(
    /(and)(deployed|maintained|integrated|optimized|improved|built)/gi,
    "$1 $2",
  );
  s = s.replace(/anddeployed/gi, "and deployed");

  s = s.replace(/\.(SoftwareEngineer)(@)/g, ". Software Engineer @");
  s = s.replace(/\.(Software Engineer)@/g, ". Software Engineer @");
  s = s.replace(/(\w)\.(Software Engineer@)/g, "$1. $2");

  s = normalizeTechTerms(s);

  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/([A-Za-z]):([A-Za-z])/g, "$1: $2");
  }

  s = normalizeTechTerms(s);

  s = s.replace(/([A-Za-z])(\d{4})(?=\s*-\s*\d{4})/g, "$1 $2");
  s = s.replace(
    /([A-Za-z])(\d{4})(?=\s+[A-Z][a-z]+(?:\s+[A-Za-z]+)*,)/g,
    "$1 $2",
  );

  s = s.replace(/\.(js|ts|tsx|jsx)([A-Z])/g, ".$1 $2");

  s = s.replace(/(\d)([A-Za-z])/g, "$1 $2").replace(/([a-z])([A-Z])/g, "$1 $2");

  s = s.replace(
    /([^\s@])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    "$1 $2",
  );
  s = s.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})([^\s@])/g,
    "$1 $2",
  );

  s = s.replace(/([^\s:/])(https?:\/\/)/g, "$1 $2");
  s = s.replace(/(https?:\/\/[^\s]+)/g, " $1 ");
  s = normalizeUrls(s);

  s = formatLabeledSkills(s);

  s = normalizeTechTerms(s);

  s = s.replace(/(\bSoftware Engineer)@/g, "$1 @");
  s = s.replace(/(\bEngineer)@/g, "$1 @");
  s = s.replace(/(\bEngineer)([a-zA-Z0-9._%+-]+@)/g, "$1 $2");

  s = repairBrokenEmails(s);
  s = normalizeTechTerms(s);

  s = s.replace(/\bSoftwareEngineer\b/g, "Software Engineer");
  s = s.replace(/(?<=[A-Z])SoftwareEngineer(?=[a-z])/g, "Software Engineer ");
  s = s.replace(/anddeployedGraphQL/gi, "and deployed GraphQL");
  s = s.replace(/anddeployed/gi, "and deployed");
  s = s.replace(/(\w)\.(Software Engineer@)/g, "$1. $2");

  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Insert blank lines before section headers for readable multi-line `text`. */
export function addResumeSectionBreaks(flatText: string): string {
  const re = new RegExp(
    `(\\s|^)(${HEADER_PATTERN})(?=\\s+(?:[A-Z0-9]|https?:\\/\\/))`,
    "gi",
  );
  return flatText.replace(re, "\n\n$2\n\n");
}

export type ResumeSection = { title: string; content: string };

export function parseResumeSections(textWithBreaks: string): ResumeSection[] {
  const trimmed = textWithBreaks.trim();
  if (!trimmed) return [];

  const headerSet = new Set(SECTION_HEADERS.map((h) => h.toUpperCase()));
  const parts = trimmed.split(
    new RegExp(`\\n\\n(${HEADER_PATTERN})\\n\\n`, "gi"),
  );

  if (parts.length === 1) {
    return [{ title: "Resume", content: parts[0] }];
  }

  const sections: ResumeSection[] = [];
  const preamble = parts[0].trim();
  if (preamble) {
    sections.push({ title: "Contact", content: preamble });
  }

  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() ?? "";
    const content = (parts[i + 1] ?? "").trim();
    if (!title) continue;
    if (!headerSet.has(title.toUpperCase())) {
      if (sections.length) {
        const last = sections[sections.length - 1];
        last.content = [last.content, title, content]
          .filter(Boolean)
          .join("\n\n");
      } else {
        sections.push({
          title: "Resume",
          content: [title, content].filter(Boolean).join("\n\n"),
        });
      }
      continue;
    }
    sections.push({ title, content });
  }

  return sections;
}

/** Word-based sliding windows (defaults ~150 words, 20 overlap). */
export function chunkResumeText(
  text: string,
  chunkSize = 150,
  overlap = 20,
): string[] {
  const words = text.split(/\s+/).filter(Boolean); //Boolean removes empty strings
  if (words.length === 0) return [];

  const chunks: string[] = [];
  const step = Math.max(1, chunkSize - overlap);
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

/** Clean → section breaks → structured sections + flat text for APIs. */
export function prepareResumeForEmbeddings(rawText: string): {
  /** Single-line normalized text (use for word chunking). */
  cleaned: string;
  text: string;
  sections: ResumeSection[];
} {
  const cleaned = cleanResumeText(rawText);
  const withSections = addResumeSectionBreaks(cleaned);
  const normalized = withSections.replace(/\n{3,}/g, "\n\n").trim();
  return {
    cleaned,
    text: normalized,
    sections: parseResumeSections(normalized),
  };
}
