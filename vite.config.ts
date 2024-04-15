// @ts-ignore
import path from 'path';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import {viteElectronPlugin} from './plugins/vite-electron-plugin';
import {viteElectronBuildPlugin} from './plugins/vite-electron-build-plugin';
import {viteElectronRuntimePlugin} from './plugins/vite-electron-runtime-plugin'

export default defineConfig({
  plugins: [
    vue(),
    viteElectronRuntimePlugin(),
    viteElectronBuildPlugin(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver({importStyle: 'sass'})]
    })
  ],
  resolve: {
    // 设置别名
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    // 忽略后缀名的配置选项, 添加 .vue 选项时要记得原本默认忽略的选项也要手动写入
    extensions: ['.js', '.ts', '.json', '.vue']
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element.scss" as *;`
      }
    }
  },
  build: {
    // 设置最终构建的浏览器兼容目标
    target: 'es2015',
    // 构建后是否生成 source map 文件
    sourcemap: false,
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 2000,
    // 启用/禁用 gzip 压缩大小报告
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
});
