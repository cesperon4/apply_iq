import { type vector } from "@/types/milvus.types";
import { useMutation } from "@tanstack/react-query";

export async function getMilvusCollections() {
  const res = await fetch("/api/milvus/collections");
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export async function generateTextChunks(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/generate-text-chunks", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("error generating text chunks");

  return res.json();
}

export async function embedTextChunks(chunks: string[]) {
  const res = await fetch("/api/embed-chunks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chunks: chunks }),
  });

  if (!res.ok) throw new Error("error embedding text chunks");

  return res.json();
}

/** One or more query vectors (same dim as stored embeddings, e.g. 768). */
export async function searchVectors(
  queryEmbeddings: number[][],
  collection_name: string,
) {
  const res = await fetch("/api/milvus/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeddings: queryEmbeddings, collection_name }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      typeof errBody === "object" &&
      errBody &&
      "error" in errBody &&
      typeof (errBody as { error: string }).error === "string"
        ? (errBody as { error: string }).error
        : "Failed to search vectors";
    throw new Error(msg);
  }

  return res.json();
}

export async function insertEmbeddings(
  embeddings: vector[],
  collection_name: string,
) {
  const res = await fetch("/api/milvus/vectors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collection_name: collection_name,
      embeddings: embeddings,
    }),
  });

  if (!res.ok) throw new Error("Failed to insert embeddings");

  return res.json();
}

export function useInsertEmbeddings() {
  return useMutation({
    mutationFn: ({
      embeddings,
      collection_name,
    }: {
      embeddings: vector[];
      collection_name: string;
    }) => insertEmbeddings(embeddings, collection_name),
  });
}
