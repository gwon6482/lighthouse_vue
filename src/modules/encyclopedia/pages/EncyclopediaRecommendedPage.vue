<template>
  <div class="encyclopedia-recommended">
    <!-- 나의 추천 진로 목록 -->
    <div v-if="isLoading">로딩 중...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="recommendedJobs.length === 0">추천 진로가 없습니다.</div>
    <RecommendedJobCard
      v-for="job in recommendedJobs"
      :key="job.jobCode"
      :job="job"
      @click="goToJobDetail(job.jobCode)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEncyclopedia } from '../composables/useEncyclopedia'
import RecommendedJobCard from '../components/page/home/RecommendedJobCard.vue'

const router = useRouter()
const { recommendedJobs, isLoading, error, loadRecommendedJobs } = useEncyclopedia()

function goToJobDetail(jobCode: string) {
  router.push(`/career-encyclopedia/job/${jobCode}`)
}

onMounted(() => {
  loadRecommendedJobs()
})
</script>

<style scoped>
</style>
