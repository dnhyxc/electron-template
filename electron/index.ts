import path from 'path';
import { app } from 'electron';
import { createMainWindow } from './windows/main-win';
import { isDev, isMac } from './utils';
import { globalInfo } from './constant';

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// 解决 http 下无法使用媒体api（navigator.mediaDevices.getUserMedia）的问题
// app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', DOMAIN_URL);

app.whenReady().then(createMainWindow);

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
