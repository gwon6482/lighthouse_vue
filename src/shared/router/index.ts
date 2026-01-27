import { createRouter, createWebHistory } from 'vue-router'

import surveyRoutes from '@/modules/survey/survey.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...surveyRoutes],
})

export default router
