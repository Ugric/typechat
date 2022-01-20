import { Database, open } from "sqlite";
import express from "express";
import { forceDomain } from "forcedomain";
import * as http from "http";
import * as fs from "fs";
import sqlite3 = require("sqlite3");
import cookieParser = require("cookie-parser");
import { BinaryLike, createHash } from "crypto";
import path = require("path");
import mime = require("mime-types");
const snooze = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
import { generate } from "randomstring";
import WebSocket = require("ws");
import { NotificationEmail, PasswordEmail, VerificationEmail } from "./emailer";
import autoaccountdetails from "./autoaccountdetails.json";
import EmailValidation from "emailvalid";
import { client, roleID, serverID, unlinkedroleID } from "./typechatbot";
import { MessageEmbed } from "discord.js";
import urlMetadata from "url-metadata";
import greenlockexpress from "greenlock-express";
import paypal from "@paypal/checkout-server-sdk";
import fetch from "node-fetch";
import { URLSearchParams } from "url";



console.time("express boot");

const testRECAP3 = (secret: string, response: string) =>
  fetch(
    `https://www.google.com/recaptcha/api/siteverify?` +
    new URLSearchParams({ secret, response })
  )
    .then((resp: { json: () => Promise<any> }) => resp.json())
    .then((json: { success: any }) => {
      return json.success;
    })
    .catch(() => false);

const environment =
  process.env.NODE_ENV === "development"
    ? new paypal.core.SandboxEnvironment(
      "AeuWaW6AFfWlxVmxWYsof3Z9Gl6a055HPJh_UQO-0v1Fb5I12UYwteo_JsiitmIncsQETAu0Yw81wfH0",
      "EAmkLLRgEYRvV7-3ijZry_bQPK82UwkKrKT9SQjTZJGHkb7Lu9sVDVUjJJWFUt5l-4v8ejCyU2LRhlur"
    )
    : new paypal.core.LiveEnvironment(
      "Afdcs6hnKtTzRMY5fV_hT60anRq51JteUwrlpchS3Rs3LyEp6a33tqWmhhzj6jMkq6ZdpWmAcwB2Bkmg",
      "EA87J47CS97x5ThWeC332UEkgh1voNVc4uQJA5vNXvFpJ1tKIkispLVuzWiFM5X03cNUpwI14ztYK44K"
    );
const PPclient = new paypal.core.PayPalHttpClient(environment);

const tempmetadata: { [key: string]: urlMetadata.Result } = {};

const ev = new EmailValidation();
const RECAPsecret = "6LcHJdYcAAAAAG2S8MePwtuTv0RqZLcJ2QG6zLfw";

const discordserver = "https://discord.gg/R6FnAaX8rC";

interface linkurls {
  linkID: { [key: string]: string };
  discordID: { [key: string]: string };
}

const updatepassword: {
  [key: string]: string;
} = {};

const linkurls: linkurls = { linkID: {}, discordID: {} };
let database: {
  db?: Database<sqlite3.Database, sqlite3.Statement>;
  linkurls: linkurls;
} = { linkurls };
const normallimit = 100000000;
const blastlimit = 500000000;

function parseCookies(request: http.IncomingMessage) {
  const list: { [key: string]: any } = {},
    rc = request.headers.cookie;

  rc &&
    rc.split(";").forEach(function (cookie: string) {
      const parts: string[] = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });

  return list;
}

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const blastSaleOff = (
  startofweek: number = Math.trunc(new Date().getTime() / 6.048e8) * 6.048e8
) => (5 * Math.round(mulberry32(startofweek + 99556484639)() * 5)) / 100;

async function checkFileExists(file: fs.PathLike) {
  try {
    await fs.promises.access(file, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
const truncate = (input: string, limit: number) =>
  input.length > limit ? `${input.substring(0, limit)}...` : input;

const notificationsockets: Record<
  string,
  Record<string, { [key: string]: any; focus: boolean }>
> = {};

const messagefunctions = {};

const toVerify: Record<string, string> = {};

const toVerifyAccountID: Record<string, string> = {};

const updateFunctions: Record<string, Record<string, Function>> = {};

function updateFromAccountID(accountID: string) {
  try {
    if (updateFunctions[accountID]) {
      for (const connectionID in updateFunctions[accountID]) {
        updateFunctions[accountID][connectionID]();
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
  const createFileID = async (
    file: { data: BinaryLike; mimetype: string; name: string },
    from?: string
  ) => {
    const hashed = createHash("md5").update(file.data).digest("hex");
    const existsindatabase = await db.get(
      "SELECT * FROM images WHERE hash=:hash LIMIT 1",
      { ":hash": hashed }
    );
    const id = generate(25);
    const filename = !existsindatabase
      ? generate(45) + "." + mime.extension(file.mimetype)
      : existsindatabase.filename;
    const paths = path.join(__dirname, "files", filename);
    const originalfilename = file.name;
    db.run(
      "INSERT INTO images (imageID, filename, hash, fromID, originalfilename, mimetype) VALUES  (:id, :filename, :hash, :fromID, :originalfilename, :mimetype)",
      {
        ":id": id,
        ":filename": filename,
        ":hash": hashed,
        ":fromID": from,
        ":originalfilename": originalfilename,
        ":mimetype": file.mimetype,
      }
    );
    return {
      id,
      filename,
      path: paths,
      exists: Boolean(existsindatabase),
    };
  };
  const hasher = (string: string) =>
    createHash("sha256").update(string).digest("hex");
  async function DiscordNotification(
    accoutID: string,
    data: { title: string; message: string; to: string; sound?: string }
  ) {
    const discordlink = await db.get(
      "SELECT * FROM discordAccountLink WHERE accountID=:accountID",
      { ":accountID": accoutID }
    );
    if (discordlink) {
      const discordAccount = client.users.cache.find(
        (user) => user.id == discordlink.discordID
      );
      if (discordAccount) {
        await discordAccount.send({
          embeds: [
            new MessageEmbed()
              .setColor("#5656ff")
              .setTitle("New Notification 🎉")
              .addField(data.title, data.message)
              .setURL(new URL(data.to, "https://tchat.us.to/").href)
              .setThumbnail("https://tchat.us.to/logo.png"),
          ],
        });
      }
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
        const { email, discordnotification, emailnotification } = await db.get(
          "SELECT email, discordnotification, emailnotification FROM accounts WHERE accountID=:to",
          {
            ":to": to,
          }
        );
        if (emailnotification) {
          NotificationEmail(email, data).catch(console.error);
        }
        if (discordnotification) {
          DiscordNotification(to, data).catch(console.error);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  database.db = db;
  await Promise.all([
    db.run(
      "CREATE TABLE IF NOT EXISTS accounts (accountID, email, username, password, salt, profilePic, tag, backgroundImage, joined, discordnotification, emailnotification)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS tokens (accountID, token)"),
    db.run("CREATE TABLE IF NOT EXISTS friends (accountID, toAccountID, time)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS friendsChatMessages (ID,accountID, toAccountID, message, time, file, mimetype, deleted, gift, amount)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS groupchats (chatID, name, picture)"),
    db.run("CREATE TABLE IF NOT EXISTS groupchatUsers (chatID, accountID)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS groupchatMessages (ID,accountID, chatID, message, time, file, mimetype)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS images (imageID, filename, hash, fromID, originalfilename, mimetype)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS blast (accountID, expires, fuel)"),
    db.run("CREATE TABLE IF NOT EXISTS rocketFuelPoints (accountID, used)"),
    db.run(
      "CREATE TABLE IF NOT EXISTS uploadlogs (accountID, size, time, fileID)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS discordAccountLink (accountID, discordID, time)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS badges (accountID, name, added, expires)"
    ),
    db.run(
      "CREATE TABLE IF NOT EXISTS friendsChatLastMessageSent (accountID, toAccountID, time)"
    ),
    db.run("CREATE TABLE IF NOT EXISTS christmasOpened (accountID, year)"),
  ]);
  db.run("ALTER TABLE friendsChatMessages ADD deleted DEFAULT false").catch(
    () => { }
  );
  db.run("ALTER TABLE friendsChatMessages ADD edited DEFAULT false").catch(
    () => { }
  );
  db.run("ALTER TABLE images ADD mimetype").catch(() => { });
  db.run("ALTER TABLE images ADD originalfilename").catch(() => { });
  db.run("ALTER TABLE uploadlogs ADD fileID").catch(() => { });
  db.run("ALTER TABLE friendsChatMessages ADD gift").catch(() => { });
  db.run("ALTER TABLE friendsChatMessages ADD amount").catch(() => { });
  db.run("ALTER TABLE rocketFuelPoints ADD used DEFAULT false").catch(() => { });
  db.run("ALTER TABLE blast ADD fuel DEFAULT 1").catch(() => { });
  db.run("ALTER TABLE accounts ADD discordnotification DEFAULT true").catch(
    () => { }
  );
  db.run("ALTER TABLE accounts ADD emailnotification DEFAULT true").catch(
    () => { }
  );
  db.run("ALTER TABLE accounts ADD joined NUMBER DEFAULT 0").catch(() => { });
  db.run("ALTER TABLE friendsChatMessages ADD mimetype STRING").catch(() => { });
  let defaultaccount = await db.get(
    "SELECT * FROM accounts WHERE email=:email",
    {
      ":email": autoaccountdetails.email,
    }
  );

  async function updateFriendMessageTiming(
    accountID: string,
    toAccountID: string
  ) {
    if (
      await db.get(
        "SELECT * FROM friendsChatLastMessageSent WHERE accountID=:accountID AND toAccountID=:toAccountID",
        {
          ":accountID": accountID,
          ":toAccountID": toAccountID,
        }
      )
    ) {
      db.run(
        "UPDATE friendsChatLastMessageSent SET time=:time WHERE accountID=:accountID AND toAccountID=:toAccountID",
        {
          ":accountID": accountID,
          ":toAccountID": toAccountID,
          ":time": Date.now(),
        }
      );
    } else {
      db.run(
        "INSERT INTO friendsChatLastMessageSent (accountID, toAccountID, time) VALUES (:accountID, :toAccountID, :time)",
        {
          ":accountID": accountID,
          ":toAccountID": toAccountID,
          ":time": Date.now(),
        }
      );
    }
  }
  function getBadgesFromAccountID(accountID: string) {
    return db.all(
      "SELECT name FROM badges WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
      { ":accountID": accountID, ":time": new Date().getTime() }
    );
  }
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
        ":time": new Date().getTime(),
      }
    );
    defaultaccount = await db.get("SELECT * FROM accounts WHERE email=:email", {
      ":email": autoaccountdetails.email,
    });
  }
  if (!(await db.get("SELECT * FROM badges WHERE accountID='TypeChat'"))) {
    await db.run(
      "INSERT INTO badges (accountID, name) VALUES ('TypeChat', 'admin')"
    );
    await db.run(
      "INSERT INTO badges (accountID, name) VALUES ('TypeChat', 'verified')"
    );
    await db.run(
      "INSERT INTO badges (accountID, name) VALUES ('TypeChat', 'nodejs')"
    );
    await db.run(
      "INSERT INTO badges (accountID, name) VALUES ('TypeChat', 'discord')"
    );
    await db.run(
      "INSERT INTO badges (accountID, name) VALUES ('TypeChat', 'Blast')"
    );
  }
  async () => {
    for (const user of await db.all(
      "SELECT * FROM accounts WHERE accountID!='TypeChat'"
    )) {
      if (
        !(await db.get(
          "SELECT * FROM rocketFuelPoints WHERE accountID=:accountID and used=false",
          { ":accountID": user.accountID }
        ))
      ) {
        const topromise = [];
        for (let i = 0; i < 1; i++) {
          topromise.push(
            db.run(
              "INSERT INTO rocketFuelPoints (accountID, used) VALUES (:accountID, false)",
              { ":accountID": user.accountID }
            )
          );
        }
        await Promise.all(topromise);
      }
      if (
        !(await db.get(
          "SELECT * FROM badges WHERE accountID=:accountID and name='Beta Tester'",
          { ":accountID": user.accountID }
        ))
      ) {
        db.run(
          "INSERT INTO badges (accountID, name) VALUES (:accountID, 'Beta Tester')",
          { ":accountID": user.accountID }
        );
      }
    }
  };
  if (
    !(await db.get("SELECT * FROM blast WHERE accountID=:accountID", {
      ":accountID": defaultaccount.accountID,
    }))
  ) {
    await db.run("INSERT INTO blast (accountID, fuel) VALUES (:accountID, 1)", {
      ":accountID": defaultaccount.accountID,
    });
  }
  const app = express();
  app.use(require("morgan")("tiny"));
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
  const serverboot = (glx: { httpsServer: any; httpServer: any }) => {
    console.log(glx);
    const httpsServer = glx.httpsServer(null, app);

    httpsServer.listen(
      5000,
      "0.0.0.0",
      function () {
        console.info("Listening on ", httpsServer.address());
      }
    );

    const httpServer = glx.httpServer();

    httpServer.listen(80, "0.0.0.0", function () {
      console.info("Listening on ", httpServer.address());
    });
    const ws = new WebSocket.Server({
      server: httpsServer,
    });
    ws.on("connection", async (ws, req) => {
      let accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": parseCookies(req).token,
        }
      );
      console.log('ws connection', req.url);
      if (["/notifications", '/notifications-bg'].includes(req.url)) {
        let lastping = 0;
        const connectionID = generate(20);
        const pingpong = async () => {
          await snooze(10000);
          ws.send(JSON.stringify({ type: "ping" }), () => { });
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
            }
          } catch (e) {
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
          focus: req.url !== '/notifications-bg',
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
          ws.send(JSON.stringify({ type: "ping" }), () => { });
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
              getAllOnline(messagefunctions[accountdata.accountID][to])
                .length <= 0 &&
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
                delete messagefunctions[accountdata.accountID][to][
                  connectionID
                ];
                if (
                  getAllOnline(messagefunctions[accountdata.accountID][to])
                    .length <= 0 &&
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
        ID, accountID as "from", message, time, file, mimetype, edited, gift, amount
        FROM friendsChatMessages
        WHERE (
                accountID = :accountID
                and toAccountID = :toUser
                and deleted=false
            )
            or (
                accountID = :toUser
                and toAccountID = :accountID
                and deleted=false
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
                const badges = await getBadgesFromAccountID(users.accountID);
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
                        badges,
                      },
                    },
                  })
                );
              }
              to = String(msg.to);
              const allonline = getAllOnline(
                messagefunctions[to] &&
                  messagefunctions[to][accountdata.accountID]
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
            } else if (msg.type == "delete") {
              const id = msg.id;
              const isowned = Boolean(
                await db.get(
                  "SELECT * from friendsChatMessages WHERE deleted=false and ID=:id and accountID=:accountID",
                  { ":id": id, ":accountID": accountdata.accountID }
                )
              );
              if (isowned) {
                db.run(
                  "UPDATE friendsChatMessages SET deleted=true WHERE deleted=false and ID=:id and accountID=:accountID",
                  { ":id": id, ":accountID": accountdata.accountID }
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
                        type: "delete",
                        id,
                        from: accountdata.accountID,
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
                      messagefunctions[accountdata.accountID][to][ws]
                        .connectionID !== connectionID
                    ) {
                      messagefunctions[accountdata.accountID][to][ws].ws.send(
                        JSON.stringify({
                          type: "delete",
                          id,
                          from: accountdata.accountID,
                        })
                      );
                    }
                  }
                }
              }
            } else if (msg.type == "edit") {
              const id = msg.id;
              const message = String(msg.message);
              const isowned = Boolean(
                await db.get(
                  "SELECT * from friendsChatMessages WHERE deleted=false and ID=:id and accountID=:accountID",
                  { ":id": id, ":accountID": accountdata.accountID }
                )
              );
              if (isowned) {
                db.run(
                  "UPDATE friendsChatMessages SET message=:message, edited=true WHERE deleted=false and ID=:id and accountID=:accountID",
                  {
                    ":id": id,
                    ":accountID": accountdata.accountID,
                    ":message": message,
                  }
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
                        type: "edit",
                        id,
                        message,
                        from: accountdata.accountID,
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
                      messagefunctions[accountdata.accountID][to][ws]
                        .connectionID !== connectionID
                    ) {
                      messagefunctions[accountdata.accountID][to][ws].ws.send(
                        JSON.stringify({
                          type: "edit",
                          id,
                          message,
                          from: accountdata.accountID,
                        })
                      );
                    }
                  }
                }
              }
            } else if (msg.type == "getmessages") {
              const messages = (
                await db.all(
                  `SELECT * FROM (SELECT
        ID, accountID as "from", message, time, file, mimetype, edited, gift, amount
        FROM friendsChatMessages
        WHERE (
                accountID = :accountID
                and toAccountID = :toUser
                and deleted=false
            )
            or (
                accountID = :toUser
                and toAccountID = :accountID
                and deleted=false
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
            } else if (msg.type === "gift") {
              const rocketFuel: any = (
                await db.all(
                  "SELECT * FROM rocketFuelPoints WHERE accountID=:accountID and used=false",
                  {
                    ":accountID": accountdata.accountID,
                  }
                )
              ).length;
              if (rocketFuel >= msg.amount) {
                const time = new Date().getTime();
                const id = generate(100);
                await db.run(
                  "UPDATE rocketFuelPoints SET accountID=:toAccountID WHERE rowid in (SELECT rowid FROM rocketFuelPoints WHERE accountID=:accountID and used=false LIMIT :limit)",
                  {
                    ":accountID": accountdata.accountID,
                    ":toAccountID": to,
                    ":limit": msg.amount,
                  }
                );
                updateFromAccountID(accountdata.accountID);
                updateFromAccountID(to);
                if (
                  messagefunctions[to] &&
                  messagefunctions[to][accountdata.accountID]
                ) {
                  for (const ws of Object.keys(
                    messagefunctions[to][accountdata.accountID]
                  )) {
                    messagefunctions[to][accountdata.accountID][ws].ws.send(
                      JSON.stringify({
                        type: "gift",
                        message: {
                          from: accountdata.accountID,
                          time,
                          message: msg.message,
                          ID: id,
                          amount: msg.amount,
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
                      messagefunctions[accountdata.accountID][to][ws]
                        .connectionID !== connectionID
                    ) {
                      messagefunctions[accountdata.accountID][to][ws].ws.send(
                        JSON.stringify({
                          type: "gift",
                          message: {
                            from: accountdata.accountID,
                            time,
                            message: msg.message,
                            ID: id,
                            amount: msg.amount,
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
                    getAllOnline(messagefunctions[to][accountdata.accountID])
                      .length > 0
                  )
                ) {
                  sendNotification(to, {
                    title: "NEW GIFT 🎁",
                    message: `${accountdata.username}#${accountdata.tag} sent you a gift!`,
                    to: `/chat/${accountdata.accountID}`,
                  });
                }
                await db
                  .run(
                    `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time, deleted, gift, amount) VALUES (:ID, :accountID, :toAccountID, :message, :time, false, true, :amount)`,
                    {
                      ":ID": id,
                      ":accountID": accountdata.accountID,
                      ":toAccountID": to,
                      ":message": msg.message,
                      ":time": time,
                      ":amount": msg.amount,
                    }
                  )
                  .catch(console.error);
                ws.send(
                  JSON.stringify({ type: "sent", tempid: msg.tempid, id })
                );
              }
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
                    messagefunctions[accountdata.accountID][to][ws]
                      .connectionID !== connectionID
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
                  getAllOnline(messagefunctions[to][accountdata.accountID])
                    .length > 0
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
                  `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, file, time, mimetype, deleted) VALUES (:ID, :accountID, :toAccountID, :message, :file, :time, :mimetype, false)`,
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
              updateFriendMessageTiming(accountdata.accountID, to);
              updateFriendMessageTiming(to, accountdata.accountID);
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
                      by: accountdata.accountID,
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
    });
    90;
    app.get("/api/uploadlimit", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const time = new Date().getTime();
      if (accountdata) {
        const blastdata = await db.get(
          "SELECT * FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
          {
            ":accountID": accountdata.accountID,
            ":time": time,
          }
        );
        const startofmonth =
          Math.trunc(time / 2629743000) * 2629743000 +
          ((blastdata ? blastdata.expires : accountdata.joined) % 2629743000);
        const filelimit = blastdata ? blastlimit * blastdata.fuel : normallimit;
        const limitused = (
          await db.get(
            "SELECT SUM(size) as limitused FROM uploadlogs WHERE accountID=:accountID and time>=:startofmonth",
            {
              ":accountID": accountdata.accountID,
              ":startofmonth": startofmonth,
            }
          )
        ).limitused;
        const timeleft = 2629743000 - (time - startofmonth);
        return res.send({ filelimit, limitused, timeleft });
      }
      return res.send({ filelimit: 0, limitused: 0, timeleft: 0 });
    });
    app.post("/api/deltefile");
    app.post("/api/uploadfile", async (req: any, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const time = new Date().getTime();
      if (accountdata) {
        const blastdata = await db.get(
          "SELECT * FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
          {
            ":accountID": accountdata.accountID,
            ":time": time,
          }
        );
        const blast = Boolean(blastdata);
        const startofmonth =
          Math.trunc(time / 2629743000) * 2629743000 +
          (Number(blast ? blastdata.expires : accountdata.joined) % 2629743000);
        const filelimit = blast ? blastlimit * blastdata.fuel : normallimit;
        const limitused = (
          await db.get(
            "SELECT SUM(size) as limitused FROM uploadlogs WHERE accountID=:accountID and time>=:startofmonth",
            {
              ":accountID": accountdata.accountID,
              ":startofmonth": startofmonth,
            }
          )
        ).limitused;
        if (
          filelimit >= limitused + req.files.file.size ||
          accountdata.accountID == defaultaccount.accountID
        ) {
          const { id, path, exists } = await createFileID(
            req.files.file,
            accountdata.accountID
          );
          if (!exists) {
            req.files.file.mv(path);
          }
          await db.run(
            "INSERT INTO uploadlogs (accountID, size, time, fileID) VALUES  (:accountID, :size, :time, :fileID)",
            {
              ":accountID": accountdata.accountID,
              ":size": req.files.file.size,
              ":time": time,
              ":fileID": id,
            }
          );
          res.send({ resp: true, id: id });
        } else {
          res.send({
            resp: false,
            err: "This file is too big and would exceed your monthly upload limit.",
          });
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
        if (
          toFriendUserData &&
          accountdata.accountID != toFriendUserData.accountID
        ) {
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
        );
        delete toVerify[req.params.verificationID];
        delete toVerifyAccountID[accountdata.accountID];
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
          });
        }
      }
      return res.send({
        verified: false,
      });
    });
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
    app.get("/api/getimagedata", async (req, res) => {
      const imagedata = await db.get(
        "SELECT imageID as id, originalfilename as filename, mimetype FROM uploadlogs JOIN images ON uploadlogs.fileID=images.imageID WHERE imageID=:id",
        { ":id": req.query.id }
      );
      return res.send(imagedata);
    });
    app.get("/api/mydrive", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        const fileslist = (
          await db.all(
            "SELECT imageID as id, originalfilename as filename, mimetype FROM uploadlogs JOIN images ON uploadlogs.fileID=images.imageID WHERE uploadlogs.accountID=:accountID and images.originalfilename is not NULL",
            { ":accountID": accountdata.accountID }
          )
        ).reverse();
        return res.send(fileslist);
      } else {
        return res.send(false);
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
SELECT username, accounts.accountID as id, profilePic, tag, backgroundImage, (SELECT time FROM friendsChatLastMessageSent WHERE friendsChatLastMessageSent.accountID == :accountID and friendsChatLastMessageSent.toAccountID == accounts.accountID LIMIT 1) as time, (SELECT fuel FROM blast WHERE accountID=accounts.accountID and (expires is NULL or expires>=:time) LIMIT 1) as blast
FROM friends 
JOIN accounts ON friends.toAccountID=accounts.accountID
WHERE friends.accountID == :accountID and accounts.accountID != :accountID
    and toAccountID in friendrequestlist ORDER BY
    (SELECT time FROM friendsChatLastMessageSent WHERE friendsChatLastMessageSent.accountID == :accountID and friendsChatLastMessageSent.toAccountID == accounts.accountID LIMIT 1) DESC`,
          { ":accountID": accountdata.accountID }
        );

        for (const contact of contacts) {
          contact.badges = await getBadgesFromAccountID(contact.id);
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
    app.get("/api/getuserdataonupdate", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      const connectionID = generate(16);
      async function update() {
        if (updateFunctions[accountdata.accountID][connectionID]) {
          delete updateFunctions[accountdata.accountID][connectionID];
        }
        try {
          const newaccountdata = await db.get(
            "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
            {
              ":token": req.cookies.token,
            }
          );

          if (newaccountdata) {
            const blast = (
              await db.get(
                "SELECT fuel FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
                {
                  ":accountID": newaccountdata.accountID,
                  ":time": new Date().getTime(),
                }
              )
            )?.fuel;
            const badges = await getBadgesFromAccountID(
              newaccountdata.accountID
            );
            const rocketFuel = (
              await db.all(
                "SELECT * FROM rocketFuelPoints WHERE accountID=:accountID and used=false",
                {
                  ":accountID": newaccountdata.accountID,
                }
              )
            ).length;
            return res.send({
              loggedin: true,
              user: {
                username: newaccountdata.username,
                id: newaccountdata.accountID,
                profilePic: newaccountdata.profilePic,
                tag: newaccountdata.tag,
                backgroundImage: newaccountdata.backgroundImage,
                blast,
                rocketFuel,
                badges,
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
          updateFunctions[accountdata.accountID] = {};
        }
        updateFunctions[accountdata.accountID][connectionID] = update;
        await snooze(30000);
        if (updateFunctions[accountdata.accountID][connectionID]) {
          delete updateFunctions[accountdata.accountID][connectionID];
          return res.send({ reconnect: true });
        }
      }
    });
    app.get("/api/hasopened", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (!accountdata) return res.send(false);
      const date = new Date();
      if (
        !(
          date.getMonth() === 11 &&
          date.getDate() >= 25 &&
          date.getDate() <= 31
        )
      )
        return res.send(true);
      const alreadyOpened = await db.get(
        "SELECT * FROM christmasOpened WHERE accountID=:accountID and year=:year",
        {
          ":accountID": accountdata.accountID,
          ":year": date.getFullYear(),
        }
      );
      return res.send(Boolean(alreadyOpened));
    });
    app.post("/api/openchristmaspresent", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (!accountdata) return res.status(401).send();
      const date = new Date();
      if (
        !(
          date.getMonth() === 11 &&
          date.getDate() >= 25 &&
          date.getDate() <= 31
        )
      )
        return res.status(401).send();
      const alreadyOpened = await db.get(
        "SELECT * FROM christmasOpened WHERE accountID=:accountID and year=:year",
        {
          ":accountID": accountdata.accountID,
          ":year": date.getFullYear(),
        }
      );
      if (!alreadyOpened) {
        const numberOfPoints = Math.round(Math.random() * 4) + 1;
        const toPromise = [];
        toPromise.push(
          db.run(
            "INSERT INTO christmasOpened (accountID, year) VALUES (:accountID, :year)",
            {
              ":accountID": accountdata.accountID,
              ":year": date.getFullYear(),
            }
          )
        );
        toPromise.push(
          db.run(
            "INSERT INTO badges (accountID, name, added, expires) VALUES (:accountID, :badge, :date, null)",
            {
              ":accountID": accountdata.accountID,
              ":date": date.getTime(),
              ":badge": "xmas" + date.getFullYear(),
            }
          )
        );
        for (let i = 0; i < numberOfPoints; i++) {
          toPromise.push(
            db.run(
              "INSERT INTO rocketFuelPoints (accountID, used) VALUES (:accountID, false)",
              {
                ":accountID": accountdata.accountID,
              }
            )
          );
        }
        await Promise.all(toPromise);
        updateFromAccountID(accountdata.accountID);
        return res.status(200).send({ points: numberOfPoints });
      }
      return res.status(401).send();
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
        const blast = (
          await db.get(
            "SELECT fuel FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
            {
              ":accountID": accountdata.accountID,
              ":time": new Date().getTime(),
            }
          )
        )?.fuel;
        const badges = await getBadgesFromAccountID(accountdata.accountID);
        const rocketFuel = (
          await db.all(
            "SELECT * FROM rocketFuelPoints WHERE accountID=:accountID and used=false",
            {
              ":accountID": accountdata.accountID,
            }
          )
        ).length;
        return res.send({
          loggedin: true,
          user: {
            username: accountdata.username,
            id: accountdata.accountID,
            profilePic: accountdata.profilePic,
            tag: accountdata.tag,
            backgroundImage: accountdata.backgroundImage,
            blast,
            rocketFuel,
            badges,
          },
        });
      }
    });
    app.post("/api/requestnewpassword", async (req, res) => {
      const requestaccount = await db.get(
        "SELECT * FROM accounts WHERE email=:email",
        { ":email": req.body.email }
      );
      if (requestaccount) {
        const passwordUpdateID = generate(30);
        updatepassword[passwordUpdateID] = requestaccount.accountID;
        PasswordEmail(req.body.email, passwordUpdateID).catch(console.error);
        setTimeout(() => {
          if (updatepassword[passwordUpdateID])
            delete updatepassword[passwordUpdateID];
        }, 3600000);
      }
      console.log(requestaccount);
      return res.send(true);
    });
    app.post("/api/changepassword", async (req, res) => {
      if (
        testRECAP3(RECAPsecret, req.body["g-recaptcha-response"]) ||
        process.env.NODE_ENV === "development"
      ) {
        const accountdata = await db.get(
          "SELECT * FROM accounts WHERE accountID=:accountID",
          { ":accountID": updatepassword[req.body.updateID] }
        );
        if (accountdata) {
          const salt = generate(150);
          const password = hasher(req.body.pass + salt);
          updateFromAccountID(accountdata.accountID);
          await Promise.all([
            db.run(
              "UPDATE accounts SET password=:password, salt=:salt WHERE accountID=:accountID",
              {
                ":salt": salt,
                ":password": password,
                ":accountID": updatepassword[req.body.updateID],
              }
            ),
            db.run(`DELETE FROM tokens WHERE accountID = :accountID`, {
              ":accountID": accountdata.accountID,
            }),
          ]);
          delete updatepassword[req.body.updateID];
          return res.send(true);
        }
      }
      return res.send(false);
    });
    app.get("/api/getNotificationsOn", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (!accountdata) {
        return res.send({ discord: false, email: false });
      }
      return res.send({
        discord: Boolean(accountdata.discordnotification),
        email: Boolean(accountdata.emailnotification),
      });
    });
    app.post("/api/togglediscord", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        await db.run(
          "UPDATE accounts SET discordnotification=:discordnotification WHERE accountID=:accountID",
          {
            ":discordnotification": JSON.parse(req.body.toggle),
            ":accountID": accountdata.accountID,
          }
        );
        return res.send(true);
      }
      return res.send(false);
    });

    app.post("/api/toggleemail", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        await db.run(
          "UPDATE accounts SET emailnotification=:emailnotification WHERE accountID=:accountID",
          {
            ":emailnotification": JSON.parse(req.body.toggle),
            ":accountID": accountdata.accountID,
          }
        );
        return res.send(true);
      }
      return res.send(false);
    });

    app.get("/files/:id", async (req, res) => {
      const imagedata = await db.get(
        `SELECT filename FROM images WHERE imageID=:id`,
        {
          ":id": req.params.id,
        }
      );
      if (imagedata) {
        const filepath = path.join(__dirname, "files", imagedata.filename);
        if (imagedata && (await checkFileExists(filepath))) {
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
          updateFromAccountID(accountdata.accountID);
          const discordlink = await db.get(
            "SELECT * FROM discordAccountLink WHERE accountID=:accountID",
            { ":accountID": accountdata.accountID }
          );
          if (discordlink) {
            const guild = client.guilds.cache.get(serverID);
            const memberonguild = guild?.members?.cache?.get(
              discordlink.discordID
            );
            memberonguild
              ?.setNickname(req.body.username, "rename")
              .catch(() => { });
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
    app.get("/api/blastprices", (_, res) => {
      const startofweek = Math.trunc(new Date().getTime() / 6.048e8) * 6.048e8;
      return res.send({
        price: 100,
        startofweek,
        sale: blastSaleOff(startofweek),
      });
    });
    app.post("/api/setbackgroundimage", async (req: any, res: any) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        { ":token": req.cookies.token }
      );
      const blast = (
        await db.get(
          "SELECT fuel FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
          {
            ":accountID": accountdata?.accountID,
            ":time": new Date().getTime(),
          }
        )
      )?.fuel;
      if (accountdata && blast > 0) {
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
        updateFromAccountID(accountdata.accountID);
        res.send(true);
      } else {
        res.send(false);
      }
    });
    app.get("/api/getmetadata", (req, res) => {
      const url = String(req.query.url);
      if (tempmetadata[url]) {
        return res.send(tempmetadata[url]);
      }
      urlMetadata(url, {
        maxRedirects: 10,
        timeout: 10000,
        ensureSecureImageRequest: true,
      }).then(
        function (metadata) {
          tempmetadata[url] = metadata;
          res.send(metadata);
          setTimeout(() => {
            delete tempmetadata[url];
          }, 3600000);
        },
        function (error) {
          res.sendStatus(404).send(false);
        }
      );
    });
    app.get("/api/link/:id", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        { ":token": req.cookies.token }
      );
      const time = new Date().getTime();
      if (accountdata) {
        const discordID = linkurls.linkID[req.params.id];
        if (discordID) {
          if (!toVerifyAccountID[accountdata.accountID]) {
            const link = await db.get(
              "SELECT * FROM discordAccountLink WHERE accountID=:accountID",
              { ":accountID": accountdata.accountID }
            );
            if (!link) {
              const discordAccount = client.users.cache.find(
                (user) => user.id == discordID
              );
              if (discordAccount) {
                const discordlink = await db.get(
                  "SELECT * FROM discordAccountLink WHERE discordID=:discordID",
                  { ":discordID": discordAccount.id }
                );
                if (!discordlink) {
                  await db.run(
                    "INSERT INTO discordAccountLink (accountID, discordID, time) VALUES (:accountID, :discordID, :time)",
                    {
                      ":accountID": accountdata.accountID,
                      ":discordID": discordAccount.id,
                      ":time": time,
                    }
                  );
                  const guild = client.guilds.cache.get(serverID);
                  const memberonguild = guild.members.cache.get(
                    discordAccount.id
                  );
                  delete linkurls.discordID[linkurls.linkID[req.params.id]];
                  delete linkurls.linkID[req.params.id];
                  await memberonguild
                    .setNickname(accountdata.username, "linked")
                    .catch(() => { });
                  await memberonguild.roles
                    .add(roleID, "linked")
                    .catch(() => { });
                  await memberonguild.roles
                    .remove(unlinkedroleID, "linked")
                    .catch(() => { });
                  discordAccount.dmChannel.send({
                    embeds: [
                      new MessageEmbed()
                        .setColor("#5656ff")
                        .setTitle("Linked 🔒")
                        .setDescription(
                          `your account has been linked with \`${accountdata.username}#${accountdata.tag}\`, type \`!unlink\` to unlink your discord account from your typechat account!`
                        )
                        .setThumbnail(
                          `https://tchat.us.to/files/${accountdata.profilePic}`
                        ),
                    ],
                  });
                  return res.send({ linked: true });
                } else {
                  return res.send({
                    linked: false,
                    error:
                      "this discord account is already linked with a typechat account!",
                  });
                }
              } else {
                return res.send({
                  linked: false,
                  error:
                    "invalid discord account or discord account not on server!",
                });
              }
            } else {
              return res.send({
                linked: false,
                error:
                  "this typechat account has already been linked with a discord account!",
              });
            }
          } else {
            return res.send({
              linked: false,
              error:
                "Your account must be verified before you link your discord account!",
            });
          }
        } else {
          return res.send({
            linked: false,
            error: "invaild link ID, maybe try create a new link url!",
          });
        }
      } else {
        return res.send({ linked: false, error: "invalid token!" });
      }
    });
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
          updateFromAccountID(accountdata.accountID);
          res.send({ resp: true });
        } else {
          res.send({ resp: false, err: "no image!" });
        }
      } else {
        res.send({ resp: false, err: "invalid cookie" });
      }
    });
    app.post("/login", async (req, res) => {
      if (
        testRECAP3(RECAPsecret, req.body["g-recaptcha-response"]) ||
        process.env.NODE_ENV === "development"
      ) {
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
      } else {
        return res.send({ resp: false, err: "INVALID RECAPTCHA AUTH" });
      }
    });
    app.post("/api/startrocketfuel", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );
      if (accountdata) {
        const rocketFuel: any = (
          await db.all(
            "SELECT * FROM rocketFuelPoints WHERE accountID=:accountID and used=false",
            {
              ":accountID": accountdata.accountID,
            }
          )
        ).length;
        let blast = Number(
          (
            await db.get(
              "SELECT fuel FROM blast WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
              {
                ":accountID": accountdata.accountID,
                ":time": new Date().getTime(),
              }
            )
          )?.fuel
        );
        blast = blast ? blast : 0;
        const fuel = Number(JSON.parse(req.body.fuel));
        if (rocketFuel >= fuel && fuel + blast <= 20) {
          const topromise = [];
          topromise.push(
            db.run(
              "UPDATE rocketFuelPoints SET used=true WHERE rowid in (SELECT rowid FROM rocketFuelPoints WHERE accountID=:accountID and used=false LIMIT :limit)",
              { ":accountID": accountdata.accountID, ":limit": fuel }
            )
          );
          if (blast) {
            console.log("adding to");
            topromise.push(
              db.run(
                "UPDATE blast SET fuel=:fuel WHERE accountID=:accountID and (expires is NULL or expires>=:time)",
                {
                  ":fuel": blast + fuel,
                  ":accountID": accountdata.accountID,
                  ":time": new Date().getTime(),
                }
              )
            );
          } else {
            console.log("creating");
            topromise.push(
              db.run(
                "INSERT INTO blast (accountID, fuel, expires) VALUES (:accountID, :fuel, :expires)",
                {
                  ":fuel": fuel,
                  ":expires": new Date().getTime() + 2.628e9,
                  ":accountID": accountdata.accountID,
                }
              )
            );
            if (
              !(await db.get(
                "SELECT * FROM badges WHERE accountID=:accountID and name='Blast'",
                { ":accountID": accountdata.accountID }
              ))
            ) {
              topromise.push(
                db.run(
                  "INSERT INTO badges (accountID, name) VALUES (:accountID, 'Blast')",
                  { ":accountID": accountdata.accountID }
                )
              );
            }
          }
          await Promise.all(topromise);
          updateFromAccountID(accountdata.accountID);
          return res.send(true);
        } else {
          return res.send(false);
        }
      } else {
        return res.send(false);
      }
    });
    app.post("/api/paypal-buy-rocket-fuel", async (req, res) => {
      try {
        const accountdata = await db.get(
          "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
          { ":token": req.cookies.token }
        );
        if (
          (testRECAP3(RECAPsecret, req.body["g-recaptcha-response"]) ||
            process.env.NODE_ENV === "development") &&
          accountdata
        ) {
          const request = new paypal.orders.OrdersCaptureRequest(
            req.body.orderID
          );
          const details = await PPclient.execute(request);
          console.log(details.result.status + ":", details.result);
          const topromise = [];
          for (let i = 0; i < req.body.quantity; i++) {
            topromise.push(
              db.run(
                "INSERT INTO rocketFuelPoints (accountID, used) VALUES (:accountID, false)",
                { ":accountID": accountdata.accountID }
              )
            );
          }
          await Promise.all(topromise);
          updateFromAccountID(accountdata.accountID);
          console.log("added");
          res.status(200).send();
        } else {
          res.status(403).send();
        }
      } catch {
        res.status(403).send();
      }
    });
    app.post("/signup", async (req: any, res) => {
      if (
        testRECAP3(RECAPsecret, req.body["g-recaptcha-response"]) ||
        process.env.NODE_ENV === "development"
      ) {
        const emailInUse =
          (await db.get("SELECT * FROM accounts WHERE email=:email", {
            ":email": req.body.email,
          })) != undefined;
        if (ev.check(req.body.email).valid) {
          return res.send({ resp: false, err: "Please use a valid email!" });
        } else if (emailInUse) {
          return res.send({
            resp: false,
            err: "That email is already in use!",
          });
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
              "INSERT INTO accounts (accountID, email, username, password, salt, profilePic, tag, joined, discordnotification, emailnotification) VALUES  (:accountID, :email, :username, :password, :salt, :profilePic, :tag, :time, true, true)",
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
              `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time, deleted) VALUES (:ID, :accountID, :toAccountID, :message, :time, false)`,
              {
                ":ID": generate(100),
                ":accountID": defaultaccount.accountID,
                ":toAccountID": accountID,
                ":message": firstMessage,
                ":time": time - 2000,
              }
            ),
            db.run(
              `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time, deleted) VALUES (:ID, :accountID, :toAccountID, :message, :time, false)`,
              {
                ":ID": generate(100),
                ":accountID": defaultaccount.accountID,
                ":toAccountID": accountID,
                ":message":
                  "A verification email has been sent to your email, you have 1 hour to verify your account before your account is disabled. If your account is disabled before you verify, you can create a new one under the same email. 📧✅",
                ":time": time - 1000,
              }
            ),
            db.run(
              "INSERT INTO badges (accountID, name, expires) VALUES (:accountID, 'new', :expires)",
              {
                ":accountID": accountID,
                ":expires": new Date().getTime() + 6.048e8,
              }
            ),
            db.run(
              `INSERT INTO friendsChatMessages (ID, accountID, toAccountID, message, time, deleted) VALUES (:ID, :accountID, :toAccountID, :message, :time, false)`,
              {
                ":ID": generate(100),
                ":accountID": defaultaccount.accountID,
                ":toAccountID": accountID,
                ":message":
                  "Dont forget to check out Blast 🚀!\n\nTypechat is and always will be free, however to help us pay for the costs of our platform we rely on the Blast 🚀 subscription service.\n\nTo learn more go to https://typechat.world/blast",
                ":time": time,
              }
            ),
          ]);
          res.send({ resp: true, token });
          const verificationID = generate(100);
          toVerify[verificationID] = accountID;
          toVerifyAccountID[accountID] = verificationID;
          VerificationEmail(req.body.email, verificationID);
          await snooze(3600000);
          if (toVerify[verificationID]) {
            await Promise.all([
              db.run(`DELETE FROM accounts WHERE accountID = :accountID`, {
                ":accountID": accountID,
              }),
              db.run(`DELETE FROM tokens WHERE accountID = :accountID`, {
                ":accountID": accountID,
              }),
              db.run(
                `DELETE FROM friends WHERE accountID = :accountID and toAccountID = :accountID`,
                {
                  ":accountID": accountID,
                }
              ),
            ]);
            sendNotification(defaultaccount.accountID, {
              title: "Not verified lol",
              message: `${req.body.uname}#${tag} was deleted because they didnt verify! ${req.body.email}`,
              to: `/chat/${defaultaccount.accountID}`,
            });
            updateFromAccountID(accountID);
          }
        }
      } else {
        return res.send({ resp: false, err: "INVALID RECAPTCHA AUTH" });
      }
    });
    if (!(process.env.NODE_ENV === "development")) {
      app.use(forceDomain({ hostname: "typechat.world" }));
    }
    app.get("/logo.png", (_, res) =>
      res.sendFile(path.join(__dirname, "logo.png"))
    );
    app.get("/invite", (_, res) => res.redirect(discordserver));
    app.use(function (
      _: any,
      __: any,
      res: { status: (arg0: number) => void; send: (arg0: string) => void },
      ___: any
    ) {
      res.status(500);
      res.send("Oops, something went wrong.");
    });
    app.get(['/', '/login', '/signup'], async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );

      if (accountdata) return res.redirect("/contacts");

      res.sendFile(
        path.join(__dirname, "typechat", "build", "index.html")
      );
    });
    app.get("/contacts", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );

      if (!accountdata) return res.redirect("/");

      res.sendFile(
        path.join(__dirname, "typechat", "build", "200.html")
      );
    });

    app.get("/chat/:id", async (req, res) => {
      const accountdata = await db.get(
        "SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token) LIMIT 1",
        {
          ":token": req.cookies.token,
        }
      );

      if (!accountdata) return res.redirect("/");
      res.sendFile(
        path.join(__dirname, "typechat", "build", "200.html")
      );
    });
    app.use((req, res, next) => {
      const temppath = path.join(
        __dirname,
        "typechat",
        "build",
        req.path,
        "index.html"
      );
      fs.access(temppath, function (err) {
        if (err) return next()
        res.sendFile(temppath);
      });
    });
    app.use(express.static(path.join(__dirname, "typechat", "build")));
    app.use((_: any, res: any) => {
      res.sendFile(path.join(__dirname, "typechat", "build", "200.html"));
    });
  };
  console.log(process.env.NODE_ENV, "boot up");
  serverboot({
    httpsServer: () => http.createServer(app),
    httpServer: () => {
      return { listen: () => { } };
    },
  });
})();

process
  .on("unhandledRejection", console.error)
  .on("uncaughtException", console.error);
export default database;
