<template>
  <div class="overview-tab">

    <!-- 주요업무 -->
    <section class="overview-section">
      <h3 class="overview-section__title">주요업무</h3>
      <p class="overview-section__text">{{ job.overview }}</p>
    </section>

    <!-- 수행직무 -->
    <section class="overview-section">
      <h3 class="overview-section__title">수행직무</h3>
      <ul class="overview-duties">
        <li
          v-for="(duty, i) in job.duties"
          :key="i"
          class="overview-duties__item"
        >
          {{ duty }}
        </li>
      </ul>
    </section>

    <!-- 추천성향 -->
    <section class="overview-section">
      <h3 class="overview-section__title">추천성향</h3>

      <div class="overview-personality">
        <!-- 성격 -->
        <div class="overview-personality__group">
          <span class="overview-personality__label">성격</span>
          <div class="overview-personality__tags">
            <span
              v-for="item in personalityItems"
              :key="item.name"
              class="overview-tag"
            >
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- 흥미 -->
        <div class="overview-personality__group">
          <span class="overview-personality__label">흥미</span>
          <div class="overview-personality__tags">
            <span
              v-for="item in interestItems"
              :key="item.name"
              class="overview-tag overview-tag--interest"
            >
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 주요업무수행능력 -->
    <section class="overview-section">
      <h3 class="overview-section__title">주요업무수행능력</h3>
      <ul class="overview-abilities">
        <li
          v-for="item in abilityItems"
          :key="item.name"
          class="overview-abilities__item"
        >
          <div class="overview-abilities__info">
            <span class="overview-abilities__name">{{ item.name }}</span>
            <span class="overview-abilities__score">{{ item.score }}</span>
          </div>
          <div class="overview-abilities__bar-bg">
            <div
              class="overview-abilities__bar-fill"
              :style="{ width: item.score + '%' }"
            />
          </div>
        </li>
      </ul>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Job, RankingGroup, RankItem } from '../../../../types/encyclopedia'

const props = defineProps<{
  job: Job
}>()

function rankingToArray(group: RankingGroup): RankItem[] {
  return [
    group.item_1st,
    group.item_2nd,
    group.item_3rd,
    group.item_4th,
    group.item_5th,
  ]
}

const personalityItems = computed(() => {
  const group = props.job.details['성격/흥미/가치관']['성격']['성격 > 중요도 > 직업 내 비교']
  return group ? rankingToArray(group) : []
})

const interestItems = computed(() => {
  const group = props.job.details['성격/흥미/가치관']['흥미']['흥미 > 중요도 > 직업 내 비교']
  return group ? rankingToArray(group) : []
})

const abilityItems = computed(() => {
  const group = props.job.details['능력/지식/환경']['업무수행능력']['업무수행능력 > 중요도 > 직업 간 비교']
  return group ? rankingToArray(group) : []
})
</script>

<style scoped>
.overview-tab {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 20px 40px;
}

/* 섹션 공통 */
.overview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-section__title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #eee;
}

/* 주요업무 */
.overview-section__text {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}

/* 수행직무 */
.overview-duties {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-duties__item {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  padding-left: 14px;
  position: relative;
}

.overview-duties__item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #bbb;
}

/* 추천성향 */
.overview-personality {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.overview-personality__group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.overview-personality__label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 4px 8px;
  margin-top: 2px;
}

.overview-personality__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.overview-tag {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 5px 12px;
}

.overview-tag--interest {
  color: #4a7fc1;
  background-color: #eef3fb;
}

/* 주요업무수행능력 */
.overview-abilities {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-abilities__item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.overview-abilities__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-abilities__name {
  font-size: 14px;
  color: #444;
}

.overview-abilities__score {
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

.overview-abilities__bar-bg {
  width: 100%;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.overview-abilities__bar-fill {
  height: 100%;
  background-color: #333;
  border-radius: 3px;
  transition: width 0.4s ease;
}
</style>
