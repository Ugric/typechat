const { app, BrowserWindow, protocol, Notification } = require("electron");
const path = require("path")
const fs = require("fs")
const snooze = (timeout) =>
  new Promise((reslove) => {
    setTimeout(reslove, timeout);
  });

if (require("electron-squirrel-startup")) {
  app.quit();
}


function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: "notify",
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const createWindow = async () => {

  protocol.registerStringProtocol("notify", async (request, callback) => {
    const data = paramsToObject(
      new URLSearchParams(new URL(request.url).search)
    );


    const notify = new Notification({ title: data.title, body: data.message, icon: path.join(__dirname, "typechat.png"), sound: false })
    notify.show()
    notify.on("click", () => {
      callback({ data: "click" })
    })
    notify.on("close", () => {
      callback({ data: "close" })
    })
    notify.on("failed", () => {
      callback({ data: "failed" })
    })
  });
  const loadingWindow = new BrowserWindow({
    frame: false,
    width: 230,
    alwaysOnTop: true,
    height: 230,
    resizable: false,
    icon: "./src/favicon.ico",
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
    },
  });
  loadingWindow.on("close", function () {
    app.quit();
  });
  loadingWindow.loadFile("./src/loader.html");
  await snooze(5000);
  const mainWindow = new BrowserWindow({
    icon: "./src/favicon.ico",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
      , preload: path.join(__dirname, "preload.js")
    }, movable: true,
    minWidth: 711,
    minHeight: 400,
  });
  mainWindow.maximize();
  mainWindow.setAlwaysOnTop(!mainWindow.isMaximized(), "screen");
  mainWindow.on("close", function () {
    app.quit();
  });
  mainWindow.on("maximize", () => {
    mainWindow.setAlwaysOnTop(false, "screen");
  });
  mainWindow.on("enter-full-screen", () => {
    mainWindow.setAlwaysOnTop(false, "screen");
  });
  mainWindow.on("leave-full-screen", () => {
    mainWindow.setAlwaysOnTop(!mainWindow.isMaximized(), "screen");
  });
  mainWindow.on("unmaximize", () => {
    mainWindow.setAlwaysOnTop(true, "screen");
  });
  mainWindow.webContents.once("did-start-loading", () => {
    mainWindow.hide();
  });
  mainWindow.webContents.once("did-finish-load", () => {
    mainWindow.show();
    loadingWindow.hide();
  });
  mainWindow.loadURL(`http://freshcraft.play.ai:5000/`);
};
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
