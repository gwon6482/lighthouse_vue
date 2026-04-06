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
        <li v-for="(duty, i) in job.duties" :key="i" class="overview-duties__item">
          {{ duty }}
        </li>
      </ul>
    </section>

    <!-- 개인요소 / 업무요소 -->
    <section v-for="section in detailSections" :key="section.title" class="overview-section">
      <h3 class="overview-section__title">{{ section.title }}</h3>
      <div class="factor-group">
        <div v-for="catKey in section.keys" :key="catKey" class="factor-card">
          <h4 class="factor-card__title">{{ catKey }}</h4>

          <div v-for="dimKey in dimensionsOf(catKey)" :key="dimKey" class="factor-dim">
            <span class="factor-dim__badge">{{ dimKey }}</span>

            <!-- 직업 내 -->
            <div class="factor-block">
              <span class="factor-block__label factor-block__label--inner">직업 내</span>
              <ul class="rank-list">
                <li v-for="item in getItems(catKey, dimKey, '직업내')" :key="item.name" class="rank-item">
                  <div class="rank-item__row">
                    <span class="rank-item__name">{{ item.name }}</span>
                    <span class="rank-item__score">{{ item.score }}</span>
                  </div>
                  <div class="rank-bar-bg">
                    <div class="rank-bar-fill rank-bar-fill--inner" :style="{ width: pct(item.score, 7) }" />
                  </div>
                </li>
              </ul>
            </div>

            <!-- 직업 간 -->
            <div class="factor-block">
              <span class="factor-block__label factor-block__label--inter">직업 간</span>
              <ul class="rank-list">
                <li v-for="item in getItems(catKey, dimKey, '직업간')" :key="item.name" class="rank-item">
                  <div class="rank-item__row">
                    <span class="rank-item__name">{{ item.name }}</span>
                    <span class="rank-item__score">{{ item.score }}</span>
                  </div>
                  <div class="rank-bar-bg">
                    <div class="rank-bar-fill rank-bar-fill--inter" :style="{ width: pct(item.score, 100) }" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
import type { Job, JobDetails, CategoryRankings, RankItem } from '../../../../types/encyclopedia'

const props = defineProps<{ job: Job }>()

type FactorKey = keyof JobDetails
type DimKey = '중요도' | '수준'
type CompareKey = '직업내' | '직업간'

const detailSections: Array<{ title: string; keys: FactorKey[] }> = [
  { title: '개인요소', keys: ['성격', '지식', '흥미', '가치관'] },
  { title: '업무요소', keys: ['업무수행능력', '업무활동', '업무환경'] },
]

function dimensionsOf(catKey: FactorKey): DimKey[] {
  const cat = props.job.details[catKey] as CategoryRankings
  return (['중요도', '수준'] as DimKey[]).filter(k => cat[k] !== undefined)
}

function getItems(catKey: FactorKey, dimKey: DimKey, compareKey: CompareKey): RankItem[] {
  return (props.job.details[catKey] as CategoryRankings)[dimKey]?.[compareKey] ?? []
}

function pct(score: number, max: number): string {
  return `${Math.min((score / max) * 100, 100).toFixed(1)}%`
}
</script>

<style scoped lang="scss">
.overview-tab {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 50px 40px;
  background-color: #f9fafb;
}

/* 섹션 공통 */
.overview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

  &__text {
    font-size: 14px;
    color: #555;
    line-height: 1.7;
  }
}

/* 수행직무 */
.overview-duties {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__item {
    font-size: 14px;
    color: #555;
    line-height: 1.6;
    padding-left: 14px;
    position: relative;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #bbb;
    }
  }
}

/* 개인요소 / 업무요소 그룹 */
.factor-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 카테고리 카드 */
.factor-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: #333;
  }
}

/* 중요도 / 수준 구분 */
.factor-dim {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    color: #666;
    background-color: #e9ecef;
    border-radius: 6px;
    padding: 3px 8px;
    align-self: flex-start;
  }
}

/* 직업내 / 직업간 블록 */
.factor-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;

  &:last-child { margin-bottom: 8px; }

  &__label {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.3px;

    &--inner { color: #4a7fc1; }
    &--inter  { color: #e0a030; }
  }
}

/* 순위 리스트 */
.rank-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-size: 13px;
    color: #444;
    flex: 1;
    margin-right: 8px;
    line-height: 1.4;
  }

  &__score {
    font-size: 12px;
    font-weight: 600;
    color: #3365E3;
    flex-shrink: 0;
  }
}

.rank-bar-bg {
  width: 100%;
  height: 5px;
  background-color: #e4e4e4;
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;

  &--inner { background-color: #4a7fc1; }
  &--inter  { background-color: #e0a030; }
}

/* 직업 현황 */
.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 16px 16px 20px;

    &:last-child { padding: 16px 16px 35px; }
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #888;
  }
}

/* 만족도 */
.overview-satisfaction {
  display: flex;
  align-items: center;
  gap: 12px;

  &__bar-bg {
    flex: 1;
    height: 8px;
    background-color: #e4e4e4;
    border-radius: 4px;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4a7fc1, #6fa3e8);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  &__value {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 700;
    color: #4a7fc1;
  }
}

/* 임금 */
.overview-salary {
  padding: 20px 8px 8px;

  &__track {
    position: relative;
    height: 4px;
    background-color: #e4e4e4;
    border-radius: 2px;
    margin: 0 16px;
  }

  &__bar {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #c8daf5, #4a7fc1);
    border-radius: 2px;
  }

  &__point {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    &--lower  { left: 0%; }
    &--median { left: 50%; }
    &--upper  { left: 100%; }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4a7fc1;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #4a7fc1;

    &--median {
      width: 14px;
      height: 14px;
      background-color: #2b5fa8;
      box-shadow: 0 0 0 1px #2b5fa8;
    }
  }

  &__tip {
    position: absolute;
    top: -22px;
    font-size: 11px;
    color: #aaa;
    white-space: nowrap;
  }

  &__amount {
    position: absolute;
    top: 18px;
    font-size: 13px;
    font-weight: 600;
    color: #444;
    white-space: nowrap;

    &--median {
      font-size: 15px;
      font-weight: 700;
      color: #2b5fa8;
    }
  }
}
</style>
