"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Database, AlertCircle, FileType2 } from "lucide-react";
import { type vector } from "../types/milvus.types";
import {
  generateTextChunks,
  embedTextChunks,
  insertEmbeddings,
} from "@/lib/api/milvus";

interface FileUploadProps {
  onResumeExtracted: (file: File | null) => void;
}

export function FileUpload({ onResumeExtracted }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [sourceType, setSourceType] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);

  const createVectorRows = (
    chunks: string[],
    embeddings: number[][],
    source_name: string,
  ) => {
    if (
      chunks.length <= 0 ||
      embeddings.length <= 0 ||
      chunks.length !== embeddings.length ||
      source_name === ""
    ) {
      console.log("invalid create vector row params");
      return [];
    }
    const out: vector[] = [];
    for (let i = 0; i < chunks.length; i++) {
      out.push({
        text: chunks[i],
        embedding: embeddings[i],
        source_type: sourceType,
        source_name: source_name,
      });
    }

    return out;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setIsProcessing(true);
      setFileName(file.name);

      try {
        if (file.type === "application/pdf" || file.type === "text/plain") {
          onResumeExtracted(file);
          setFile(file);
        } else {
          throw new Error(
            "Unsupported file type. Please upload a PDF or TXT file.",
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process file";
        setError(errorMessage);
        onResumeExtracted(null);
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [onResumeExtracted],
  );

  const handleChunkAndEmbed = async () => {
    setError(null);
    if (!file || file.name === "" || sourceType.trim() === "") return;
    setIsIndexing(true);
    try {
      const chunks = await generateTextChunks(file);
      console.log("chunks: ", chunks);
      const embeddings = await embedTextChunks(chunks.chunks);
      const rows = createVectorRows(
        chunks.chunks,
        embeddings.embeddings,
        file.name,
      );

      await insertEmbeddings(rows, "document_v5");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Chunk/embed pipeline failed";
      setError(message);
      console.error(e);
    } finally {
      setIsIndexing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  const handleSourceType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceType(e.target.value);
  };

  const canIndex = Boolean(file && sourceType.trim());

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-[0_0_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="border-b border-zinc-800/80 bg-zinc-950/50 px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <Database className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          Add documents to your knowledge base
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Upload PDFs or text files you want searchable when generating answers
          and cover letters. Text is split into chunks, embedded locally, and
          stored in your vector database with a category label.
        </p>
      </div>

      <div className="p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          1. Choose a file
        </p>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-emerald-500/70 bg-emerald-500/10"
              : "border-zinc-700 hover:border-emerald-500/35 hover:bg-zinc-900/60"
          } ${isProcessing ? "pointer-events-none cursor-not-allowed opacity-50" : ""}`}
        >
          <input {...getInputProps()} disabled={isProcessing} />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-zinc-400">Reading file…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-500/25">
                <Upload className="h-8 w-8 text-emerald-400" aria-hidden />
              </div>
              <div>
                <p className="text-base font-medium text-zinc-100">
                  {isDragActive
                    ? "Drop your file here"
                    : "Drag & drop a PDF or text file"}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  or click to browse — one file at a time
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 px-2.5 py-1 ring-1 ring-zinc-700/80">
                    <FileType2 className="h-3.5 w-3.5" aria-hidden />
                    PDF
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 px-2.5 py-1 ring-1 ring-zinc-700/80">
                    .txt
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {fileName && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3">
            <span className="text-lg leading-none text-emerald-400" aria-hidden>
              ✓
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-300">File ready</p>
              <p className="truncate text-sm text-zinc-400" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-200/90">{error}</p>
          </div>
        )}

        {file && (
          <div className="mt-6 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="vector-doc-category"
                className="text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                2. Document category
              </label>
              <span className="text-xs text-zinc-600">required</span>
            </div>
            <input
              id="vector-doc-category"
              type="text"
              value={sourceType}
              placeholder="e.g. resume, project write-up, portfolio, certification"
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={handleSourceType}
              list="vector-doc-category-suggestions"
              autoComplete="off"
            />
            <datalist id="vector-doc-category-suggestions">
              <option value="resume" />
              <option value="project" />
              <option value="portfolio" />
              <option value="certification" />
              <option value="notes" />
            </datalist>
            <p className="text-xs text-zinc-500">
              This label is stored with each chunk so you can filter or
              understand where retrieved text came from later.
            </p>
          </div>
        )}

        {file && (
          <button
            type="button"
            disabled={!canIndex || isIndexing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_20px_-6px_rgba(74,222,128,0.4)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
            onClick={handleChunkAndEmbed}
          >
            {isIndexing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Chunking &amp; embedding…
              </>
            ) : (
              <>
                <Database className="w-4 h-4 opacity-90" aria-hidden />
                Add to vector database
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
