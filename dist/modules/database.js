"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.getUserdata = exports.verifyUser = void 0;
const mysql_1 = require("mysql");
const config_1 = __importDefault(require("../config"));
const database = (0, mysql_1.createConnection)({
    host: config_1.default.mysqlConfig.host,
    port: config_1.default.mysqlConfig.port,
    user: config_1.default.mysqlConfig.user,
    password: config_1.default.mysqlConfig.password,
    database: config_1.default.mysqlConfig.database,
    dateStrings: ["DATE"],
});
async function verifyUser(id) {
    return new Promise((resolve, reject) => {
        database.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
            if (err)
                return reject(err);
            return resolve(result.length > 0);
        });
    });
}
exports.verifyUser = verifyUser;
async function getUserdata(id) {
    return new Promise((resolve, reject) => {
        database.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
            if (err)
                return reject(err);
            return resolve(result[0]);
        });
    });
}
exports.getUserdata = getUserdata;
exports.query = database.query;
