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

    <!-- 직업 현황 -->
    <section v-if="job.jobSatisfaction != null || job.salary" class="overview-section">
      <h3 class="overview-section__title">직업 현황</h3>
      <div class="overview-stats">

        <!-- 직업 만족도 -->
        <div v-if="job.jobSatisfaction != null" class="overview-stats__card">
          <span class="overview-stats__label">직업 만족도</span>
          <div class="overview-satisfaction">
            <div class="overview-satisfaction__bar-bg">
              <div
                class="overview-satisfaction__bar-fill"
                :style="{ width: job.jobSatisfaction + '%' }"
              />
            </div>
            <span class="overview-satisfaction__value">상위 {{ (100 - job.jobSatisfaction).toFixed(1) }}%</span>
          </div>
        </div>

        <!-- 임금 정보 -->
        <div v-if="job.salary" class="overview-stats__card">
          <span class="overview-stats__label">연봉 (만원)</span>
          <div class="overview-salary">
            <div class="overview-salary__track">
              <div class="overview-salary__bar" />
              <div class="overview-salary__point overview-salary__point--lower">
                <div class="overview-salary__dot" />
                <span class="overview-salary__tip">하위 25%</span>
                <span class="overview-salary__amount">{{ job.salary.lower.toLocaleString() }}</span>
              </div>
              <div class="overview-salary__point overview-salary__point--median">
                <div class="overview-salary__dot overview-salary__dot--median" />
                <span class="overview-salary__tip">중위</span>
                <span class="overview-salary__amount overview-salary__amount--median">{{ job.salary.median.toLocaleString() }}</span>
              </div>
              <div class="overview-salary__point overview-salary__point--upper">
                <div class="overview-salary__dot" />
                <span class="overview-salary__tip">상위 25%</span>
                <span class="overview-salary__amount">{{ job.salary.upper.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
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

/* 직업 현황 */
.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-stats__card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.overview-stats__label {
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

/* 만족도 */
.overview-satisfaction {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-satisfaction__bar-bg {
  flex: 1;
  height: 8px;
  background-color: #e4e4e4;
  border-radius: 4px;
  overflow: hidden;
}

.overview-satisfaction__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a7fc1, #6fa3e8);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.overview-satisfaction__value {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: #4a7fc1;
}

/* 임금 */
.overview-salary {
  padding: 20px 8px 8px;
}

.overview-salary__track {
  position: relative;
  height: 4px;
  background-color: #e4e4e4;
  border-radius: 2px;
  margin: 0 16px;
}

.overview-salary__bar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #c8daf5, #4a7fc1);
  border-radius: 2px;
}

.overview-salary__point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.overview-salary__point--lower  { left: 0%; }
.overview-salary__point--median { left: 50%; }
.overview-salary__point--upper  { left: 100%; }

.overview-salary__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4a7fc1;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #4a7fc1;
}

.overview-salary__dot--median {
  width: 14px;
  height: 14px;
  background-color: #2b5fa8;
  box-shadow: 0 0 0 1px #2b5fa8;
}

.overview-salary__tip {
  position: absolute;
  top: -22px;
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
}

.overview-salary__amount {
  position: absolute;
  top: 18px;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
}

.overview-salary__amount--median {
  font-size: 15px;
  font-weight: 700;
  color: #2b5fa8;
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
