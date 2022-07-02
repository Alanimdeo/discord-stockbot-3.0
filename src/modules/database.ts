import { createConnection } from "mysql";
import config from "../config";
import { User } from "../types";

const database = createConnection({
  host: config.mysqlConfig.host,
  port: config.mysqlConfig.port,
  user: config.mysqlConfig.user,
  password: config.mysqlConfig.password,
  database: config.mysqlConfig.database,
  dateStrings: ["DATE"],
});

export async function verifyUser(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    database.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      return resolve(result.length > 0);
    });
  });
}

export async function getUserdata(id: string): Promise<User> {
  return new Promise((resolve, reject) => {
    database.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0] as User);
    });
  });
}

export const query = database.query;
