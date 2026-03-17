export default [
  {
    path: '/career-encyclopedia',
    name: 'Career Encyclopedia',
    component: () => import('./pages/EncyclopediaHomePage.vue'),
  },
  {
    path: '/career-encyclopedia/recommended',
    name: 'Career Encyclopedia Recommended',
    component: () => import('./pages/EncyclopediaRecommendedPage.vue'),
  },
  {
    path: '/career-encyclopedia/job/:jobCode',
    name: 'Career Encyclopedia Job Detail',
    component: () => import('./pages/EncyclopediaJobDetailPage.vue'),
  },
]
