import readlines from "readline";
import { open } from "sqlite";
import sqlite3 = require("sqlite3");
(async () => {
  const readline = readlines.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  readline.question("remove? ", (remove) => {
    readline.question("Which accountID? ", (accountID) => {
      readline.question("What Badge? ", async (badge) => {
        if (remove === "yes") {
          await db.run("UPDATE badges SET expires=0 WHERE accountID=:accountID and name=:name and expires>=:time", { ":accountID": accountID, ":name": badge, ":time": new Date().getTime() })
          console.log("removed")
        } else {
          readline.question("Expires in (ms or nothing) ", async (expires) => {
            await db.run(
              "INSERT INTO badges (accountID, name, expires) VALUES (:accountID, :name, :expires)", { ":accountID": accountID, ":name": badge, ":expires": expires === "" ? null : new Date().getTime() + Number(expires) }
            );
            console.log("added")
          });

        }
      });
    });
  })
})()