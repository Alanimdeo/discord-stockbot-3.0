import axios from "axios";
import { Asset, User } from "../types";

export class Gold implements Asset {
  user: User;
  amount: number;
  buyPrice: number;
  async setGold(amount: number) {}
  async addGold(amount: number) {}
  async reduceGold(amount: number) {}
  async removeGold(amount: number) {}

  constructor(user: User, amount?: number, buyPrice?: number) {
    this.user = user;
    this.amount = amount || 0;
    this.buyPrice = buyPrice || 0;
  }
}

export async function getGoldPrice(): Promise<{
  buy: {
    price: number;
    time: string;
    diff: `${"+" | "-"}${number}`;
  };
  sell: {
    price: number;
    time: string;
    diff: `${"+" | "-"}${number}`;
  };
}> {
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
}
