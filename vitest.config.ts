import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// 모노레포 전환 뒤 vite.config 는 apps/* 아래로 내려갔고 루트에는 없다.
// 예전 이 파일은 존재하지 않는 './vite.config' 를 mergeConfig 하고 있어 type-check 이 깨져 있었다.
// 코어의 순수 로직 테스트만 돌리면 되므로 셸 설정에 기대지 않고 여기서 alias 만 잡는다.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./packages/core/src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['packages/core/src/**/__tests__/**/*.spec.ts'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
