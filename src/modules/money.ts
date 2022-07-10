import { User } from "../types";

export class Money {
  user: User;
  amount: number;
  async setMoney(amount: number): Promise<Money> {
    this.amount = amount;
    await updateMoney(this.user, this.amount);
    return this;
  }
  async addMoney(amount: number): Promise<Money> {
    this.amount += amount;
    await updateMoney(this.user, this.amount);
    return this;
  }
  async reduceMoney(amount: number): Promise<Money> {
    this.amount -= amount;
    await updateMoney(this.user, this.amount);
    return this;
  }

  constructor(user: User, amount: number = 1_000_000) {
    this.user = user;
    this.amount = amount;
  }
}

const updateMoney = async (user: User, money: number) => {
  await user.update([{ key: "money", value: String(money) }]);
};
