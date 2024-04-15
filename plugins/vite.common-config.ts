export const buildConfig = () => {
  // 编译electron，因为vite本身就是通过esbuild进行编译的，所以可以直接导入esbuild
  require('esbuild').buildSync({
    entryPoints: ['electron/index.ts'],
    bundle: true,
    outfile: 'dist/main.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  });
  // 编译preload
  require('esbuild').buildSync({
    entryPoints: ['preload/index.ts'],
    bundle: true,
    outfile: 'dist/preload.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  });
};
