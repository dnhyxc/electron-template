#### 初始化项目

使用 vite 初始化 vue3 项目：

> 注意 node 版本，本项目采用的 node 是 v18 的版本。

```yaml
npm create vite@latest

cd electron-demo # 进入刚刚创建的项目目录

npm i # 安装项目依赖
```

#### 安装 electron、electron-builder

如果使用 npm 无法成功安装，可以使用 cnpm 进行安装：

```yaml
npm i electron electron-builder -D

  # or

cnpm i electron electron-builder -D
```

#### 配置 vite.config.ts 项目打包及启动开发环境

在项目根目录下创建 `plugins` 文件夹，并在该文件夹内分别创建：`vite.common-config.ts`、`vite-electron-plugin.ts`、`vite-electron-build-plugin.ts` 三个文件，其内容分别为：

- vite.common-config.ts 内容如下：

```js
export const buildConfig = () => {
  // 因为 vite 本身就是通过 esbuild 进行编译的，因此可以直接导入 esbuild
  require('esbuild').buildSync({
    entryPoints: ['electron/index.ts'],
    bundle: true,
    outfile: 'dist/main.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  });
  // 编译 preload
  require('esbuild').buildSync({
    entryPoints: ['preload/index.ts'],
    bundle: true,
    outfile: 'dist/preload.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  });
};
```

- vite-electron-plugin.ts 该插件是为了能在 `npm run dev` 启动 vue 时，能够同时启动 electron，而不需要单独使用 `electron .` 启动 electron：

```ts
import fs from 'fs';
import path from 'path';
import {spawn} from 'child_process';
import type {ChildProcessWithoutNullStreams} from 'child_process';
import type {Plugin} from 'vite';
import type {AddressInfo} from 'net';
import {buildConfig} from './vite.common-config';

const getTimer = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${hours}时${minutes}分${seconds}秒`
}

// 获取 electron 日志
const getLog = (data: Buffer) => {
  // 判断 data 是否有值
  if (data.length > 2) {
    console.log(`Log(${getTimer()}): ${data}`);
  }
};

// 监听文件夹中文件的变化，重新打包启动
const watchFolderFilesChange = (folderPath: string, electronProcess: ChildProcessWithoutNullStreams, IP: string) => {
  // 遍历文件夹
  fs.readdir(folderPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      // 检查文件状态
      fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        // 如果是文件夹，则递归遍历
        if (stats.isDirectory()) {
          watchFolderFilesChange(filePath, electronProcess, IP);
        } else {
          // 监听文件变化
          fs.watchFile(filePath, (curr: fs.Stats, prev: fs.Stats) => {
            if (curr.mtimeMs !== prev.mtimeMs) {
              // 杀死当前的Electron进程
              electronProcess.kill();
              // 重新编译主进程代码并重新启动Electron进程
              buildConfig();
              electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
              // 监听Electron进程的stdout输出
              electronProcess.stdout?.on('data', getLog);
            }
          });
        }
      });
    });
  });
};

export const viteElectronPlugin = (): Plugin => {
  return {
    name: 'vite-electron-plugin',
    // 在configureServer中实现插件的逻辑
    configureServer(server) {
      // 调用初始化Electron函数
      buildConfig();
      // 监听Vite的HTTP服务器的listening事件
      server?.httpServer?.once('listening', () => {
        // 获取HTTP服务器的监听地址和端口号
        const addressInfo = server?.httpServer?.address() as AddressInfo;
        const IP = `http://localhost:${addressInfo.port}`;
        // 启动Electron进程
        let electronProcess: ChildProcessWithoutNullStreams = spawn(require('electron') as any, ['dist/main.js', IP]);
        // 监听文件夹变化，重新编译 electron 代码
        watchFolderFilesChange('electron', electronProcess, IP);
        // 监听 preload 代码的更改
        fs.watchFile('preload/index.ts', () => {
          // 杀死当前的Electron进程
          electronProcess.kill();
          // 重新编译主进程代码并重新启动Electron进程
          buildConfig();
          electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
          // 监听Electron进程的stdout输出
          electronProcess.stdout?.on('data', getLog);
        });
        // 监听Electron进程的stdout输出
        electronProcess.stdout?.on('data', getLog);
      });
    }
  };
};
```

#### 初始化 Electron

在项目根目录下创建 `electron` 文件夹（文件夹名称可以自行更改），文件目录如下：

![img.png](img.png)

- index.ts 内容如下：

```js
import path from 'path';
import {app, Tray} from 'electron';
import {createMainWindow} from './windows/main-win';
import {isDev, isMac, getIconPath, createContextMenu} from './utils';
import {globalInfo} from './constant';

// 屏蔽警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// 解决 http 下无法使用媒体api（navigator.mediaDevices.getUserMedia）的问题
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', 'http://localhost:5173');

// 限制只能启动一个应用
const gotTheLock = app.requestSingleInstanceLock();

// 判断是否是 mac
if (!isMac) {
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (globalInfo.mainWin) {
        if (globalInfo.mainWin?.isMinimized()) globalInfo.mainWin?.restore();
        globalInfo.mainWin?.focus();
        globalInfo.mainWin?.show();
      }
    });
  }
}

app
  .whenReady()
  .then(createMainWindow)
  .then(() => {
    globalInfo.tray = new Tray(path.join(__dirname, getIconPath()));
    // 设置鼠标悬浮 Tip 提示
    globalInfo.tray?.setToolTip('dnhyxc');
    if (!isMac) {
      // 设置托盘菜单
      globalInfo.tray?.setContextMenu(createContextMenu());
      globalInfo.tray?.on('click', () => {
        globalInfo.mainWin?.show();
      });
    } else {
      globalInfo.tray?.on('mouse-up', () => {
        globalInfo.mainWin?.show();
      });
    }
  });

// 设置mac扩展坞图标
if (isMac) {
  app.dock.setIcon(path.join(__dirname, isDev ? '../public/mac/favicon.ico' : './mac/favicon.ico'));
}

// 当窗口开始活动时触发
app.on('activate', () => {
  if (globalInfo.mainWin === null) {
    createMainWindow();
  }
  // 点击拓展坞显示应用窗口
  if (globalInfo.mainWin && isMac) {
    globalInfo.mainWin?.show();
  }
});
```

- windows/main-win.ts 内容如下：

```js
import path from 'path';
import {ipcMain, BrowserWindow, IpcMainEvent} from 'electron';
import {globalInfo} from '../constant';
import {getIconPath, isMac} from '../utils';

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
};

ipcMain.on('test', (e: IpcMainEvent, status: string) => {
  console.log(status, 'test');
  e.sender.send('test', 'main win send message to render: ' + status);
});

ipcMain.on('info', (e: IpcMainEvent, status: number) => {
  console.log(status, 'info');
  e.sender.send('info', {id: status, title: 'Electron Vue3 template'});
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
```

- utils/index.ts 内容如下：

```js
import {Menu, app} from 'electron';
import {globalInfo} from '../constant';

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
```

- constant/index.ts 内容如下：

```js
import {BrowserWindow, Tray} from 'electron';

export const globalInfo: {
  mainWin: BrowserWindow | null;
  tray: Tray | null;
} = {
  mainWin: null,
  tray: null
};
```

在 electron 文件目录内容设置完毕之后，在根目录下创建 `preload` 文件夹，同时在 preload 文件夹中创建 `index.ts` 文件，内容如下：

```js
import {contextBridge, ipcRenderer} from 'electron';

const sendMethods = {
  sendTest: (type: string) => {
    ipcRenderer.send('test', type);
  },
  sendInfo: (id: number) => {
    console.log(id, 'id222');
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
  onTest: (cb: (value: string) => void) => {
    // 移除之前添加的一次性监听器
    ipcRenderer.removeAllListeners('info');
    ipcRenderer.on('test', (e, value: string) => cb(value));
  },
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
```
