import { describe, it, expect, vi, beforeEach } from "vitest";
import type { JobRecord } from "@/types/job.types";

vi.mock("@/lib/notion/store", () => ({
  getJobsApplied: vi.fn(),
}));

vi.mock("@/helpers/notion", () => ({
  formatPage: vi.fn(),
}));

import { getTechCounts } from "./query-applied-jobs";
import { getJobsApplied } from "./store";
import { formatPage } from "@/helpers/notion";

const mockGetJobsApplied = vi.mocked(getJobsApplied);
const mockFormatPage = vi.mocked(formatPage);

function makeJob(overrides: Partial<JobRecord> & { id: string }): JobRecord & {
  id: string;
} {
  return {
    job_description: "",
    company: "",
    status: "",
    date_applied: "",
    cover_letter: "",
    position: "",
    compensation: "",
    yoe: 0,
    tech_stack: [],
    ...overrides,
  };
}

describe("getTechCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns JSON with aggregated tech name counts across jobs", async () => {
    mockGetJobsApplied.mockResolvedValue([{}, {}] as never);
    let idx = 0;
    const pages: ReturnType<typeof makeJob>[] = [
      makeJob({
        id: "a",
        tech_stack: [
          { name: "React" },
          { name: "Python" },
          { name: "Javascript" },
        ],
      }),
      makeJob({
        id: "b",
        tech_stack: [{ name: "React" }, { name: "Go" }],
      }),
    ];
    mockFormatPage.mockImplementation(() => pages[idx++] as never);

    const out = await getTechCounts({
      limit: 2,
      sort_property: "date_applied",
      sort_direction: "descending",
    });

    expect(JSON.parse(out)).toEqual({
      React: 2,
      Python: 1,
      Go: 1,
      Javascript: 1,
    });
    expect(mockGetJobsApplied).toHaveBeenCalledWith({
      limit: 2,
      direction: "descending",
      sort_property: "date_applied",
      company: undefined,
    });
  });

  it("returns empty object when there are no jobs", async () => {
    mockGetJobsApplied.mockResolvedValue([]);

    const out = await getTechCounts({
      limit: 10,
      sort_property: "date_applied",
    });

    expect(JSON.parse(out)).toEqual({});
    expect(mockFormatPage).not.toHaveBeenCalled();
  });

  it("returns empty object when jobs have no tech_stack entries", async () => {
    mockGetJobsApplied.mockResolvedValue([{}] as never);
    mockFormatPage.mockReturnValue(
      makeJob({ id: "x", tech_stack: [] }) as never,
    );

    const out = await getTechCounts({ limit: 1 });

    expect(JSON.parse(out)).toEqual({});
  });

  it("maps ascending sort_direction to getJobsApplied", async () => {
    mockGetJobsApplied.mockResolvedValue([]);

    await getTechCounts({
      limit: 5,
      sort_direction: "asc",
      sort_property: "date_applied",
    });

    expect(mockGetJobsApplied).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: "ascending",
        limit: 5,
      }),
    );
  });
});
