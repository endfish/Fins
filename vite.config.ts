import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' // 直接导入 json 文件
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // @ts-ignore: crx plugin type definition might have minor mismatch in beta
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    cors: true, // 允许跨域
    origin: 'http://localhost:5173'
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 这里可以引入全局变量，暂时留空
        // additionalData: `@import "@/styles/variables.less";`
      },
    },
  },
})
