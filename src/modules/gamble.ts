import { isToday, toDateString } from "./time";
import { Embed, User } from "../types";

export async function checkDailyLimit(user: User): Promise<boolean> {
  const lastPlayed = new Date(user.gamble.lastPlayed);
  const now = new Date();
  if (isToday(lastPlayed)) {
    if (user.gamble.count >= 10) {
      return false;
    } else {
      user.gamble.count++;
      await user.update([{ key: "gamble", value: JSON.stringify(user.gamble) }]);
      return true;
    }
  } else {
    user.gamble.lastPlayed = toDateString(now);
    user.gamble.count = 1;
    await user.update([{ key: "gamble", value: JSON.stringify(user.gamble) }]);
    return true;
  }
}

export const dailyLimitExceededEmbed = Embed({
  color: "#ff0000",
  icon: "warning",
  title: "일일 제한 초과",
  description: "도박은 일일 최대 10회까지만 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336",
});
