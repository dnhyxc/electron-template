export const buildConfig = () => {
  // 编译 electron
  require("esbuild").buildSync({
    entryPoints: ["electron/index.ts"],
    bundle: true,
    outfile: "dist/main.js",
    platform: "node",
    target: "node12",
    external: ["electron"],
  });
  // 编译 preload
  require("esbuild").buildSync({
    entryPoints: ["preload/index.ts"],
    bundle: true,
    outfile: "dist/preload.js",
    platform: "node",
    target: "node12",
    external: ["electron"],
  });
};

// 需要监听的文件
export const WATCH_FILES = [
  "electron/index.ts",
  "preload/index.ts",
  "electron/windows/main-win.ts",
];
