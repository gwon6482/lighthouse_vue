<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startTest = () => {
  router.push('/self-understanding/test')
}
</script>

<template>
  <div class="self-understanding">
    <h1 class="title">자기이해 테스트</h1>
    <button class="start-button" @click="startTest">시작하기</button>
  </div>
</template>

<style scoped>
.self-understanding {
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

.start-button {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background-color: #333;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:active {
  transform: scale(0.98);
  background-color: #555;
}

@media (hover: hover) {
  .start-button:hover {
    background-color: #555;
  }
}
</style>
