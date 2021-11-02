const mysql = require("mysql");
const mysqlConfig = require("../config.json").mysql;
const database = mysql.createConnection(mysqlConfig);

module.exports = {
    data: {
        name: "돈",
        command: "money",
    },
    async execute(message) {
        const command = message.content.split(" ");
        command.shift();
        command.shift();

        database.query(`SELECT money FROM users WHERE id = ${command[1]}`, async (err, result) => {
            if (err) console.error(err);
            const money = result[0].money;
            switch (command[0]) {
                case "add":
                    money += Number(command[2]);
                    await message.reply(`Complete! Money: \`${money.toLocaleString("ko-KR")}\``);
                    break;
                case "set":
                    money = Number(command[2]);
                    await message.reply(`Complete! Money: \`${money.toLocaleString("ko-KR")}\``);
                    break;
                case "show":
                    await message.reply(`Money: \`${money.toLocaleString("ko-KR")}\``);
                    break;
            }
            database.query(`UPDATE users SET money = ${money} WHERE id = ${command[1]}`);
        });
    },
};
