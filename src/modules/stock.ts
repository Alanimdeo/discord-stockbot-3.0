import axios from "axios";
import { CorpList } from "../types";

export interface StockInfo {
  name: string;
  code: string;
  price: number;
  risefall: "upperLimit" | "up" | "unchanged" | "down" | "lowerLimit";
  diff: number;
  diffRate: number;
  high: number;
  low: number;
}

export async function getStockInfo(query: string, corpList: CorpList): Promise<StockInfo> {
  return new Promise(async (resolve, reject) => {
    let code = "",
      name = "";
    if (isNaN(Number(query)) && Object.keys(corpList).includes(query)) {
      code = corpList[query];
      name = query;
    } else if (Object.values(corpList).includes(query.padStart(6, "0"))) {
      code = query.padStart(6, "0");
      name = Object.keys(corpList)[Object.values(corpList).indexOf(code)];
    } else {
      return reject(new Error("Result not found."));
    }
    try {
      const response = await axios(`http://api.finance.naver.com/service/itemSummary.nhn?itemcode=${code}`);
      const data = response.data;
      if (response.status !== 200 || !data) {
        return reject(new Error("Failed to get stock info."));
      }
      const risefall =
        data.risefall === 1
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
    } catch (err) {
      return reject(err);
    }
  });
}
