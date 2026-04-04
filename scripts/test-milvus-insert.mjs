import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const COLLECTION = "document_v5";
const INDEX_NAME = "embedding_idx";

const client = new MilvusClient({
  address: "localhost:19530",
});

/** Milvus refuses load/query until a vector index exists on the embedding field. */
async function ensureEmbeddingIndex() {
  const described = await client.describeIndex({
    collection_name: COLLECTION,
  });

  const hasEmbedding = described.index_descriptions?.some(
    (d) => d.field_name === "embedding",
  );

  if (hasEmbedding) {
    console.log("Vector index on `embedding` already exists.");
    return;
  }

  console.log("Creating vector index (required before loadCollection)…");
  await client.createIndex({
    collection_name: COLLECTION,
    field_name: "embedding",
    index_name: INDEX_NAME,
    index_type: "IVF_FLAT",
    metric_type: "COSINE",
    params: { nlist: 128 },
  });

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const progress = await client.getIndexBuildProgress({
      collection_name: COLLECTION,
      field_name: "embedding",
    });
    if (
      progress.indexed_rows > 0 &&
      progress.indexed_rows === progress.total_rows
    ) {
      console.log("Index build finished:", progress.indexed_rows, "rows");
      return;
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  throw new Error("Timed out waiting for embedding index to finish building");
}

async function run() {
  const statsBefore = await client.getCollectionStatistics({
    collection_name: COLLECTION,
  });
  console.log("collection stats (before flush/load):", statsBefore);

  await ensureEmbeddingIndex();

  await client.flush({ collection_names: [COLLECTION] });
  await client.loadCollectionSync({
    collection_name: COLLECTION,
  });

  const result = await client.query({
    collection_name: COLLECTION,
    expr: "id >= 0",
    output_fields: ["id", "text", "source_name", "source_type"],
    limit: 10,
  });

  console.log("status:", result.status);
  console.log(
    "data (array length):",
    Array.isArray(result.data) ? result.data.length : typeof result.data,
  );
  console.log("data:", JSON.stringify(result.data, null, 2));
}

run().catch(console.error);
