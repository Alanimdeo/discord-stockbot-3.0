const mysql = require("mysql");
const { MessageEmbed } = require("discord.js");

const database = mysql.createConnection(require("../config.json").mysql);

module.exports = {
    checkDailyLimit: async function (userID) {
        return new Promise(async (resolve, reject) => {
            database.query(`SELECT gamble FROM users WHERE id = ${userID}`, (err, result) => {
                if (err) reject(err);
                else {
                    result = JSON.parse(result[0].gamble);
                    let lastPlayed = new Date(result.lastPlayed);
                    lastPlayed = `${lastPlayed.getFullYear()}-${lastPlayed.getMonth() + 1}-${lastPlayed.getDate()}`;
                    let today = new Date();
                    today = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
                    if (lastPlayed === today && result.count >= 10) resolve(true);
                    else {
                        if (lastPlayed !== today) {
                            result.lastPlayed = today;
                            result.count = 1;
                        } else result.count += 1;
                        database.query(`UPDATE users SET gamble = '${JSON.stringify(result)}' WHERE id = ${userID}`);
                        resolve(false);
                    }
                }
            });
        });
    },
    dailyLimitExceededMessage: {
        embeds: [
            new MessageEmbed()
                .setColor("#ff0000")
                .setTitle(":warning: 일일 제한 초과")
                .setDescription("도박은 일일 최대 10회까지만 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336"),
        ],
    },
};
