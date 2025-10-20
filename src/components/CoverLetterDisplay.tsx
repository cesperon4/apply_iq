"use client";

import { Copy, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

interface CoverLetterDisplayProps {
  coverLetter: string;
  isGenerating: boolean;
}

export function CoverLetterDisplay({
  coverLetter,
  isGenerating,
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

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generated Cover Letter
        </h2>

        {coverLetter && !isGenerating && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>

      <div className="h-96 overflow-y-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Generating your personalized cover letter...</p>
            <p className="text-sm mt-2">This may take a few moments</p>
          </div>
        ) : coverLetter ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {coverLetter}
            </div>
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
