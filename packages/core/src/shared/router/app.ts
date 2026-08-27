// app 셸 라우터 — 프로덕션. "완성된 모듈만" 포함한다.
//
// ⭐ 승격 게이트: 어떤 기능을 프로덕션에 노출할지는 "여기서 해당 모듈 라우트를
//    import 하느냐"로 결정된다. 미완성 모듈은 아래에서 빼면 app 번들에 코드 자체가
//    들어가지 않는다(트리셰이킹). 완성되면 한 줄 추가 → 다음 배포에 반영.
//
// 현 정책(2026-06-24 확정): v1 은 전체 모듈 노출(=test 와 동일 구성). 진입 가드/로그인
//   뒤라 무방. 특정 모듈만 프로덕션에서 제외하려면 그 모듈 import 를 여기서 빼면 된다.
import surveyRoutes from '@/modules/survey/survey.routes'
import encyclopediaRoutes from '@/modules/encyclopedia/encyclopedia.routes'
import careerDesignRoutes from '@/modules/career-design/career-design.routes'
import careerAchievementRoutes from '@/modules/career-achievement/career-achievement.routes'
import onboardingRoutes from '@/modules/onboarding/onboarding.routes'
import stubRoutes from './stubRoutes'
import { makeRouter } from './createRouter'
import { useAuthStore } from '@/shared/stores/auth'
import { useAchievementStore } from '@/shared/stores/achievement'

const router = makeRouter([
  ...onboardingRoutes,
  ...surveyRoutes,
  ...encyclopediaRoutes,
  ...careerDesignRoutes,
  ...careerAchievementRoutes,
  ...stubRoutes,
])

// ── 프로덕션 진입 분기 (test 셸에는 없음) ──
// 루트('/') 진입 시 인증·진로계획 상태로 보낸다.
//   1) 최초/로그아웃(토큰 없음)        → /onboarding (온보딩 애니메이션 → 로그인)
//   2) 자동로그인 + 진로계획 전(plan 無) → /main/before
//   3) 자동로그인 + 진로계획 후(plan 有) → /career-achievement (설계 후 메인 = 진로달성)
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // 로그인 상태에서 로그인 페이지(최초 진입)로 되돌아가려 하면 = 사실상 로그아웃.
  // '이전' 버튼·하드웨어 백·브라우저 백 등 경로와 무관하게 여기서 한 번 확인한다.
  // (가입 위저드 뒤로가기는 아직 토큰이 없어 걸리지 않는다 → 조용히 통과)
  if (to.path === '/onboarding/auth' && auth.token) {
    if (!confirm('로그인 화면으로 돌아가면 로그아웃돼요.\n정말 로그아웃하시겠어요?')) return false
    auth.logout()
    return true
  }

  if (to.path !== '/') return true

  // 토큰 없음 = 한 번도 로그인 안 함(또는 로그아웃) → 온보딩
  if (!auth.token) return '/onboarding'

  // 브라우저에 저장된 토큰으로 자동로그인 검증 (실패 시 fetchMe 내부에서 logout)
  if (!auth.user) await auth.fetchMe()
  if (!auth.isLoggedIn) return '/onboarding'

  // 진로계획 보유 여부로 메인 분기
  const achievement = useAchievementStore()
  await achievement.loadActivePlan()
  return achievement.hasActivePlan ? '/career-achievement' : '/main/before'
})

export { resetViewportZoom } from './createRouter'
export default router
