"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYesterday = exports.getToday = exports.toDateString = void 0;
const toDateString = (date) => `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
exports.toDateString = toDateString;
function getToday() {
    const now = new Date();
    return (0, exports.toDateString)(now);
} // returns YYYY-MM-DD
exports.getToday = getToday;
function getYesterday() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return (0, exports.toDateString)(now);
} // returns YYYY-MM-DD (yesterday)
exports.getYesterday = getYesterday;
