<template>
  <div class="survey-test">
    <!-- 로딩 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>설문지를 불러오는 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadSurvey">다시 시도</button>
    </div>

    <!-- 설문 내용 -->
    <template v-else-if="currentPage">
      <!-- 헤더 -->
      <header class="survey-header">
        <div class="part-info">
          <span class="part-number">파트 {{ currentPartInfo?.number }}</span>
          <span class="part-name">{{ currentPartInfo?.name }}</span>
        </div>
        <div class="page-info">
          {{ currentPartPageInfo?.current }} / {{ currentPartPageInfo?.total }} 페이지
        </div>
      </header>

      <!-- 진행바 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-text">전체 진행률: {{ progress }}%</div>

      <!-- 질문 영역 -->
      <main class="question-area">
        <!-- T1, T21: 스케일 질문 -->
        <template v-if="currentPage.type === 'scale' && currentPage.questions">
          <ScaleQuestion
            v-for="q in currentPage.questions"
            :key="q.question_id"
            :question-id="q.question_id"
            :question-num="q.question_num"
            :question-text="q.question_text"
            :model-value="answers[currentPage.part as 'T1' | 'T21'][q.question_id] || ''"
            :scale-type="scaleType"
            @update:model-value="handleScaleAnswer(q.question_id, $event)"
          />
        </template>

        <!-- T22: 다중 선택 -->
        <template v-else-if="currentPage.type === 'multiSelect' && currentPage.items">
          <MultiSelectQuestion :items="currentPage.items" v-model="answers.T22.checked" />
        </template>

        <!-- T23: 우선순위 -->
        <template v-else-if="currentPage.type === 'priority' && currentPage.items">
          <PriorityQuestion :items="currentPage.items" v-model="answers.T23" />
        </template>

        <!-- T3: 3지선다 -->
        <template v-else-if="currentPage.type === 'threeChoice' && currentPage.items">
          <ThreeChoiceQuestion :items="currentPage.items" v-model="answers.T3" />
        </template>
      </main>

      <!-- 네비게이션 -->
      <footer class="survey-footer">
        <button class="nav-btn prev" :disabled="!canGoPrev" @click="goToPrevPage">이전</button>

        <span class="page-indicator"> {{ currentPageIndex + 1 }} / {{ totalPages }} </span>

        <button
          v-if="!isLastPage"
          class="nav-btn next"
          :disabled="!isCurrentPageComplete"
          @click="goToNextPage"
        >
          다음
        </button>

        <button
          v-else
          class="nav-btn submit"
          :disabled="!isCurrentPageComplete"
          @click="handleSubmit"
        >
          제출
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * SurveyTestView 컴포넌트
 *
 * 자기이해 설문 검사 메인 페이지
 * - API로부터 설문 데이터를 받아와 화면에 렌더링
 * - 파트별(성격, 재능, 흥미, 가치관, 근무환경) 질문을 순차적으로 표시
 * - 사용자 답변을 수집하고 API로 제출
 * - 완료된 응답을 JSON 파일로 다운로드 (테스트용)
 *
 * 라우트: /self-understanding/test
 */
import { useRouter } from 'vue-router'
import { useSurvey } from '@/modules/survey/composables/useSurvey'

import ScaleQuestion from './SUQuestions/ScaleQuestion5.vue'
import MultiSelectQuestion from './SUQuestions/MultiSelectQuestion.vue'
import PriorityQuestion from './SUQuestions/PriorityQuestion.vue'
import ThreeChoiceQuestion from './SUQuestions/ThreeChoiceQuestion.vue'

const router = useRouter()
const {
  surveyId,
  isLoading,
  error,
  scaleType,
  answers,
  currentPage,
  totalPages,
  currentPageIndex,
  currentPartInfo,
  currentPartPageInfo,
  progress,
  canGoPrev,
  isLastPage,
  isCurrentPageComplete,
  loadSurvey,
  setScaleAnswer,
  goToNextPage,
  goToPrevPage,
  submitSurvey,
} = useSurvey()

// 응답을 JSON 파일로 다운로드
function downloadResponse(surveyId: string, respondentId: string) {
  const responseData = {
    survey_id: surveyId,
    respondent_id: respondentId,
    completed_at: new Date().toISOString(),
    is_completed: true,
    answers: {
      T1: answers.T1,
      T21: answers.T21,
      T22: answers.T22,
      T23: answers.T23,
      T3: answers.T3,
    },
  }

  const blob = new Blob([JSON.stringify(responseData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `survey_${surveyId}_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 응답제출
async function handleSubmit() {
  try {
    // 임시 respondent_id (실제로는 로그인 정보 등에서 가져와야 함)
    const respondentId = `user_${Date.now()}`

    // 로컬에 응답 파일 다운로드 (테스트용)
    downloadResponse(surveyId.value, respondentId)

    await submitSurvey(respondentId)
    alert('설문이 제출되었습니다!')
    router.push('/self-understanding')
  } catch {
    // 에러는 useSurvey에서 처리됨
  }
}

function handleScaleAnswer(questionId: string, value: string) {
  if (currentPage.value) {
    setScaleAnswer(currentPage.value.part as 'T1' | 'T21', questionId, value)
  }
}
</script>
