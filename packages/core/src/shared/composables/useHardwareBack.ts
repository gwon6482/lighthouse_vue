import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'

// 하드웨어 백버튼(안드로이드) 전역 처리 — 기준 R4.
// 리스너를 등록하면 Capacitor 기본 동작(무조건 history.back → 루트에서 앱 즉시 종료)을
// 대체한다. 정책:
//   - 루트/홈이 아니고 뒤로 갈 히스토리가 있으면 → router.back() (로그아웃/이탈 등 라우터 가드 그대로 적용)
//   - 루트/홈이거나 뒤로 갈 곳이 없으면 → "한 번 더 누르면 종료" (실수 종료 방지)
// 정확일치로만 판정한다(하위경로는 일반 화면). 설계 전/후 메인이 각각 루트 취급.
const ROOT_PATHS = ['/', '/career-achievement', '/main/before', '/onboarding']
const EXIT_WINDOW_MS = 2000

export function useHardwareBack() {
  const router = useRouter()
  const showExitToast = ref(false)

  let handle: PluginListenerHandle | null = null
  let exitArmed = false
  let timer: ReturnType<typeof setTimeout> | null = null

  onMounted(async () => {
    if (!Capacitor.isNativePlatform()) return

    handle = await CapacitorApp.addListener('backButton', () => {
      const path = router.currentRoute.value.path
      const canGoBack = window.history.state?.back != null

      // 일반 화면: 라우터 뒤로 (guards가 로그아웃/미저장 이탈을 잡는다)
      if (!ROOT_PATHS.includes(path) && canGoBack) {
        router.back()
        return
      }

      // 루트/홈: 한 번 더 눌러야 종료
      if (exitArmed) {
        CapacitorApp.exitApp()
        return
      }
      exitArmed = true
      showExitToast.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        exitArmed = false
        showExitToast.value = false
      }, EXIT_WINDOW_MS)
    })
  })

  onUnmounted(() => {
    handle?.remove()
    if (timer) clearTimeout(timer)
  })

  return { showExitToast }
}
