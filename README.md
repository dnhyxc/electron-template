#### 初始化项目

使用 vite 初始化 vue3 项目：

```yaml
npm create vite@latest

cd electron-demo # 进入刚刚创建的项目目录

npm i # 安装项目依赖
```

> 如果不想看具体实现过程，可以直接跳转到文章末尾查看源码。

#### 安装 electron、electron-builder

```yaml
npm i electron electron-builder -D
```

如果安装失败，可以尝试使用如下方式进行安装：

```yaml
npm install -g cnpm --registry=https://registry.npmmirror.com

cnpm i electron electron-builder -D
```

#### 配置 electron 开发环境

当使用 electron 加 vue3 进行开发时，如果不进行开发配置，需要在启动 vue 项目时，另开一个终端，单独启动 electron，同时在更改主进程代码时，窗口不会自动刷新，需要终结掉之前的 electron 启动进程，重新启动才能获取到最新的主进程更改。

为了方便开发，可以安装 `vite-plugin-electron` 和 `vite-plugin-electron-renderer` 这两个插件：

```yaml
npm i vite-plugin-electron vite-plugin-electron-renderer -D
```

- vite-plugin-electron：这个插件可以在启动 vue 项目时，自动启动 electron 项目。该插件会在项目根目录下自动创建一个名为 `dist-electron/index.js` 的文件，这个文件就是它对 electron 主进程打包后的产物，用于 electron 的运行。也就是说，`dist-electron/index.js` 需要配置在 `package.json` 的 `main` 属性上：

```json
{
  // ...
  "main": "dist-electron/index.js",
  "scripts": {
    // ...
  }
}
```

- vite-plugin-electron-renderer：这个插件是用于 electron 主进程代码的热更新，即在更改主进程代码之后，窗口会自动刷新。

插件具体使用方式如下：

```js
import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import electronRender from 'vite-plugin-electron-renderer';

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    electron({
      entry: 'electron/index.ts' // 这个是 electron 主进程的入口文件
    }),
    electronRender()
  ]
});
```

配置好上述插件之后，就可以在项目根目录下创建 `electron/index.ts` 文件作为主进程的入口文件，具体内容如下：

```js
import { app, BrowserWindow, ipcMain } from 'electron';

// 屏蔽浏览器控制台警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 550,
    minWidth: 800,
    minHeight: 550,
    webPreferences: {
      /**
       * - 将 contextIsolation 设置为 true 启用上下文隔离，这意味着每个渲染进程都拥有自己的上下文环境。
       *   也就是说不能直接在渲染进程中使用 ipcRenderer 与主进程进行通信。
       *
       * - 如果想要直接在渲染进程中使用 ipcRenderer 与主进程进行通信，就需要将 contextIsolation 设置为 false。
       **/
      contextIsolation: false,
      // 是否支持使用 node 模块
      nodeIntegration: true
    }
  });

  // 开启调试工具
  win.webContents.openDevTools();

  win.loadURL('http://localhost:5173');
};

app.whenReady().then(createMainWindow);
```

#### 主进程与渲染进程通信示例

在 electron 主进程代码中增加 ipc 通信代码，具体如下设置：

```js
import { app, BrowserWindow, ipcMain } from 'electron';

// 屏蔽浏览器控制台警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 550,
    minWidth: 800,
    minHeight: 550,
    webPreferences: {
      /**
       * - 将 contextIsolation 设置为 true 启用上下文隔离，这意味着每个渲染进程都拥有自己的上下文环境。
       *   也就是说不能直接在渲染进程中使用 ipcRenderer 与主进程进行通信。
       *
       * - 如果想要直接在渲染进程中使用 ipcRenderer 与主进程进行通信，就需要将 contextIsolation 设置为 false。
       **/
      contextIsolation: false,
      // 是否支持使用 node 模块
      nodeIntegration: true
    }
  });

  // 监听渲染进程发送的消息
  ipcMain.handle('test', (e, value) => {
    console.log(value);
    // 向渲染进程发送消息
    e.sender.send('main-test', 'main send message: ' + value);
  });

  // 开启调试工具
  win.webContents.openDevTools();

  win.loadURL('http://localhost:5173');
};

app.whenReady().then(createMainWindow);
```

在渲染进程中增加 ipc 通信代码，以 `App.vue` 为例，具体如下：

```vue
<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref } from 'vue';

const message = ref('');
const count = ref(0);

// 向主进程发送消息
const onEmit = () => {
  ipcRenderer.invoke('test', count.value++);
};

// 接受主进程发送的消息
ipcRenderer.on('main-test', (_, value) => {
  console.log(value, 'value');
  message.value = value;
});
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <p>{{ message }}</p>
    <button @click="onEmit">通信</button>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
```

如果不需要采用 `preload` 统一管理渲染进程与主进程的通信，而直接在渲染进程中采用 `ipcRenderer` 与主进程进行通信，那么到这一步，你就可以快乐的进行功能的 coding 了。

如果想更安全且集中的进行主进程与渲染进程的通信，那么使用上述方式是满足不了的，需要在主进程中增加 `preload` 配置。

#### 配置 preload

配置 preload 需要在主进程 `webPreferences` 属性下增加 `preload` 配置，具体如下：

```js
import { app, BrowserWindow, ipcMain } from 'electron';

// 屏蔽浏览器控制台警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 550,
    minWidth: 800,
    minHeight: 550,
    webPreferences: {
      /**
       * - 将 contextIsolation 设置为 true 启用上下文隔离，这意味着每个渲染进程都拥有自己的上下文环境。
       *   也就是说不能直接在渲染进程中使用 ipcRenderer 与主进程进行通信。
       *
       * - 如果想要直接在渲染进程中使用 ipcRenderer 与主进程进行通信，就需要将 contextIsolation 设置为 false。
       **/
      // 这里需要设置为 true， 否则导入 preload.js 会报错
      contextIsolation: true,
      // 是否支持使用 node 模块
      nodeIntegration: false,
      // preload 的路径，是相对于 electron 打包后的入口文件 index.js 的
      preload: path.join(__dirname, './preload.js')
    }
  });

  // 监听渲染进程发送的消息
  ipcMain.handle('test', (e, value) => {
    console.log(value);
    // 向渲染进程发送消息
    e.sender.send('main-test', 'main send message: ' + value);
  });

  // 开启调试工具
  win.webContents.openDevTools();

  win.loadURL('http://localhost:5173');
};

app.whenReady().then(createMainWindow);
```

> 这里 `preload: path.join(__dirname, './preload.js')` 中，`preload.js` 需要与 electron 的入口文件 `index.js` 处于同一层级，也就是说 `preload.js` 的路径需要相对于打包后的 electron 入口文件 `index.js` 进行设置。

在项目根目录下创建 `preload/index.ts` 文件，具体内容如下：

```js
import { contextBridge, ipcRenderer } from 'electron';

const sendMethods = {
  sendTest: (count: number) => {
    ipcRenderer.send('test', count);
  }
};

const onMethods = {
  onGetTest: (cb: (value: string) => void) => {
    // 监听事件前，先移除上一次的监听，防止监听多次
    ipcRenderer.removeAllListeners('info');
    ipcRenderer.on('main-test', (e, value) => cb(value));
  }
};

contextBridge.exposeInMainWorld('electronApi', {
  ...sendMethods,
  ...onMethods
});
```

> 说明：preload 会在 window 下挂载 `electronApi` 这个属性，因此在渲染进程中可以直接通过 `window.electronApi.sendTest` 和 `window.electronApi.onGetTest` 访问到上述 `sendTest` 和 `onGetTest` 方法。

由于采用了 typescript 进行 preload 的编写，而 electron 运行时是不接受 typescript 的，因此在代码执行前需要将 preload/index.ts 编译为 js 才能运行，而之前的插件 `vite-plugin-electron` 无法将 `preload/index.ts` 打包到 `dist-electron` 文件目录下的，既然这条路行不通，那只能另辟蹊径了。

#### 编译 preload 及 electron 主进程代码

方式一：可以使用 vite 分别将 electron 和 preload 单独打包进入 dist 文件目录，但是这种方式对于开发调试来说，及其不方便，因为只要改动主进程代码或者 preload 中的代码都需要重新打包之后再运行 electron。因此这种方式这里不做详细的赘述。

方式二：可以通过 `Electron Forge` 脚手架实现，具体参考 [Electron 官网](https://www.electronjs.org/zh/blog/forge-v6-release) 及 [Electron Forge 官方文档](https://www.electronforge.io/)。

方式三：自己实现两个 vite 插件，实现与 `vite-plugin-electron` 和 `vite-plugin-electron-renderer` 这两个插件同样的功能，但区别是能够自动编译 preload 及 主进程代码，同时实现主进程代码热更新。

除了上述所列的一些方式，还有一些其他的方式，由于在本文中不是重点的介绍对象，因此就没有一一列举。在下文中，会主要介绍方式三的实现。

#### 实现 ViteElectronRuntimePlugin 及 ViteElectronBuildPlugin

ViteElectronRuntimePlugin：这个插件主要实现了主进程及 preload 代码的打包及热更新，同时监听了 electron 是否终止，从而终止对应启动的 vite 服务及 终端 node 进程。具体代码如下：

```js
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { Plugin, ViteDevServer } from 'vite';
import type { AddressInfo } from 'net';
import { buildConfig } from './vite.common-config';

// electron 进程
let electronProcess: ChildProcessWithoutNullStreams;

// 标识是否时手动还是通过kill终止的electron进程
let manualTermination = false;

// 获取时间
const getTimer = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${hours}时${minutes}分${seconds}秒`;
};

// 获取 electron 进程的 stdout 输出 log 信息
const getLog = (data: Buffer) => {
  // 判断 data 是否有值
  if (data.length > 2) {
    console.log(`Log(${getTimer()}): ${data}`);
  }
};

// electron 进程终止回调
const onExit = (code: number, signal: string, server: ViteDevServer) => {
  // 如果是手动终止，则不退出Vite服务和node进程
  if (!manualTermination) {
    // 终止Vite服务
    server.close();
    // 退出node进程
    process.exit();
  } else {
    // 手动终止后，重置标志位
    manualTermination = false;
  }
};

// 文件更改后的回调
const onFileChange = (curr: fs.Stats, prev: fs.Stats, IP: string, server: ViteDevServer) => {
  if (curr.mtimeMs !== prev.mtimeMs) {
    manualTermination = true;
    // 杀死当前的 electron 进程
    electronProcess?.kill();
    // 启动服务前，先编译 electron 及 preload
    buildConfig();
    // 重新启动 electron
    electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
    // 监听 electron 进程的 stdout 输出 log 信息
    electronProcess?.stdout?.on('data', getLog);
    // 监听 electron 进程的退出时，同时退出 vite 服务及 node 进程
    electronProcess?.on('exit', (code: number, signal: string) => onExit(code, signal, server));
  }
};

// 监听 electron 文件夹中文件的更改
const watchFolderFilesChange = (folderPath: string, IP: string, server: ViteDevServer) => {
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
          watchFolderFilesChange(filePath, IP, server);
        } else {
          // 监听文件变化
          fs.watchFile(filePath, (curr: fs.Stats, prev: fs.Stats) => onFileChange(curr, prev, IP, server));
        }
      });
    });
  });
};

// 监听 preload 文件更改
const watchPreloadFileChange = (IP: string, server: ViteDevServer) => {
  fs.watchFile('preload/index.ts', (curr: fs.Stats, prev: fs.Stats) => onFileChange(curr, prev, IP, server));
};

// 导出Vite插件函数
export const ViteElectronRuntimePlugin = (): Plugin => {
  return {
    name: 'vite-electron-runtime-plugin',
    // 在configureServer中实现插件的逻辑
    configureServer(server) {
      // 启动服务前，先编译 electron 及 preload
      buildConfig();
      // 监听 Vite 的 HTTP 服务器的 listening 事件
      server?.httpServer?.once('listening', () => {
        // 获取 HTTP 服务器的监听地址和端口号
        const addressInfo = server?.httpServer?.address() as AddressInfo;
        const IP = `http://localhost:${addressInfo.port}`;
        // 启动 electron 进程
        electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
        // 监听 electron 文件夹中文件内容更改
        watchFolderFilesChange('electron', IP, server);
        // 监听 preload 代码的更改
        watchPreloadFileChange(IP, server);
        // 监听 electron 进程的 stdout 输出 log 信息
        electronProcess?.stdout?.on('data', getLog);
        // 监听 electron 进程的退出时，同时退出 vite 服务及 node 进程
        electronProcess?.on('exit', (code: number, signal: string) => onExit(code, signal, server));
      });
    }
  };
};
```

ViteElectronBuildPlugin：这个插件主要是为了防止开发者直接进行打包，而没有先使用 `npm run dev` 先在根目录下生成 `dist` 打包文件夹，从而导致 electron 打包报错。具体代码如下：

```js
import type { Plugin } from 'vite';
import { buildConfig } from './vite.common-config';

// electron 打包插件
export const ViteElectronBuildPlugin = (): Plugin => {
  return {
    name: 'vite-electron-build-plugin',
    // closeBundle是Vite的一个插件钩子函数，用于在Vite构建完成后执行编译 electron、preload 相关代码
    closeBundle() {
      buildConfig();
    }
  };
};
```

可以看到，上述文件中都用到了 `buildConfig` 这个方法，这个方法主要是用来打包 electron 和 preload 的，具体如下：

```js
export const buildConfig = () => {
  // 编译 electron，因为 vite 本身就是通过 esbuild 进行编译的，所以可以直接导入 esbuild
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

插件的具体使用如下：

```js
import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteElectronBuildPlugin } from './plugins/vite-electron-build-plugin';
import { ViteElectronRuntimePlugin } from './plugins/vite-electron-runtime-plugin';

export default defineConfig({
  plugins: [vue(), ViteElectronRuntimePlugin(), ViteElectronBuildPlugin()]
});
```

#### 重新实现主进程与渲染进程的通信

主进程配置不需要做更改，主要需要改的是渲染进程，具体如下：

- electron/index.ts 内容如下：

```js
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

// 屏蔽浏览器控制台警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 550,
    minWidth: 800,
    minHeight: 550,
    webPreferences: {
      /**
       * - 将 contextIsolation 设置为 true 启用上下文隔离，这意味着每个渲染进程都拥有自己的上下文环境。
       *   也就是说不能直接在渲染进程中使用 ipcRenderer 与主进程进行通信。
       *
       * - 如果想要直接在渲染进程中使用 ipcRenderer 与主进程进行通信，就需要将 contextIsolation 设置为 false。
       **/
      // 这里需要设置为 true， 否则导入 preload.js 会报错
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js')
    }
  });

  // 监听渲染进程发送的消息
  ipcMain.handle('test', (e, value) => {
    console.log(value, 'test');
    // 向渲染进程发送消息
    e.sender.send('main-test', 'main send message: ' + value);
  });

  // 开启调试工具
  win.webContents.openDevTools();

  win.loadURL('http://localhost:5173');
};

app.whenReady().then(createMainWindow);
```

- App.vue 内容如下：

```vue
<script setup lang="ts">
import { ref } from 'vue';

const message = ref('');
const count = ref(0);

const onEmit = () => {
  window.electronApi.sendTest(count.value++);
};

window.electronApi.onGetTest((value: string) => {
  message.value = value;
});
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <p>{{ message }}</p>
    <button @click="onEmit">通信</button>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
```

通过上述代码可以看出，渲染进程中将不直接通过 `ipcRenderer` 与主进程通信了，而是采用了 preload 中向 window 上挂载的 `electronApi` 进行通信了。

#### 打包 electron

打包 electron 用到了 [electron-builder](https://www.electron.build/api/electron-builder) 插件，该插件是一个用于打包和发布 Electron 应用程序的强大工具。它支持多种平台（如 macOS、Windows 和 Linux）、多种格式（如安装包、可执行文件和压缩包）的打包，并提供了丰富的配置选项，可以满足各种复杂的需求。

要配置 electron-builder，可以在 `package.json` 中增加一个 `build` 选项，同时在 `scripts` 增加打包脚本，下面提供一份具体的配置示例，以供参考：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build && electron-builder"
  },
  "build": {
    // appId 是你的应用程序的唯一标识符，通常采用反向域名表示。它在不同的平台上用于唯一标识你的应用程序。
    "appId": "com.electron.desktop",
    // productName 是你的应用程序的名称，它将用于构建输出文件的名称。
    "productName": "template",
    // asar 是一个布尔值，用于指定是否使用 asar 打包你的应用程序代码。asar 是 Electron 中用于将应用程序文件打包成单个文件的一种格式，可以提高应用程序的加载速度和安全性。
    "asar": true,
    // copyright 是你的应用程序的版权信息。
    "copyright": "Copyright © 2023 dnhyxc",
    // directories.output 指定了打包后的输出目录，即应用程序文件将被输出到 app/ 目录下。
    "directories": {
      "output": "app/"
    },
    // 需要被打包的文件，注意：如果在 dist 之外还有关于 electron 的代码，需要加入到这里。比如如果是通过 vite-plugin-electron 插件运行 electron 时，它产生的 dist-electron 文件目录，就需要加入到这。
    "files": ["dist"],
    // 配置 mac 打包属性
    "mac": {
      // 指定了应用程序在 macOS 平台上的图标路径。如果不设置，将会采用 electron 默认图标。
      "icon": "./dist/mac/favicon.ico",
      // 定义生成的安装包或者可执行文件的命名格式。
      "artifactName": "${productName}_${version}.${ext}",
      // 指定打包的目标格式为 dmg 格式的安装包。
      "target": ["dmg"]
    },
    // 配置 window 打包属性
    "win": {
      // 指定了应用程序在 Windows 平台上的图标路径。如果不设置，将会采用 electron 默认图标。
      "icon": "./dist/win/favicon.ico",
      // 定义生成的安装包的格式为 nsis 格式的安装程序，并且指定了目标架构为 x64。
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      // 定义生成的安装包或者可执行文件的命名格式。
      "artifactName": "${productName}_${version}.${ext}"
    },
    // 配置 NSIS 安装程序的选项
    "nsis": {
      // 指定是否启用一键安装模式，这里设置为不开启一键安装。
      "oneClick": false,
      // 指定是否为每台机器安装。这里设置为否，这样用户能自主选择。
      "perMachine": false,
      // 指定是否允许用户更改安装目录。
      "allowToChangeInstallationDirectory": true,
      // 指定是否在卸载时删除应用程序数据。
      "deleteAppDataOnUninstall": true
    },
    // 配置发布选项，用于指定应用程序的发布方式。
    "publish": [
      {
        // 指定发布提供者为通用的 HTTP 服务器。
        "provider": "generic",
        // 指定了发布的目标 URL。
        "url": "http://127.0.0.1:8080"
      }
    ],
    // 配置发布信息
    "releaseInfo": {
      // 定义版本更新的具体内容，通常用于在发布时提供给用户的更新日志或者发布说明。
      "releaseNotes": "版本更新的具体内容"
    }
  }
}
```

项目打包完成之后，就可以通过打包出来 app 文件目录中以 `.dwg` 或 `.exe` 结尾的安装程序进行安装了。

#### github 源码

[具体源码可以戳这里查看](https://github.com/dnhyxc/electron-template)。
