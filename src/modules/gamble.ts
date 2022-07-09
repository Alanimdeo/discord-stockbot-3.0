import { getUserdata, query } from "./database";
import { toDateString } from "./time";
import { Embed } from "../types";

export async function checkDailyLimit(userId: string): Promise<boolean> {
  const gamble = (await getUserdata(userId)).gamble;
  const lastPlayed = new Date(gamble.lastPlayed);
  const now = new Date();
  if (
    lastPlayed.getFullYear() === now.getFullYear() &&
    lastPlayed.getMonth() === now.getMonth() &&
    lastPlayed.getDate() === now.getDate()
  ) {
    if (gamble.count >= 10) {
      return false;
    } else {
      gamble.count++;
      query(`UPDATE users SET gamble = '${JSON.stringify(gamble)}' WHERE id = ?`, [userId]);
      return true;
    }
  } else {
    gamble.lastPlayed = toDateString(now);
    gamble.count = 1;
    query(`UPDATE users SET gamble = '${JSON.stringify(gamble)}' WHERE id = ?`, [userId]);
    return true;
  }
}

export const dailyLimitExceededEmbed = Embed({
  color: "#ff0000",
  icon: "warning",
  title: "일일 제한 초과",
  description: "도박은 일일 최대 10회까지만 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336",
});
