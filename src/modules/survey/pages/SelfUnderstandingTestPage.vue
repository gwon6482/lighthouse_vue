<template>
  <div class="survey-test">
    <!-- 로딩 -->
    <SurveyIntro v-if="isLoading" />

    <!-- 에러 -->
    <SurveyError v-else-if="error" :error="error" @loadSurvey="loadSurvey" />

    <!-- 설문 내용 -->
    <template v-else-if="currentPage">
      <!-- 헤더 -->
      <SurveyHeader
        v-if="currentPartInfo && currentPartPageInfo"
        :currentPartInfo="currentPartInfo"
        :currentPartPageInfo="currentPartPageInfo"
      />

      <!-- 진행바 -->
      <SurveyProgressBar :progress="progress" />

      <!-- 질문 영역 -->
      <main class="question-area">
        <!-- T1, T21: 스케일 질문 -->
        <template v-if="currentPage.type === 'scale' && currentPage.questions">
          <template v-if="scaleType === 2">
            <ScaleQuestion2
              v-for="q in currentPage.questions"
              :key="`2-${q.question_id}`"
              :question-id="q.question_id"
              :question-num="q.question_num"
              :question-text="q.question_text"
              :model-value="answers[currentPage.part as 'T1' | 'T21'][q.question_id] || ''"
              @update:model-value="handleScaleAnswer(q.question_id, $event)"
            />
          </template>
          <template v-else-if="scaleType === 5">
            <ScaleQuestion5
              v-for="q in currentPage.questions"
              :key="`5-${q.question_id}`"
              :question-id="q.question_id"
              :question-num="q.question_num"
              :question-text="q.question_text"
              :model-value="answers[currentPage.part as 'T1' | 'T21'][q.question_id] || ''"
              @update:model-value="handleScaleAnswer(q.question_id, $event)"
            />
          </template>
          <template v-else-if="scaleType === 10">
            <ScaleQuestion10
              v-for="q in currentPage.questions"
              :key="`10-${q.question_id}`"
              :question-id="q.question_id"
              :question-num="q.question_num"
              :question-text="q.question_text"
              :model-value="answers[currentPage.part as 'T1' | 'T21'][q.question_id] || ''"
              @update:model-value="handleScaleAnswer(q.question_id, $event)"
            />
          </template>
        </template>

        <!-- T22: 다중 선택 -->
        <template v-else-if="currentPage.type === 'multiSelect' && currentPage.items">
          <MultiSelectQuestion :items="currentPage.items" v-model="answers.T22.checked" />
        </template>

        <!-- T23: 우선순위 -->
        <template v-else-if="currentPage.type === 'priority' && currentPage.items">
          <PriorityQuestion :items="currentPage.items" v-model="answers.T23" />
        </template>

        <!-- T3: 업무환경 슬라이더 -->
        <template v-else-if="currentPage.type === 'threeChoice'">
          <ThreeChoiceQuestion v-model="answers.T3" :items="currentPage.items ?? []" />
        </template>

        <!-- 파트 인트로 -->
        <template v-else-if="currentPage.type === 'partIntro' && currentPage.introData">
          <SurveyPartIntro :intro-data="currentPage.introData" />
        </template>
      </main>

      <!-- 네비게이션 -->
      <footer class="survey-footer">
        <SurveyNavBtnPrev :disabled="!canGoPrev" @goToPrevPage="goToPrevPage" />

        <SurveyNavCurrentPage :currentPageIndex="currentPageIndex" :totalPages="totalPages" />

        <SurveyNavBtnNext
          v-if="!isLastPage"
          :disabled="!isCurrentPageComplete"
          @goToNextPage="goToNextPage"
        />

        <SurveyNavBtnSubmit
          v-else
          :disabled="!isCurrentPageComplete"
          @handleSubmit="handleSubmit"
        />
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
import { useSurvey } from '../composables/useSurvey'

import ScaleQuestion5 from '../components/page/su-test-page/su-questions/ScaleQuestion5.vue'
import MultiSelectQuestion from '../components/page/su-test-page/su-questions/MultiSelectQuestion.vue'
import PriorityQuestion from '../components/page/su-test-page/su-questions/PriorityQuestion.vue'
import ThreeChoiceQuestion from '../components/page/su-test-page/su-questions/ThreeChoiceQuestion.vue'
import SurveyIntro from '../components/page/su-test-page/SurveyIntro.vue'
import SurveyError from '../components/page/su-test-page/SurveyError.vue'
import SurveyHeader from '../components/page/su-test-page/SurveyHeader.vue'
import SurveyProgressBar from '../components/page/su-test-page/SurveyProgressBar.vue'
import SurveyNavBtnNext from '../components/page/su-test-page/SurveyNavBtnNext.vue'
import SurveyNavBtnSubmit from '../components/page/su-test-page/SurveyNavBtnSubmit.vue'
import SurveyNavBtnPrev from '../components/page/su-test-page/SurveyNavBtnPrev.vue'
import SurveyNavCurrentPage from '../components/page/su-test-page/SurveyNavCurrentPage.vue'
import ScaleQuestion2 from '../components/page/su-test-page/su-questions/ScaleQuestion2.vue'
import ScaleQuestion10 from '../components/page/su-test-page/su-questions/ScaleQuestion10.vue'
import SurveyPartIntro from '../components/page/su-test-page/SurveyPartIntro.vue'

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
    router.push('/self-understanding/complete')
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
