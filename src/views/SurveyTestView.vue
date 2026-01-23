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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSurvey } from '../composables/useSurvey'

import ScaleQuestion from '../components/survey/ScaleQuestion.vue'
import MultiSelectQuestion from '../components/survey/MultiSelectQuestion.vue'
import PriorityQuestion from '../components/survey/PriorityQuestion.vue'
import ThreeChoiceQuestion from '../components/survey/ThreeChoiceQuestion.vue'

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

onMounted(() => {
  loadSurvey()
})

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

<style scoped>
.survey-test {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
}

/* 로딩 */
.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 에러 */
.error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  text-align: center;
}

.error p {
  color: #d32f2f;
  font-size: 16px;
}

.error button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #333;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

/* 헤더 */
.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.part-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.part-number {
  padding: 4px 10px;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.part-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 진행바 */
.progress-bar {
  height: 4px;
  background: #e0e0e0;
}

.progress-fill {
  height: 100%;
  background: #333;
  transition: width 0.3s ease;
}

.progress-text {
  padding: 8px 20px;
  font-size: 12px;
  color: #999;
  background: #fff;
  text-align: right;
}

/* 질문 영역 */
.question-area {
  flex: 1;
  padding: 20px;
  background: #fff;
  margin: 0;
  overflow-y: auto;
}

/* 푸터 */
.survey-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
}

.nav-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn.prev {
  background: #f5f5f5;
  color: #333;
}

.nav-btn.prev:hover:not(:disabled) {
  background: #e8e8e8;
}

.nav-btn.next,
.nav-btn.submit {
  background: #333;
  color: #fff;
}

.nav-btn.next:hover:not(:disabled),
.nav-btn.submit:hover:not(:disabled) {
  background: #555;
}

.page-indicator {
  font-size: 14px;
  color: #999;
}

/* 반응형 */
@media (max-width: 480px) {
  .survey-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .nav-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
