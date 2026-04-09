<template>
  <div class="home">
    <h1 class="title">라이트하우스 관리자 페이지</h1>
    <HomeButtonContainer :menus="menus" />
    <h1>홈</h1>
  </div>
</template>

<script setup lang="ts">
import HomeButtonContainer from '../components/page/HomeButtonContainer.vue'

const menus = [
  { name: '자기이해', icon: '🔍', route: '/self-understanding' },
  { name: '진로백과', icon: '📚', route: '/career-encyclopedia' },
]
</script>
