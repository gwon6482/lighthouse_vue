import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SelfUnderstandingView from '../views/SelfUnderstandingView.vue'
import SurveyTestView from '../views/SurveyTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/self-understanding',
      name: 'self-understanding',
      component: SelfUnderstandingView,
    },
    {
      path: '/self-understanding/test',
      name: 'survey-test',
      component: SurveyTestView,
    },
  ],
})

export default router
