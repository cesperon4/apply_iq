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

export type tech = {
  name: string;
};

export type JobRecord = NotionRecord & {
  job_description: string;
  company: string;
  status: string;
  date_applied: string;
  cover_letter: string;
  position: string;
  compensation: string;
  yoe: number;
  tech_stack: tech[];
};

export type CoverLetterResponse = {
  body: string;
  job_compensation: string;
  job_tech_stack: string[];
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
