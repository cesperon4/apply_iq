import React from "react";
import { Briefcase } from "lucide-react";
import { type JobRecord } from "@/types/notion.types";

type DescriptionInputProps<T extends string | JobRecord> = T extends string
  ? {
      value: string;
      onChange: React.Dispatch<React.SetStateAction<string>>;
      title: string;
      field?: never;
    }
  : {
      value: string;
      onChange: React.Dispatch<React.SetStateAction<JobRecord>>;
      field: keyof JobRecord;
      title: string;
    };

export function DescriptionInput<T extends string | JobRecord>(
  props: DescriptionInputProps<T>,
) {
  const handleChange = (val: string) => {
    if ("field" in props && props.field) {
      // TS knows props.field exists → T is JobData
      (props.onChange as React.Dispatch<React.SetStateAction<JobRecord>>)(
        (prev) => ({
          ...(prev as JobRecord),
          [props.field]: val,
        }),
      );
    } else {
      (props.onChange as React.Dispatch<React.SetStateAction<string>>)(val);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-[0_0_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
        <Briefcase className="h-5 w-5 text-emerald-400/90" aria-hidden />
        {`${props.title}`}
      </h2>

      <div className="space-y-2">
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-zinc-400"
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
          className="h-64 w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          rows={12}
        />
        <p className="text-xs text-zinc-500">{props.value.length} characters</p>
      </div>

      <button
        type="button"
        className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
        onClick={() => {
          handleChange("");
        }}
      >
        Clear
      </button>
    </div>
  );
}
