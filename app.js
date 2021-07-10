"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var sqlite_1 = require("sqlite");
var express = require("express");
var sqlite3 = require("sqlite3");
var cookieParser = require("cookie-parser");
var createHash = require("crypto").createHash;
var expressWs = require("express-ws");
var path = require("path");
var mime = require("mime-types");
var snooze = function (milliseconds) {
    return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
};
var generate = require("randomstring").generate;
console.time("express boot");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var createFileID, hasher, db, _a, app, getWss, applyTo, port;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                createFileID = function (extention) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, filename, paths, output;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = generate(25);
                                filename = generate(45) + "." + extention;
                                paths = path.join(__dirname, "files", filename);
                                output = {
                                    id: id,
                                    filename: filename,
                                    path: paths
                                };
                                return [4 /*yield*/, db.run("INSERT INTO images (imageID, filename) VALUES  (:id, :filename)", { ":id": id, ":filename": filename })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, output];
                        }
                    });
                }); };
                hasher = function (string) {
                    return createHash("md5").update(string).digest("hex");
                };
                return [4 /*yield*/, sqlite_1.open({
                        filename: "./database.db",
                        driver: sqlite3.Database
                    })];
            case 1:
                db = _b.sent();
                return [4 /*yield*/, Promise.all([
                        db.run("CREATE TABLE IF NOT EXISTS accounts (accountID, email, username, password, salt, profilePic)"),
                        db.run("CREATE TABLE IF NOT EXISTS tokens (accountID, token)"),
                        db.run("CREATE TABLE IF NOT EXISTS chats (chatID)"),
                        db.run("CREATE TABLE IF NOT EXISTS chatUsers (chatID, accountID)"),
                        db.run("CREATE TABLE IF NOT EXISTS chatMessages (chatID, accountID, message, time)"),
                        db.run("CREATE TABLE IF NOT EXISTS images (imageID, filename)"),
                    ])];
            case 2:
                _b.sent();
                _a = expressWs(express()), app = _a.app, getWss = _a.getWss, applyTo = _a.applyTo;
                app.use(cookieParser());
                app.use(require("express-fileupload")());
                port = 5050;
                app.ws("/", function (ws, req) {
                    ws.on("message", function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ws.send(msg)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                app.get("/api/logout", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log(req.cookies);
                                return [4 /*yield*/, db.get("DELETE FROM tokens WHERE token=:token", {
                                        ":token": req.cookies.token
                                    })];
                            case 1:
                                _a.sent();
                                res.send(true);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.get("/api/userdatafromid", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var accountdata;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.get("SELECT * FROM accounts WHERE accountID=:ID", {
                                    ":ID": req.query.id
                                })];
                            case 1:
                                accountdata = _a.sent();
                                if (!accountdata) {
                                    return [2 /*return*/, res.send({ exists: false })];
                                }
                                else {
                                    return [2 /*return*/, res.send({
                                            exists: true,
                                            username: accountdata.username,
                                            id: accountdata.accountID,
                                            profilePic: accountdata.profilePic
                                        })];
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.get("/api/userdata", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var accountdata;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.get("SELECT * FROM accounts WHERE accountID=(SELECT accountID FROM tokens WHERE token=:token)", {
                                    ":token": req.cookies.token
                                })];
                            case 1:
                                accountdata = _a.sent();
                                if (!accountdata) {
                                    return [2 /*return*/, res.send({ loggedin: false })];
                                }
                                else {
                                    return [2 /*return*/, res.send({
                                            loggedin: true,
                                            user: {
                                                username: accountdata.username,
                                                id: accountdata.accountID,
                                                profilePic: accountdata.profilePic
                                            }
                                        })];
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.get("/files/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var imagedata;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.get("SELECT filename FROM images WHERE imageID=:id", {
                                    ":id": req.params.id
                                })];
                            case 1:
                                imagedata = _a.sent();
                                res.sendFile(path.join(__dirname, "files", imagedata.filename));
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var accounts, accountdata, i, account, token;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.all("SELECT * FROM accounts")];
                            case 1:
                                accounts = _a.sent();
                                for (i = 0; i < accounts.length; i++) {
                                    account = accounts[i];
                                    if (account.email == req.body.email &&
                                        account.password == hasher(req.body.pass + account.salt)) {
                                        accountdata = account;
                                        break;
                                    }
                                }
                                if (!accountdata) return [3 /*break*/, 3];
                                token = generate(100);
                                return [4 /*yield*/, db.run("INSERT INTO tokens (accountID, token) VALUES  (:accountID, :token)", { ":accountID": accountdata.accountID, ":token": token })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/, res.send({ resp: true, token: token })];
                            case 3: return [2 /*return*/, res.send({ resp: false, err: "invalid email or password!" })];
                        }
                    });
                }); });
                app.post("/signup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var emailInUse, token, accountID, salt, password, _a, profileID, profilePath;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, db.get("SELECT * FROM accounts WHERE email=:email", {
                                    ":email": req.body.email
                                })];
                            case 1:
                                emailInUse = (_b.sent()) != undefined;
                                if (!emailInUse) return [3 /*break*/, 2];
                                return [2 /*return*/, res.send({ resp: false, err: "That email is already in use!" })];
                            case 2:
                                token = generate(100);
                                accountID = generate(20);
                                salt = generate(150);
                                password = hasher(req.body.pass + salt);
                                return [4 /*yield*/, createFileID(mime.extension(req.files.profile.mimetype))];
                            case 3:
                                _a = _b.sent(), profileID = _a.id, profilePath = _a.path;
                                req.files.profile.mv(profilePath);
                                return [4 /*yield*/, Promise.all([
                                        db.run("INSERT INTO accounts (accountID, email, username, password, salt, profilePic) VALUES  (:accountID, :email, :username, :password, :salt, :profilePic)", {
                                            ":accountID": accountID,
                                            ":email": req.body.email,
                                            ":username": req.body.uname,
                                            ":password": password,
                                            ":salt": salt,
                                            ":profilePic": profileID
                                        } // work on this next! // thanks lol
                                        ),
                                        db.run("INSERT INTO tokens (accountID, token) VALUES  (:accountID, :token)", { ":accountID": accountID, ":token": token }),
                                    ])];
                            case 4:
                                _b.sent();
                                return [2 /*return*/, res.send({ resp: true, token: token })];
                        }
                    });
                }); });
                app.listen(port, function () {
                    console.timeEnd("express boot");
                    console.log("server started at http://localhost:" + port);
                });
                return [2 /*return*/];
        }
    });
}); })();
