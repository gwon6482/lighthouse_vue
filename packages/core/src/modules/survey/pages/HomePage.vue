<template>
  <div class="home">
    <h1 class="title">라이트하우스 테스트 페이지</h1>

    <!-- 로그인 전 -->
    <section v-if="!authStore.isLoggedIn" class="login-panel">
      <p class="login-panel__desc">아이디/비밀번호를 입력한 뒤 로그인하거나 회원가입 버튼을 눌러주세요.</p>
      <form @submit.prevent="handleLogin" class="login-panel__form">
        <div class="login-panel__field">
          <label class="login-panel__label">아이디</label>
          <input
            type="email"
            v-model="email"
            placeholder="admin@lighthouse.com"
            class="login-panel__input"
          />
        </div>

        <div class="login-panel__field">
          <label class="login-panel__label">비밀번호</label>
          <input
            type="password"
            v-model="password"
            placeholder="••••••••"
            class="login-panel__input"
          />
        </div>

        <p v-if="error" class="login-panel__error">{{ error }}</p>

        <div class="login-panel__actions">
          <button type="submit" class="login-panel__btn login-panel__btn--primary" :disabled="loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
          <button type="button" @click="showSignUp = true" class="login-panel__btn login-panel__btn--secondary">회원가입</button>
        </div>
      </form>
    </section>

    <!-- 로그인 후 -->
    <section v-else class="user-panel">
      <div class="user-panel__avatar">{{ avatarLetter }}</div>
      <div class="user-panel__info">
        <p class="user-panel__name">{{ authStore.user?.name ?? authStore.user?.email }}</p>
        <p class="user-panel__email">{{ authStore.user?.email }}</p>
        <div class="user-panel__meta" v-if="authStore.user?.age || authStore.user?.gender">
          <span v-if="authStore.user?.age">{{ authStore.user.age }}세</span>
          <span v-if="authStore.user?.gender">{{ authStore.user.gender === 'M' ? '남성' : '여성' }}</span>
        </div>
      </div>
      <div class="user-panel__actions">
        <RouterLink to="/mypage" class="user-panel__mypage">마이페이지</RouterLink>
        <button class="user-panel__logout" @click="handleLogout">로그아웃</button>
      </div>
    </section>

    <!-- 랜딩페이지 진입 — 별도 프로젝트(lighthouse_landing, Nuxt)로 운영, 외부 도메인 -->
    <a href="https://www.lighthouse.career" target="_blank" rel="noopener" class="landing-link">
      <span class="landing-link__icon">🌟</span>
      <span class="landing-link__text">랜딩페이지</span>
      <span class="landing-link__arrow">↗</span>
    </a>

    <HomeButtonContainer :menus="menus" />
    <button @click="lastPage" style="display: none;">마지막 페이지</button>

    <!-- 개발자 기능 -->
    <section class="dev-tools">
      <div class="dev-tools__head">
        <span class="dev-tools__badge">DEV</span>
        <h2 class="dev-tools__title">개발자 기능</h2>
      </div>

      <!-- 오늘 날짜 시뮬레이션 -->
      <div class="dev-tools__group">
        <h3 class="dev-tools__group-title">오늘 날짜 시뮬레이션</h3>
        <p class="dev-tools__desc">
          진로달성 페이지가 "오늘"을 인식하는 날짜를 임의로 바꿔서 테스트할 수 있어요.
          <strong v-if="devDate">현재: {{ devDate }}</strong>
          <strong v-else>현재: 실제 오늘 사용 중</strong>
        </p>
        <div class="dev-tools__row">
          <input v-model="devDateInput" type="date" class="dev-tools__input" />
          <button class="dev-tools__btn dev-tools__btn--primary" @click="applyDevDate">적용</button>
          <button class="dev-tools__btn" @click="clearDevDate">실제 오늘로</button>
        </div>
        <div class="dev-tools__row dev-tools__row--step">
          <button class="dev-tools__btn dev-tools__btn--step" @click="shiftDevDate(-1)">‹ 이전날</button>
          <button class="dev-tools__btn dev-tools__btn--step" @click="shiftDevDate(1)">다음날 ›</button>
        </div>
      </div>

      <!-- 진행상황 초기화 -->
      <div class="dev-tools__group">
        <h3 class="dev-tools__group-title">진행상황 초기화</h3>
        <p class="dev-tools__desc">
          완료 마킹, 기록, 축하 상태, 주간 일정(WeeklySchedule)을 모두 지웁니다.
          진로계획·프로젝트·루틴 같은 마스터 데이터는 유지돼요.
        </p>
        <div class="dev-tools__row">
          <button
            class="dev-tools__btn dev-tools__btn--danger"
            :disabled="resetting"
            @click="resetProgress"
          >
            {{ resetting ? '초기화 중...' : '진행상황 초기화' }}
          </button>
        </div>
      </div>
    </section>

    <SignUpModal v-model="showSignUp" @registered="onRegistered" />

    <!-- 진로달성 데일리 / 주간리뷰 선택 팝업 -->
    <Teleport to="body">
      <Transition name="ach-modal">
        <div v-if="showAchievementChoice" class="ach-modal" @click.self="showAchievementChoice = false">
          <div class="ach-modal__sheet">
            <div class="ach-modal__handle" />
            <h2 class="ach-modal__title">진로달성</h2>
            <p class="ach-modal__sub">어떤 화면으로 이동할까요?</p>
            <div class="ach-modal__btns">
              <button class="ach-modal__btn ach-modal__btn--daily" @click="pickAchievement('daily')">
                <span class="ach-modal__btn-icon">📅</span>
                <span class="ach-modal__btn-name">데일리</span>
                <span class="ach-modal__btn-desc">오늘의 할일과 루틴을 확인</span>
              </button>
              <button class="ach-modal__btn ach-modal__btn--weekly" @click="pickAchievement('weekly')">
                <span class="ach-modal__btn-icon">📝</span>
                <span class="ach-modal__btn-name">주간 리뷰</span>
                <span class="ach-modal__btn-desc">한 주를 돌아보고 다음 주를 계획</span>
              </button>
            </div>
            <button class="ach-modal__cancel" @click="showAchievementChoice = false">취소</button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import HomeButtonContainer from '../components/page/HomeButtonContainer.vue'
import SignUpModal from '../components/SignUpModal.vue'
import { useSurvey } from '../composables/useSurvey'
import { useAuthStore } from '@/shared/stores/auth'
import { useDevDate } from '@/shared/utils/dev-date'
import { useCareerDesign } from '@/modules/career-design/composables/useCareerDesign'
import { useWeeklySchedule } from '@/modules/career-achievement/composables/useWeeklySchedule'
import {
  fetchAchievements, deleteAchievement, fetchCurriculum, upsertCurriculum,
} from '@/modules/career-achievement/achievement.api'

const router = useRouter()
const { currentPageIndex, totalPages } = useSurvey()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showSignUp = ref(false)

const avatarLetter = computed(() => {
  const src = authStore.user?.name ?? authStore.user?.email ?? '?'
  return src.charAt(0).toUpperCase()
})

// 진로달성은 데일리/주간리뷰 중 선택하도록 팝업을 띄움
const showAchievementChoice = ref(false)
function pickAchievement(target: 'daily' | 'weekly') {
  showAchievementChoice.value = false
  router.push(target === 'daily' ? '/career-achievement' : '/career-achievement/weekly-review')
}

const menus = [
  { name: '온보딩(최초진입)', icon: '🚪', route: '/onboarding' },
  { name: '자기이해', icon: '🔍', route: '/self-understanding' },
  { name: '진로백과', icon: '📚', route: '/career-encyclopedia' },
  { name: '진로설계', icon: '🗺️', route: '/career-design' },
  { name: '진로달성', icon: '🏆', onClick: () => { showAchievementChoice.value = true } },
  // 설계 후 메인은 위 '진로달성'이 그 자체이므로, 여기선 설계 전 메인만 노출한다.
  { name: '메인 페이지(설계 전)', icon: '🏠', route: '/main/before' },
  { name: '자기이해 랜딩페이지', icon: '🌟', route: '/self-understanding/intro' },
]

const lastPage = () => {
  currentPageIndex.value = totalPages.value - 1
  router.push('/self-understanding/test')
}

const handleLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = '아이디와 비밀번호를 모두 입력해주세요.'
    return
  }
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    email.value = ''
    password.value = ''
  } catch (e: any) {
    error.value = e.response?.data?.error ?? '로그인 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
}

const onRegistered = (token: string, user: any) => {
  authStore.setAuth(token, user)
}

// ── 개발 도구: 오늘 날짜 시뮬레이션 ───────────────
const { devDate, setDevDate } = useDevDate()
const devDateInput = ref(devDate.value ?? '')

function applyDevDate() {
  const v = devDateInput.value.trim()
  if (!v) return
  setDevDate(v)
}

function clearDevDate() {
  devDateInput.value = ''
  setDevDate(null)
}

// 이전/다음 날로 한 칸 이동. 현재 devDate 가 있으면 그 기준, 없으면 실제 오늘 기준.
function shiftDevDate(delta: number) {
  const base = devDate.value
    ? new Date(devDate.value + 'T00:00:00')
    : new Date()
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() + delta)
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  const next = `${y}-${m}-${d}`
  devDateInput.value = next
  setDevDate(next)
}

// ── 진행상황 초기화 ───────────────────────────────
// localStorage 의 완료 마킹·기록·축하 + 모든 WeeklySchedule 을 삭제.
// 진로계획·프로젝트·루틴 같은 마스터 데이터는 그대로 유지.
const resetting = ref(false)
const { fetchMyPlans } = useCareerDesign()
const { fetchSchedules, deleteSchedule } = useWeeklySchedule()

async function resetProgress() {
  const ok = confirm(
    '진행상황을 초기화할까요?\n\n' +
    '· 완료 마킹·기록·축하 상태 (localStorage + 서버)\n' +
    '· 달성 기록·커리큘럼 완료 (서버)\n' +
    '· 모든 주간 일정(WeeklySchedule)\n' +
    '· 오늘 날짜 시뮬레이션\n\n' +
    '진로계획·프로젝트·루틴 등 마스터 데이터는 유지됩니다.'
  )
  if (!ok) return

  resetting.value = true
  try {
    // 1) localStorage 진행상황 키 클리어
    const fixedKeys = [
      'lh_achievement_v1',
      'lh_curriculum_items_v1',
      'lh_achievement_entries_v1',
      'lh_survey_progress_v1',
      'lh_survey_form_v1',
    ]
    for (const k of fixedKeys) localStorage.removeItem(k)
    // lh_celebration_YYYY-MM-DD 들
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('lh_celebration_')) localStorage.removeItem(k)
    }

    // 2) BE 진행상황 전부 삭제 (모든 plan 의 WeeklySchedule + 달성기록 + 커리큘럼)
    try {
      const plans = await fetchMyPlans()
      for (const plan of plans) {
        if (!plan?.planId) continue
        const schedules = await fetchSchedules(plan.planId)
        for (const s of schedules) {
          await deleteSchedule(plan.planId, s.weekStart)
        }
        const records = await fetchAchievements(plan.planId)
        for (const r of records) {
          await deleteAchievement(plan.planId, r.date, r.itemType, r.itemId)
        }
        const curriculum = await fetchCurriculum(plan.planId)
        for (const c of curriculum) {
          await upsertCurriculum(plan.planId, c.projectId, c.week, c.idx, false)
        }
      }
    } catch (err) {
      // BE 실패해도 localStorage 는 이미 초기화됨 — 사용자에 알리고 계속 진행
      console.warn('[resetProgress] BE 진행상황 삭제 일부 실패', err)
    }

    // 3) dev-date 초기화
    setDevDate(null)
    devDateInput.value = ''

    // 4) 새로고침으로 모든 상태 클린 로드
    location.reload()
  } finally {
    resetting.value = false
  }
}
</script>
