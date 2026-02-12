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

// 페이지 정보 타입
export interface PageInfo {
  part: string
  pageKey: string
  pageNumber: number
  questions?: SurveyQuestion[]
  items?: SurveyItem[]
  type: 'scale' | 'multiSelect' | 'priority' | 'threeChoice'
}

// Survey API 타입 정의
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
