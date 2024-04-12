import { app, ipcMain } from 'electron';
import { createMainWindow } from './windows/main-win';

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// 解决 http 下无法使用媒体api（navigator.mediaDevices.getUserMedia）的问题
// app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', DOMAIN_URL);

app.whenReady().then(createMainWindow);

ipcMain.on('test', (e, status) => {
  console.log(status, 'status');
  e.sender.send('test', 'main win send message to render: ' + status);
});
