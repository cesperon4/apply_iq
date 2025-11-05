type tech = {
  name: string;
};

export type JobRecord = {
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
