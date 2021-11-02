const mysql = require("mysql");
const mysqlConfig = require("../config.json").mysql;
const database = mysql.createConnection(mysqlConfig);

module.exports = {
    data: {
        name: "주식",
        command: "stock",
    },
    async execute(message) {
        const command = message.content.split(" ");
        command.shift();
        command.shift();

        if (command[0] == "fetch") {
            var corpList = require("../corpList.json");
            try {
                if (isNaN(command[1])) {
                    await message.reply(corpList[command[1]]);
                } else {
                    await message.reply(Object.keys(corpList)[Object.values(corpList).indexOf(command[1])]);
                }
            } catch (err) {
                if (err) await message.reply("Error! ```\n" + err.message + "```");
            }
            return;
        }
        database.query(`SELECT stock FROM users WHERE id = ${command[1]}`, async (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            let stock = JSON.parse(result[0].stock);
            try {
                switch (command[0]) {
                    case "add":
                        if (stock[command[2]]) {
                            stock[command[2]]["amount"] += Number(command[3]);
                        } else {
                            stock[command[2]] = {
                                amount: command[3],
                                buyPrice: 0,
                            };
                        }
                        await message.reply("Complete!```json\n" + JSON.stringify(stock, undefined, 2) + "```");
                        break;
                    case "set":
                        stock[command[2]] = {
                            amount: command[3],
                            buyPrice: command[4] ? command[4] : stock[command[2]] ? stock[command[2]]["buyPrice"] : 0,
                        };
                        await message.reply("Complete!```json\n" + JSON.stringify(stock, undefined, 2) + "```");
                        break;
                    case "remove":
                        delete stock[command[2]];
                        stock = stock.filter(() => true);
                        await message.reply("Complete!```json\n" + JSON.stringify(stock, undefined, 2) + "```");
                        break;
                    case "show":
                        await message.reply("```json\n" + JSON.stringify(stock, undefined, 2) + "```");
                        break;
                }
                database.query(`UPDATE users SET stock = '${JSON.stringify(stock)}' WHERE id = ${command[1]}`);
            } catch (err) {
                await message.reply("Error! " + err.message);
            }
        });
    },
};
