"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
async function getStockInfo(query, corpList) {
    return new Promise(async (resolve, reject) => {
        let code = "", name = "";
        if (isNaN(Number(query)) && Object.keys(corpList).includes(query)) {
            code = corpList[query];
            name = query;
        }
        else if (Object.values(corpList).includes(query.padStart(6, "0"))) {
            code = query.padStart(6, "0");
            name = Object.keys(corpList)[Object.values(corpList).indexOf(code)];
        }
        else {
            return reject(new types_1.NotFoundError("Result not found."));
        }
        try {
            const response = await (0, axios_1.default)(`http://api.finance.naver.com/service/itemSummary.nhn?itemcode=${code}`);
            const data = response.data;
            if (response.status !== 200 || !data) {
                return reject(new types_1.StockFetchFailedError("Failed to get stock info."));
            }
            const risefall = data.risefall === 1
                ? "upperLimit"
                : data.risefall === 2
                    ? "up"
                    : data.risefall === 3
                        ? "unchanged"
                        : data.risefall === 4
                            ? "lowerLimit"
                            : "down";
            return resolve({
                name,
                code,
                price: data.now,
                risefall,
                diff: data.diff,
                diffRate: data.rate,
                high: data.high,
                low: data.low,
            });
        }
        catch (err) {
            return reject(err);
        }
    });
}
exports.getStockInfo = getStockInfo;
