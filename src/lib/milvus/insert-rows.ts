import { milvusClient } from "../clients/milvus";
import { type vector } from "@/types/milvus.types";

export const insertRows = (rows: vector[], name: string) => {
  return milvusClient.insert({
    collection_name: name,
    data: rows,
  });
};
