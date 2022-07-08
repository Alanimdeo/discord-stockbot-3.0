import { createConnection } from "mysql";
import config from "../config";
import { NotFoundError, User, UserStock } from "../types";

const db = createConnection({
  host: config.mysqlConfig.host,
  port: config.mysqlConfig.port,
  user: config.mysqlConfig.user,
  password: config.mysqlConfig.password,
  database: config.mysqlConfig.database,
  dateStrings: ["DATE"],
});

export const query = db.query.bind(db);

export async function verifyUser(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      return resolve(result.length > 0);
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
          result[0].money,
          new UserStock(JSON.parse(result[0].stock)),
          JSON.parse(result[0].gold),
          JSON.parse(result[0].lottery),
          JSON.parse(result[0].gamble),
          result[0].lastClaim
        )
      );
    });
  });
}
