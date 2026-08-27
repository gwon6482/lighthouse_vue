import type { RouteRecordRaw } from 'vue-router'
import { features } from '@/shared/config/features'

// 피처 플래그가 꺼져 있으면 딥링크/북마크 진입도 홈으로 돌려보낸다(코드는 보존).
const HOME_ROUTE = { name: 'Career Achievement' }

// BottomNav 스텁 라우트 (커리어 허브 / 커뮤니티) — 실제 기능은 추후 구현
const stubRoutes: RouteRecordRaw[] = [
  {
    path: '/career-hub',
    name: 'Career Hub',
    component: () => import('@/shared/pages/ComingSoonPage.vue'),
    beforeEnter: () => (features.career ? true : HOME_ROUTE),
    meta: {
      showBottomNav: true,
      comingSoonTitle: '커리어 허브',
      comingSoonMsg: '진로체험, 채용정보, 채용박람회 뉴스를 한 곳에서 만날 수 있게 준비하고 있어요.',
    },
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/shared/pages/ComingSoonPage.vue'),
    beforeEnter: () => (features.community ? true : HOME_ROUTE),
    meta: {
      showBottomNav: true,
      comingSoonTitle: '커뮤니티',
      comingSoonMsg: '같은 진로를 향해 노력하는 동료들의 완료 피드와 응원을 곧 만날 수 있어요.',
    },
  },
]

export default stubRoutes
