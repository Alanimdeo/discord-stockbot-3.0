"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyLimitExceededEmbed = exports.checkDailyLimit = void 0;
const database_1 = require("./database");
const time_1 = require("./time");
const types_1 = require("../types");
async function checkDailyLimit(userId) {
    const gamble = (await (0, database_1.getUserdata)(userId)).gamble;
    const lastPlayed = new Date(gamble.lastPlayed);
    const now = new Date();
    if (lastPlayed.getFullYear() === now.getFullYear() &&
        lastPlayed.getMonth() === now.getMonth() &&
        lastPlayed.getDate() === now.getDate()) {
        if (gamble.count >= 10) {
            return false;
        }
        else {
            gamble.count++;
            (0, database_1.query)(`UPDATE users SET gamble = '${JSON.stringify(gamble)}' WHERE id = ?`, [userId]);
            return true;
        }
    }
    else {
        gamble.lastPlayed = (0, time_1.toDateString)(now);
        gamble.count = 1;
        (0, database_1.query)(`UPDATE users SET gamble = '${JSON.stringify(gamble)}' WHERE id = ?`, [userId]);
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
