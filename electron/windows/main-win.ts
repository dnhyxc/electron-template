// @ts-ignore
import path from "path";
import { BrowserWindow } from "electron";
import { globalInfo } from "../constant";

export const createMainWindow = () => {
  globalInfo.mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // 为了解决require 识别问题
      contextIsolation: true, // 这里需要设置为 true， 否则导入 preload.js 会报错
      preload: path.join(__dirname, "./preload.js"),
    },
    // icon: path.join(__dirname, getIconPath()),
  });

  globalInfo.mainWin?.webContents.openDevTools();

  globalInfo.mainWin?.loadURL("http://localhost:5173");
};
