import { open } from "sqlite";
const express = require("express");
const sqlite3 = require("sqlite3");
const cookieParser = require("cookie-parser");
const { createHash } = require("crypto");
const expressWs = require("express-ws");
const path = require("path");
const mime = require("mime-types");
const snooze = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const { generate } = require("randomstring");
console.time("express boot");

(async () => {
  const tagGenerator = (): string => {
    const output = [];
    for (let i = 0; i < 4; i++) {
      output.push(String(Math.floor(Math.random() * 10)));
    }
    return output.join("");
  };
  const createFileID = async (file: any) => {
    const hashed = createHash("md5").update(file.data).digest("hex");
    const existsindatabase = await db.get(
      "SELECT * FROM images WHERE hash=:hash LIMIT 1",
      { ":hash": hashed }
    );
    if (existsindatabase) {
      const id = existsindatabase.imageID;
      const filename = existsindatabase.filename;
      const paths = path.join(__dirname, "files", filename);
      return {
        id,
        filename,
        path: paths,
        exists: true,
      };
    }
    const id = generate(25);
    const filename = generate(45) + "." + mime.extension(file.mimetype);
    const paths = path.join(__dirname, "files", filename);
    db.run(
      "INSERT INTO images (imageID, filename, hash) VALUES  (:id, :filename, :hash)",
      {
        ":id": id,
        ":filename": filename,
        ":hash": hashed,
      }
    );
    return {
      id,
      filename,
      path: paths,
      exists: false,
    };
  };
  const hasher = (string: string) =>
    createHash("md5").update(string).digest("hex");
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  await Promise.all([
    db.run(
      "CREATE TABLE IF NOT EXISTS accounts (accountID, email, username, password, salt, profilePic, tag, backgroundImage)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS tokens (accountID, token)"),
    db.run("CREATE TABLE IF NOT EXISTS chats (chatID)"),
    db.run("CREATE TABLE IF NOT EXISTS chatUsers (chatID, accountID)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS chatMessages (chatID, accountID, message, time)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS images (imageID, filename, hash)"),
  ]);
  const { app, getWss, applyTo } = expressWs(express());
  app.use(cookieParser());
  app.use(require("express-fileupload")());
  const port = 5050;
  app.ws("/", (ws, req) => {
    ws.on("message", async (msg: String) => {
      await ws.send(msg);
    });
  });
  app.get("/api/logout", async (req, res) => {
    await db.get("DELETE FROM tokens WHERE token=:token", {
      ":token": req.cookies.token,
    });
    res.send(true);
  });
  app.get("/api/userdatafromid", async (req, res) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=:ID",
      {
        ":ID": req.query.id,
      }
    );
    if (!accountdata) {
      return res.send({ exists: false });
    } else {
      return res.send({
        exists: true,
        username: accountdata.username,
        id: accountdata.accountID,
        profilePic: accountdata.profilePic,
        tag: accountdata.tag,
        backgroundImage: accountdata.backgroundImage,
      });
    }
  });
  app.get("/api/getuserdataonupdate", async (req, res) => {
    let open = true;
    const currentaccountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)",
      {
        ":token": req.cookies.token,
      }
    );
    for (let index = 0; index < 30; index++) {
      await snooze(1000);
      const nowaccountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)",
        {
          ":token": req.cookies.token,
        }
      );
      if (
        JSON.stringify(currentaccountdata) !== JSON.stringify(nowaccountdata)
      ) {
        return res.send({
          loggedin: true,
          user: {
            username: nowaccountdata.username,
            id: nowaccountdata.accountID,
            profilePic: nowaccountdata.profilePic,
            tag: nowaccountdata.tag,
            backgroundImage: nowaccountdata.backgroundImage,
          },
        });
      }
    }
    return res.send({ reconnect: true });
  });
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
      return res.send({
        loggedin: true,
        user: {
          username: accountdata.username,
          id: accountdata.accountID,
          profilePic: accountdata.profilePic,
          tag: accountdata.tag,
          backgroundImage: accountdata.backgroundImage,
        },
      });
    }
  });
  app.get("/files/:id", async (req, res) => {
    const imagedata = await db.get(
      `SELECT filename FROM images WHERE imageID=:id`,
      {
        ":id": req.params.id,
      }
    );
    if (imagedata) {
      res.sendFile(path.join(__dirname, "files", imagedata.filename));
    } else {
      res.status(404).send("image not found in the database!");
    }
  });
  app.post("/api/setusername", async (req, res) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)",
      { ":token": req.cookies.token }
    );
    if (accountdata.password == hasher(req.body.pass + accountdata.salt)) {
      await db.run(
        "UPDATE accounts SET username=:username WHERE accountID=:accountID",
        { ":username": req.body.username, ":accountID": accountdata.accountID }
      );
      res.send({ resp: true });
    } else {
      res.send({ resp: false, err: "incorrect password!" });
    }
  });
  app.post("/api/setbackgroundimage", async (req, res) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)",
      { ":token": req.cookies.token }
    );
    if (accountdata) {
      let id = null;
      if (req.files) {
        const fileiddata = await createFileID(req.files.backgroundImage);
        id = fileiddata.id;
        const { exists, path } = fileiddata;
        if (!exists) {
          req.files.backgroundImage.mv(path);
        }
      }
      await db.run(
        "UPDATE accounts SET backgroundImage=:backgroundImage WHERE accountID=:accountID",
        { ":backgroundImage": id, ":accountID": accountdata.accountID }
      );
      res.send(true);
    } else {
      res.send(false);
    }
  });
  app.post("/login", async (req, res) => {
    const accounts = await db.all("SELECT * FROM accounts");
    let accountdata: any;
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
        "INSERT INTO tokens (accountID, token) VALUES  (:accountID, :token)",
        { ":accountID": accountdata.accountID, ":token": token }
      );
      return res.send({ resp: true, token });
    } else {
      return res.send({ resp: false, err: "invalid email or password!" });
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
      const tag = tagGenerator();
      const {
        id: profileID,
        path: profilePath,
        exists,
      } = await createFileID(req.files.profile);
      if (!exists) {
        req.files.profile.mv(profilePath);
      }
      await Promise.all([
        db.run(
          "INSERT INTO accounts (accountID, email, username, password, salt, profilePic, tag) VALUES  (:accountID, :email, :username, :password, :salt, :profilePic, :tag)",
          {
            ":accountID": accountID,
            ":email": req.body.email,
            ":username": req.body.uname,
            ":password": password,
            ":salt": salt,
            ":profilePic": profileID,
            ":tag": tag,
          } // work on this next! // thanks lol
        ),
        db.run(
          "INSERT INTO tokens (accountID, token) VALUES  (:accountID, :token)",
          { ":accountID": accountID, ":token": token }
        ),
      ]);
      return res.send({ resp: true, token });
    }
  });
  app.listen(port, () => {
    console.timeEnd("express boot");
    console.log(`server started at http://localhost:${port}`);
  });
})();
