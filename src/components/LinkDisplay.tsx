import React, { useState, useEffect } from "react";
import { IoIosAdd } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { Copy } from "lucide-react";

import { type LinksRecord } from "../types/notion.types";
import { type ApiResponse } from "@/types/api.types";

interface link {
  link: string;
  name: string;
}
export function LinkDisplay() {
  const [linksArr, setLinksArr] = useState<link[]>([{ link: "", name: "" }]);

  const [edit, setEdit] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const addLinkRow = () => {
    setLinksArr((prev) => {
      const updated = [...prev];
      updated.push({ link: "", name: "" });
      return updated;
    });
  };

  const removeLinkRow = () => {
    if (linksArr.length === 1) return;
    setLinksArr((prev) => {
      const updated = [...prev];
      updated.pop();
      return updated;
    });
  };

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const key = e.target.id as keyof link;
    setLinksArr((prev) => {
      return prev.map((link, i) =>
        i === index ? { ...link, [key]: e.target.value } : link,
      );
    });
  };

  const handleCopy = (index: number) => {
    const url = linksArr[index]?.link;
    if (!url) return;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/notion/links", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = (await response.json()) as ApiResponse<LinksRecord[]>;
      const links = data.data;

      setLinksArr(() => {
        return links.map((link) => ({ name: link.link_name, link: link.link }));
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const inputClass =
    "rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 shadow-none focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60";

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-zinc-300 shadow-[0_0_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-zinc-100">My links</h2>
      {linksArr.map((link, index) => (
        <div
          className="flex flex-col justify-center gap-2 md:flex-row md:items-center"
          key={index}
        >
          <input
            placeholder="Name"
            id="name"
            defaultValue={linksArr[index].name}
            disabled={!edit}
            type="text"
            className={`${inputClass} min-w-0 flex-1`}
            onChange={(e) => {
              handleOnChange(e, index);
            }}
          />
          <input
            placeholder="URL"
            id="link"
            defaultValue={linksArr[index].link}
            disabled={!edit}
            type="text"
            className={`${inputClass} min-w-0 flex-[2]`}
            onChange={(e) => {
              handleOnChange(e, index);
            }}
          />
          <button
            type="button"
            onClick={() => {
              handleCopy(index);
            }}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm transition hover:border-emerald-500/40 hover:bg-zinc-800"
          >
            <Copy className="h-4 w-4" />
            {copiedIndex === index ? "Copied!" : "Copy"}
          </button>
        </div>
      ))}

      {edit ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-950/60 sm:min-w-[10rem]"
            onClick={() => {
              removeLinkRow();
            }}
          >
            <MdDeleteOutline className="text-lg" aria-hidden />
            Remove row
          </button>
          <button
            type="button"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/15 sm:min-w-[10rem]"
            onClick={() => {
              addLinkRow();
            }}
          >
            <IoIosAdd className="text-lg" aria-hidden />
            Add link
          </button>
          <button
            type="button"
            className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 sm:min-w-[10rem]"
            onClick={() => {
              setEdit((prev) => !prev);
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mx-auto w-full max-w-xs cursor-pointer rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/40 hover:bg-zinc-800"
          onClick={() => {
            setEdit((prev) => !prev);
          }}
        >
          Edit
        </button>
      )}
    </div>
  );
}

export default LinkDisplay;
