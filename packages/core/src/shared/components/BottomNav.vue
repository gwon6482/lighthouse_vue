<template>
  <nav v-if="visible" class="bn" role="navigation" aria-label="주요 메뉴">
    <ul class="bn__list">
      <li
        v-for="item in visibleNavItems"
        :key="item.key"
        class="bn__item"
        :class="{
          'bn__item--center': item.center,
          'bn__item--active': isActive(item),
        }"
      >
        <button
          type="button"
          class="bn__btn"
          :class="{ 'bn__btn--center': item.center }"
          :aria-current="isActive(item) ? 'page' : undefined"
          :aria-label="item.label"
          @click="handleClick(item)"
        >
          <span class="bn__icon" :class="{ 'bn__icon--center': item.center }">
            <component :is="iconMap[item.icon]" />
            <span
              v-if="item.center && pendingBadge"
              class="bn__badge"
              :aria-label="`미완료 ${pendingBadge}건`"
            >{{ pendingBadge > 99 ? '99+' : pendingBadge }}</span>
          </span>
          <span class="bn__label">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAchievementStore } from '@/shared/stores/achievement'
import { useAuthStore } from '@/shared/stores/auth'
import { features } from '@/shared/config/features'

interface NavItem {
  key: string
  label: string
  icon: 'briefcase' | 'map' | 'home' | 'users' | 'user'
  routeName: string
  center?: boolean
  comingSoon?: boolean
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const achievementStore = useAchievementStore()

// 항목/아이콘 코드는 보존하고, 커리어·커뮤니티는 피처 플래그로만 노출을 제어한다.
// (2026-07-31 베타: 3탭 = 로드맵 · 홈 · 마이. 플래그 flip 시 재노출)
const navItems: NavItem[] = [
  { key: 'career',    label: '커리어',   icon: 'briefcase', routeName: 'Career Hub',                          comingSoon: true },
  { key: 'schedule',  label: '로드맵',   icon: 'map',       routeName: 'Career Achievement Weekly Schedule' },
  { key: 'home',      label: '홈',       icon: 'home',      routeName: 'Career Achievement',                  center: true },
  { key: 'community', label: '커뮤니티', icon: 'users',     routeName: 'Community',                            comingSoon: true },
  { key: 'my',        label: '마이',     icon: 'user',      routeName: 'MyPage' },
]

const visibleNavItems = computed(() =>
  navItems.filter((item) => {
    if (item.key === 'career') return features.career
    if (item.key === 'community') return features.community
    return true
  }),
)

const visible = computed(() =>
  Boolean(route.meta.showBottomNav)
  && authStore.isLoggedIn
  && achievementStore.hasActivePlan,
)

const pendingBadge = computed(() => achievementStore.todayPendingCount)

function isActive(item: NavItem): boolean {
  return route.name === item.routeName
}

function handleClick(item: NavItem) {
  if (route.name === item.routeName) return
  router.push({ name: item.routeName })
}

// ───────────────────────────────────────────────────────
// 인라인 SVG 아이콘 (Tabler outline 24x24 스타일)
// ───────────────────────────────────────────────────────
const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.75,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}

const Briefcase = () => h('svg', svgProps, [
  h('rect', { x: 3, y: 7, width: 18, height: 13, rx: 2 }),
  h('path', { d: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' }),
  h('path', { d: 'M3 13h18' }),
])

// 접힌 지도(Tabler map 계열) — '로드맵' 탭
const Map = () => h('svg', svgProps, [
  h('path', { d: 'M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3z' }),
  h('path', { d: 'M9 4v13' }),
  h('path', { d: 'M15 7v13' }),
])

const Home = () => h('svg', svgProps, [
  h('path', { d: 'M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9z' }),
])

const Users = () => h('svg', svgProps, [
  h('circle', { cx: 9, cy: 8, r: 3 }),
  h('path', { d: 'M3 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1' }),
  h('circle', { cx: 17, cy: 9, r: 2.4 }),
  h('path', { d: 'M21 21v-.5a4 4 0 0 0-4-4' }),
])

const User = () => h('svg', svgProps, [
  h('circle', { cx: 12, cy: 8, r: 3.5 }),
  h('path', { d: 'M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1' }),
])

const iconMap = {
  briefcase: Briefcase,
  map:       Map,
  home:      Home,
  users:     Users,
  user:      User,
} as const
</script>

<style scoped lang="scss">
.bn {
  /* CSS 변수 (BottomNav 내부 토큰 — 추후 글로벌 토큰화 진입점) */
  --bn-bg: #ffffff;
  --bn-border: #EEEEE8;
  --bn-active: #FFC700;
  --bn-active-text: #1a1a1a;
  --bn-inactive: #9aa0a6;
  --bn-badge-bg: #FF4D4F;
  --bn-badge-text: #ffffff;
  --bn-center-bg: #FFC700;
  --bn-center-ring: #ffffff;
  --bn-shadow: rgba(0, 0, 0, 0.06);

  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  background: var(--bn-bg);
  border-top: 1px solid var(--bn-border);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 12px var(--bn-shadow);

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    height: 60px;
  }

  &__item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: stretch;
    min-height: 44px;
  }

  &__btn {
    flex: 1;
    min-width: 44px;
    min-height: 44px;
    background: none;
    border: none;
    padding: 4px 0 2px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--bn-inactive);
    font-family: inherit;
    transition: color 0.15s;

    &:focus-visible {
      outline: 2px solid var(--bn-active);
      outline-offset: -2px;
      border-radius: 8px;
    }
  }

  &__item--active &__btn {
    color: var(--bn-active-text);
  }

  &__icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  &__label {
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.2px;
  }

  &__item--active &__label {
    font-weight: 700;
  }

  /* ─── 중앙 홈 탭 ─── */
  &__item--center {
    position: relative;
  }

  &__btn--center {
    align-items: center;
  }

  &__icon--center {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--bn-center-bg);
    color: var(--bn-active-text);
    transform: translateY(-14px);
    box-shadow: 0 4px 12px rgba(255, 199, 0, 0.35);
    border: 4px solid var(--bn-center-ring);
  }

  &__item--center &__label {
    margin-top: -10px;
  }

  &__item--center.bn__item--active &__icon--center {
    box-shadow: 0 4px 16px rgba(255, 199, 0, 0.5);
  }

  /* ─── Badge ─── */
  &__badge {
    position: absolute;
    top: -2px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--bn-badge-bg);
    color: var(--bn-badge-text);
    font-size: 10px;
    font-weight: 800;
    line-height: 18px;
    text-align: center;
    border: 2px solid var(--bn-center-ring);
    box-sizing: content-box;
  }
}
</style>
