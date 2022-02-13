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

  readline.question("Which accountID? ", (accountID) => {
    readline.question("How much? ", async (numberof: any) => {
      numberof = Number(numberof)
      const topromise = []
      for (let i = 0; i < numberof; i++) {
        topromise.push(db.run(
          "INSERT INTO rocketFuelPoints (accountID, used) VALUES (:accountID, false)",
          { ":accountID": accountID }
        ));
      }
      await Promise.all(topromise)
      console.log("added")
    });
  });
})()