"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegativeNumberError = exports.StockFetchFailedError = exports.NotFoundError = exports.errorLog = void 0;
const fs_1 = require("fs");
function errorLog(err, caller) {
    (0, fs_1.appendFileSync)("./error.log", `[${new Date().toLocaleString()}] - ${caller}\n${String(err)}\n\n`);
}
exports.errorLog = errorLog;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFound";
    }
}
exports.NotFoundError = NotFoundError;
class StockFetchFailedError extends Error {
    constructor(message) {
        super(message);
        this.name = "StockFetchFailed";
    }
}
exports.StockFetchFailedError = StockFetchFailedError;
class NegativeNumberError extends Error {
    constructor(message) {
        super(message);
        this.name = "NegativeNumber";
    }
}
exports.NegativeNumberError = NegativeNumberError;
