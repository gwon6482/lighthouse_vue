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
import { ref, computed, reactive, onMounted } from 'vue'
import { fetchSurveyForm, submitSurveyResponse } from '../survey.api'
import type { SurveyFormResponse, SurveyAnswers, T3Answers, SurveyQuestion, PageInfo, PartIntroData } from '../types/survey'

// 모듈 레벨에서 상태 정의 (모든 인스턴스가 공유)
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
  T3: { T3_PHY: 3, T3_PEO: 3, T3_COM: 3, T3_RES: 3, T3_STR: 3, T3_FLX: 3 },
})

// 현재 페이지 인덱스
const currentPageIndex = ref(0)

export function useSurvey() {
  // 모든 페이지 목록 생성
  const allPages = computed<PageInfo[]>(() => {
    if (!surveyData.value) return []

    const pages: PageInfo[] = []

    // 파트별 인트로 데이터 (하드코딩, SURVEY_FLOW_UPDATE.md 참고)
    // 문항 수: T1=43, T21=61, T22=33, T23=13, T3=6개 항목
    const partIntros: Record<string, PartIntroData> = {
      T1: {
        partLabel: '파트 1',
        title: '성격 & 기질',
        description: '적성을 파악하는 데 가장 중요한 요소',
        emoji: '🧠',
        questionCount: '43문항',
        estimatedMinutes: 5,
        highlights: [
          '외향성 · 기발함 · 성실성 · 우호성 · 자극추구 · 위험회피 · 사회적민감성 · 자율성 · 연대감, 9가지 요소를 측정해',
          '단순한 진로 추천을 넘어 스스로를 이해하는 중요한 지표가 돼',
          '정답은 없어. 지금의 나 그대로 솔직하게 답해줘',
        ],
      },
      T21: {
        partLabel: '파트 2',
        title: '좋아하는 일',
        description: '라이트하우스 검사의 핵심',
        emoji: '✨',
        questionCount: '총 107문항',  // T21(61) + T22(33) + T23(13)
        estimatedMinutes: 5,
        highlights: [
          '좋아하는 일 = 흥미있는 분야에서 잘하는 것(재능)을 하며, 가치있는 것(가치관)을 쫓는 것',
          '재능 · 흥미 · 가치관 3개 파트로 나눠서 검사해',
          '재능 검사는 다중지능검사를 베이스로 제작됐어. 조금 걸리지만 분명히 도움이 될 거야',
        ],
      },
      T3: {
        partLabel: '파트 3',
        title: '업무 환경',
        description: '나의 진로 리스크를 미리 파악하는 검사',
        emoji: '🌿',
        questionCount: '6개 항목',
        // estimatedMinutes 없음 — T3는 예상 시간 미표시
        highlights: [
          '좋아하는 일을 해도 직업 환경의 리스크를 미리 파악 못 하면 적응하지 못하는 경우가 생겨',
          '라이트하우스는 이 검사를 통해 너의 진로 리스크를 먼저 파악하고, 진로 추천에 반영해',
        ],
      },
    }

    for (const part of surveyData.value.survey) {
      const partName = part.survey_part

      // T1, T21, T3 파트 시작 전 인트로 페이지 삽입
      if (partIntros[partName]) {
        pages.push({
          part: partName,
          pageKey: 'intro',
          pageNumber: 0,
          type: 'partIntro',
          introData: partIntros[partName],
        })
      }

      if (partName === 'T1' || partName === 'T21') {
        // 페이지별 질문
        const pageKeys = Object.keys(part).filter((k) => k.startsWith('page_'))
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
            type: 'scale',
          })
        }
      } else if (partName === 'T22') {
        pages.push({
          part: partName,
          pageKey: 'items',
          pageNumber: 1,
          items: part.items,
          type: 'multiSelect',
        })
      } else if (partName === 'T23') {
        pages.push({
          part: partName,
          pageKey: 'items',
          pageNumber: 1,
          items: part.items,
          type: 'priority',
        })
      } else if (partName === 'T3') {
        pages.push({
          part: partName,
          pageKey: 'items',
          pageNumber: 1,
          items: part.items,
          type: 'threeChoice',
        })
      }
    }

    return pages
  })

  // ScaleQuestion 2, 5, 10 값 선택
  function setScaleType(type: 2 | 5 | 10) {
    scaleType.value = type
  }

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
      T3: { number: 3, name: '근무환경' },
    }

    return partLabels[page.part] || null
  })

  // 현재 파트 내 페이지 정보
  const currentPartPageInfo = computed(() => {
    const page = currentPage.value
    if (!page) return null

    // partIntro 페이지는 카운트에서 제외 (헤더 진행 표시가 0/N 이 되는 것 방지)
    const partPages = allPages.value.filter((p) => p.part === page.part && p.type !== 'partIntro')
    const currentIndexInPart = partPages.findIndex((p) => p.pageKey === page.pageKey)

    return {
      current: currentIndexInPart + 1,
      total: partPages.length,
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
      const { data, status } = await fetchSurveyForm()
      if (status === 200) {
        surveyData.value = data
        surveyId.value = data.survey_id
        currentPageIndex.value = 0
      } else {
        throw new Error('설문지를 불러오는데 실패했습니다.')
      }
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

  function setPriorityAnswer(priorities: {
    priority_1: string
    priority_2: string
    priority_3: string
    no_priority: string[]
  }) {
    answers.T23 = priorities
  }

  function setT3Answers(value: T3Answers) {
    Object.assign(answers.T3, value)
  }

  // 페이지 이동
  function goToNextPage() {
    if (canGoNext.value) {
      currentPageIndex.value++
      window.scrollTo(0, 0)
    }
  }

  function goToPrevPage() {
    if (canGoPrev.value) {
      currentPageIndex.value--
      window.scrollTo(0, 0)
    }
  }

  // 현재 페이지 답변 완료 여부
  const isCurrentPageComplete = computed(() => {
    const page = currentPage.value
    if (!page) return false

    if (page.type === 'scale' && page.questions) {
      const partAnswers = answers[page.part as 'T1' | 'T21']
      return page.questions.every((q) => partAnswers[q.question_id])
    }

    if (page.type === 'multiSelect') {
      return answers.T22.checked.length > 0
    }

    if (page.type === 'priority') {
      return answers.T23.priority_1 && answers.T23.priority_2 && answers.T23.priority_3
    }

    if (page.type === 'threeChoice') {
      return true // 슬라이더는 항상 유효한 값(1~5)을 가짐
    }

    if (page.type === 'partIntro') {
      return true // 인트로 페이지는 답변 없이 다음으로 이동 가능
    }

    return false
  })

  // 설문 제출
  async function submitSurvey(respondentId: string) {
    isLoading.value = true
    error.value = null

    try {
      // const response = await submitSurveyResponse({
      //   survey_id: surveyId.value,
      //   respondent_id: respondentId,
      //   answers
      // })

      // if (!response.success) {
      //   throw new Error(response.error?.message || '제출에 실패했습니다.')
      // }

      // return response

      const { data } = await submitSurveyResponse({
        survey_id: surveyId.value,
        respondent_id: respondentId,
        answers,
      })

      if (!data.success) {
        throw new Error(data.error?.message || '제출에 실패했습니다.')
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '제출에 실패했습니다.'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // 컴포넌트 마운트 시 설문지 로드
  // surveyData가 이미 있으면 loadSurvey() 스킵하도록 가드 추가 (기존 첫 로드 동작은 그대로). if문은 마지막 페이지 이동용 임시라 삭제해도 됨.
  onMounted(() => {
    if (!surveyData.value) {
      loadSurvey()
    }
  })

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
    setScaleType,
    setScaleAnswer,
    setMultiSelectAnswer,
    setPriorityAnswer,
    setT3Answers,
    goToNextPage,
    goToPrevPage,
    submitSurvey,
  }
}
