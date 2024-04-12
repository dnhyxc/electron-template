import { contextBridge, ipcRenderer } from "electron";

const sendMethods = {
  sendTest: (type: string) => {
    ipcRenderer.send("test", type);
  },
};

const onMethods = {
  onTest: (cb: (value: string) => void) => {
    ipcRenderer.on("test", (e, value: string) => cb(value));
  },
};

contextBridge.exposeInMainWorld("electronApi", {
  ...sendMethods,
  ...onMethods,
});

console.log(sendMethods, "yellow-dnhyxc", onMethods);
