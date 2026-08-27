export default [
  {
    path: '/career-design',
    name: 'Career Design',
    component: () => import('./pages/CareerDesignPage.vue'),
  },
  {
    path: '/career-design/explore',
    name: 'Career Design Explore',
    component: () => import('./pages/CareerDesignExplorePage.vue'),
  },
  {
    path: '/career-design/plan/new',
    name: 'Career Design Plan Write',
    component: () => import('./pages/CareerDesignPlanWritePage.vue'),
  },
  {
    path: '/career-design/plan/:planId',
    name: 'Career Design Plan Detail',
    component: () => import('./pages/CareerDesignPlanDetailPage.vue'),
  },
  {
    path: '/career-design/plan/projects',
    name: 'Career Design Projects',
    component: () => import('./pages/CareerDesignProjectsPage.vue'),
  },
  {
    path: '/career-design/project/new',
    name: 'Career Design Project Write',
    component: () => import('./pages/CareerDesignProjectWritePage.vue'),
  },
  {
    path: '/career-design/project/curriculum',
    name: 'Career Design Project Curriculum',
    component: () => import('./pages/CareerDesignProjectCurriculumPage.vue'),
  },
  {
    path: '/career-design/project/:id',
    name: 'Career Design Project Detail',
    component: () => import('./pages/CareerDesignProjectDetailPage.vue'),
  },
  {
    path: '/career-design/complete',
    name: 'Career Design Complete',
    component: () => import('./pages/CareerDesignCompletePage.vue'),
  },
  {
    path: '/career-design/plan/routines',
    name: 'Career Design Routines',
    component: () => import('./pages/CareerDesignRoutinesPage.vue'),
  },
  {
    path: '/career-design/routine/new',
    name: 'Career Design Routine Write',
    component: () => import('./pages/CareerDesignRoutineWritePage.vue'),
  },
  {
    path: '/career-design/plan/review-day',
    name: 'Career Design Review Day',
    component: () => import('./pages/CareerDesignReviewDayPage.vue'),
  },
  {
    path: '/career-design/result',
    name: 'Career Design Result',
    component: () => import('./pages/CareerDesignResultPage.vue'),
  },
]
