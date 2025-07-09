import react from '@vitejs/plugin-react'

import * as path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          open: true, // 直接在浏览器中打开分析报告
          filename: 'stats.html', // 输出文件的名称
          gzipSize: true, // 显示gzip后的大小
          brotliSize: true, // 显示brotli压缩后的大小
        }),
      ],
    },
  },
  server: {
    proxy: {
      '/api/login': 'http://localhost:8080',
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 8088,
    host: true,
  },
})
