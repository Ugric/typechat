import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cookieParser from "cookie-parser";
import { createHash } from "crypto";
import { nextTick } from "process";
const { generate } = require("randomstring");
console.time("express boot");

(async () => {
  const hasher = (string: string) =>
    createHash("md5").update(string).digest("hex");
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  await Promise.all([
    db.run(
      "CREATE TABLE IF NOT EXISTS accounts (accountID, email, username, password, salt, profilePic)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS tokens (accountID, token)"),
    db.run("CREATE TABLE IF NOT EXISTS chats (chatID)"),
    db.run("CREATE TABLE IF NOT EXISTS chatUsers (chatID, accountID)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS chatMessages (chatID, accountID, message, time)"
    ),
  ]);
  const app = express();
  app.use(require("body-parser").urlencoded({ extended: true }));
  app.use(cookieParser());
  const port = 5050;
  app.get("/api/userdata", async (req, res) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)",
      {
        ":token": req.cookies.token,
      }
    );
    if (!accountdata) {
      return res.send({ loggedin: false });
    } else {
      return res.send({ loggedin: true, user: { username: "Hi" } });
    }
  });
  app.post("/login", async (req, res) => {
    const accounts = await db.all("SELECT * FROM accounts");
    let accountdata;
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      if (
        account.email == req.body.email &&
        account.password == hasher(req.body.pass + account.salt)
      ) {
        accountdata = account;
        break;
      }
    }
    if (accountdata) {
      const token = generate(100);
      await db.run(
        "INSERT INTO TABLE tokens columns (accountID, token) (:accountID, :token)",
        { ":accountID": accountdata.accountID, ":token": token }
      );
      return res.send({ resp: true, token });
    } else {
      return res.send({ resp: false, err: "invalid password or username!" });
    }
  });
  app.post("/signup", async (req, res) => {
    const emailInUse =
      (await db.get("SELECT * FROM accounts WHERE email=:email", {
        ":email": req.body.email,
      })) != undefined;
    if (emailInUse) {
      return res.send({ resp: false, err: "That email is already in use!" });
    } else {
      const token = generate(100);
      const accountID = generate(20);
      const salt = generate(150);
      const password = hasher(req.body.pass + salt);
      await Promise.all([
        db.run(
          "INSERT INTO TABLE columns (accountID, email, username, password, salt)" // work on this next!
        ),
      ]);
    }
  });
  app.listen(port, () => {
    console.timeEnd("express boot");
    console.log(`server started at http://localhost:${port}`);
  });
})();
