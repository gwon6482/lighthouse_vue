<template>
  <div class="wiz">
    <!-- 헤더: 뒤로 + 진행바 -->
    <header class="wiz__header">
      <button class="wiz__back" @click="back" aria-label="뒤로">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="wiz__progress">
        <div class="wiz__progress-fill" :style="{ width: `${progressPct}%` }" />
      </div>
    </header>

    <div class="wiz__body">
      <!-- step 0: 계정 -->
      <section v-if="step === 0" class="wiz__step">
        <h2 class="wiz__title">계정을 만들어요</h2>
        <p class="wiz__desc">로그인에 사용할 이메일과 비밀번호를 입력해 주세요.</p>
        <div class="wiz__field">
          <label class="wiz__label">이메일</label>
          <input v-model="form.email" type="email" class="wiz__input" placeholder="user@example.com" autocomplete="email" />
        </div>
        <div class="wiz__field">
          <label class="wiz__label">비밀번호</label>
          <input v-model="form.password" type="password" class="wiz__input" placeholder="6자 이상" autocomplete="new-password" />
        </div>
        <div class="wiz__field">
          <label class="wiz__label">비밀번호 확인</label>
          <input v-model="form.passwordConfirm" type="password" class="wiz__input" placeholder="••••••••" autocomplete="new-password" />
        </div>
      </section>

      <!-- step 1: 이름 -->
      <section v-else-if="step === 1" class="wiz__step">
        <h2 class="wiz__title">이름을 알려주세요</h2>
        <p class="wiz__desc">서비스에서 이렇게 불러드릴게요.</p>
        <div class="wiz__field">
          <label class="wiz__label">이름</label>
          <input v-model="form.name" type="text" class="wiz__input" placeholder="홍길동" autocomplete="name" />
        </div>
      </section>

      <!-- step 2: 나이/성별 -->
      <section v-else-if="step === 2" class="wiz__step">
        <h2 class="wiz__title">기본 정보를 입력해요</h2>
        <p class="wiz__desc">진로 추천을 더 정확하게 해드릴 수 있어요.</p>
        <div class="wiz__field">
          <label class="wiz__label">나이</label>
          <input v-model.number="form.age" type="number" min="1" max="120" class="wiz__input" placeholder="25" />
        </div>
        <div class="wiz__field">
          <label class="wiz__label">성별</label>
          <div class="wiz__gender">
            <button
              type="button"
              class="wiz__gender-btn"
              :class="{ 'wiz__gender-btn--active': form.gender === 'M' }"
              @click="form.gender = 'M'"
            >남성</button>
            <button
              type="button"
              class="wiz__gender-btn"
              :class="{ 'wiz__gender-btn--active': form.gender === 'F' }"
              @click="form.gender = 'F'"
            >여성</button>
          </div>
        </div>
      </section>

      <!-- step 3: Q1 (단일) -->
      <section v-else-if="step === 3" class="wiz__step">
        <h2 class="wiz__title">지금 어떤 상황이신가요?</h2>
        <p class="wiz__desc">하나만 골라주세요.</p>
        <div class="wiz__options">
          <button
            v-for="opt in Q1"
            :key="opt.value"
            class="wiz__option"
            :class="{ 'wiz__option--active': form.q1 === opt.value }"
            @click="form.q1 = opt.value"
          >{{ opt.label }}</button>
        </div>
      </section>

      <!-- step 4: Q2 (중복) -->
      <section v-else-if="step === 4" class="wiz__step">
        <h2 class="wiz__title">요즘 진로에 대해<br/>어떤 고민이 있나요?</h2>
        <p class="wiz__desc">여러 개 골라도 돼요.</p>
        <div class="wiz__options">
          <button
            v-for="opt in Q2"
            :key="opt.value"
            class="wiz__option"
            :class="{ 'wiz__option--active': form.q2.includes(opt.value) }"
            @click="toggleQ2(opt.value)"
          >
            <span class="wiz__check" aria-hidden="true" />
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </section>

      <!-- step 5: Q3 (단일) -->
      <section v-else-if="step === 5" class="wiz__step">
        <h2 class="wiz__title">나 자신에 대해<br/>얼마나 알고 있다고 생각하세요?</h2>
        <p class="wiz__desc">하나만 골라주세요.</p>
        <div class="wiz__options">
          <button
            v-for="opt in Q3"
            :key="opt.value"
            class="wiz__option"
            :class="{ 'wiz__option--active': form.q3 === opt.value }"
            @click="form.q3 = opt.value"
          >{{ opt.label }}</button>
        </div>
      </section>

      <p v-if="error" class="wiz__error">{{ error }}</p>
    </div>

    <footer class="wiz__footer">
      <button class="wiz__next" :disabled="!canNext || loading || checking" @click="next">
        {{ checking ? '확인 중...' : loading ? '가입 중...' : (isLast ? '가입 완료' : '다음') }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { req } from '@/shared/api'
import { useAuthStore } from '@/shared/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ── social 모드 ───────────────────────────────────────────
// 소셜 로그인은 콜백에서 **계정이 이미 만들어진다.** 그래서 계정 단계(step 0)는 건너뛰고,
// 카카오가 준 이름·나이를 채워둔 채 나머지를 이메일 가입과 똑같이 받는다.
// 제출도 register 가 아니라 complete-profile 로 간다(register 는 409 가 난다).
const isSocial = route.query.social === '1'

const TOTAL = 6
const FIRST_STEP = isSocial ? 1 : 0
const step = ref(FIRST_STEP)
const isLast = computed(() => step.value === TOTAL - 1)

// 진행바는 '보이는 구간' 기준으로 센다 — social 은 5단계라 0/6 부터 시작하면 어긋난다.
const progressPct = computed(() =>
  Math.max(10, ((step.value - FIRST_STEP) / (TOTAL - FIRST_STEP)) * 100),
)

const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  age: null as number | null,
  gender: '' as '' | 'M' | 'F',
  q1: null as number | null,
  q2: [] as number[],
  q3: null as number | null,
})

onMounted(async () => {
  if (!isSocial) return
  // 이 경로로 직접 들어왔거나 새로고침해서 유저가 비어 있을 수 있다.
  if (!authStore.token) {
    router.replace('/onboarding/auth')
    return
  }
  if (!authStore.user) await authStore.fetchMe()

  // 카카오가 주는 건 이메일·닉네임뿐이다. 이메일은 위저드에서 묻지 않으므로 이름만 채운다.
  // ⚠️ 나이는 프리필하지 않는다 — 사용자가 직접 입력한다(2026-09-11 결정).
  //    출생연도 동의항목이 승인되면 서버가 age 를 채우게 되고, 그때는 아래 한 줄이 그대로 산다.
  form.name = authStore.user?.name ?? ''
  form.age = authStore.user?.age ?? null
})

const Q1 = [
  { value: 1, label: '중·고등학생이에요.' },
  { value: 2, label: '대학생(휴학 포함)이에요.' },
  { value: 3, label: '취업을 준비하고 있어요.' },
  { value: 4, label: '일하고 있지만 진로를 다시 고민 중이에요.' },
]

const Q2 = [
  { value: 1, label: '내가 무엇을 좋아하고 잘하는지 모르겠어요.' },
  { value: 2, label: '내가 선택할 수 있는 진로 분야에 어떤 것들이 있는지 잘 모르겠어요.' },
  { value: 3, label: '관심 있는 분야는 있지만, 진로로 정해도 될지 모르겠어요.' },
  { value: 4, label: '목표하는 진로는 있지만, 무엇부터 준비해야 할지 모르겠어요.' },
  { value: 5, label: '목표를 향해 노력 중이지만, 맞는 방법인지 확신이 없어요.' },
  { value: 6, label: '아직 잘 모르겠어요.' },
]
const Q2_NONE = 6   // "아직 잘 모르겠어요" — 단독 선택

const Q3 = [
  { value: 1, label: '내가 무엇을 잘하고 좋아하는지 잘 알고 있어요.' },
  { value: 2, label: '조금 알고 있어요.' },
  { value: 3, label: '거의 모르는 것 같아요.' },
]

function toggleQ2(value: number) {
  if (value === Q2_NONE) {
    form.q2 = form.q2.includes(Q2_NONE) ? [] : [Q2_NONE]
    return
  }
  // 다른 항목 선택 시 "아직 잘 모르겠어요" 해제
  const without = form.q2.filter((v) => v !== Q2_NONE)
  form.q2 = without.includes(value)
    ? without.filter((v) => v !== value)
    : [...without, value]
}

const error = ref('')

const canNext = computed(() => {
  switch (step.value) {
    case 0: return !!form.email && form.password.length >= 6 && form.password === form.passwordConfirm
    case 1: return form.name.trim().length > 0
    case 2: return !!form.age && form.age > 0 && !!form.gender
    case 3: return form.q1 !== null
    case 4: return form.q2.length > 0
    case 5: return form.q3 !== null
    default: return false
  }
})

function back() {
  error.value = ''
  // social 은 첫 화면이 step 1 이다. 첫 화면에서 더 뒤로 가면 로그인 화면인데,
  // 토큰이 있으므로 전역 가드(R5)가 '로그아웃할까요?' 를 물어준다 — 여기서 따로 처리하지 않는다.
  if (step.value > FIRST_STEP) step.value--
  else router.replace('/onboarding/auth')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const checking = ref(false)

async function next() {
  error.value = ''
  if (!canNext.value || loading.value || checking.value) return

  // step 0: 이메일 형식 + 비번 일치 + 중복체크
  if (step.value === 0) {
    if (!EMAIL_RE.test(form.email.trim())) {
      error.value = '올바른 이메일 형식을 입력해 주세요.'
      return
    }
    if (form.password !== form.passwordConfirm) {
      error.value = '비밀번호가 일치하지 않습니다.'
      return
    }
    checking.value = true
    try {
      const res = await req.get('/api/auth/check-email', { params: { email: form.email.trim() } })
      if (!res.data.available) {
        error.value = '이미 사용 중인 이메일이에요.'
        return
      }
    } catch (e: any) {
      error.value = e.response?.data?.error ?? '이메일 확인 중 오류가 발생했어요.'
      return
    } finally {
      checking.value = false
    }
  }

  if (isLast.value) submit()
  else step.value++
}

const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    // 진로 온보딩 답변(Q1~Q3)은 가입 요청에 함께 실어 보낸다.
    // 2026-09-09 이전에는 localStorage 에만 넣었고 그 키를 읽는 코드가 어디에도 없어
    // 모든 가입자의 답이 그대로 버려졌다. 이제 서버가 source of truth 다.
    // 필드명은 API 스키마(User.onboarding)를 따른다 — q1/q2/q3 가 아니다.
    const profile = {
      name: form.name,
      age: form.age,
      gender: form.gender,
      onboarding: {
        status: form.q1,
        concerns: form.q2,
        selfAwareness: form.q3,
      },
    }

    if (isSocial) {
      // 계정은 소셜 콜백에서 이미 만들어졌다. 토큰도 이미 있으므로 나머지만 채운다.
      const res = await req.post('/api/auth/complete-profile', profile)
      authStore.user = res.data.user
    } else {
      const res = await req.post('/api/auth/register', { email: form.email, password: form.password, ...profile })
      authStore.setAuth(res.data.token, res.data.user)
    }

    // localStorage 는 오프라인 캐시로만 유지한다(다른 화면과 같은 방침).
    // 저장 실패가 가입 자체를 막으면 안 되므로 삼켜준다.
    try {
      localStorage.setItem(
        'lh_onboarding_v1',
        JSON.stringify({ q1: form.q1, q2: form.q2, q3: form.q3, at: new Date().toISOString() }),
      )
    } catch { /* quota */ }

    router.replace('/onboarding/intro')
  } catch (e: any) {
    error.value = e.response?.data?.error ?? '회원가입 중 오류가 발생했어요.'
  } finally {
    loading.value = false
  }
}
</script>
