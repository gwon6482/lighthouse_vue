<template>
  <SurveyResultBody :survey-id="surveyId" @job-click="goEncyclopedia">
    <!-- 일반 검사 흐름: 결과 저장/이어가기 CTA -->
    <section class="m-sec result-cta-section">
      <!-- 비로그인: 가입 유도 -->
      <template v-if="!authStore.isLoggedIn">
        <h2 class="result-cta-title">결과를 저장하고<br>진로를 이어가보세요</h2>
        <p class="result-cta-sub">가입하면 이 결과가 저장되고,<br>맞춤 진로를 계속 탐색할 수 있어요.</p>
        <button class="btn-signup-cta" @click="showSignUp = true">
          회원가입하고 더 진행하기
        </button>
      </template>

      <!-- 로그인: 마이페이지 이동 -->
      <template v-else>
        <h2 class="result-cta-title">결과가 저장됐어요</h2>
        <p class="result-cta-sub">마이페이지에서 내 검사 결과를 언제든 다시 볼 수 있어요.</p>
        <RouterLink to="/mypage" class="btn-mypage-cta">
          마이페이지에서 결과 보기
        </RouterLink>
      </template>

      <RouterLink to="/encyclopedia" class="btn-encyclopedia">
        진로백과 바로가기 →
      </RouterLink>
    </section>
  </SurveyResultBody>

  <SignUpModal v-model="showSignUp" @registered="onRegistered" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { linkSurveyToUser } from '../survey.api'
import SurveyResultBody from '../components/SurveyResultBody.vue'
import SignUpModal from '../components/SignUpModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const surveyId = route.params.survey_id as string

const showSignUp = ref(false)

function goEncyclopedia(jobCode: string) {
  router.push(`/career-encyclopedia/job/${jobCode}`)
}

async function onRegistered(token: string, user: any) {
  authStore.setAuth(token, user)
  await linkSurveyToUser(surveyId).catch(() => {})
  router.push('/')
}
</script>
