"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserdata = exports.verifyUser = exports.query = void 0;
const mysql_1 = require("mysql");
const config_1 = __importDefault(require("../config"));
const types_1 = require("../types");
const db = (0, mysql_1.createConnection)({
    host: config_1.default.mysqlConfig.host,
    port: config_1.default.mysqlConfig.port,
    user: config_1.default.mysqlConfig.user,
    password: config_1.default.mysqlConfig.password,
    database: config_1.default.mysqlConfig.database,
    dateStrings: ["DATE"],
});
exports.query = db.query.bind(db);
async function verifyUser(id) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
            if (err)
                return reject(err);
            return resolve(result.length > 0);
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
                return reject(new types_1.NotFoundError("User not found."));
            }
            return resolve(new types_1.User(result[0].id, result[0].money, new types_1.UserStock(JSON.parse(result[0].stock)), JSON.parse(result[0].gold), JSON.parse(result[0].lottery), JSON.parse(result[0].gamble), result[0].lastClaim));
        });
    });
}
exports.getUserdata = getUserdata;
