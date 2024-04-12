import { contextBridge, ipcRenderer } from 'electron';

const sendMethods = {
  sendTest: (type: string) => {
    ipcRenderer.send('test', type);
  },
  sendInfo: (id: number) => {
    console.log(id, 'id');
    ipcRenderer.send('info', id);
  }
};

const onMethods = {
  onTest: (cb: (value: string) => void) => {
    ipcRenderer.on('test', (e, value: string) => cb(value));
  },
  onGetInfo: (cb: (info: { id: number; title: string }) => void) => {
    ipcRenderer.on('info', (e, info) => cb(info));
  }
};

contextBridge.exposeInMainWorld('electronApi', {
  ...sendMethods,
  ...onMethods
});

console.log(sendMethods, 'yellow-dnhyxc', onMethods);
