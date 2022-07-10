import { format } from "mysql";
import { Asset, GambleInfo } from ".";
import { query, QueryOption } from "../modules/database";
import { Gold } from "../modules/gold";
import { Lottery } from "../modules/lottery";
import { Money } from "../modules/money";
import { UserStock, UserStockStatus } from "../modules/stock";
import { getToday, getYesterday } from "../modules/time";

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
      let queryString = queries.join(",");
      query(`UPDATE users SET ${queryString} WHERE id = ?`, [this.id], async (err) => {
        if (err) return reject(err);
        return resolve(this);
      });
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
    this.gamble = gamble || { count: 0, lastPlayed: getToday() };
    this.lastClaim = lastClaim || getYesterday();
  }
}
