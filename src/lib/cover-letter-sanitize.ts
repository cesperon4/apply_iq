import type { CoverLetterOutput } from "@/lib/schemas/cover-letter-output";

const PLACEHOLDER_COMPANY = /^(default|company|unknown|n\/a|tbd|your company|the company)$/i;

/** Strip bogus company fields models use when the real name is unknown. */
export function sanitizeCoverLetterCompany(company: string): string {
  const t = company.trim();
  if (PLACEHOLDER_COMPANY.test(t)) return "";
  return t;
}

/**
 * "Default" often appears in job posts as the **company/product you are applying to**.
 * Models sometimes wrongly say you **previously worked at Default**. Fix only past-employment phrasing;
 * leave "apply for the … role at Default" alone.
 */
export function sanitizeCoverLetterBody(body: string): string {
  let s = body;
  s = s.replace(/\[\s*Job Posting Platform\s*\]/gi, "");
  s = s.replace(/\[\s*Company\s*\]/gi, "");
  s = s.replace(/\[\s*Location\s*\]/gi, "");
  s = s.replace(/\s+as advertised on\s*,?/gi, ", ");
  s = s.replace(
    /\bAs a Support Engineer at (Woodard\s*&?\s*Curran)\b/gi,
    "In my software engineering role at $1",
  );
  s = s.replace(
    /\b(?:my|a|an)\s+(?:previous|prior|past)\s+(?:role|position|job|employment)\s+at\s+Default\b/gi,
    "my previous role",
  );
  s = s.replace(
    /\b(?:worked|working|employed|had\s+been)\s+(?:at|for)\s+Default\b/gi,
    "worked in prior roles",
  );
  s = s.replace(
    /\b(?:time|experience)\s+(?:at|with)\s+Default\b(?=\s*[,.])/gi,
    "time in prior roles",
  );
  s = s.replace(/\s{2,}/g, " ");
  return s.trim();
}

/** Lines that are clearly not a person's name (often fragments from agency names in excerpts). */
const BAD_SIGN_OFF_LINE =
  /^(Water\s+Supply|Water\s+Supply\s+and\s+Conservation|Bay\s+Area|Conservation|Northern\s+California|Alameda\s+County|Woodard|Pathloom|Santa\s+Rosa|Software\s+Engineer|Support\s+Engineer|Developer|Engineering|Default)$/i;

function looksLikePersonName(line: string): boolean {
  const t = line.trim();
  if (t.length < 5 || t.length > 80) return false;
  if (BAD_SIGN_OFF_LINE.test(t)) return false;
  return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(t);
}

/**
 * After "Sincerely," / "Best regards," the next line must be a real person's name.
 * Replace fragments like "Water Supply" (from agency names in excerpts) or fix non-name lines when `name` is set.
 */
export function fixBadSignOff(body: string, name?: string): string {
  const lines = body.trim().split(/\n/).map((l) => l.trimEnd());
  if (lines.length < 2) return body;

  for (let i = lines.length - 2; i >= 0; i--) {
    const line = lines[i].trim();
    if (!/^(Sincerely|Best regards|Regards),?$/i.test(line)) continue;

    const nextIdx = i + 1;
    if (nextIdx >= lines.length) return body;
    const nextLine = lines[nextIdx].trim();
    const bad =
      BAD_SIGN_OFF_LINE.test(nextLine) ||
      (nextLine.length > 0 && !looksLikePersonName(nextLine));

    if (bad && name?.trim()) {
      lines[nextIdx] = name.trim();
      return lines.join("\n").trim();
    }
    if (BAD_SIGN_OFF_LINE.test(nextLine) && !name?.trim()) {
      lines.splice(nextIdx, 1);
      return lines.join("\n").trim();
    }
    break;
  }
  return body;
}

/** Heuristic: first plausible "Firstname Lastname" in excerpt text. */
export function extractCandidateNameFromExcerpts(
  excerpts: string,
): string | undefined {
  const head = excerpts.slice(0, 6000);
  const badFull =
    /^(Santa Rosa|Bay Area|Woodard Curran|Alameda County|Northern California|Sonoma State)/i;
  const badFirst =
    /^(Woodard|Pathloom|Santa|Bay|Northern|Alameda|Sacramento|Sonoma|Apply|Software|Engineer|Developer|Linkedin|Water|Conservation)/i;

  const re = /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(head)) !== null) {
    const full = m[1].trim();
    if (badFull.test(full)) continue;
    const first = full.split(" ")[0] ?? "";
    if (badFirst.test(first)) continue;
    if (full.length < 5 || full.length > 60) continue;
    return full;
  }
  return undefined;
}

/** Replace [Your Name] and bare "Best regards," with a real sign-off when we have a name. */
export function applySignOffName(body: string, name: string): string {
  const n = name.trim();
  if (!n) return body;
  let s = body.replace(/\[\s*Your Name\s*\]/gi, n);
  s = s.replace(/\[\s*Name\s*\]/gi, n);
  // "Best regards,\n[Your Name]" already handled; if line is only "Best regards," append name
  const endsBare =
    /Best regards,?\s*$/i.test(s.trim()) && !s.includes(`\n${n}`) && !s.endsWith(n);
  if (endsBare) {
    s = s.replace(/\s*Best regards,?\s*$/i, `\n\nBest regards,\n${n}`);
  }
  return s;
}

export function sanitizeCoverLetterOutput(
  data: CoverLetterOutput,
  signOffName?: string,
): CoverLetterOutput {
  let body = sanitizeCoverLetterBody(data.body);
  if (signOffName?.trim()) {
    body = applySignOffName(body, signOffName.trim());
  }
  body = fixBadSignOff(body, signOffName);
  return {
    ...data,
    job_description_company: sanitizeCoverLetterCompany(
      data.job_description_company,
    ),
    body,
  };
}

/** Turn plain-text letter (paragraphs separated by blank lines) into safe HTML for React Quill. */
export function coverLetterBodyToHtml(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";

  const escape = (t: string) =>
    t
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return `<p>${escape(trimmed).replace(/\n/g, "<br/>")}</p>`;
  }

  return paragraphs
    .map((p) => `<p>${escape(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
