import axios from "axios";
import { Asset, CorpList, NotFoundError, StockFetchFailedError } from "../types";
import { NegativeNumberError } from "../types/error";
import { updateUserdata } from "./database";

export class UserStock {
  userId: string;
  status: UserStockStatus;
  async setStock(code: string, amount: number, buyPrice?: number): Promise<UserStock> {
    if (amount < 0 || (buyPrice && buyPrice < 0)) {
      throw new NegativeNumberError("The amount or buyPrice of stock cannot be negative.");
    } else if (amount === 0) {
      console.log("If you want to remove stock, use removeStock instead.");
      return this.removeStock(code);
    }
    this.status[code] = {
      amount,
      buyPrice: buyPrice || 1, // 0으로 하면 내주식 명령어 사용 시 수익률이 무한대가 됨
    };
    await updateStock(this.userId, this.status);
    return this;
  }
  async addStock(code: string, amount: number, price: number): Promise<UserStock> {
    if (amount < 0 || price < 0) {
      throw new NegativeNumberError(
        "Adding negative number using addStock can cause error because it doesn't check if the amount is 0. Use reduceStock or setStock or removeStock instead."
      );
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
    await updateStock(this.userId, this.status);
    return this;
  }
  async reduceStock(code: string, amount: number, price: number): Promise<UserStock> {
    if (amount < 0 || price < 0) {
      throw new NegativeNumberError(
        "Reducing the amount of stock using reduceStock is not recommmended. use addStock instead."
      );
    } else if (!this.status[code]) {
      throw new NotFoundError("The user does not have this stock.");
    } else if (this.status[code].amount < amount) {
      throw new NegativeNumberError("The user does not have enough stock.");
    }
    if (this.status[code].amount === amount) {
      return await this.removeStock(code);
    } else {
      this.status[code].amount -= amount;
      this.status[code].buyPrice -= price * amount;
      await updateStock(this.userId, this.status);
      return this;
    }
  }
  async removeStock(code: string): Promise<UserStock> {
    if (!this.status[code]) {
      throw new NotFoundError("The user does not have this stock.");
    }
    delete this.status[code];
    await updateStock(this.userId, this.status);
    return this;
  }

  constructor(userId: string, status: UserStockStatus = {}) {
    this.userId = userId;
    this.status = status;
  }
}

const updateStock = async (id: string, stock: UserStockStatus) =>
  await updateUserdata(id, [{ key: "stock", value: JSON.stringify(stock) }]);

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
    throw new NotFoundError("Result not found.");
  }
  try {
    const response = await axios(`http://api.finance.naver.com/service/itemSummary.nhn?itemcode=${code}`);
    const data = response.data;
    if (response.status !== 200 || !data) {
      throw new StockFetchFailedError("Failed to get stock info.");
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
