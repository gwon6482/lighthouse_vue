/**
 * surveyApi 서비스
 *
 * Lighthouse DB API와 통신하는 서비스 모듈
 * - 설문지 데이터 조회
 * - 설문 응답 제출
 *
 * 개발 환경: 프록시를 통해 http://localhost:3000 접근
 * 프로덕션: 환경변수 VITE_API_BASE_URL 사용
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// 타입 정의
export interface SurveyQuestion {
  question_num: string
  question_id: string
  question_text: string
}

export interface SurveyItem {
  item_id: string
  item_name?: string
  item_text?: string
  item_definition?: string
}

export interface SurveyPart {
  survey_part: string
  items?: SurveyItem[]
  [key: string]: SurveyQuestion[] | SurveyItem[] | string | undefined
}

export interface SurveyFormResponse {
  survey_id: string
  '2_values': number[]
  '5_values': number[]
  survey: SurveyPart[]
}

export interface SurveyAnswers {
  T1: Record<string, string>
  T21: Record<string, string>
  T22: { checked: string[] }
  T23: {
    priority_1: string
    priority_2: string
    priority_3: string
    no_priority: string[]
  }
  T3: Record<string, string>
}

export interface SurveySubmitRequest {
  survey_id: string
  respondent_id: string
  answers: SurveyAnswers
}

export interface SurveySubmitResponse {
  success: boolean
  message?: string
  data?: {
    survey_id: string
    respondent_id: string
    submitted_at: string
  }
  error?: {
    message: string
    code: string
  }
}

// API 함수
export async function fetchSurveyForm(): Promise<SurveyFormResponse> {
  const res = await fetch(`${API_BASE}/api/survey/form`)
  if (!res.ok) {
    throw new Error('설문지를 불러오는데 실패했습니다.')
  }
  return res.json()
}

export async function submitSurveyResponse(data: SurveySubmitRequest): Promise<SurveySubmitResponse> {
  const res = await fetch(`${API_BASE}/api/survey/response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}
