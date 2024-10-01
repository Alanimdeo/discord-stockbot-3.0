import { format } from "mysql";
import { Asset, GambleInfo } from "../types";
import { query } from "./database";
import { Gold } from "./gold";
import { Lottery } from "./lottery";
import { Money } from "./money";
import { UserStock, UserStockStatus } from "./stock";
import { getYesterday } from "./time";

export class User {
  id: string;
  money: Money;
  stock: UserStock;
  gold: Gold;
  lottery: Lottery[];
  gamble: GambleInfo;
  lastClaim: string;
  async update(options: QueryOption[]): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const queries: string[] = [];
      options.map((q) => queries.push(`${q.key} = ${format("?", [q.value])}`));
      const queryString = queries.join(",");
      query(
        `UPDATE users SET ${queryString} WHERE id = ?`,
        [this.id],
        async (err) => {
          if (err) return reject(err);
          return resolve(this);
        }
      );
    });
  }

  constructor(
    id: string,
    money?: number,
    stock?: UserStockStatus,
    gold?: Asset,
    lottery?: Lottery[],
    gamble?: GambleInfo,
    lastClaim?: string
  ) {
    this.id = id;
    this.money = new Money(this, money);
    this.stock = new UserStock(this, stock);
    this.gold = new Gold(this, gold?.amount, gold?.buyPrice);
    this.lottery = lottery || [];
    this.gamble = gamble || { count: 0, lastPlayed: getYesterday() };
    this.lastClaim = lastClaim || getYesterday();
  }
}

export interface QueryOption {
  key: keyof User;
  value: string;
}
