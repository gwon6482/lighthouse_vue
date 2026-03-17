/**
 * useEncyclopedia Composable
 *
 * 진로백과 기능을 관리하는 Composable
 * - 직업 상세 데이터 로드 및 상태 관리
 * - 직업 검색 및 추천 목록 관리
 * - 세부 진로 페이지 탭 관리
 * - 후기 / 준비과정 / 채용 데이터 관리
 *
 * 싱글톤 패턴으로 구현되어 상태가 전역적으로 공유됨
 */
import { ref } from 'vue'
import {
  fetchJob,
  searchJobs,
  fetchRecommendedJobs,
  fetchJobReviews,
  fetchJobPreparations,
  fetchJobRecruitments,
} from '../encyclopedia.api'
import type {
  Job,
  JobSummary,
  JobReview,
  PreparationCard,
  RecruitmentCard,
  JobDetailTab,
} from '../types/encyclopedia'

// ────────────────────────────────────────────────────────────────────────────
// 모듈 레벨 상태 (모든 인스턴스가 공유)
// ────────────────────────────────────────────────────────────────────────────

// 홈 화면
const searchQuery = ref<string>('')
const searchResults = ref<JobSummary[]>([])
const recommendedJobs = ref<JobSummary[]>([])

// 세부 진로 페이지
const selectedJob = ref<Job | null>(null)
const activeTab = ref<JobDetailTab>('overview')

// 탭별 데이터
const reviews = ref<JobReview[]>([])
const preparations = ref<PreparationCard[]>([])
const recruitments = ref<RecruitmentCard[]>([])

// 선택된 채용 카드 (팝업용)
const selectedRecruitment = ref<RecruitmentCard | null>(null)

// 로딩 / 에러 상태
const isLoading = ref(false)
const error = ref<string | null>(null)

// ────────────────────────────────────────────────────────────────────────────
// Composable
// ────────────────────────────────────────────────────────────────────────────

export function useEncyclopedia() {

  // ── 홈 화면 ──────────────────────────────────────────────────────────────

  /** 추천 진로 목록 로드 */
  async function loadRecommendedJobs() {
    isLoading.value = true
    error.value = null
    try {
      const { data, status } = await fetchRecommendedJobs()
      if (status === 200) {
        recommendedJobs.value = data.data
      } else {
        throw new Error('추천 진로를 불러오는데 실패했습니다.')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '추천 진로를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  /** 직업 검색 */
  async function searchJob(query: string) {
    searchQuery.value = query
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    isLoading.value = true
    error.value = null
    try {
      const { data, status } = await searchJobs(query)
      if (status === 200) {
        searchResults.value = data.data
      } else {
        throw new Error('검색에 실패했습니다.')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '검색에 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  /** 검색 결과 초기화 */
  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
  }

  // ── 세부 진로 페이지 ──────────────────────────────────────────────────────

  /** 직업 상세 로드 */
  async function loadJob(jobCode: string) {
    isLoading.value = true
    error.value = null
    selectedJob.value = null
    activeTab.value = 'overview'
    try {
      const { data, status } = await fetchJob(jobCode)
      if (status === 200) {
        selectedJob.value = data.data
      } else {
        throw new Error('직업 정보를 불러오는데 실패했습니다.')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '직업 정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  /** 탭 전환 */
  function setActiveTab(tab: JobDetailTab) {
    activeTab.value = tab
  }

  // ── 후기 탭 ──────────────────────────────────────────────────────────────

  async function loadReviews(jobCode: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, status } = await fetchJobReviews(jobCode)
      if (status === 200) {
        reviews.value = data.data
      } else {
        throw new Error('후기를 불러오는데 실패했습니다.')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '후기를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // ── 준비과정 탭 ──────────────────────────────────────────────────────────

  async function loadPreparations(jobCode: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, status } = await fetchJobPreparations(jobCode)
      if (status === 200) {
        preparations.value = data.data
      } else {
        throw new Error('준비과정을 불러오는데 실패했습니다.')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '준비과정을 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // ── 채용 탭 ──────────────────────────────────────────────────────────────

  async function loadRecruitments(jobCode: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, status } = await fetchJobRecruitments(jobCode)
      if (status === 200) {
        recruitments.value = data.data
      } else {
        throw new Error('채용정보를 불러오는데 실패했습니다.')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '채용정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  /** 채용 카드 팝업 열기 */
  function openRecruitmentPopup(recruitment: RecruitmentCard) {
    selectedRecruitment.value = recruitment
  }

  /** 채용 카드 팝업 닫기 */
  function closeRecruitmentPopup() {
    selectedRecruitment.value = null
  }

  return {
    // 상태
    searchQuery,
    searchResults,
    recommendedJobs,
    selectedJob,
    activeTab,
    reviews,
    preparations,
    recruitments,
    selectedRecruitment,
    isLoading,
    error,

    // 홈
    loadRecommendedJobs,
    searchJob,
    clearSearch,

    // 세부 진로
    loadJob,
    setActiveTab,

    // 탭별
    loadReviews,
    loadPreparations,
    loadRecruitments,
    openRecruitmentPopup,
    closeRecruitmentPopup,
  }
}
