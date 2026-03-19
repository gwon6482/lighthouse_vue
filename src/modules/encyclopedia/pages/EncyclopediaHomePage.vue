<template>
  <div class="encyclopedia-home">
    <!-- 상단 타이틀 -->
    <MainTitle />

    <!-- 검색 바 -->
    <SearchBar
      :query="searchQuery"
      @search="searchJob"
      @clear="clearSearch"
    />

    <!-- 검색 결과 (검색어 있을 때만 노출) -->
    <section v-if="searchQuery" class="encyclopedia-home__section">
      <h2 class="encyclopedia-home__section-title">검색 결과</h2>
      <div v-if="isLoading" class="encyclopedia-home__state">로딩 중...</div>
      <div v-else-if="searchResults.length === 0" class="encyclopedia-home__state">검색 결과가 없습니다.</div>
      <div v-else class="encyclopedia-home__card-list">
        <SearchResultCard
          v-for="job in searchResults"
          :key="job.jobCode"
          :job="job"
          @click="goToJobDetail(job.jobCode)"
        />
      </div>
    </section>

    <!-- 메인 메뉴 (검색어 없을 때 노출) -->
    <template v-else>
      <!-- 진로 카드 목록 -->
      <section class="encyclopedia-home__section">
        <h2 class="encyclopedia-home__section-title">진로 둘러보기</h2>
        <div class="encyclopedia-home__card-list">
          <RecommendedJobCard
            v-for="job in featuredJobs"
            :key="job.jobCode"
            :job="job"
            @click="goToJobDetail(job.jobCode)"
          />
        </div>
      </section>

      <!-- 나의 추천 진로 버튼 -->
      <section class="encyclopedia-home__section">
        <button class="encyclopedia-home__menu-btn" @click="goToRecommended">
          <span class="encyclopedia-home__menu-icon">⭐</span>
          <div class="encyclopedia-home__menu-text">
            <span class="encyclopedia-home__menu-title">나의 추천 진로</span>
            <span class="encyclopedia-home__menu-desc">자기이해 결과를 바탕으로 추천된 직업을 확인해보세요</span>
          </div>
          <span class="encyclopedia-home__menu-arrow">›</span>
        </button>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useEncyclopedia } from '../composables/useEncyclopedia'
import type { JobSummary } from '../types/encyclopedia'
import MainTitle from '../components/page/home/MainTitle.vue'
import SearchBar from '../components/page/home/SearchBar.vue'
import SearchResultCard from '../components/page/home/SearchResultCard.vue'
import RecommendedJobCard from '../components/page/home/RecommendedJobCard.vue'

const router = useRouter()
const {
  searchQuery,
  searchResults,
  isLoading,
  searchJob,
  clearSearch,
} = useEncyclopedia()

const featuredJobs: JobSummary[] = [
  {
    jobCode: '013601',
    classification: { primary: '경영·사무·금융·보험직', secondary: '전문서비스 관리자' },
    title: '예술·디자인·방송관리자',
  },
  {
    jobCode: '521101',
    classification: { primary: '미용·여행·숙박·음식·경비·청소직', secondary: '여행 서비스원' },
    title: '여행상품개발자',
  },
  {
    jobCode: '415502',
    classification: { primary: '예술·디자인·방송·스포츠직', secondary: '디자이너' },
    title: '게임그래픽디자이너',
  },
]

function goToJobDetail(jobCode: string) {
  router.push(`/career-encyclopedia/job/${jobCode}`)
}

function goToRecommended() {
  router.push('/career-encyclopedia/recommended')
}
</script>

<style scoped>
.encyclopedia-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px 0 32px;
  gap: 24px;
}

.encyclopedia-home__section {
  width: 100%;
  max-width: 480px;
  padding: 0 20px;
}

.encyclopedia-home__section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.encyclopedia-home__state {
  font-size: 14px;
  color: #aaa;
  text-align: center;
  padding: 32px 0;
}

.encyclopedia-home__menu-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 16px;
  background-color: #f5f5f5;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.encyclopedia-home__menu-btn:active {
  background-color: #e8e8e8;
}

@media (hover: hover) {
  .encyclopedia-home__menu-btn:hover {
    background-color: #e8e8e8;
  }
}

.encyclopedia-home__menu-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.encyclopedia-home__menu-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.encyclopedia-home__menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.encyclopedia-home__menu-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.4;
}

.encyclopedia-home__menu-arrow {
  font-size: 22px;
  color: #bbb;
  flex-shrink: 0;
}

.encyclopedia-home__card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
