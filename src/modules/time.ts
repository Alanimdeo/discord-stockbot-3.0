export const toDateString = (date: Date = new Date()) =>
  `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function getToday(): string {
  const now = new Date();
  return toDateString(now);
} // returns YYYY-MM-DD

export function getYesterday(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return toDateString(now);
} // returns YYYY-MM-DD (yesterday)

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  );
}
