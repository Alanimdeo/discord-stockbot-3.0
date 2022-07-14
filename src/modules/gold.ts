import axios from "axios";
import { Asset } from "../types";
import { QueryOption, User } from "./user";

export class Gold implements Asset {
  user: User;
  amount: number;
  buyPrice: number;
  async setGold(amount: number, price?: number): Promise<Gold> {
    if (amount < 0 || (price && price < 0)) {
      throw new Error("NegativeNumber");
    } else if (amount === 0) {
      console.log("If you want to remove gold, use removeGold instead.");
      return await this.removeGold();
    }
    this.amount = amount;
    this.buyPrice = price || 1;
    await updateGold(this.user, this);
    return this;
  }
  async addGold(amount: number, buyPrice: number): Promise<Gold> {
    if (amount < 0 || buyPrice < 0) {
      throw new Error("NegativeNumber");
    }
    this.amount += amount;
    this.buyPrice += buyPrice * amount;
    await updateGold(this.user, this);
    return this;
  }
  async reduceGold(amount: number, sellPrice: number): Promise<Gold> {
    if (amount < 0 || sellPrice < 0) {
      throw new Error("NegativeNumber");
    } else if (this.amount < amount) {
      throw new Error("NotEnoughGold");
    }
    if (this.amount === amount) {
      return await this.removeGold();
    }
    this.amount -= amount;
    this.buyPrice -= sellPrice * amount;
    await updateGold(this.user, this);
    return this;
  }
  async removeGold(): Promise<Gold> {
    this.amount = 0;
    this.buyPrice = 0;
    await updateGold(this.user, this);
    return this;
  }
  toQueryOption(): QueryOption {
    return {
      key: "gold",
      value: JSON.stringify({ amount: this.amount, buyPrice: this.buyPrice }),
    };
  }

  constructor(user: User, amount?: number, buyPrice?: number) {
    this.user = user;
    this.amount = amount || 0;
    this.buyPrice = buyPrice || 0;
  }
}

const updateGold = async (user: User, gold: Gold) => await user.update([gold.toQueryOption()]);

export interface GoldPriceInfo {
  buy: {
    price: number;
    time: string;
    diff: `${"+" | "-"}${number}` | "0";
  };
  sell: {
    price: number;
    time: string;
    diff: `${"+" | "-"}${number}`;
  };
}

export async function getGoldPrice(): Promise<GoldPriceInfo> {
  try {
    const { data } = await axios.post("https://apiserver.koreagoldx.co.kr/api/price/chart/listByDate", {
      srchDt: "1M",
      type: "Au",
    });
    const gold = {
      buy: {
        price: data.sChartList[0].y,
        time: data.sChartList[0].x,
        diff: data.sChartList[0].t,
      },
      sell: {
        price: data.pChartList[0].y,
        time: data.pChartList[0].x,
        diff: data.pChartList[0].t,
      },
    };
    return gold;
  } catch {
    throw new Error("GoldFetchFailed");
  }
}
