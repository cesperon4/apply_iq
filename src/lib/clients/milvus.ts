import { MilvusClient } from "@zilliz/milvus2-sdk-node";

export const milvusClient = new MilvusClient({
  address: "localhost:19530",
});
