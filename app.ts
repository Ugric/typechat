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

const messagefunctions = {};
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
    db.run("CREATE TABLE IF NOT EXISTS friends (accountID, toAccountID, time)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS friendsChatMessages (ID,accountID, toAccountID, message, time, file)"
    ),
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
    let to: string;
    const connectionID = generate(20);
    ws.on("message", async (data: string) => {
      let accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (!accountdata) {
        return ws.close();
      }
      const msg = JSON.parse(data);
      if (msg.type === "start" && !to) {
        if (msg.to === accountdata.accountID) {
          return ws.close();
        }
        const messages = await db.all(
          `SELECT
          ID,(accountID=:accountID) as mine, message, time, file
          FROM friendsChatMessages
          WHERE (
                  accountID = :accountID
                  and toAccountID = :toUser
              )
              or (
                  accountID = :toUser
                  and toAccountID = :accountID
              )`,
          {
            ":accountID": accountdata.accountID,
            ":toUser": msg.to,
          }
        );
        for (const message of messages) {
          message.mine = message.mine === 1;
        }
        ws.send(
          JSON.stringify({
            type: "setmessages",
            messages,
          })
        );
        to = String(msg.to);
        if (!messagefunctions[accountdata.accountID]) {
          messagefunctions[accountdata.accountID] = {};
        }
        if (!messagefunctions[accountdata.accountID][msg.to]) {
          messagefunctions[accountdata.accountID][msg.to] = [];
        }
        const functionidex =
          messagefunctions[accountdata.accountID][msg.to].length;
        messagefunctions[accountdata.accountID][msg.to].push({
          connectionID,
          ws,
        });
        while (!ws._socket._writableState.finished) {
          await snooze(100);
          accountdata = await db.get(
            "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)",
            {
              ":token": req.cookies.token,
            }
          );
          if (!accountdata) {
            break;
          }
        }
        messagefunctions[accountdata.accountID][msg.to].splice(functionidex, 1);
        ws.close();
      } else if (msg.type === "message" || msg.type === "file") {
        const time = new Date().getTime();
        const id = generate(100);
        if (
          messagefunctions[to] &&
          messagefunctions[to][accountdata.accountID]
        ) {
          for (const ws of messagefunctions[to][accountdata.accountID]) {
            ws.ws.send(
              JSON.stringify({
                type: "message",
                message: {
                  mine: false,
                  time,
                  message: msg.message,
                  file: msg.file,
                  id,
                },
              })
            );
          }
        }
        if (
          messagefunctions[accountdata.accountID] &&
          messagefunctions[accountdata.accountID][to]
        ) {
          for (const ws of messagefunctions[accountdata.accountID][to]) {
            if (ws.connectionID !== connectionID) {
              ws.ws.send(
                JSON.stringify({
                  type: "message",
                  message: {
                    mine: true,
                    time,
                    message: msg.message,
                    file: msg.file,
                    id,
                  },
                })
              );
            }
          }
        }
        await db
          .run(
            `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, file, time) VALUES  (:ID, :accountID, :toAccountID, :message, :file, :time)`,
            {
              ":ID": id,
              ":accountID": accountdata.accountID,
              ":toAccountID": to,
              ":message": msg.message,
              ":file": msg.file,
              ":time": time,
            }
          )
          .catch(console.error);
      } else if (msg.type === "typing") {
        if (
          messagefunctions[to] &&
          messagefunctions[to][accountdata.accountID]
        ) {
          for (const ws of messagefunctions[to][accountdata.accountID]) {
            ws.ws.send(
              JSON.stringify({
                type: "typing",
                typing: msg.typing,
                length: msg.length,
                specialchars: msg.specialchars,
              })
            );
          }
        }
      }
    });
  });
  90;
  app.post("/api/uploadfile", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
      {
        ":token": req.cookies.token,
      }
    );
    if (accountdata) {
      const { id, path, exists } = await createFileID(req.files.file);
      if (!exists) {
        req.files.file.mv(path);
      }
      res.send({ resp: true, id: id });
    } else {
      res.send({ resp: false, err: "invalid token" });
    }
  });
  app.get("/api/searchusers", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
      {
        ":token": req.cookies.token,
      }
    );
    if (accountdata) {
      res.send({
        resp: true,
        data: await db.all(
          `WITH frendslist AS (
            SELECT toAccountID
            FROM friends
            WHERE accountID == :accountID
        )
        SELECT username,
            tag,
            backgroundImage,
            profilePic,
            accountID as id
        FROM accounts
        WHERE accountID != :accountID
            and accountID not in frendslist
            and instr(lower(username || '#' || tag), lower(:search)) > 0
        LIMIT 10`,
          { ":search": req.query.q, ":accountID": accountdata.accountID }
        ),
      });
    } else {
      res.send({
        resp: false,
        err: "Invalid token!",
      });
    }
  });
  app.post("/api/frienduserfromid", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
      {
        ":token": req.cookies.token,
      }
    );
    if (accountdata) {
      const toFriendUserData = await db.get(
        "SELECT * FROM accounts WHERE accountID=:id LIMIT 1",
        {
          ":id": req.body.user,
        }
      );
      const alreadyfriendrequest = await db.get(
        "SELECT * FROM friends WHERE accountID=:accountID and toAccountID=:toAccountID",
        {
          ":accountID": accountdata.accountID,
          ":toAccountID": toFriendUserData.accountID,
        }
      );
      if (!alreadyfriendrequest) {
        const time = new Date().getTime();
        await db.run(
          `INSERT INTO friends (accountID, toAccountID, time) VALUES (:accountID, :toAccountID, :time)`,
          {
            ":accountID": accountdata.accountID,
            ":toAccountID": toFriendUserData.accountID,
            ":time": time,
          }
        );
      }
      res.send({
        friends:
          (await db.get(
            `WITH friendrequestlist as (
        SELECT accountID
        FROM friends
        WHERE toAccountID == :accountID
    )
    SELECT *
    FROM friends
    WHERE accountID == :accountID and toAccountID==:toAccountID
        and toAccountID in friendrequestlist`,
            {
              ":accountID": accountdata.accountID,
              ":toAccountID": toFriendUserData.accountID,
            }
          )) != null,
      });
    } else {
      res.send({ friends: false });
    }
  });
  app.get("/api/logout", async (req: any, res: any) => {
    await db.get("DELETE FROM tokens WHERE token=:token", {
      ":token": req.cookies.token,
    });
    res.send(true);
  });
  app.get("/api/userdatafromid", async (req: any, res: any) => {
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
  app.get("/api/getallcontacts", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
      {
        ":token": req.cookies.token,
      }
    );
    if (accountdata) {
      const oldcontacts = await db.all(
        `WITH friendrequestlist as (
      SELECT accountID
      FROM friends
      WHERE toAccountID == :accountID
  )
  SELECT toAccountID
  FROM friends
  WHERE accountID == :accountID
      and toAccountID in friendrequestlist`,
        { ":accountID": accountdata.accountID }
      );
      const contacts = [];
      for (const friend of oldcontacts) {
        contacts.push(
          await db.get(
            "SELECT username, accountID as id, profilePic, tag, backgroundImage FROM accounts WHERE accountID=:toAccountID",
            { ":toAccountID": friend.toAccountID }
          )
        );
      }
      res.send({
        resp: true,
        contacts,
      });
    } else {
      res.send({
        resp: false,
        err: "invalid token!",
      });
    }
  });
  app.get("/api/getuserdataonupdate", async (req: any, res: any) => {
    let open = true;
    const currentaccountdata = JSON.stringify(
      await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      )
    );
    for (let index = 0; index < 30; index++) {
      await snooze(1000);
      const nowaccountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const stringed = JSON.stringify(nowaccountdata);
      if (currentaccountdata !== stringed) {
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
  app.get("/api/userdata", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
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
  app.get("/files/:id", async (req: any, res: any) => {
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
  app.post("/api/setusername", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
      { ":token": req.cookies.token }
    );
    if (accountdata.password == hasher(req.body.pass + accountdata.salt)) {
      const exist = await db.get(
        "SELECT * FROM accounts WHERE username=:username and tag=:tag",
        { ":username": req.body.username, ":tag": accountdata.tag }
      );
      if (!exist) {
        await db.run(
          "UPDATE accounts SET username=:username WHERE accountID=:accountID",
          {
            ":username": req.body.username,
            ":accountID": accountdata.accountID,
          }
        );
        res.send({ resp: true });
      } else {
        res.send({
          resp: false,
          err: "someone already has that name with your tag!",
        });
      }
    } else {
      res.send({ resp: false, err: "incorrect password!" });
    }
  });
  app.post("/api/setbackgroundimage", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
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
  app.post("/api/setprofilepic", async (req: any, res: any) => {
    const accountdata = await db.get(
      "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
      { ":token": req.cookies.token }
    );
    if (accountdata) {
      if (req.files) {
        const { exists, path, id } = await createFileID(req.files.profilepic);
        if (!exists) {
          req.files.profilepic.mv(path);
        }
        await db.run(
          "UPDATE accounts SET profilePic=:profilePic WHERE accountID=:accountID",
          { ":profilePic": id, ":accountID": accountdata.accountID }
        );
        res.send({ resp: true });
      } else {
        res.send({ resp: false, err: "no image!" });
      }
    } else {
      res.send({ resp: false, err: "invalid cookie" });
    }
  });
  app.post("/login", async (req: any, res: any) => {
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
  app.post("/signup", async (req: any, res: any) => {
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
