import axios from "axios";
import { query } from "./database";

type LotteryNumbers = [number, number, number, number, number, number];

export class Lottery {
  drwNo: number;
  numbers: LotteryNumbers;

  constructor(numbers?: LotteryNumbers, drwNo: number = getCurrentDrwNo()) {
    this.drwNo = drwNo;
    if (numbers) {
      if (numbers.length !== 6) {
        throw new Error("Numbers of lottery must be 6.");
      } else if (numbers.filter((n) => n < 1 || n > 45 || Math.floor(n) !== n).length > 0) {
        throw new Error("Each number must be integer between 1 and 45.");
      } else if (new Set(numbers).size !== 6) {
        throw new Error("Each number must be unique.");
      }
      this.numbers = numbers;
    } else {
      let lottery: LotteryNumbers = [0, 0, 0, 0, 0, 0];
      while (lottery.includes(0)) {
        let number = Math.floor(Math.random() * 45) + 1;
        if (!lottery.includes(number)) {
          lottery[lottery.indexOf(0)] = number;
        }
      }
      lottery.sort((f, s) => {
        return f - s;
      });
      if (lottery.length !== 6) {
        throw new Error("Unexpected Error: lottery.length !== 6");
      }
      this.numbers = lottery;
    }
  }
}

export class DrwInfo {
  returnValue: "success" | "fail";
  drwNo: number;
  drwNoDate: string;
  totSellamnt: number;
  firstAccumamnt: number;
  firstPrzwnerCo: number;
  firstWinamnt: number;
  drwtNo: LotteryNumbers;
  bnusNo: number;

  constructor(drwInfo: any) {
    if (drwInfo.returnValue == "fail") {
      throw new Error("Failed to fetch drwInfo.");
    }
    this.returnValue = drwInfo.returnValue;
    this.drwNo = drwInfo.drwNo;
    this.drwNoDate = drwInfo.drwNoDate;
    this.totSellamnt = drwInfo.totSellamnt;
    this.firstAccumamnt = drwInfo.firstAccumamnt;
    this.firstPrzwnerCo = drwInfo.firstPrzwnerCo;
    this.firstWinamnt = drwInfo.firstWinamnt;
    this.drwtNo = [
      drwInfo.drwtNo1,
      drwInfo.drwtNo2,
      drwInfo.drwtNo3,
      drwInfo.drwtNo4,
      drwInfo.drwtNo5,
      drwInfo.drwtNo6,
    ];
    this.bnusNo = drwInfo.bnusNo;
  }
}

export async function getDrwInfo(drwNo: number = getCurrentDrwNo()): Promise<DrwInfo> {
  return new Promise(async (resolve, reject) => {
    const response = await axios(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`);
    const drwInfo = response.data;
    if (drwInfo.returnValue === "success") {
      return resolve(new DrwInfo(drwInfo));
    } else {
      return reject(new Error("Failed to get drwInfo"));
    }
  });
}

export function getCurrentDrwNo(): number {
  const now = new Date();
  let drwNo = Number((now.getTime() - 1038582000000) / 604800000);
  if (now.getDay() === 6 && Number(`${now.getHours()}${now.getMinutes()}`) < 2045) {
    drwNo -= 1;
  }
  return Math.floor(drwNo);
}

export function addLottery(userId: string, lottery: Lottery): Promise<Lottery> {
  return new Promise((resolve, reject) => {
    query(`SELECT lottery FROM users WHERE id = ?`, [userId], (err, result) => {
      if (err) {
        return reject(err);
      } else if (result.length === 0) {
        return reject(new Error("User not found."));
      }
      let lotteries: Lottery[] = JSON.parse(result[0].lottery);
      if (lotteries.filter((lottery) => lottery.drwNo === getCurrentDrwNo()).length > 5) {
        return reject(new Error("Lottery limit exceeded."));
      }
      lotteries.push(lottery);
      query(`UPDATE users SET lottery = '${JSON.stringify(lotteries)}' WHERE id = ?`, [userId], (err) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(lottery);
        }
      });
    });
  });
}
