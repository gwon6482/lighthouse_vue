<template>
  <div class="home">
    <h1 class="title">라이트하우스 관리자 페이지</h1>
    <HomeButtonContainer :menus="menus" />
    <button @click="lastPage">마지막 페이지</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import HomeButtonContainer from '../components/page/HomeButtonContainer.vue'
import { useSurvey } from '../composables/useSurvey';

const router = useRouter()
const { currentPageIndex, totalPages } = useSurvey()

const menus = [
  { name: '자기이해', icon: '🔍', route: '/self-understanding' },
  { name: '진로백과', icon: '📚', route: '/career-encyclopedia' },
]

const lastPage = () => {
  currentPageIndex.value = totalPages.value - 1
  router.push('/self-understanding/test')
}
</script>
