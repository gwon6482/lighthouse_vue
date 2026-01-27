<template>
  <div class="home">
    <h1 class="title">라이트하우스 관리자 페이지</h1>
    <div class="button-container">
      <button class="main-button" @click="goToSelfUnderstanding">
        <span class="button-icon">🔍</span>
        <span class="button-text">자기이해</span>
      </button>
      <button class="main-button" @click="goToCareerEncyclopedia">
        <span class="button-icon">📚</span>
        <span class="button-text">진로백과</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSelfUnderstanding = () => {
  router.push('/self-understanding')
}

const goToCareerEncyclopedia = () => {
router.push('/career-encyclopedia')
}
</script>
