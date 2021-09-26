import { Database, open } from "sqlite";
import express from "express";
import { forceDomain } from 'forcedomain';
import * as http from "http";
import * as fs from "fs";
import sqlite3 = require("sqlite3");
import cookieParser = require("cookie-parser");
import { createHash } from "crypto";
import path = require("path");
import mime = require("mime-types");
const snooze = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
import { generate } from "randomstring";
import WebSocket = require('ws');
import { NotificationEmail, VerificationEmail } from "./emailer";
import autoaccountdetails from "./autoaccountdetails.json";
import EmailValidation from 'emailvalid';
import {client, roleID, serverID, unlinkedroleID} from "./typechatbot";
import { MessageEmbed } from "discord.js";
require("./typechatbot")
console.time("express boot");

const ev = new EmailValidation()

const discordserver = "https://discord.gg/R6FnAaX8rC"

interface linkurls {linkID:{[key: string]: string}, discordID: {[key: string]: string}};

const linkurls: linkurls = {linkID:{}, discordID: {}}
let database: {db?:Database<sqlite3.Database, sqlite3.Statement>, linkurls: linkurls} = {linkurls}
const normallimit = 50000000
const blastlimit = 1000000000

function parseCookies(request: http.IncomingMessage) {
  const list: { [key: string]: any } = {},
    rc = request.headers.cookie;

  rc && rc.split(';').forEach(function (cookie: string) {
    const parts: string[] = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  });

  return list;
}

async function checkFileExists(file) {
  try {
    await fs.promises.access(file, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}
const truncate = (input: string, limit: number) =>
  input.length > limit ? `${input.substring(0, limit)}...` : input;

const notificationsockets: {
  [key: string]: {
    [key: string]: { focus: boolean;[key: string]: any }
  }
} = {};

const messagefunctions = {};

const toVerify: { [key: string]: string } = {}

const updateFunctions: { [key: string]: { [key: string]: Function } } = {};

function updateFromAccountID(accountID: string) {
  try {
    if (updateFunctions[accountID]) {
      for (const connectionID in updateFunctions[accountID]) {
        updateFunctions[accountID][connectionID]()
      }
    }
  } catch { }
}

(async () => {
  const tagGenerator = (): string => {
    const output = [];
    for (let i = 0; i < 4; i++) {
      output.push(String(Math.floor(Math.random() * 10)));
    }
    return output.join("");
  };
  const createFileID = async (file: any, from?: string) => {
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
      "INSERT INTO images (imageID, filename, hash, fromID) VALUES  (:id, :filename, :hash, :fromID)",
      {
        ":id": id,
        ":filename": filename,
        ":hash": hashed,
        ":fromID": from,
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


  async function DiscordNotification(accoutID: string, data: { title: string; message: string; to: string; sound?: string }) {
    const discordlink = await db.get("SELECT * FROM discordAccountLink WHERE accountID=:accountID", { ":accountID": accoutID })
    if (discordlink) {
      const discordAccount = client.users.cache.find(user => user.id == discordlink.discordID)
      await discordAccount.send({embeds: [new MessageEmbed().setColor("#5656ff").setTitle("New Notification 🎉").addField(data.title, data.message).setURL(new URL(data.to, "https://tchat.us.to/").href).setThumbnail("https://tchat.us.to/logo.png")]})
    }
  }
  const sendNotification = async (
    to: string,
    data: { title: string; message: string; to: string; sound?: string }
  ) => {
    if (notificationsockets[to]) {
      for (const ws of Object.keys(notificationsockets[to])) {
        notificationsockets[to][ws].ws.send(JSON.stringify(data));
      }
    }
    if (
      !(
        notificationsockets[to] &&
        getAllOnline(notificationsockets[to]).length > 0
      )
    ) {
      try {
        const { email } = await db.get(
          "SELECT email FROM accounts WHERE accountID=:to",
          {
            ":to": to,
          }
        );
        await NotificationEmail(email, data).catch();
        await DiscordNotification(to,data).catch();

      } catch (e) {
        console.error(e);
      }
    }
  };
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  database.db = db
  await Promise.all([
    db.run(
      "CREATE TABLE IF NOT EXISTS accounts (accountID, email, username, password, salt, profilePic, tag, backgroundImage, joined)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS tokens (accountID, token)"),
    db.run("CREATE TABLE IF NOT EXISTS friends (accountID, toAccountID, time)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS friendsChatMessages (ID,accountID, toAccountID, message, time, file, mimetype)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS groupchats (chatID, name, picture)"),
    db.run("CREATE TABLE IF NOT EXISTS groupchatUsers (chatID, accountID)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS groupchatMessages (ID,accountID, chatID, message, time, file, mimetype)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS images (imageID, filename, hash, fromID)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS blast (accountID, expires)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS uploadlogs (accountID, size, time, fileID)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS discordAccountLink (accountID, discordID, time)"
    ),
  ]);
  db.run("ALTER TABLE uploadlogs ADD fileID").catch(() => { });
  db.run("ALTER TABLE accounts ADD joined NUMBER DEFAULT 0").catch(() => { });
  db.run("ALTER TABLE friendsChatMessages ADD mimetype STRING").catch(() => { });
  let defaultaccount = await db.get(
    "SELECT * FROM accounts WHERE email=:email",
    {
      ":email": autoaccountdetails.email,
    }
  );
  if (!defaultaccount) {
    const salt = generate(150);
    const password = hasher(autoaccountdetails.pass + salt);
    await db.run(
      "INSERT INTO accounts (accountID, email, username, password, salt, tag, joined) VALUES  (:accountID, :email, :username, :password, :salt, :tag, :time)",
      {
        ":accountID": "TypeChat",
        ":email": autoaccountdetails.email,
        ":username": "TypeChat",
        ":password": password,
        ":salt": salt,
        ":tag": "OFFICIAL",
        ":time": new Date().getTime()
      }
    );
    defaultaccount = await db.get("SELECT * FROM accounts WHERE email=:email", {
      ":email": autoaccountdetails.email,
    });
  }
  if (!(await db.get(
    "SELECT * FROM blast WHERE accountID=:accountID",
    {
      ":accountID": defaultaccount.accountID,
    }
  ))) {
    await db.run(
      "INSERT INTO blast (accountID) VALUES (:accountID)",
      {
        ":accountID": defaultaccount.accountID,
      }
    );
  }
  const app = express()
  app.use(cookieParser());
  app.use(require("express-fileupload")());
  const getAllOnline = (sockets: {
    [key: string]: { focus: boolean;[key: string]: any };
  }): { focus: boolean;[key: string]: any }[] => {
    const online = [];
    for (const socket of Object.keys(sockets)) {
      if (sockets[socket].focus) {
        online.push(sockets[socket]);
      }
    }
    return online;
  };
  const serverboot = (glx: { httpsServer: any; httpServer: any; }) => {
    console.log(glx)
    const httpsServer = glx.httpsServer(null, app);

    httpsServer.listen(process.env.NODE_ENV === "development" ? 5000 : 443, "0.0.0.0", function () {
      console.info("Listening on ", httpsServer.address());
    });


    const httpServer = glx.httpServer();

    httpServer.listen(80, "0.0.0.0", function () {
      console.info("Listening on ", httpServer.address());
    });
    const ws = new WebSocket.Server({
      server: httpsServer
    });
    ws.on('connection', async (ws, req) => {
      let accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": parseCookies(req).token,
        }
      );
      if (req.url == "/notifications") {
        let lastping = 0;
        const connectionID = generate(20);
        const pingpong = async () => {
          await snooze(10000);
          ws.send(JSON.stringify({ type: "ping" }));
          await snooze(2500);
          const time = new Date().getTime();
          if (time - lastping > 5000) {
            ws.close();
          }
        };
        if (!accountdata) {
          return ws.close();
        }
        ws.on("message", (data: string) => {
          try {
          const msg = JSON.parse(data);
          if (msg.type == "pong") {
            lastping = new Date().getTime();
            pingpong();
          } else if (msg.type == "setFocus") {
            notificationsockets[accountdata.accountID][connectionID].focus =
              msg.focus;
          }} catch (e) {
            console.error(e, e.stack);
        }
        });
        ws.on("close", () => {
          delete notificationsockets[accountdata.accountID][connectionID];
        });
        if (!notificationsockets[accountdata.accountID]) {
          notificationsockets[accountdata.accountID] = {};
        }
        notificationsockets[accountdata.accountID][connectionID] = {
          ws,
          focus: true,
        };

        pingpong();
      } else if (req.url == "/groupchat") {
        if (!accountdata) {
          return ws.close();
        }
        let lastping = 0;
      } else if (req.url == "/chat") {
        let to: string;
        let mobile: boolean = false;
        const connectionID = generate(20);
        if (!accountdata) {
          return ws.close();
        }
        let lastping = 0;
        const pingpong = async () => {
          await snooze(10000);
          ws.send(JSON.stringify({ type: "ping" }));
          await snooze(2500);
          const time = new Date().getTime();
          if (time - lastping > 5000) {
            ws.close();
          }
        };
        ws.on("close", () => {
          if (to) {
            delete messagefunctions[accountdata.accountID][to][connectionID];
            if (
              getAllOnline(messagefunctions[accountdata.accountID][to]).length <=
              0 &&
              messagefunctions[to] &&
              messagefunctions[to][accountdata.accountID]
            ) {
              for (const ws of Object.keys(
                messagefunctions[to][accountdata.accountID]
              )) {
                messagefunctions[to][accountdata.accountID][ws].ws.send(
                  JSON.stringify({
                    type: "online",
                    online: false,
                  })
                );
              }
            }
          }
        });
        ws.on("message", async (data: string) => {
          try {
          const msg = JSON.parse(data);
          if (msg.type === "start") {
            if (msg.to === accountdata.accountID) {
              return ws.close();
            }

            if (to) {
              delete messagefunctions[accountdata.accountID][to][connectionID];
              if (
                getAllOnline(messagefunctions[accountdata.accountID][to]).length <=
                0 &&
                messagefunctions[to] &&
                messagefunctions[to][accountdata.accountID]
              ) {
                for (const ws of Object.keys(
                  messagefunctions[to][accountdata.accountID]
                )) {
                  messagefunctions[to][accountdata.accountID][ws].ws.send(
                    JSON.stringify({
                      type: "online",
                      online: false,
                    })
                  );
                }
              }
            }
            const messages = (
              await db.all(
                `SELECT * 
        FROM (SELECT
        ID, accountID as "from", message, time, file, mimetype
        FROM friendsChatMessages
        WHERE (
                accountID = :accountID
                and toAccountID = :toUser
            )
            or (
                accountID = :toUser
                and toAccountID = :accountID
            ) ORDER  BY time DESC) LIMIT :max`,
                {
                  ":accountID": accountdata.accountID,
                  ":toUser": msg.to,
                  ":max": msg.limit,
                }
              )
            ).reverse();
            const users = await db.get(
              `WITH friendrequestlist as (
        SELECT accountID
        FROM friends
        WHERE toAccountID == :accountID
    )
    SELECT *
    FROM friends 
    JOIN accounts ON friends.toAccountID=accounts.accountID
    WHERE friends.accountID == :accountID and friends.toAccountID==:ID
        and toAccountID in friendrequestlist`,
              {
                ":accountID": accountdata.accountID,
                ":ID": msg.to,
              }
            );
            if (users) {
              ws.send(
                JSON.stringify({
                  type: "setmessages",
                  messages,
                  users: {
                    [msg.to]: {
                      username: users.username,
                      id: users.accountID,
                      profilePic: users.profilePic,
                      tag: users.tag,
                      backgroundImage: users.backgroundImage,
                    },
                  },
                })
              );
            }
            to = String(msg.to);
            const allonline = getAllOnline(
              messagefunctions[to] && messagefunctions[to][accountdata.accountID]
                ? messagefunctions[to][accountdata.accountID]
                : []
            );
            ws.send(
              JSON.stringify({
                type: "online",
                online:
                  (messagefunctions[to] &&
                    messagefunctions[to][accountdata.accountID] &&
                    allonline.length > 0) === true,
                mobile:
                  allonline.length > 0
                    ? allonline[allonline.length - 1].mobile
                    : undefined,
              })
            );
            if (
              messagefunctions[to] &&
              messagefunctions[to][accountdata.accountID]
            ) {
              for (const ws of Object.keys(
                messagefunctions[to][accountdata.accountID]
              )) {
                messagefunctions[to][accountdata.accountID][ws].ws.send(
                  JSON.stringify({
                    type: "online",
                    online: true,
                    mobile: msg.mobile,
                  })
                );
              }
            }
            mobile = msg.mobile;
            if (!messagefunctions[accountdata.accountID]) {
              messagefunctions[accountdata.accountID] = {};
            }
            if (!messagefunctions[accountdata.accountID][msg.to]) {
              messagefunctions[accountdata.accountID][msg.to] = {};
            }
            messagefunctions[accountdata.accountID][msg.to][connectionID] = {
              connectionID,
              ws,
              mobile: msg.mobile,
              focus: true,
            };
          } else if (msg.type == "getmessages") {
            const messages = (
              await db.all(
                `SELECT * FROM (SELECT
        ID, accountID as "from", message, time, file, mimetype
        FROM friendsChatMessages
        WHERE (
                accountID = :accountID
                and toAccountID = :toUser
            )
            or (
                accountID = :toUser
                and toAccountID = :accountID
            ) ORDER  BY time DESC) LIMIT :start, :max`,
                {
                  ":accountID": accountdata.accountID,
                  ":toUser": to,
                  ":start": msg.start,
                  ":max": msg.max,
                }
              )
            ).reverse();
            for (const message of messages) {
              message.mine = message.mine === 1;
            }
            ws.send(
              JSON.stringify({
                type: "prependmessages",
                messages,
              })
            );
          } else if (
            msg.type == "setFocus" &&
            to &&
            messagefunctions[accountdata.accountID][to][connectionID]
          ) {
            messagefunctions[accountdata.accountID][to][connectionID].focus =
              msg.focus;
            if (
              (!msg.focus
                ? getAllOnline(messagefunctions[accountdata.accountID][to])
                  .length <= 0
                : true) &&
              messagefunctions[to] &&
              messagefunctions[to][accountdata.accountID]
            ) {
              for (const ws of Object.keys(
                messagefunctions[to][accountdata.accountID]
              )) {
                messagefunctions[to][accountdata.accountID][ws].ws.send(
                  JSON.stringify({
                    type: "online",
                    online: msg.focus,
                    mobile: msg.focus ? mobile : undefined,
                  })
                );
              }
            }
          } else if (msg.type == "pong") {
            lastping = new Date().getTime();
            pingpong();
          } else if (msg.type === "message" || msg.type === "file") {
            const time = new Date().getTime();
            const id = generate(100);
            if (
              messagefunctions[to] &&
              messagefunctions[to][accountdata.accountID]
            ) {
              for (const ws of Object.keys(
                messagefunctions[to][accountdata.accountID]
              )) {
                messagefunctions[to][accountdata.accountID][ws].ws.send(
                  JSON.stringify({
                    type: "message",
                    message: {
                      from: accountdata.accountID,
                      time,
                      message: msg.message,
                      file: msg.file,
                      mimetype: msg.mimetype,
                      ID: id,
                    },
                  })
                );
              }
            }
            if (
              messagefunctions[accountdata.accountID] &&
              messagefunctions[accountdata.accountID][to]
            ) {
              for (const ws of Object.keys(
                messagefunctions[accountdata.accountID][to]
              )) {
                if (
                  messagefunctions[accountdata.accountID][to][ws].connectionID !==
                  connectionID
                ) {
                  messagefunctions[accountdata.accountID][to][ws].ws.send(
                    JSON.stringify({
                      type: "message",
                      message: {
                        from: accountdata.accountID,
                        time,
                        message: msg.message,
                        file: msg.file,
                        mimetype: msg.mimetype,
                        ID: id,
                      },
                    })
                  );
                }
              }
            }
            if (
              !(
                messagefunctions[to] &&
                messagefunctions[to][accountdata.accountID] &&
                getAllOnline(messagefunctions[to][accountdata.accountID]).length > 0
              )
            ) {
              sendNotification(to, {
                title: accountdata.username,
                message: msg.message ? truncate(msg.message, 25) : "file",
                to: `/chat/${accountdata.accountID}`,
              });
            }
            await db
              .run(
                `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, file, time, mimetype) VALUES (:ID, :accountID, :toAccountID, :message, :file, :time, :mimetype)`,
                {
                  ":ID": id,
                  ":accountID": accountdata.accountID,
                  ":toAccountID": to,
                  ":message": msg.message,
                  ":file": msg.file,
                  ":mimetype": msg.mimetype,
                  ":time": time,
                }
              )
              .catch(console.error);
            ws.send(JSON.stringify({ type: "sent", tempid: msg.tempid, id }));
          } else if (msg.type === "typing") {
            if (
              messagefunctions[to] &&
              messagefunctions[to][accountdata.accountID]
            ) {
              for (const ws of Object.keys(
                messagefunctions[to][accountdata.accountID]
              )) {
                messagefunctions[to][accountdata.accountID][ws].ws.send(
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
        } catch (e) {
            console.error(e, e.stack);
        }
        });
        ws.send(JSON.stringify({ type: "start" }));
        pingpong();
      }
    })
    90;
    app.get("/api/uploadlimit", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const time = new Date().getTime()
      if (accountdata) {
        const blastdata = await db.get(
          "SELECT * FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
          {
            ":accountID": accountdata.accountID,
            ":time": time,
          }
        )
        const blast = Boolean(blastdata);
        const startofmonth = (Math.trunc(time / 2629743000) * 2629743000) + ((blast ? blastdata.expires : accountdata.joined) % 2629743000)
        const filelimit = blast ? blastlimit : normallimit
        const limitused = (await db.get(
          "SELECT SUM(size) as limitused FROM uploadlogs WHERE accountID=:accountID and time>=:startofmonth",
          {
            ":accountID": accountdata.accountID,
            ":startofmonth": startofmonth
          }
        )).limitused;
        const timeleft = 2629743000-(time - startofmonth)
        return res.send({ filelimit, limitused, timeleft })
      }
      return res.send({ filelimit: 0, limitused: 0, timeleft: 0 })
    })
    app.post("/api/uploadfile", async (req: any, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const time = new Date().getTime()
      if (accountdata) {
        const blastdata = await db.get(
          "SELECT * FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
          {
            ":accountID": accountdata.accountID,
            ":time": time,
          }
        )
        const blast = Boolean(blastdata);
        const startofmonth = (Math.trunc(time / 2629743000) * 2629743000) + (Number(blast ? blastdata.expires : accountdata.joined) % 2629743000)
        const filelimit = blast ? blastlimit : normallimit
        const limitused = (await db.get(
          "SELECT SUM(size) as limitused FROM uploadlogs WHERE accountID=:accountID and time>=:startofmonth",
          {
            ":accountID": accountdata.accountID,
            ":startofmonth": startofmonth
          }
        )).limitused;
        if ((filelimit >= limitused + req.files.file.size) || accountdata.accountID == defaultaccount.accountID) {
          const { id, path, exists } = await createFileID(
            req.files.file,
            accountdata.accountID
          );
          if (!exists) {
            req.files.file.mv(path);
          }
          await db.run("INSERT INTO uploadlogs (accountID, size, time, fileID) VALUES  (:accountID, :size, :time, :fileID)", { ":accountID": accountdata.accountID, ":size": req.files.file.size, ":time": time, ":fileID": id })
          res.send({ resp: true, id: id });
        }
        else {
          res.send({ resp: false, err: "This file is too big and would exceed your monthly upload limit." });
        }
      } else {
        res.send({ resp: false, err: "invalid token" });
      }
    });
    app.get("/api/searchusers", async (req, res) => {
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
    app.post("/api/frienduserfromid", async (req, res) => {
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
        if (toFriendUserData && accountdata.accountID != toFriendUserData.accountID) {
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
          const isfriends =
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
            )) != null;
          if (!alreadyfriendrequest) {
            if (isfriends) {
              sendNotification(toFriendUserData.accountID, {
                title: "New Contact!",
                message: `${accountdata.username}#${accountdata.tag} added you back!`,
                to: `/chat/${accountdata.accountID}`,
                sound: "/sounds/friends.mp3",
              });
            } else {
              sendNotification(toFriendUserData.accountID, {
                title: "Friend Request!",
                message: `${accountdata.username}#${accountdata.tag} sent a friend request!`,
                to: `/add`,
                sound: "/sounds/friendrequest.mp3",
              });
            }
          }
          res.send({
            friends: isfriends,
          });
        } else {
          res.send({ friends: false });
        }
      } else {
        res.send({ friends: false });
      }
    });
    app.get("/sounds/:filename", async (req, res) => {
      res.sendFile(path.join(__dirname, "sounds", req.params.filename));
    });
    app.get("/api/verify/:verificationID", async (req, res) => {
      if (toVerify[req.params.verificationID]) {
        const accountdata = await db.get(
          "SELECT * FROM accounts WHERE accountID=:accountID",
          {
            ":accountID": toVerify[req.params.verificationID],
          }
        )
        delete toVerify[req.params.verificationID]
        if (accountdata) {
          return res.send({
            verified: true,
            user: {
              username: accountdata.username,
              id: accountdata.accountID,
              profilePic: accountdata.profilePic,
              tag: accountdata.tag,
              backgroundImage: accountdata.backgroundImage,
            },
          })
        }
      }
      return res.send({
        verified: false,
      })
    })
    app.get("/api/logout", async (req, res) => {
      await db.get("DELETE FROM tokens WHERE token=:token", {
        ":token": req.cookies.token,
      });
      res.send(true);
    });
    app.get("/api/friendsuserdatafromid", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        const friendsaccountdata = await db.get(
          `WITH friendrequestlist as (
      SELECT accountID
      FROM friends
      WHERE toAccountID == :accountID
  )
  SELECT *
  FROM friends 
  JOIN accounts ON friends.toAccountID=accounts.accountID
  WHERE friends.accountID == :accountID and friends.toAccountID==:ID
      and toAccountID in friendrequestlist`,
          {
            ":accountID": accountdata.accountID,
            ":ID": req.query.id,
          }
        );
        if (!friendsaccountdata) {
          return res.send({ exists: false });
        } else {
          return res.send({
            exists: true,
            username: friendsaccountdata.username,
            id: friendsaccountdata.accountID,
            profilePic: friendsaccountdata.profilePic,
            tag: friendsaccountdata.tag,
            backgroundImage: friendsaccountdata.backgroundImage,
          });
        }
      } else {
        return res.send({ exists: false });
      }
    });
    app.get("/api/getallfriendrequests", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        const friendrequests = await db.all(
          `WITH sentfriendrequestlist as (
    SELECT toAccountID
    FROM friends
    WHERE accountID == :accountID
)
SELECT username, accounts.accountID as id, profilePic, tag, backgroundImage
FROM friends 
JOIN accounts ON friends.accountID=accounts.accountID
WHERE friends.toAccountID == :accountID 
    and accounts.accountID not in sentfriendrequestlist ORDER BY
    username ASC`,
          { ":accountID": accountdata.accountID }
        );
        res.send({
          resp: true,
          friendrequests,
        });
      } else {
        res.send({
          resp: false,
          err: "invalid token!",
        });
      }
    });
    app.get("/api/getallcontacts", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        const contacts = await db.all(
          `WITH friendrequestlist as (
    SELECT accountID
    FROM friends
    WHERE toAccountID == :accountID
)
SELECT username, accounts.accountID as id, profilePic, tag, backgroundImage
FROM friends 
JOIN accounts ON friends.toAccountID=accounts.accountID
WHERE friends.accountID == :accountID
    and toAccountID in friendrequestlist ORDER BY
    username ASC`,
          { ":accountID": accountdata.accountID }
        );
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
    app.get("/api/getuserdataonupdate", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const connectionID = generate(16)
      async function update() {
        if (updateFunctions[accountdata.accountID][connectionID]) { delete updateFunctions[accountdata.accountID][connectionID] }
        try {
          const newaccountdata = await db.get(
            "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
            {
              ":token": req.cookies.token,
            }
          );

          if (newaccountdata) {
            const blast = Boolean(await db.get(
              "SELECT * FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
              {
                ":accountID": newaccountdata.accountID,
                ":time": new Date().getTime(),
              }
            ));
            return res.send({
              loggedin: true,
              user: {
                username: newaccountdata.username,
                id: newaccountdata.accountID,
                profilePic: newaccountdata.profilePic,
                tag: newaccountdata.tag,
                backgroundImage: newaccountdata.backgroundImage,
                blast
              },
            });
          } else {
            return res.send({
              loggedin: false,
            });
          }
        } catch { }
      }
      if (accountdata) {
        if (!updateFunctions[accountdata.accountID]) {
          updateFunctions[accountdata.accountID] = {}
        }
        updateFunctions[accountdata.accountID][connectionID] = update
        await snooze(30000)
        if (updateFunctions[accountdata.accountID][connectionID]) {
          delete updateFunctions[accountdata.accountID][connectionID]
          return res.send({ reconnect: true });
        }
      }
    });
    app.get("/api/userdata", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (!accountdata) {
        return res.send({ loggedin: false });
      } else {
        const blast = Boolean(await db.get(
          "SELECT * FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
          {
            ":accountID": accountdata.accountID,
            ":time": new Date().getTime(),
          }
        ));
        return res.send({
          loggedin: true,
          user: {
            username: accountdata.username,
            id: accountdata.accountID,
            profilePic: accountdata.profilePic,
            tag: accountdata.tag,
            backgroundImage: accountdata.backgroundImage,
            blast
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
        const filepath = path.join(__dirname, "files", imagedata.filename)
        if (imagedata && await checkFileExists(filepath)) {
          return res.sendFile(filepath);
        }
      }
      return res.status(404).sendFile(path.join(__dirname, "unknown.png"));

    });
    app.get("/getprofilepicfromid", async (req, res) => {
      const imagedata = await db.get(
        `SELECT filename FROM images WHERE imageID=(SELECT profilePic FROM accounts WHERE accountID==:accountID)`,
        {
          ":accountID": req.query.id,
        }
      );
      if (imagedata) {
        res.sendFile(path.join(__dirname, "files", imagedata.filename));
      } else {
        res.status(404).send("image not found in the database!");
      }
    });
    app.get("/filecontenttype/:id", async (req, res) => {
      const imagedata = await db.get(
        `SELECT filename FROM images WHERE imageID=:id`,
        {
          ":id": req.params.id,
        }
      );
      if (imagedata) {
        res.send(mime.lookup(imagedata.filename));
      } else {
        res.status(404).send("image not found in the database!");
      }
    });
    app.post("/api/setusername", async (req, res) => {
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
          updateFromAccountID(accountdata.accountID)
          const discordlink = await db.get("SELECT * FROM discordAccountLink WHERE accountID=:accountID", { ":accountID": accountdata.accountID })
          if (discordlink) {
            const guild = client.guilds.cache.get(serverID)
            const memberonguild = guild?.members?.cache?.get(discordlink.discordID)
            memberonguild?.setNickname(req.body.username, "rename").catch(()=>{})
          }
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
          const fileiddata = await createFileID(
            req.files.backgroundImage,
            accountdata.accountID
          );
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
        updateFromAccountID(accountdata.accountID)
        res.send(true);
      } else {
        res.send(false);
      }
    });
    app.get("/api/link/:id", async (req, res)=>{
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        { ":token": req.cookies.token }
      );
      const time = new Date().getTime()
      if (accountdata) {
        const discordID = linkurls.linkID[req.params.id]
        if (discordID) {
        if (!toVerify[accountdata.accountID]) {
          const link = await db.get("SELECT * FROM discordAccountLink WHERE accountID=:accountID", { ":accountID": accountdata.accountID })
          if (!link) {
              const discordAccount = client.users.cache.find(user => user.id == discordID)
              if (discordAccount) {
                const discordlink = await db.get("SELECT * FROM discordAccountLink WHERE discordID=:discordID", { ":discordID": discordAccount.id })
                if (!discordlink) {
                  await db.run("INSERT INTO discordAccountLink (accountID, discordID, time) VALUES (:accountID, :discordID, :time)", { ":accountID": accountdata.accountID, ":discordID": discordAccount.id, ":time": time })
                  const guild = client.guilds.cache.get(serverID)
                  const memberonguild = guild.members.cache.get(discordAccount.id)
                  delete linkurls.discordID[linkurls.linkID[req.params.id]]
                  delete linkurls.linkID[req.params.id]
                  await memberonguild.setNickname(accountdata.username, "linked").catch(()=>{})
                  await memberonguild.roles.add(roleID, "linked").catch(()=>{})
                  await memberonguild.roles.remove(unlinkedroleID, "linked").catch(()=>{})
                  discordAccount.dmChannel.send({embeds: [new MessageEmbed().setColor("#5656ff").setTitle("Linked 🔒").setDescription(`your account has been linked with \`${accountdata.username}#${accountdata.tag}\`, type \`!unlink\` to unlink your discord account from your typechat account!`).setThumbnail(`https://tchat.us.to/files/${accountdata.profilePic}`)]})
                  return res.send({linked: true})
                }else{
                  return res.send({linked: false, error: "this discord account is already linked with a typechat account!"})
                }
              } else{
                return res.send({linked: false, error: "invalid discord account or discord account not on server!"})
              }
            } else{
              return res.send({linked: false, error: "this typechat account has already been linked with a discord account!"})
              }
          } else {
            return res.send({linked: false, error: "Your account must be verified before you link your discord account!"})
          }
        } else{
          return res.send({linked: false, error: "invaild link ID, maybe try create a new link url!"})
          }
      } else {
      return res.send({linked: false, error: "invalid token!"})
    }
    })
    app.post("/api/setprofilepic", async (req: any, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        { ":token": req.cookies.token }
      );
      if (accountdata) {
        if (req.files) {
          const { exists, path, id } = await createFileID(
            req.files.profilepic,
            accountdata.accountID
          );
          if (!exists) {
            req.files.profilepic.mv(path);
          }
          await db.run(
            "UPDATE accounts SET profilePic=:profilePic WHERE accountID=:accountID",
            { ":profilePic": id, ":accountID": accountdata.accountID }
          );
          updateFromAccountID(accountdata.accountID)
          res.send({ resp: true });
        } else {
          res.send({ resp: false, err: "no image!" });
        }
      } else {
        res.send({ resp: false, err: "invalid cookie" });
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
    app.post("/signup", async (req: any, res) => {
      const emailInUse =
        (await db.get("SELECT * FROM accounts WHERE email=:email", {
          ":email": req.body.email,
        })) != undefined;
      if (ev.check(req.body.email).valid) {
        return res.send({ resp: false, err: "Please use a valid email!" });
      } else if (emailInUse) {
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
        } = await createFileID(req.files.profile, accountID);
        if (!exists) {
          req.files.profile.mv(profilePath);
        }
        const time = new Date().getTime();
        const firstMessage = `Hello ${req.body.uname}#${tag}! The Team hope you will enjoy your time on typechat! If you have any issues, just text us! 💬✅`;
        await Promise.all([
          db.run(
            "INSERT INTO accounts (accountID, email, username, password, salt, profilePic, tag, joined) VALUES  (:accountID, :email, :username, :password, :salt, :profilePic, :tag, :time)",
            {
              ":accountID": accountID,
              ":email": req.body.email,
              ":username": req.body.uname,
              ":password": password,
              ":salt": salt,
              ":profilePic": profileID,
              ":tag": tag,
              ":time": time,
            } // work on this next! // thanks lol
          ),
          db.run(
            "INSERT INTO tokens (accountID, token) VALUES  (:accountID, :token)",
            { ":accountID": accountID, ":token": token }
          ),
          db.run(
            "INSERT INTO friends (accountID, toAccountID, time) VALUES (:accountID, :toAccountID, :time)",
            {
              ":accountID": accountID,
              ":toAccountID": defaultaccount.accountID,
              ":time": time,
            }
          ),
          db.run(
            "INSERT INTO friends (accountID, toAccountID, time) VALUES (:accountID, :toAccountID, :time)",
            {
              ":accountID": defaultaccount.accountID,
              ":toAccountID": accountID,
              ":time": time,
            }
          ),
          db.run(
            `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time) VALUES (:ID, :accountID, :toAccountID, :message, :time)`,
            {
              ":ID": generate(100),
              ":accountID": defaultaccount.accountID,
              ":toAccountID": accountID,
              ":message": firstMessage,
              ":time": time - 2000,
            }
          ),
          db.run(
            `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time) VALUES (:ID, :accountID, :toAccountID, :message, :time)`,
            {
              ":ID": generate(100),
              ":accountID": defaultaccount.accountID,
              ":toAccountID": accountID,
              ":message": "A verification email has been sent to your email, you have 1 hour to verify your account before your account is disabled. If your account is disabled before you verify, you can create a new one under the same email. 📧✅",
              ":time": time - 1000,
            }
          ),
          db.run(
            `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time) VALUES (:ID, :accountID, :toAccountID, :message, :time)`,
            {
              ":ID": generate(100),
              ":accountID": defaultaccount.accountID,
              ":toAccountID": accountID,
              ":message": "Dont forget to check out Blast 🚀!\n\nTypechat is and always will be free, however to help us pay for the costs of our platform we rely on the Blast 🚀 subscription service.\n\nTo learn more go to https://tchat.us.to/blast",
              ":time": time,
            }
          )
        ]);
        res.send({ resp: true, token });
        const verificationID = generate(100)
        toVerify[verificationID] = accountID
        VerificationEmail(req.body.email, verificationID)
        await snooze(3600000)
        if (toVerify[verificationID]) {
          const newemail = generate(15) + "@typechat.us.to"
          const salt = generate(150);
          const password = hasher(autoaccountdetails.pass + salt);
          const message = `lol, i did verify my email, my email is now ${newemail} and you already know what the password would be set to lol.`
          await Promise.all([
            db.run(
              `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time) VALUES (:ID, :accountID, :toAccountID, :message, :time)`,
              {
                ":ID": generate(100),
                ":accountID": accountID,
                ":toAccountID": defaultaccount.accountID,
                ":message": message,
                ":time": new Date().getTime(),
              }
            ),
            db.run(
              `DELETE FROM tokens WHERE accountID = :accountID`,
              {
                ":accountID": accountID,
              }
            ),
            db.run(`UPDATE accounts
            SET email = :email, salt = :salt, password = :password
            WHERE accountID = :accountID;`, { ":email": newemail, ":salt": salt, ":password": password, ":accountID": accountID })])
          sendNotification(defaultaccount.accountID, {
            title: "Not verified lol",
            message: truncate(message, 25),
            to: `/chat/${defaultaccount.accountID}`,
          });
          updateFromAccountID(accountID)
        }
      }
    });
    if (!(process.env.NODE_ENV === "development")) {
      app.use(forceDomain({ hostname: "tchat.us.to" }));
    }
    app.get("/logo.png", (_, res) => res.sendFile(path.join(__dirname, "logo.svg")))
    app.get("/invite", (_, res) => res.redirect(discordserver))
    app.use(express.static(path.join(__dirname, "typechat", "build")));
    app.use((_: any, res: any) => {
      res.sendFile(path.join(__dirname, "typechat", "build", "index.html"));
    });
  }
  console.log(process.env.NODE_ENV, "boot up")
  if (process.env.NODE_ENV === "development") {
    serverboot({ httpsServer: () => http.createServer(app), httpServer: () => { return { listen: () => { } } } })
  } else {

    require("greenlock-express")
      .init({
        packageRoot: __dirname,
        configDir: "./greenlock.d",

        // contact for security and critical bug notices
        maintainerEmail: "epicugric@gmail.com",

        // whether or not to run at cloudscale
        cluster: false,
        approveDomains: ['typechat.us.to', 'www.typechat.us.to', 'typechat.uk.to', 'www.typechat.uk.to']
      }).ready(serverboot)
  }
})();
export default database