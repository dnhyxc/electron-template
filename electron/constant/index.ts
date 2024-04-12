import { BrowserWindow } from "electron";

export const globalInfo: {
  mainWin: BrowserWindow | null;
} = {
  mainWin: null,
};
