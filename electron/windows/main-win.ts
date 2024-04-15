// @ts-ignore
import path from 'path';
import { ipcMain, BrowserWindow, IpcMainEvent, app } from 'electron';
import { globalInfo } from '../constant';
import { getIconPath, isMac } from '../utils';

let timer: ReturnType<typeof setTimeout> | null = null;

export const createMainWindow = () => {
  globalInfo.mainWin = new BrowserWindow({
    width: 800,
    height: 550,
    minWidth: 800,
    minHeight: 550,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // 这里需要设置为 true， 否则导入 preload.js 会报错
      preload: path.join(__dirname, './preload.js'),
      // 如果是开发模式可以使用devTools 调试
      // devTools: process.env.NODE_ENV === 'development' || config.build.openDevTools,
      // 在macos中启用滚动回弹效果
      scrollBounce: process.platform === 'darwin'
    },
    // 设置 transparent 会导致 win.restore() 失效
    // transparent: true, // 当transparent为true会导致win.restore()无效
    icon: path.join(__dirname, getIconPath())
  });

  // 禁止右键开启右键菜单
  if (!isMac) {
    globalInfo.mainWin?.hookWindowMessage(278, function (e) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      globalInfo.mainWin?.setEnabled(false); //窗口禁用
      timer = setTimeout(() => {
        globalInfo.mainWin?.setEnabled(true);
      }, 100); //延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
      return true;
    });
  }

  globalInfo.mainWin?.webContents.openDevTools();

  globalInfo.mainWin?.loadURL('http://localhost:5173');

  // 关闭按钮处理 - Mac是点击最小化
  globalInfo.mainWin?.on('closed', () => {
    globalInfo.mainWin = null;
    globalInfo.tray = null;
  });

  globalInfo.mainWin?.on('close', (event) => {
    if (!globalInfo.willQuitApp) {
      event.preventDefault();
      globalInfo.mainWin?.hide();
      globalInfo.mainWin?.setSkipTaskbar(true);
    }
  });
};

ipcMain.on('info', (e: IpcMainEvent, status: number) => {
  console.log(status, 'info');
  e.sender.send('info', { id: status, title: 'Electron Vue3 template' });
});

ipcMain.on('win-min', () => {
  globalInfo.mainWin?.minimize();
});

ipcMain.on('win-max', (e: IpcMainEvent) => {
  if (globalInfo.mainWin?.isMaximized()) {
    globalInfo.mainWin?.restore();
  } else {
    globalInfo.mainWin?.maximize();
  }
  e.sender.send('win-max', globalInfo.mainWin?.isMaximized());
});

ipcMain.on('win-close', () => {
  globalInfo.mainWin?.hide();
});
