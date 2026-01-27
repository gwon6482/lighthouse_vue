import { createRouter, createWebHistory } from 'vue-router'

import surveyRoutes from '@/modules/survey/survey.routes'
import encyclopediaRoutes from '@/modules/encyclopedia/encyclopedia.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...surveyRoutes, ...encyclopediaRoutes],
})

export default router
