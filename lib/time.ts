import { startOfYear, endOfYear, format } from "date-fns";

export function listDaysInYear(year: number | string): string[] {
  const yearNumber = typeof year === "string" ? parseInt(year) : year;
  const start = startOfYear(new Date(yearNumber, 0, 1));
  const end = endOfYear(new Date(yearNumber, 0, 1));
  const days = [];
  for (let i = start; i <= end; i.setDate(i.getDate() + 1)) {
    days.push(new Date(i));
  }
  return days.map((day) => format(day, "yyyy-MM-dd"));
}
