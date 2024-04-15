import {contextBridge, ipcRenderer} from 'electron';

const sendMethods = {
  sendInfo: (id: number) => {
    console.log(id, 'sendMethods');
    ipcRenderer.send('info', id);
  },
  sendWinMin: () => {
    ipcRenderer.send('win-min');
  },
  sendWinMax: () => {
    ipcRenderer.send('win-max');
  },
  sendWinClose: () => {
    ipcRenderer.send('win-close');
  }
};

const onMethods = {
  onGetInfo: (cb: (info: { id: number; title: string }) => void) => {
    // 移除之前添加的一次性监听器
    ipcRenderer.removeAllListeners('info');
    ipcRenderer.on('info', (e, info) => cb(info));
  },
  onWinMax: (cb: (status: boolean) => void) => {
    // 移除之前添加的一次性监听器
    ipcRenderer.removeAllListeners('info');
    ipcRenderer.on('win-max', (e, status) => cb(status));
  }
};

contextBridge.exposeInMainWorld('electronApi', {
  ...sendMethods,
  ...onMethods
});
