export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/HomePage.vue'),
  },
  {
    path: '/self-understanding',
    name: 'Self Understanding',
    component: () => import('./pages/SelfUnderstandingPage.vue'),
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
]
