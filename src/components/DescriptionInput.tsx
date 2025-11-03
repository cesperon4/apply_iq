import React from "react";
import { Briefcase } from "lucide-react";
import { type JobData } from "@/types/job.types";

type DescriptionInputProps<T extends string | JobData> = T extends string
  ? {
      value: string;
      onChange: React.Dispatch<React.SetStateAction<string>>;
      title: string;
      field?: never;
    }
  : {
      value: string;
      onChange: React.Dispatch<React.SetStateAction<JobData>>;
      title: string;
      field: keyof JobData;
    };

export function DescriptionInput<T extends string | JobData>(
  props: DescriptionInputProps<T>
) {
  const handleChange = (val: string) => {
    if ("field" in props && props.field) {
      // TS knows props.field exists → T is JobData
      (props.onChange as React.Dispatch<React.SetStateAction<JobData>>)(
        (prev) => ({
          ...(prev as JobData),
          [props.field]: val,
        })
      );
    } else {
      (props.onChange as React.Dispatch<React.SetStateAction<string>>)(val);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5" />
        {`${props.title}`}
      </h2>

      <div className="space-y-2">
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-gray-700"
        >
          Paste the job description below
        </label>
        <textarea
          id="job-description"
          value={props.value}
          onChange={(e) => {
            handleChange(e.target.value);
          }}
          placeholder="Copy and paste the job description here. Include details about the role, requirements, and company information..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-600"
          rows={12}
        />
        <p className="text-xs text-gray-500">{props.value.length} characters</p>
      </div>

      <button
        className="bg-gray-300 text-white p-2 rounded"
        onClick={() => {
          handleChange("");
        }}
      >
        Clear
      </button>
    </div>
  );
}
