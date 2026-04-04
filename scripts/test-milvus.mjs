import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "localhost:19530",
});

async function run() {
  const res = await client.listCollections();
  console.log(res);
}

run();
