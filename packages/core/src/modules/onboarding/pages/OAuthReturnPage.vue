<template>
  <div class="oauth-return">
    <div class="oauth-return__inner">
      <template v-if="!errorMessage">
        <img class="oauth-return__logo" src="/Symbol.svg" width="48" height="57" alt="" />
        <p class="oauth-return__text">로그인 중이에요...</p>
      </template>

      <template v-else>
        <p class="oauth-return__text oauth-return__text--error">{{ errorMessage }}</p>
        <button class="oauth-return__retry" @click="backToAuth">다시 시도하기</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { useAchievementStore } from '@/shared/stores/achievement'

// 소셜 로그인 복귀 지점.
// API 가 카카오 콜백을 처리한 뒤 이 경로로 302 를 보낸다.
//   성공: /onboarding/oauth#token=<JWT>
//   실패: /onboarding/oauth?error=<코드>
//
// ⚠️ 토큰이 쿼리가 아니라 **프래그먼트**로 오는 건 의도된 설계다.
//    프래그먼트는 브라우저가 서버로 보내지 않아 CloudFront 액세스 로그·Referer 에 남지 않는다.
//    (API 쪽 controllers/oauthController.js 참조)

const router = useRouter()
const authStore = useAuthStore()
const achievementStore = useAchievementStore()

const errorMessage = ref('')

// API 가 내려주는 실패 코드 → 사용자 문구.
// 코드를 그대로 보여주면 아무도 못 알아본다.
const ERROR_TEXT: Record<string, string> = {
  cancelled: '카카오 로그인을 취소했어요.',
  invalid_state: '로그인 요청이 만료됐어요. 다시 시도해 주세요.',
  token_failed: '카카오 인증에 실패했어요. 잠시 후 다시 시도해 주세요.',
  profile_failed: '카카오 계정 정보를 가져오지 못했어요.',
  // 같은 이메일의 이메일가입 계정이 이미 있는 경우.
  // 이메일이 같다고 자동으로 이어붙이지 않는 건 계정 탈취를 막기 위한 의도적 설계다.
  email_taken: '같은 이메일로 가입된 계정이 있어요. 이메일로 로그인해 주세요.',
}

function backToAuth() {
  router.replace('/onboarding/auth')
}

onMounted(async () => {
  const err = new URLSearchParams(window.location.search).get('error')
  if (err) {
    errorMessage.value = ERROR_TEXT[err] ?? '로그인 중 문제가 생겼어요. 다시 시도해 주세요.'
    return
  }

  const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
  if (!token) {
    // 사용자가 이 주소를 직접 열었거나 프래그먼트가 유실된 경우
    errorMessage.value = '로그인 정보를 받지 못했어요. 다시 시도해 주세요.'
    return
  }

  // ⚠️ 토큰을 주소창에서 **즉시** 지운다.
  // 남겨두면 사용자가 URL 을 복사해 공유하거나 히스토리·bfcache 에 그대로 남는다.
  window.history.replaceState(null, '', window.location.pathname)

  authStore.applyToken(token)
  await authStore.fetchMe()
  if (!authStore.isLoggedIn) {
    // fetchMe 가 실패하면 내부에서 logout 한다 = 토큰이 유효하지 않았다는 뜻
    errorMessage.value = '로그인 정보가 유효하지 않아요. 다시 시도해 주세요.'
    return
  }

  // 이메일 로그인(AuthPage.handleLogin)과 같은 분기를 쓴다.
  await achievementStore.loadActivePlan()
  router.replace(achievementStore.hasActivePlan ? '/career-achievement' : '/main/before')
})
</script>

<style scoped>
.oauth-return {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 24px;
}

.oauth-return__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.oauth-return__text {
  font-size: 15px;
  color: #555;
}

.oauth-return__text--error {
  color: #d14343;
}

.oauth-return__retry {
  padding: 12px 20px;
  border: 0;
  border-radius: 10px;
  background: #2b6cb0;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}
</style>
