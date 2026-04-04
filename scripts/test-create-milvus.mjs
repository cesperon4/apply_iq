// create-collection.mjs
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "localhost:19530",
});

async function createCollection() {
  await client.createCollection({
    collection_name: "document_v5",
    fields: [
      {
        name: "id",
        data_type: 5, // int64
        is_primary_key: true,
        autoID: true,
      },
      {
        name: "embedding",
        data_type: 101, // float vector
        type_params: { dim: "768" }, // embedding dimension
      },
      {
        name: "text",
        data_type: 21, // VarChar
        max_length: 2000,
      },
      {
        name: "source_type",
        data_type: 21,
        max_length: 50,
      },
      {
        name: "source_name",
        data_type: 21,
        max_length: 200,
      },
    ],
  });

  console.log("Collection created!");

  // Required before loadCollection / search / query in current Milvus versions.
  await client.createIndex({
    collection_name: "document_v5",
    field_name: "embedding",
    index_name: "embedding_idx",
    index_type: "IVF_FLAT",
    metric_type: "COSINE",
    params: { nlist: 128 },
  });
  console.log(
    "Vector index created on `embedding` (IVF_FLAT, COSINE). Build may be async.",
  );
}

createCollection().catch(console.error);
