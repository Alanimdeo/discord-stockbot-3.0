const dateString = (date: Date) =>
  `${date.getUTCFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;

export function getToday(): string {
  const now = new Date();
  return dateString(now);
} // returns YYYY-MM-DD

export function getYesterday(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return dateString(now);
} // returns YYYY-MM-DD (yesterday)
