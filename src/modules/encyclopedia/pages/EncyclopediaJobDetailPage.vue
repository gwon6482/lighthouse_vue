<template>
  <div class="job-detail-page">
    <!-- 로딩 -->
    <div v-if="isLoading" class="job-detail-page__loading">
      로딩 중...
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="job-detail-page__error">
      {{ error }}
    </div>

    <!-- 직업 상세 -->
    <template v-else-if="selectedJob">
      <!-- 헤더: 직업명 + 분류 -->
      <JobDetailHeader
        :title="selectedJob.title"
        :classification="selectedJob.classification"
      />

      <!-- 탭 네비게이션 -->
      <JobDetailTabs
        :active-tab="activeTab"
        @change="setActiveTab"
      />

      <!-- 탭 컨텐츠 -->
      <div class="job-detail-page__content">
        <OverviewTab
          v-if="activeTab === 'overview'"
          :job="selectedJob"
        />
        <ReviewTab
          v-else-if="activeTab === 'review'"
          :job-code="selectedJob.jobCode"
        />
        <PreparationTab
          v-else-if="activeTab === 'preparation'"
          :job-code="selectedJob.jobCode"
        />
        <RecruitmentTab
          v-else-if="activeTab === 'recruitment'"
          :job-code="selectedJob.jobCode"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEncyclopedia } from '../composables/useEncyclopedia'
import JobDetailHeader from '../components/page/job-detail/JobDetailHeader.vue'
import JobDetailTabs from '../components/page/job-detail/JobDetailTabs.vue'
import OverviewTab from '../components/page/job-detail/tabs/OverviewTab.vue'
import ReviewTab from '../components/page/job-detail/tabs/ReviewTab.vue'
import PreparationTab from '../components/page/job-detail/tabs/PreparationTab.vue'
import RecruitmentTab from '../components/page/job-detail/tabs/RecruitmentTab.vue'

const route = useRoute()
const { selectedJob, activeTab, isLoading, error, loadJob, setActiveTab } = useEncyclopedia()

onMounted(() => {
  const jobCode = route.params.jobCode as string
  loadJob(jobCode)
})
</script>

<style scoped lang="scss">
.job-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__loading,
  &__error {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #aaa;
    padding: 40px 20px;
  }

  &__content {
    flex: 1;
  }
}
</style>
