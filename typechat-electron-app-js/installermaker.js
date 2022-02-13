const electronInstaller = require('electron-winstaller');

(async () => {
    await electronInstaller.createWindowsInstaller({
        appDirectory: "./out/TypeChat-win32-x64", usePackageJson: true,
        outputDirectory: '/build/installer64',
        authors: 'TypeChat',
        setupMsi: 'typechatInstaller.exe'
    });
    console.log('It worked!');
})()