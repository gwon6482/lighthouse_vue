// 최초 진입 사용자 온보딩 플로우
// 0 스플래시 → 1 서비스 소개 → 2 로그인/가입 → 3 가입 위저드 → 4 welcome → 5 /main/before
// 단계별로 하나씩 구현 중. 아직 안 만든 단계는 임시 placeholder 로 둔다.
import type { RouteRecordRaw } from 'vue-router'

const onboardingRoutes: RouteRecordRaw[] = [
  {
    path: '/onboarding',
    name: 'Onboarding Splash',
    component: () => import('./pages/SplashPage.vue'),
  },
  {
    path: '/onboarding/intro',
    name: 'Onboarding Intro',
    component: () => import('./pages/IntroSlidesPage.vue'),
  },
  {
    path: '/onboarding/auth',
    name: 'Onboarding Auth',
    component: () => import('./pages/AuthPage.vue'),
  },
  {
    path: '/onboarding/signup',
    name: 'Onboarding Signup',
    component: () => import('./pages/SignupWizardPage.vue'),
  },
  {
    // 소셜 로그인 복귀 지점. API 카카오 콜백이 여기로 302 를 보낸다.
    // (경로를 바꾸면 API 의 OAUTH 복귀 허용목록·fallback 도 같이 바꿔야 한다)
    path: '/onboarding/oauth',
    name: 'Onboarding OAuth Return',
    component: () => import('./pages/OAuthReturnPage.vue'),
  },
  {
    path: '/onboarding/welcome',
    name: 'Onboarding Welcome',
    component: () => import('./pages/WelcomePage.vue'),
  },
]

export default onboardingRoutes
