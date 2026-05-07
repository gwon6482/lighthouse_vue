<template>
  <div class="review-tab">

    <!-- 후기 목록 -->
    <section class="review-section">
      <h3 class="review-section__title">후기 ({{ reviews.length }})</h3>

      <div v-if="isLoading" class="review-empty">불러오는 중...</div>
      <div v-else-if="error" class="review-empty review-empty--error">{{ error }}</div>
      <div v-else-if="reviews.length === 0" class="review-empty">아직 등록된 후기가 없습니다.</div>

      <ul v-else class="review-list">
        <li v-for="review in reviews" :key="review._id" class="review-card">
          <div class="review-card__top">
            <div class="review-card__satisfaction">
              <span class="review-card__satisfaction-label">만족도</span>
              <div class="review-card__bar-bg">
                <div class="review-card__bar-fill" :style="{ width: review.satisfaction + '%' }" />
              </div>
              <span class="review-card__satisfaction-value">{{ review.satisfaction }}점</span>
            </div>
            <span class="review-card__date">{{ formatDate(review.createdAt) }}</span>
          </div>

          <p class="review-card__summary">{{ review.summary }}</p>

          <div class="review-card__detail">
            <div class="review-card__detail-item review-card__detail-item--pros">
              <span class="review-card__detail-label">장점</span>
              <p class="review-card__detail-text">{{ review.pros }}</p>
            </div>
            <div class="review-card__detail-item review-card__detail-item--cons">
              <span class="review-card__detail-label">단점</span>
              <p class="review-card__detail-text">{{ review.cons }}</p>
            </div>
          </div>

          <div class="review-card__recommendation">
            <span class="review-card__recommendation-label">추천</span>
            <p class="review-card__recommendation-text">{{ review.recommendation }}</p>
          </div>

          <div v-if="review.personalityTags.length > 0" class="review-card__tags">
            <span
              v-for="tag in review.personalityTags"
              :key="tag"
              class="review-card__tag"
            >{{ TAG_LABELS[tag] }}</span>
          </div>
        </li>
      </ul>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchJobReviews } from '../../../../encyclopedia.api'
import type { JobReview, T1GroupCode } from '../../../../types/encyclopedia'

const props = defineProps<{ jobCode: string }>()

const TAG_LABELS: Record<T1GroupCode, string> = {
  E: '외향성', C: '성실성', S: '민감성', A: '친화성',
  I: '지성', R: '현실성', G: '집단화합', U: '독특성', T: '끈기',
}

const reviews = ref<JobReview[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function loadReviews() {
  isLoading.value = true
  error.value = null
  try {
    const { data } = await fetchJobReviews(props.jobCode)
    reviews.value = data.data
  } catch {
    error.value = '후기를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadReviews)
</script>

<style scoped lang="scss">
.review-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 50px 40px;
  background-color: #f9fafb;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #fff;
  padding: 30px;
  border-radius: 20px;

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: #333;
    padding-bottom: 8px;
    border-bottom: 1.5px solid #eee;
  }
}

/* 빈 상태 */
.review-empty {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: #bbb;

  &--error { color: #e05050; }
}

/* 후기 목록 */
.review-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background-color: #f8f9fa;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: space-between;
  }

  &__satisfaction {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  &__satisfaction-label {
    font-size: 12px;
    font-weight: 600;
    color: #888;
    flex-shrink: 0;
  }

  &__bar-bg {
    flex: 1;
    height: 6px;
    background-color: #e4e4e4;
    border-radius: 3px;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4a7fc1, #6fa3e8);
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  &__satisfaction-value {
    font-size: 13px;
    font-weight: 700;
    color: #4a7fc1;
    flex-shrink: 0;
  }

  &__date {
    font-size: 12px;
    color: #bbb;
    flex-shrink: 0;
  }

  &__summary {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__detail-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  &__detail-label {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    flex-shrink: 0;
    margin-top: 2px;

    .review-card__detail-item--pros & {
      background-color: #e8f4e8;
      color: #3a9a3a;
    }

    .review-card__detail-item--cons & {
      background-color: #fde8e8;
      color: #c94040;
    }
  }

  &__detail-text {
    font-size: 13px;
    color: #555;
    line-height: 1.6;
  }

  &__recommendation {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  &__recommendation-label {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    flex-shrink: 0;
    margin-top: 2px;
    background-color: #e8edf8;
    color: #3365E3;
  }

  &__recommendation-text {
    font-size: 13px;
    color: #555;
    line-height: 1.6;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__tag {
    font-size: 11px;
    font-weight: 600;
    color: #666;
    background-color: #ebebeb;
    border-radius: 20px;
    padding: 3px 10px;
  }
}

</style>
