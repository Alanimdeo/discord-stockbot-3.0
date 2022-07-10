"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyLimitExceededEmbed = exports.checkDailyLimit = void 0;
const time_1 = require("./time");
const types_1 = require("../types");
async function checkDailyLimit(user) {
    const lastPlayed = new Date(user.gamble.lastPlayed);
    const now = new Date();
    if ((0, time_1.isToday)(lastPlayed)) {
        if (user.gamble.count >= 10) {
            return false;
        }
        else {
            user.gamble.count++;
            await user.update([{ key: "gamble", value: JSON.stringify(user.gamble) }]);
            return true;
        }
    }
    else {
        user.gamble.lastPlayed = (0, time_1.toDateString)(now);
        user.gamble.count = 1;
        await user.update([{ key: "gamble", value: JSON.stringify(user.gamble) }]);
        return true;
    }
}
exports.checkDailyLimit = checkDailyLimit;
exports.dailyLimitExceededEmbed = (0, types_1.Embed)({
    color: "#ff0000",
    icon: "warning",
    title: "일일 제한 초과",
    description: "도박은 일일 최대 10회까지만 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336",
});
