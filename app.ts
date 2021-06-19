import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cookieParser from "cookie-parser";

(async () => {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await Promise.all([
    db.run(
      "CREATE TABLE IF NOT EXISTS accounts (accountID, username, profilePic)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS tokens (accountID, token)"),
    db.run("CREATE TABLE IF NOT EXISTS chats (chatID)"),
    db.run("CREATE TABLE IF NOT EXISTS chatUsers (chatID, accountID)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS chatMessages (chatID, accountID, message, time)"
    ),
  ]);
  const app = express();
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
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
})();
