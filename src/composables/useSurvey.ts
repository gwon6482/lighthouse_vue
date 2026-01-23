/**
 * useSurvey Composable
 *
 * 설문 조사 기능을 관리하는 Composable
 * - 설문 데이터 로드 및 상태 관리
 * - 사용자 답변 수집 및 관리
 * - 페이지 네비게이션 (이전/다음)
 * - 진행률 계산
 * - 답변 완료 여부 검증
 * - 설문 제출
 *
 * 싱글톤 패턴으로 구현되어 상태가 전역적으로 공유됨
 */
import { ref, computed, reactive } from 'vue'
import { fetchSurveyForm, submitSurveyResponse, type SurveyFormResponse, type SurveyAnswers, type SurveyQuestion, type SurveyItem } from '@/services/surveyApi'

// 페이지 정보 타입
export interface PageInfo {
  part: string
  pageKey: string
  pageNumber: number
  questions?: SurveyQuestion[]
  items?: SurveyItem[]
  type: 'scale' | 'multiSelect' | 'priority' | 'threeChoice'
}

// 상태를 모듈 레벨에서 정의 (싱글톤)
const surveyId = ref<string>('')
const surveyData = ref<SurveyFormResponse | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const scaleType = ref<2 | 5 | 10>(5) // 확장용: 2지선다, 5지선다, 10지선다

// 답변 저장
const answers = reactive<SurveyAnswers>({
  T1: {},
  T21: {},
  T22: { checked: [] },
  T23: { priority_1: '', priority_2: '', priority_3: '', no_priority: [] },
  T3: {}
})

// 현재 페이지 인덱스
const currentPageIndex = ref(0)

export function useSurvey() {

  // 모든 페이지 목록 생성
  const allPages = computed<PageInfo[]>(() => {
    if (!surveyData.value) return []

    const pages: PageInfo[] = []

    for (const part of surveyData.value.survey) {
      const partName = part.survey_part

      if (partName === 'T1' || partName === 'T21') {
        // 페이지별 질문
        const pageKeys = Object.keys(part).filter(k => k.startsWith('page_'))
        pageKeys.sort((a, b) => {
          const numA = parseInt(a.split('_').pop() || '0')
          const numB = parseInt(b.split('_').pop() || '0')
          return numA - numB
        })

        for (const pageKey of pageKeys) {
          const pageNum = parseInt(pageKey.split('_').pop() || '0')
          pages.push({
            part: partName,
            pageKey,
            pageNumber: pageNum,
            questions: part[pageKey] as SurveyQuestion[],
            type: 'scale'
          })
        }
      } else if (partName === 'T22') {
        pages.push({
          part: partName,
          pageKey: 'items',
          pageNumber: 1,
          items: part.items,
          type: 'multiSelect'
        })
      } else if (partName === 'T23') {
        pages.push({
          part: partName,
          pageKey: 'items',
          pageNumber: 1,
          items: part.items,
          type: 'priority'
        })
      } else if (partName === 'T3') {
        pages.push({
          part: partName,
          pageKey: 'items',
          pageNumber: 1,
          items: part.items,
          type: 'threeChoice'
        })
      }
    }

    return pages
  })

  // 현재 페이지 정보
  const currentPage = computed(() => allPages.value[currentPageIndex.value] || null)

  // 총 페이지 수
  const totalPages = computed(() => allPages.value.length)

  // 현재 파트 정보
  const currentPartInfo = computed(() => {
    const page = currentPage.value
    if (!page) return null

    const partLabels: Record<string, { number: number; name: string }> = {
      T1: { number: 1, name: '성격' },
      T21: { number: 2, name: '재능' },
      T22: { number: 2, name: '흥미' },
      T23: { number: 2, name: '가치관' },
      T3: { number: 3, name: '근무환경' }
    }

    return partLabels[page.part] || null
  })

  // 현재 파트 내 페이지 정보
  const currentPartPageInfo = computed(() => {
    const page = currentPage.value
    if (!page) return null

    const partPages = allPages.value.filter(p => p.part === page.part)
    const currentIndexInPart = partPages.findIndex(p => p.pageKey === page.pageKey)

    return {
      current: currentIndexInPart + 1,
      total: partPages.length
    }
  })

  // 진행률 (%)
  const progress = computed(() => {
    if (totalPages.value === 0) return 0
    return Math.round(((currentPageIndex.value + 1) / totalPages.value) * 100)
  })

  // 이전/다음 가능 여부
  const canGoPrev = computed(() => currentPageIndex.value > 0)
  const canGoNext = computed(() => currentPageIndex.value < totalPages.value - 1)
  const isLastPage = computed(() => currentPageIndex.value === totalPages.value - 1)

  // 설문지 로드
  async function loadSurvey() {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchSurveyForm()
      surveyData.value = data
      surveyId.value = data.survey_id
      currentPageIndex.value = 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : '설문지를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 답변 저장 함수들
  function setScaleAnswer(part: 'T1' | 'T21', questionId: string, value: string) {
    answers[part][questionId] = value
  }

  function setMultiSelectAnswer(checkedIds: string[]) {
    answers.T22.checked = checkedIds
  }

  function setPriorityAnswer(priorities: { priority_1: string; priority_2: string; priority_3: string; no_priority: string[] }) {
    answers.T23 = priorities
  }

  function setThreeChoiceAnswer(itemId: string, value: 'O' | 'M' | 'X') {
    answers.T3[itemId] = value
  }

  // 페이지 이동
  function goToNextPage() {
    if (canGoNext.value) {
      currentPageIndex.value++
    }
  }

  function goToPrevPage() {
    if (canGoPrev.value) {
      currentPageIndex.value--
    }
  }

  // 현재 페이지 답변 완료 여부
  const isCurrentPageComplete = computed(() => {
    const page = currentPage.value
    if (!page) return false

    if (page.type === 'scale' && page.questions) {
      const partAnswers = answers[page.part as 'T1' | 'T21']
      return page.questions.every(q => partAnswers[q.question_id])
    }

    if (page.type === 'multiSelect') {
      return answers.T22.checked.length > 0
    }

    if (page.type === 'priority') {
      return answers.T23.priority_1 && answers.T23.priority_2 && answers.T23.priority_3
    }

    if (page.type === 'threeChoice' && page.items) {
      return page.items.every(item => answers.T3[item.item_id])
    }

    return false
  })

  // 설문 제출
  async function submitSurvey(respondentId: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await submitSurveyResponse({
        survey_id: surveyId.value,
        respondent_id: respondentId,
        answers
      })

      if (!response.success) {
        throw new Error(response.error?.message || '제출에 실패했습니다.')
      }

      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : '제출에 실패했습니다.'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 상태
    surveyId,
    surveyData,
    isLoading,
    error,
    scaleType,
    answers,
    currentPageIndex,

    // computed
    allPages,
    currentPage,
    totalPages,
    currentPartInfo,
    currentPartPageInfo,
    progress,
    canGoPrev,
    canGoNext,
    isLastPage,
    isCurrentPageComplete,

    // 함수
    loadSurvey,
    setScaleAnswer,
    setMultiSelectAnswer,
    setPriorityAnswer,
    setThreeChoiceAnswer,
    goToNextPage,
    goToPrevPage,
    submitSurvey
  }
}
