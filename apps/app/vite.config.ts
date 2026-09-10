import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const coreSrc = fileURLToPath(new URL('../../packages/core/src', import.meta.url))
const publicDir = fileURLToPath(new URL('../../public', import.meta.url))
const appearance = fileURLToPath(new URL('../../packages/core/src/appearance', import.meta.url))
// .env* 는 모노레포 루트에 있다. envDir 을 안 잡으면 Vite 는 이 앱 디렉터리에서만 찾으므로
// 루트 .env.production 이 무시되고 VITE_API 가 undefined 인 채로 빌드된다.
// CI 는 워크플로우가 VITE_API 를 직접 주입해서 통과할 뿐이라, 로컬 빌드만 조용히 달랐다.
const envDir = fileURLToPath(new URL('../../', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  publicDir,
  envDir,
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-icon-180.png'],
      manifest: {
        name: 'Lighthouse',
        short_name: 'Lighthouse',
        description: 'Lighthouse — 나의 진로를 비추는 빛',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/t3_img/**'],
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [appearance],
      },
    },
  },
  resolve: {
    alias: {
      '@': coreSrc,
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.lighthouse.career',
        changeOrigin: true,
      },
    },
  },
})
