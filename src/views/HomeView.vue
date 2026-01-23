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

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 48px;
  text-align: center;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.main-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 24px 32px;
  border: none;
  border-radius: 16px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.main-button:active {
  transform: scale(0.98);
  background-color: #e8e8e8;
}

@media (hover: hover) {
  .main-button:hover {
    background-color: #e8e8e8;
  }
}

.button-icon {
  font-size: 28px;
}

.button-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* PC 대응 - 가로 배치 */
@media (min-width: 768px) {
  .button-container {
    flex-direction: row;
    max-width: 600px;
  }

  .main-button {
    flex: 1;
    padding: 32px;
  }
}
</style>
