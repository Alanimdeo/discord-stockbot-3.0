"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYesterday = exports.getToday = void 0;
const dateString = (date) => `${date.getUTCFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;
function getToday() {
    const now = new Date();
    return dateString(now);
} // returns YYYY-MM-DD
exports.getToday = getToday;
function getYesterday() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return dateString(now);
} // returns YYYY-MM-DD (yesterday)
exports.getYesterday = getYesterday;
