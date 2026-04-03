<template>
  <section v-if="searchQuery" class="encyclopedia-home__section">
      <h2 class="encyclopedia-home__section-title">검색 결과</h2>
      <div v-if="isLoading" class="encyclopedia-home__state">로딩 중...</div>
      <div v-else-if="searchResults.length === 0" class="encyclopedia-home__state">검색 결과가 없습니다.</div>
      <div v-else class="encyclopedia-home__card-list">
        <SearchResultCard
          v-for="job in searchResults"
          :key="job.jobCode"
          :job="job"
        />
      </div>
    </section>
</template>

<script setup lang="ts">
import type { JobSummary } from '@/modules/encyclopedia/types/encyclopedia';
import SearchResultCard from './SearchResultCard.vue'

defineProps<{
  searchQuery: string,
  isLoading: boolean,
  searchResults: JobSummary[]
}>()

// function goToJobDetail(jobCode: string) {
//   console.log('jobCode', jobCode)
// }
</script>

<style scoped>

</style>
