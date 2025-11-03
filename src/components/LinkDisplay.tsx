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
    index: number
  ) => {
    const key = e.target.id as keyof link;
    setLinksArr((prev) => {
      return prev.map((link, i) =>
        i === index ? { ...link, [key]: e.target.value } : link
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

  return (
    <div className="grid grid-cols-1 gap-4 bg-white rounded-lg shadow-md p-6 w-full mx-auto text-gray-700">
      <h2>My Links</h2>
      {linksArr.map((link, index) => (
        <div className="flex gap-2 justify-center" key={index}>
          <input
            placeholder="name"
            id="name"
            defaultValue={linksArr[index].name}
            disabled={!edit}
            type="text"
            className="shadow p-2"
            onChange={(e) => {
              handleOnChange(e, index);
            }}
          />
          <input
            placeholder="link"
            id="url"
            defaultValue={linksArr[index].link}
            disabled={!edit}
            type="text"
            className="shadow p-2"
            onChange={(e) => {
              handleOnChange(e, index);
            }}
          />
          <button
            onClick={() => {
              handleCopy(index);
            }}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            {copiedIndex === index ? "Copied!" : "Copy"}
          </button>
        </div>
      ))}

      {edit ? (
        <div className="flex gap-4">
          <a
            className="flex items-center justify-center gap-2 cursor-pointer bg-orange-400 w-6/12 text-white p-2 rounded mx-auto"
            onClick={() => {
              removeLinkRow();
            }}
          >
            <MdDeleteOutline />
            <span>remove row</span>
          </a>
          <a
            className="flex items-center justify-center gap-2 cursor-pointer bg-blue-400 w-6/12 text-white p-2 rounded mx-auto"
            onClick={() => {
              addLinkRow();
            }}
          >
            <IoIosAdd />
            <span>add link</span>
          </a>
          <button
            className="bg-green-400 w-6/12 mx-auto p-2 rounded text-white cursor-pointer"
            onClick={() => {
              setEdit((prev) => !prev);
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <button
          className="bg-gray-400 w-2/12 mx-auto p-2 rounded text-white cursor-pointer"
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
