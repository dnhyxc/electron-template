import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteElectronPlugin } from "./plugins/vite-electron-plugin";
import { viteElectronBuildPlugin } from "./plugins/vite-electron-build-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteElectronPlugin(), viteElectronBuildPlugin()],
  build: {
    // 设置最终构建的浏览器兼容目标
    target: "es2015",
    // 构建后是否生成 source map 文件
    sourcemap: false,
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 2000,
    // 启用/禁用 gzip 压缩大小报告
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },
});