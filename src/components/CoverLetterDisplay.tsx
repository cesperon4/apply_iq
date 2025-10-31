"use client";

import { Copy, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // ✅ import it here instead

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface CoverLetterDisplayProps {
  coverLetter: string;
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
}

export function CoverLetterDisplay({
  coverLetter,
  isGenerating,
  setCoverLetter,
}: CoverLetterDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
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
                new TextRun({ text: remaining.slice(lastIndex, match.index) })
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
                  })
                ),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({}),
            // Convert HTML cover letter to DOCX paragraphs
            ...parseHtmlToDocxParagraphs(coverLetter),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "cover-letter.docx");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generated Cover Letter
        </h2>

        {coverLetter && !isGenerating && (
          <div className="flex gap-2 text-gray-700">
            <button
              // onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            >
              Add Job To Notion
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Generating your personalized cover letter...</p>
            <p className="text-sm mt-2">This may take a few moments</p>
          </div>
        ) : coverLetter ? (
          <div className="prose prose-sm max-w-none">
            <ReactQuill
              value={coverLetter}
              onChange={setCoverLetter}
              className=" text-gray-700"
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
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">
              Your cover letter will appear here
            </p>
            <p className="text-sm mt-2 text-center">
              Upload your resume and enter a job description, then click
              &ldquo;Generate Cover Letter&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
