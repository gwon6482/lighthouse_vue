export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/HomePage.vue'),
  },
  // 설계 후 메인은 진로달성(`/career-achievement`)이 담당한다. 과거 `/main`은 플레이스홀더였고
  // 2026-08-07 제거 — 다만 PWA start_url·북마크·기존 히스토리가 남아있을 수 있어 리다이렉트로 존치.
  {
    path: '/main',
    redirect: '/career-achievement',
  },
  {
    path: '/main/before',
    name: 'Main Before Design',
    component: () => import('./pages/MainBeforePage.vue'),
  },
  {
    path: '/self-understanding',
    name: 'Self Understanding',
    component: () => import('./pages/SelfUnderstandingMainPage.vue'),
  },
  {
    path: '/self-understanding/intro',
    name: 'Self Understanding Intro',
    component: () => import('./pages/SelfUnderstandingIntroPage.vue'),
  },
  {
    // 검사 전체 안내 페이지 (SURVEY_FLOW_UPDATE.md 참고)
    path: '/self-understanding/guide',
    name: 'Self Understanding Guide',
    component: () => import('./pages/SelfUnderstandingGuidePage.vue'),
  },
  {
    path: '/self-understanding/select',
    name: 'Self Understanding Select',
    component: () => import('./pages/SelfUnderstandingSelectPage.vue'),
  },
  {
    path: '/self-understanding/test',
    name: 'Self Understanding Test',
    component: () => import('./pages/SelfUnderstandingTestPage.vue'),
  },
  {
    // 검사 완료 페이지 (SURVEY_FLOW_UPDATE.md 참고)
    path: '/self-understanding/complete',
    name: 'Self Understanding Complete',
    component: () => import('./pages/SelfUnderstandingCompletePage.vue'),
  },
  {
    path: '/self-understanding/result/:survey_id',
    name: 'Self Understanding Result',
    component: () => import('./pages/SelfUnderstandingResultPage.vue'),
  },
  {
    // 최초검사(회원가입 온보딩) 전용 결과 페이지 — 추천 직업은 진로백과 이동 대신 개요 팝업
    path: '/self-understanding/onboarding-result/:survey_id',
    name: 'Self Understanding Onboarding Result',
    component: () => import('./pages/OnboardingSurveyResultPage.vue'),
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: () => import('./pages/MyPage.vue'),
    meta: { showBottomNav: true },
  },
]
