import { createConnection, format } from "mysql";
import config from "../config";
import { NotFoundError, User } from "../types";
import { Money } from "./money";
import { UserStock } from "./stock";

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
        return reject(new NotFoundError("User not found."));
      }
      return resolve(
        new User(
          result[0].id,
          new Money(result[0].id, result[0].money),
          new UserStock(result[0].id, JSON.parse(result[0].stock)),
          JSON.parse(result[0].gold),
          JSON.parse(result[0].lottery),
          JSON.parse(result[0].gamble),
          result[0].lastClaim
        )
      );
    });
  });
}

export async function updateUserdata(userId: string, options: QueryOption[]): Promise<User> {
  return new Promise(async (resolve, reject) => {
    if (!(await verifyUser(userId))) {
      return reject(new NotFoundError("User not found."));
    }
    const queries: string[] = [];
    options.map((q) => queries.push(`${q.key} = ${format("?", [q.value])}`));
    let queryString = queries.join(",");
    query(`UPDATE users SET ${queryString} WHERE id = ?`, [userId], async (err) => {
      if (err) return reject(err);
      return resolve(await getUserdata(userId));
    });
  });
}

export interface QueryOption {
  key: keyof User;
  value: string;
}
