export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/HomePage.vue'),
  },
  {
    path: '/self-understanding',
    name: 'Self Understanding',
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
]
