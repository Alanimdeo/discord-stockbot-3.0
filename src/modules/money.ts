import { updateUserdata } from "./database";

export class Money {
  userId: string;
  amount: number;
  async setMoney(amount: number): Promise<Money> {
    this.amount = amount;
    await updateMoney(this.userId, this.amount);
    return this;
  }
  async addMoney(amount: number): Promise<Money> {
    this.amount += amount;
    await updateMoney(this.userId, this.amount);
    return this;
  }
  async reduceMoney(amount: number): Promise<Money> {
    this.amount -= amount;
    await updateMoney(this.userId, this.amount);
    return this;
  }

  constructor(userId: string, amount: number = 1_000_000) {
    this.userId = userId;
    this.amount = amount;
  }
}

const updateMoney = async (id: string, money: number) =>
  await updateUserdata(id, [{ key: "money", value: String(money) }]);
