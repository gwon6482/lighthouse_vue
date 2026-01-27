export default [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/HomePage.vue'),
    },
    {
      path: '/self-understanding',
      name: 'self-understanding',
      component: () => import('./pages/SelfUnderstandingPage.vue'),
    },
    {
      path: '/self-understanding/test',
      name: 'survey-test',
      component: () => import('../../views/SurveyTestView.vue'),
    },
]
