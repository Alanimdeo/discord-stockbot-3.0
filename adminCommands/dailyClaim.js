const mysql = require("mysql");
const mysqlConfig = require("../config.json").mysql;
const database = mysql.createConnection(mysqlConfig);

module.exports = {
    data: {
        name: "용돈",
        command: "dailyclaim",
    },
    async execute(message) {
        const command = message.content.split(" ");

        database.query(`UPDATE users SET lastClaim = '2021-01-01' WHERE id = ${command[2]}`, async () => {
            await message.react("✅");
        });
    },
};
