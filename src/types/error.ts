import { appendFileSync } from "fs";

export function errorLog(err: any, caller: string) {
  appendFileSync("./error.log", `[${new Date().toLocaleString()}] - ${caller}\n${String(err)}\n\n`);
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "NotFound";
  }
}

export class StockFetchFailedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "StockFetchFailed";
  }
}

export class NegativeNumberError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "NegativeNumber";
  }
}
