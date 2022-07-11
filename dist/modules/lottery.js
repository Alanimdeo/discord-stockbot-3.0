"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLottery = exports.getDrwNo = exports.getDrwInfo = exports.DrwInfo = exports.Lottery = void 0;
const axios_1 = __importDefault(require("axios"));
class Lottery {
    drwNo;
    numbers;
    constructor(numbers, drwNo = getDrwNo()) {
        this.drwNo = drwNo;
        if (numbers) {
            if (numbers.length !== 6) {
                throw new Error("NotSixNumbers");
            }
            else if (numbers.filter((n) => n < 1 || n > 45 || Math.floor(n) !== n).length > 0) {
                throw new Error("IllegalNumber");
            }
            else if (new Set(numbers).size !== 6) {
                throw new Error("NotUniqueNumber");
            }
            this.numbers = numbers;
        }
        else {
            let lottery = [0, 0, 0, 0, 0, 0];
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
                throw new Error("Unexpected NotSixNumbers");
            }
            this.numbers = lottery;
        }
    }
}
exports.Lottery = Lottery;
class DrwInfo {
    returnValue;
    drwNo;
    drwNoDate;
    totSellamnt;
    firstAccumamnt;
    firstPrzwnerCo;
    firstWinamnt;
    drwtNo;
    bnusNo;
    constructor(drwInfo) {
        if (drwInfo.returnValue == "fail") {
            throw new Error("DrwInfoFetchFailed");
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
exports.DrwInfo = DrwInfo;
async function getDrwInfo(drwNo = getDrwNo()) {
    const response = await (0, axios_1.default)(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`);
    const drwInfo = response.data;
    if (drwInfo.returnValue === "success") {
        return new DrwInfo(drwInfo);
    }
    else {
        throw new Error("DrwInfoFetchFailed");
    }
}
exports.getDrwInfo = getDrwInfo;
// 가장 최근에 추첨한 로또 번호
// 토요일은 21시 이후부터 당일 추첨한 회차 반환
// 로또 구매 등의 기능에서는 +1 해야 함
function getDrwNo(date = new Date()) {
    if (typeof date === "string") {
        date = new Date(date);
    }
    let drwNo = Number((date.getTime() - 1038582000000) / 604800000);
    if (date.getDay() === 6 && date.getHours() < 21) {
        drwNo -= 1;
    }
    return Math.floor(drwNo);
}
exports.getDrwNo = getDrwNo;
async function addLottery(user, lottery) {
    try {
        if (user.lottery.filter((lottery) => lottery.drwNo === getDrwNo()).length > 5) {
            throw new Error("LotteryLimitExceeded");
        }
        user.lottery.push(lottery);
        await user.update([{ key: "lottery", value: JSON.stringify(user.lottery) }]);
        return user.lottery;
    }
    catch (err) {
        throw err;
    }
}
exports.addLottery = addLottery;
