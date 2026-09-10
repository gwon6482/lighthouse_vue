<template>
  <div class="auth">
    <div class="auth__inner">
      <!-- 브랜드 헤더 -->
      <div class="auth__brand">
        <img class="auth__logo" src="/Symbol.svg" width="64" height="76" alt="라이트하우스" />
        <h1 class="auth__headline">
          {{ mode === 'signup' ? '라이트하우스 시작하기' : '다시 만나서 반가워요' }}
        </h1>
        <p class="auth__sub">
          {{ mode === 'signup'
            ? '나에게 꼭 맞는 진로를 찾아가요.'
            : '이메일로 로그인해 주세요.' }}
        </p>
      </div>

      <!-- ── 회원가입 모드 ── -->
      <template v-if="mode === 'signup'">
        <div class="auth__socials">
          <button class="auth__social auth__social--kakao" @click="comingSoon('카카오')">
            <span class="auth__social-icon">💬</span>
            카카오로 시작하기
          </button>
          <button class="auth__social auth__social--apple" @click="comingSoon('Apple')">
            <span class="auth__social-icon"></span>
            Apple로 시작하기
          </button>
          <button class="auth__social auth__social--google" @click="comingSoon('구글')">
            <span class="auth__social-icon">G</span>
            구글로 시작하기
          </button>
        </div>

        <div class="auth__divider"><span>또는</span></div>

        <button class="auth__primary" @click="goEmailSignup">이메일로 가입하기</button>

        <p class="auth__switch">
          이미 계정이 있으신가요?
          <button class="auth__switch-btn" @click="mode = 'login'">로그인</button>
        </p>
      </template>

      <!-- ── 로그인 모드 ── -->
      <template v-else>
        <form class="auth__form" @submit.prevent="handleLogin">
          <div class="auth__field">
            <label class="auth__label">이메일</label>
            <input
              v-model="email"
              type="email"
              class="auth__input"
              placeholder="user@example.com"
              autocomplete="email"
            />
          </div>
          <div class="auth__field">
            <label class="auth__label">비밀번호</label>
            <input
              v-model="password"
              type="password"
              class="auth__input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <p v-if="error" class="auth__error">{{ error }}</p>

          <button type="submit" class="auth__primary" :disabled="loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <p class="auth__switch">
          아직 회원이 아니신가요?
          <button class="auth__switch-btn" @click="mode = 'signup'">회원가입</button>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { useAchievementStore } from '@/shared/stores/achievement'

const router = useRouter()
const authStore = useAuthStore()
const achievementStore = useAchievementStore()

const mode = ref<'signup' | 'login'>('signup')   // 회원가입이 기본

// ── 회원가입 ──
function goEmailSignup() {
  router.push('/onboarding/signup')
}

function comingSoon(provider: string) {
  // SNS 연동(OAuth)은 백엔드 준비 후 2차 연동 예정
  alert(`${provider} 연동은 준비 중이에요. 이메일로 가입해 주세요.`)
}

// ── 로그인 (기존 사용자) ──
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = '이메일과 비밀번호를 모두 입력해 주세요.'
    return
  }
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await achievementStore.loadActivePlan()
    // 활성 진로계획 유무에 따라 설계 전/후 메인으로 (설계 후 메인 = 진로달성)
    router.replace(achievementStore.hasActivePlan ? '/career-achievement' : '/main/before')
  } catch (e: any) {
    error.value = e.response?.data?.error ?? '로그인 중 오류가 발생했어요.'
  } finally {
    loading.value = false
  }
}
</script>
