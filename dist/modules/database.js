"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUserdata = exports.verifyUser = exports.query = void 0;
const mysql_1 = require("mysql");
const config_1 = __importDefault(require("../config"));
const user_1 = require("../modules/user");
const time_1 = require("./time");
const db = (0, mysql_1.createConnection)({
    host: config_1.default.mysqlConfig.host,
    port: config_1.default.mysqlConfig.port,
    user: config_1.default.mysqlConfig.user,
    password: config_1.default.mysqlConfig.password,
    database: config_1.default.mysqlConfig.database,
    dateStrings: ["DATE"],
});
exports.query = db.query.bind(db);
async function verifyUser(userId) {
    return new Promise((resolve, reject) => {
        db.query("SELECT EXISTS (SELECT * FROM users WHERE id = ?) AS SUCCESS", [userId], (err, result) => {
            if (err)
                return reject(err);
            return resolve(!!result[0].SUCCESS);
        });
    });
}
exports.verifyUser = verifyUser;
async function getUserdata(userId) {
    return new Promise((resolve, reject) => {
        (0, exports.query)("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
            if (err)
                return reject(err);
            else if (result.length === 0) {
                return reject(new Error("UserNotFound"));
            }
            return resolve(new user_1.User(result[0].id, result[0].money, JSON.parse(result[0].stock), JSON.parse(result[0].gold), JSON.parse(result[0].lottery), JSON.parse(result[0].gamble), result[0].lastClaim));
        });
    });
}
exports.getUserdata = getUserdata;
async function createUser(userId) {
    if (await verifyUser(userId)) {
        throw new Error("UserAlreadyExists");
    }
    (0, exports.query)("INSERT INTO users (id, stock, lottery, gamble, lastClaim) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        userId,
        "{}",
        "[]",
        `{"count":0,"lastPlayed":${(0, time_1.getYesterday)()}}`,
        (0, time_1.getYesterday)(),
    ]);
    return new user_1.User(userId);
}
exports.createUser = createUser;
