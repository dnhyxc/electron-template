import {BrowserWindow, Tray} from 'electron';

export const globalInfo: {
  mainWin: BrowserWindow | null;
  tray: Tray | null;
  // 控制是否退出
  willQuitApp: boolean;
} = {
  mainWin: null,
  tray: null,
  willQuitApp: false,
};
