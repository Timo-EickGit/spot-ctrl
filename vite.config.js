import fs from 'fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    envDir: './',
    target: 'esnext' 
  },
  server: {
    https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    }
  }
})
