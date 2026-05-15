import { req } from '@/shared/api'
import type { SurveyFormResponse, SurveySubmitRequest, SurveySubmitResponse, SurveyAnalysisResponse, T2RecommendResponse } from './types/survey'

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

// const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// API 함수
// export async function fetchSurveyForm(): Promise<SurveyFormResponse> {
//   const res = await fetch(`${API_BASE}/api/survey/form`)
//   if (!res.ok) {
//     throw new Error('설문지를 불러오는데 실패했습니다.')
//   }
//   return res.json()
// }

export const fetchSurveyForm = () => req.get<SurveyFormResponse>(`/api/survey/form`)

// export async function submitSurveyResponse(data: SurveySubmitRequest): Promise<SurveySubmitResponse> {
//   const res = await fetch(`${API_BASE}/api/survey/response`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   })
//   return res.json()
// }

export const submitSurveyResponse = (data: SurveySubmitRequest) =>
  req.post<SurveySubmitResponse>(`/api/survey/response`, data)

export const fetchSurveyAnalysis = (surveyId: string) =>
  req.get<SurveyAnalysisResponse>(`/api/survey/analysis/${surveyId}`)

export const fetchT2Recommend = (surveyId: string) =>
  req.get<T2RecommendResponse>(`/api/job/recommend-t2/${surveyId}`)
