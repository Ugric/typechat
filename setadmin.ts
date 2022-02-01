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

  readline.question("Which accountID? ", async (accountID) => {
    await db.run(
      "UPDATE accounts SET admin = not admin WHERE accountID = :accountID",
      { ":accountID": accountID }
    );
      console.log("updated")
  });
})();
