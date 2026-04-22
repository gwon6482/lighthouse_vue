export interface SurveyFormResponse {
  survey_id: string
  '2_values': number[]
  '5_values': number[]
  survey: SurveyPart[]
}

// 파트 인트로 데이터 타입
export interface PartIntroData {
  partLabel: string        // 예: '파트 1'
  title: string            // 예: '성격 & 기질'
  description: string      // 한 줄 부제
  emoji: string
  questionCount: string    // 예: '43문항', '총 107문항', '6개 항목'
  estimatedMinutes?: number // T3는 undefined (시간 표시 없음)
  highlights: string[]     // 핵심 안내 문구 목록
}

// 페이지 정보 타입
export interface PageInfo {
  part: string
  pageKey: string
  pageNumber: number
  questions?: SurveyQuestion[]
  items?: SurveyItem[]
  type: 'scale' | 'multiSelect' | 'priority' | 'threeChoice' | 'partIntro'
  introData?: PartIntroData
}

// 설문 타입 정의
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

// su-questions 타입 정의
export interface MultiSelectItem {
  item_id: string
  item_name?: string
  item_text?: string
}

export interface PriorityItem {
  item_id: string
  item_text?: string
  item_definition?: string
}

export interface PriorityValue {
  priority_1: string
  priority_2: string
  priority_3: string
  no_priority: string[]
}

export interface ThreeChoiceItem {
  item_id: string
  item_name?: string
  item_definition?: string
}



export interface T3Answers {
  T3_PHY: number  // 근무환경 강도
  T3_PEO: number  // 대인접촉 강도
  T3_COM: number  // 커뮤니케이션 강도
  T3_RES: number  // 책임·권한 강도
  T3_STR: number  // 스트레스 강도
  T3_FLX: number  // 업무 유동성
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
  T3: T3Answers
}

// Survey API 타입 정의
export interface SurveySubmitRequest {
  survey_id: string
  respondent_id: string
  answer_type: 'type_2' | 'type_5' | 'type_10'
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
