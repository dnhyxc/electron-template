// @ts-ignore
import path from 'path';
import { app, Tray } from 'electron';
import { createMainWindow } from './windows/main-win';
import { isDev, isMac, getIconPath, createContextMenu } from './utils';
import { globalInfo } from './constant';

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// 解决 http 下无法使用媒体api（navigator.mediaDevices.getUserMedia）的问题
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', 'http://localhost:5173');

// 限制只能启动一个应用
const gotTheLock = app.requestSingleInstanceLock();

// 判断是否是 mac
if (!isMac) {
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (globalInfo.mainWin) {
        if (globalInfo.mainWin?.isMinimized()) globalInfo.mainWin?.restore();
        globalInfo.mainWin?.focus();
        globalInfo.mainWin?.show();
      }
    });
  }
}

app
  .whenReady()
  .then(createMainWindow)
  .then(() => {
    globalInfo.tray = new Tray(path.join(__dirname, getIconPath()));
    // 设置鼠标悬浮 Tip 提示
    globalInfo.tray?.setToolTip('dnhyxc');
    if (!isMac) {
      // 设置托盘菜单
      globalInfo.tray?.setContextMenu(createContextMenu());
      globalInfo.tray?.on('click', () => {
        globalInfo.mainWin?.show();
      });
    } else {
      globalInfo.tray?.on('mouse-up', () => {
        globalInfo.mainWin?.show();
      });
    }
  });

// 设置mac扩展坞图标
if (isMac) {
  app.dock.setIcon(path.join(__dirname, isDev ? '../public/mac/favicon.ico' : './mac/favicon.ico'));
}

// 当窗口开始活动时触发
app.on('activate', () => {
  if (globalInfo.mainWin === null) {
    createMainWindow();
  }
  // 点击拓展坞显示应用窗口
  if (globalInfo.mainWin && isMac) {
    globalInfo.mainWin?.show();
  }
});
