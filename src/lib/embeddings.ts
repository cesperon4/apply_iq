import "server-only";

import ollama from "ollama";

export const embedChunks = async (chunks: string[]) => {
  const { embeddings } = await ollama.embed({
    model: "nomic-embed-text",
    input: chunks,
  });
  return embeddings;
};
