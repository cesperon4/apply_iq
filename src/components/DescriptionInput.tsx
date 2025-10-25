import React from "react";

import { Briefcase } from "lucide-react";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
}

export function DescriptionInput({
  value,
  onChange,
  title,
}: DescriptionInputProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5" />
        {`${title}`}
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Copy and paste the job description here. Include details about the role, requirements, and company information..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-600"
          rows={12}
        />
        <p className="text-xs text-gray-500">{value.length} characters</p>
      </div>

      <button
        className="bg-gray-300 text-white p-2 rounded"
        onClick={() => {
          onChange("");
        }}
      >
        Clear
      </button>
    </div>
  );
}
