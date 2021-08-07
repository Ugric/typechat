const electron = require("electron").remote


const currentWindow = electron.getCurrentWindow()
currentWindow.webContents.on("dom-ready", () => {
    const customTitlebar = require('custom-electron-titlebar')
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#3b3bd3'),
        drag: true,
        menu: false
        , unfocusEffect: false

    })
})