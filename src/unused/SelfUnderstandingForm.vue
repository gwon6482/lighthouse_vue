<template>
  <div class="self-understanding">
    <h1 class="title">자기이해 테스트</h1>
    <button class="start-button" @click="startTest">시작하기</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startTest = () => {
  router.push('/self-understanding/test')
}
</script>
