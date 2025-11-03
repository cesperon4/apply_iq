// dateRanges.ts

// today.setHours(0, 0, 0, 0)
// setHours() sets the hour, minute, second, and millisecond of a Date object.
// Here, all values are set to 0, effectively resetting the time portion to midnight (the very start of the day).

// const d = new Date('2025-10-15'); // Oct 15, 2025

// d.setDate(31);
// console.log(d); // Oct 31, 2025 — normal

// d.setDate(32);
// console.log(d); // Nov 1, 2025 — rolls into next month

// d.setDate(0);
// console.log(d); // Sep 30, 2025 — goes to last day of previous month

// d.setDate(-5);
// console.log(d); // Sep 25, 2025 — counts backwards into previous month
const today = new Date();
today.setHours(0, 0, 0, 0);

const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - 7);
weekStart.setHours(0, 0, 0, 0);

const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

export type DateFilter = {
  property: string;
  date: {
    on_or_after: string;
  };
};

export const todayFilter = {
  property: "date_applied", // replace with your date property
  date: { on_or_after: today.toISOString() },
};

export const weekFilter = {
  property: "date_applied",
  date: { on_or_after: weekStart.toISOString() },
};

export const monthFilter = {
  property: "date_applied",
  date: { on_or_after: monthStart.toISOString() },
};

export const totalFilter = {
  property: "date_applied",
  date: { on_or_after: "1900-01-01" },
};
