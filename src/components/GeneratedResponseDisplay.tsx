"use client";

import { Copy, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

import { RiNotionFill } from "react-icons/ri";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // ✅ import it here instead

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface GeneratedResponseProps {
  generatedResponse: string;
  setGeneratedResponse: React.Dispatch<React.SetStateAction<string>>;
  isResponseGenerating: boolean;
  type: string;
  addToNotion: (() => void) | null;
}

export function GeneratedResponseDisplay({
  generatedResponse,
  isResponseGenerating,
  setGeneratedResponse,
  type,
  addToNotion,
}: GeneratedResponseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  function parseHtmlToDocxParagraphs(html: string): Paragraph[] {
    // Remove Unicode line/paragraph separators
    const cleanedHtml = html.replace(/[\u2028\u2029]/g, "");
    // Extract all <p>...</p> blocks
    const paragraphs = cleanedHtml.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    return paragraphs
      .map((p) => {
        // Remove <p> tags and trim
        const inner = p.replace(/<p[^>]*>|<\/p>/gi, "").trim();
        if (!inner) return null;

        // Split <br> inside paragraph
        const lines = inner.split(/<br\s*\/?>/i);

        const children: TextRun[] = lines.flatMap((line) => {
          const runs: TextRun[] = [];
          const remaining = line;

          // Regex to find <strong> or <b> tags
          const boldRegex = /<strong>(.*?)<\/strong>|<b>(.*?)<\/b>/gi;
          let match: RegExpExecArray | null;
          let lastIndex = 0;

          while ((match = boldRegex.exec(remaining)) !== null) {
            // Text before bold tag
            if (match.index > lastIndex) {
              runs.push(
                new TextRun({ text: remaining.slice(lastIndex, match.index) }),
              );
            }

            // Bold text inside tag
            const boldText = match[1] || match[2] || "";
            runs.push(new TextRun({ text: boldText, bold: true }));

            lastIndex = match.index + match[0].length;
          }

          // Text after last bold tag
          if (lastIndex < remaining.length) {
            runs.push(new TextRun({ text: remaining.slice(lastIndex) }));
          }

          return runs;
        });

        return new Paragraph({
          children,
          spacing: { after: 80 },
          alignment: AlignmentType.LEFT,
        });
      })
      .filter(Boolean) as Paragraph[];
  }

  const handleDownload = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Christian Esperon",
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
            new Paragraph({}),
            new Paragraph({
              children: [
                new TextRun("939 Lodi Street"),
                new TextRun({ text: "\nSanta Rosa, CA 95401" }),
                new TextRun({ text: "\n(707) 479-7145" }),
                new TextRun({ text: "\ncesperon4@gmail.com" }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun(
                  new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                ),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({}),
            // Convert HTML cover letter to DOCX paragraphs
            ...parseHtmlToDocxParagraphs(generatedResponse),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "cover-letter.docx");
  };

  return (
    <div className="flex h-full min-h-[24rem] flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-[0_0_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <FileText className="h-5 w-5 text-emerald-400/90" aria-hidden />
          {`Generated ${type}`}
        </h2>

        {generatedResponse && !isResponseGenerating && (
          <div className="flex flex-wrap gap-2 text-zinc-200">
            {addToNotion && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  addToNotion();
                }}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-sm transition hover:border-emerald-500/40 hover:bg-zinc-800"
              >
                Add job to Notion
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-sm transition hover:border-emerald-500/40 hover:bg-zinc-800"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-sm transition hover:border-emerald-500/40 hover:bg-zinc-800"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isResponseGenerating ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-zinc-400">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-emerald-400" />
            <p>{`Generating your personalized ${type.toLowerCase()}…`}</p>
            <p className="mt-2 text-sm text-zinc-500">
              This may take a few moments
            </p>
          </div>
        ) : generatedResponse ? (
          <div className="prose prose-sm max-w-none prose-invert">
            <div className="quill-dark overflow-hidden rounded-xl border border-zinc-800">
              <ReactQuill
                value={generatedResponse}
                onChange={setGeneratedResponse}
                className="text-zinc-200"
                placeholder="Edit your cover letter..."
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
                theme="snow"
              />
            </div>

            {type === "Cover Letter" && (
              <button
                type="button"
                onClick={handleCopy}
                className="mx-auto mt-4 flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-emerald-500/40 hover:bg-zinc-800"
              >
                <RiNotionFill className="h-4 w-4" />
                Add to Notion
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-zinc-500">
            <FileText className="mb-4 h-16 w-16 text-zinc-600" aria-hidden />
            <p className="text-lg font-medium text-zinc-300">
              {`Your ${type.toLocaleLowerCase()} will appear here`}
            </p>
            {type === "Cover Letter" && (
              <p className="mt-2 max-w-sm text-center text-sm text-zinc-500">
                Upload your resume and enter a job description, then click
                &ldquo;Generate cover letter&rdquo;
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
