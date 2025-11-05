import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  type JobRecord,
  type LinksRecord,
  type CountRecord,
  type NotionRecord,
  type tech,
} from "@/types/notion.types";

// --- Step 1: Define Notion property types ---
interface Status {
  id: string;
  name: string;
  color: string;
}

interface StatusProperty {
  id: string;
  type: "status";
  status: Status;
}

interface DatePropertyValue {
  start: string | null;
  end: string | null;
  time_zone: string | null;
}

interface DateProperty {
  id: string;
  type: "date";
  date: DatePropertyValue;
}

interface Text {
  content: string;
  link: string | null;
}

interface TitleItem {
  type: "text" | string;
  text: Text;
}

interface TitleProperty {
  id: string;
  type: "title";
  title: TitleItem[];
}

interface RichText {
  type: "text";
  text: Text;
}

interface RichTextProperty {
  id: string;
  type: "rich_text";
  rich_text: RichText[];
}

interface URLProperty {
  id: string;
  type: "url";
  url: string;
}
interface NumberProperty {
  id: string;
  type: "number";
  number: number;
}

interface MultiSelectProperty {
  id: string;
  type: "multi_select";
  multi_select: tech[];
}
// Add more properties as needed
type NotionProperty =
  | StatusProperty
  | DateProperty
  | TitleProperty
  | RichTextProperty
  | URLProperty
  | NumberProperty
  | MultiSelectProperty;

// --- Step 2: Flatten a property to string ---
export function flattenProperty(
  prop: NotionProperty
): string | number | tech[] {
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.text.content).join("") || "(no title)";
    case "date":
      return prop.date?.start ?? "";
    case "status":
      return prop.status?.name ?? "";
    case "rich_text":
      return prop.rich_text.map((t) => t.text.content).join("") || "(no title)";
    case "url":
      return prop.url ?? "";
    case "number":
      return prop.number;
    case "multi_select":
      return prop.multi_select.map((item) => ({
        name: item.name,
      }));
    default:
      return "";
  }
}

// --- Step 3: Format Notion results into simple JSON ---
export function formatPage(
  page: PageObjectResponse
): JobRecord | LinksRecord | CountRecord | NotionRecord {
  const properties = page.properties || {};
  const flattened: Record<string, string | number | tech[]> = {};
  //url not returning correct id?
  Object.entries(properties).forEach(([key, prop]) => {
    flattened[key] = flattenProperty(prop as NotionProperty);
  });

  return {
    id: page.id,
    // url: page.url,
    ...flattened,
  };
}

/**
 * Remove all HTML tags from a string
 * @param html - The input string that may contain HTML
 * @returns Cleaned string without any HTML elements
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}
