import { BrowserWindow, Tray } from 'electron';

export const globalInfo: {
  mainWin: BrowserWindow | null;
  tray: Tray | null;
} = {
  mainWin: null,
  tray: null
};
