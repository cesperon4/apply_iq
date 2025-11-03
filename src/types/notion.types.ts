export type NotionRecord = {
  id: string;
};

export type LinksRecord = NotionRecord & {
  link_name: string;
  link: string;
};

export type CountRecord = NotionRecord & {
  record_name: string;
  count: number;
};

export type CoverLetterResponse = {
  body: string;
  job_compensation: string;
  job_description_company: string;
  job_description_position: string;
  job_description_years_of_experience: number;
};

type record = {
  count: number;
  id: string;
};

export type RecordCounts = {
  Daily: record;
  Weekly: record;
  Monthly: record;
  Total: record;
};

export type JobCounts = {
  Daily: number;
  Weekly: number;
  Monthly: number;
  Total: number;
};
