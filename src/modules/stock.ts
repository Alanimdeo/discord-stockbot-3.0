import axios from "axios";
import { Asset, CorpList } from "../types";
import { User } from "./user";

export class UserStock {
  user: User;
  status: UserStockStatus;
  async setStock(code: string, amount: number, buyPrice?: number): Promise<UserStock> {
    if (amount < 0 || (buyPrice && buyPrice < 0)) {
      throw new Error("NegativeNumber");
    } else if (amount === 0) {
      console.log("If you want to remove stock, use removeStock instead.");
      return this.removeStock(code);
    }
    this.status[code] = {
      amount,
      buyPrice: buyPrice || 1, // 0으로 하면 내주식 명령어 사용 시 수익률이 무한대가 됨
    };
    await updateStock(this.user, this.status);
    return this;
  }
  async addStock(code: string, amount: number, price: number): Promise<UserStock> {
    if (amount < 0 || price < 0) {
      throw new Error("NegativeNumber");
    }
    if (!this.status[code]) {
      this.status[code] = {
        amount,
        buyPrice: price * amount,
      };
    } else {
      this.status[code].amount += amount;
      this.status[code].buyPrice += price * amount;
    }
    await updateStock(this.user, this.status);
    return this;
  }
  async reduceStock(code: string, amount: number, price: number): Promise<UserStock> {
    if (amount < 0 || price < 0) {
      throw new Error("NegativeNumber");
    } else if (!this.status[code]) {
      throw new Error("NotHavingStock");
    } else if (this.status[code].amount < amount) {
      throw new Error("NotEnoughStock");
    }
    if (this.status[code].amount === amount) {
      return await this.removeStock(code);
    } else {
      this.status[code].amount -= amount;
      this.status[code].buyPrice -= price * amount;
      await updateStock(this.user, this.status);
      return this;
    }
  }
  async removeStock(code: string): Promise<UserStock> {
    if (!this.status[code]) {
      throw new Error("NotHavingStock");
    }
    delete this.status[code];
    await updateStock(this.user, this.status);
    return this;
  }

  constructor(user: User, status: UserStockStatus = {}) {
    this.user = user;
    this.status = status;
  }
}

const updateStock = async (user: User, stock: UserStockStatus) =>
  await user.update([{ key: "stock", value: JSON.stringify(stock) }]);

export interface UserStockStatus {
  [code: string]: Asset;
}

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
  let code = "",
    name = "";
  if (isNaN(Number(query)) && Object.keys(corpList).includes(query)) {
    code = corpList[query];
    name = query;
  } else if (Object.values(corpList).includes(query.padStart(6, "0"))) {
    code = query.padStart(6, "0");
    name = Object.keys(corpList)[Object.values(corpList).indexOf(code)];
  } else {
    throw new Error("ResultNotFound");
  }
  try {
    const response = await axios(`http://api.finance.naver.com/service/itemSummary.nhn?itemcode=${code}`);
    const data = response.data;
    if (response.status !== 200 || !data) {
      throw new Error("StockFetchFailed");
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
    return {
      name,
      code,
      price: data.now,
      risefall,
      diff: data.diff,
      diffRate: data.rate,
      high: data.high,
      low: data.low,
    };
  } catch (err) {
    throw err;
  }
}
