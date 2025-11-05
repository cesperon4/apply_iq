import { type JobRecord } from "./job.types";

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message: string;
};

export type GetJobs = {
  job_results: JobRecord[];
  tech_counts: Record<string, number>;
};
