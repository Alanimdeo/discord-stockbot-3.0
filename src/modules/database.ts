import { createConnection } from "mysql";
import config from "../config";
import { User } from "../modules/user";
import { getYesterday } from "./time";

const db = createConnection({
  host: config.mysqlConfig.host,
  port: config.mysqlConfig.port,
  user: config.mysqlConfig.user,
  password: config.mysqlConfig.password,
  database: config.mysqlConfig.database,
  dateStrings: ["DATE"],
});

export const query = db.query.bind(db);

export async function verifyUser(userId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.query("SELECT EXISTS (SELECT * FROM users WHERE id = ?) AS SUCCESS", [userId], (err, result) => {
      if (err) return reject(err);
      return resolve(!!result[0].SUCCESS);
    });
  });
}

export async function getUserdata(userId: string): Promise<User> {
  return new Promise((resolve, reject) => {
    query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
      if (err) return reject(err);
      else if (result.length === 0) {
        return reject(new Error("UserNotFound"));
      }
      return resolve(
        new User(
          result[0].id,
          result[0].money,
          JSON.parse(result[0].stock),
          JSON.parse(result[0].gold),
          JSON.parse(result[0].lottery),
          JSON.parse(result[0].gamble),
          result[0].lastClaim
        )
      );
    });
  });
}

export async function createUser(userId: string): Promise<User> {
  if (await verifyUser(userId)) {
    throw new Error("UserAlreadyExists");
  }
  query("INSERT INTO users (id, stock, lottery, gamble, lastClaim) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    userId,
    "{}",
    "[]",
    `{"count":0,"lastPlayed":${getYesterday()}}`,
    getYesterday(),
  ]);
  return new User(userId);
}
