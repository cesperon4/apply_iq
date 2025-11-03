export type GeneratedAnswerResponse = {
  body: string;
};

export type CoverLetterResponse = GeneratedAnswerResponse & {
  job_description_years_of_experience: number;
  job_description_company: string;
  job_description_position: string;
  job_compensation: string;
};
