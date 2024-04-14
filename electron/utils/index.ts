import { Menu, app } from 'electron';
import { globalInfo } from '../constant';

export const isDev = process.env.NODE_ENV === 'development';

export const isMac = process.platform === 'darwin';

export const getIconPath = () => {
  if (isDev) {
    return isMac ? '../public/Template.png' : '../public/icon@2.png';
  } else {
    return isMac ? './Template.png' : './icon@2.png';
  }
};

export const clearGlobalInfo = () => {
  globalInfo.mainWin = null;
  globalInfo.tray = null;
};

export const createContextMenu = () => {
  // 托盘菜单
  return Menu.buildFromTemplate([
    {
      label: '显示墨客',
      click: () => {
        globalInfo.mainWin?.show();
      }
    },
    {
      label: '退出墨客',
      click: () => {
        clearGlobalInfo();
        app.quit();
      }
    }
  ]);
};
