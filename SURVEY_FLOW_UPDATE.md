# Survey Flow Update — 2026-04-16

> 자기이해 설문 흐름에 파트 인트로 페이지, 검사 안내 페이지, 검사 완료 페이지를 추가한 작업 기록.
> 이 문서를 먼저 읽지 않고 코드만 보면 맥락을 놓치기 쉬우므로, 수정 전 반드시 이 파일을 먼저 읽을 것.

---

## 배경

기존 흐름은 인트로 → 척도 선택 → 설문 진행 → (alert 후 인트로로 복귀) 였다.
UX 개선 요청으로 아래 항목을 추가함:

1. 인트로 이후 전체 검사를 안내하는 페이지
2. 각 파트(T1, T21, T3) 시작 전 해당 파트를 소개하는 페이지
3. 제출 완료 후 이동하는 검사 완료 페이지

---

## 변경 전 흐름

```
/                          → HomePage.vue
/self-understanding        → SelfUnderstandingIntroPage.vue
/self-understanding/select → SelfUnderstandingSelectPage.vue
/self-understanding/test   → SelfUnderstandingTestPage.vue
                               T1 → T21 → T22 → T23 → T3
                               제출 → alert → /self-understanding 로 복귀
```

## 변경 후 흐름

```
/                              → HomePage.vue
/self-understanding            → SelfUnderstandingIntroPage.vue   (CTA 링크 변경됨)
/self-understanding/guide      → SelfUnderstandingGuidePage.vue   ★ 신규
/self-understanding/select     → SelfUnderstandingSelectPage.vue
/self-understanding/test       → SelfUnderstandingTestPage.vue
                                   [T1 파트 인트로]  ★ 신규 (allPages 내 삽입)
                                   T1 질문들
                                   [T21 파트 인트로] ★ 신규 (allPages 내 삽입)
                                   T21 / T22 / T23 질문들
                                   [T3 파트 인트로]  ★ 신규 (allPages 내 삽입)
                                   T3 슬라이더
                                   제출 → /self-understanding/complete 로 이동
/self-understanding/complete   → SelfUnderstandingCompletePage.vue ★ 신규
```

---

## 신규 파일

### 1. `src/modules/survey/pages/SelfUnderstandingGuidePage.vue`
- **역할**: 검사 전체 안내 페이지. 세 파트(성격·기질 / 좋아하는 일 / 업무환경) 개요, 예상 소요 시간 안내.
- **진입 경로**: `SelfUnderstandingIntroPage`의 CTA 클릭 시
- **이탈 경로**: "검사 시작하기" 버튼 → `/self-understanding/select`
- **특이사항**: 콘텐츠는 하드코딩(API 연동 없음)

### 2. `src/modules/survey/pages/SelfUnderstandingCompletePage.vue`
- **역할**: 설문 제출 완료 후 도달하는 페이지.
- **진입 경로**: `SelfUnderstandingTestPage`의 `handleSubmit` 성공 후 `router.push('/self-understanding/complete')`
- **이탈 경로**: 추후 결과 보고서 페이지 구현 시 연결 예정 (현재는 홈으로 이동 버튼만 있음)
- **특이사항**: 현재 respondent_id를 라우터 state로 전달하지 않음. 결과 페이지 구현 시 query 또는 store로 전달 필요.

### 3. `src/modules/survey/components/page/su-test-page/SurveyPartIntro.vue`
- **역할**: T1 / T21 / T3 파트 시작 전 해당 파트를 소개하는 공통 컴포넌트.
- **props**: `introData: { partLabel, title, description, emoji }` (PageInfo.introData 와 동일 구조)
- **사용처**: `SelfUnderstandingTestPage.vue`에서 `currentPage.type === 'partIntro'` 일 때 렌더
- **특이사항**: 이 컴포넌트 자체에는 "다음" 버튼이 없음. 기존 SurveyNavBtnNext 로 페이지 이동함.

---

## 수정된 파일

### 4. `src/modules/survey/types/survey.ts`
- `PageInfo.type` 유니언에 `'partIntro'` 추가
- `PageInfo`에 `introData?: { partLabel: string; title: string; description: string; emoji: string }` 필드 추가
- **이유**: allPages 배열에 파트 인트로를 일반 페이지와 동일한 구조로 삽입하기 위함

### 5. `src/modules/survey/composables/useSurvey.ts`
- `allPages` computed 내 루프에서 T1 / T21 / T3 파트가 시작되기 직전에 `type: 'partIntro'` 페이지를 삽입
- `isCurrentPageComplete`: `partIntro` 타입은 항상 `true` 반환 (다음 버튼 즉시 활성화)
- **주의**: `partIntro` 페이지의 `pageKey`는 `'intro'`로 고정. 같은 파트 내에 중복될 수 없음.
- **주의**: `currentPartPageInfo`는 partIntro 페이지를 파트 내 페이지 카운트에서 제외하도록 필터링함
  (`p.type !== 'partIntro'` 조건 추가). 헤더 진행 표시가 "1 / N" 이 아닌 "0 / N" 이 되는 것을 방지.

### 6. `src/modules/survey/pages/SelfUnderstandingTestPage.vue`
- `<template>` 질문 영역에 `partIntro` 분기 추가 → `SurveyPartIntro` 컴포넌트 렌더
- `handleSubmit`: 성공 후 `router.push('/self-understanding')` → `router.push('/self-understanding/complete')` 로 변경
- `alert('설문이 제출되었습니다!')` 제거 (완료 페이지가 그 역할을 대신)

### 7. `src/modules/survey/pages/SelfUnderstandingIntroPage.vue`
- CTA RouterLink 3곳의 `to` 값을 `/self-understanding/select` → `/self-understanding/guide` 로 변경
  - nav 버튼 (line 14)
  - hero CTA 버튼 (line 26)
  - 하단 final CTA 버튼 (line 262)

### 8. `src/modules/survey/survey.routes.ts`
- `/self-understanding/guide` → `SelfUnderstandingGuidePage` lazy import 추가
- `/self-understanding/complete` → `SelfUnderstandingCompletePage` lazy import 추가

---

---

## PartIntroData 구조 (2026-04-16 추가)

`SurveyPartIntro.vue`와 `SelfUnderstandingGuidePage.vue`에 문항 수, 예상 시간, 핵심 안내 문구가 추가됨.

```ts
interface PartIntroData {
  partLabel: string        // '파트 1' | '파트 2' | '파트 3'
  title: string
  description: string      // 한 줄 부제
  emoji: string
  questionCount: string    // '43문항' | '총 107문항' | '6개 항목'
  estimatedMinutes?: number // T3는 생략 → 시간 배지 미표시
  highlights: string[]     // 핵심 안내 문구 목록 (불릿 포인트)
}
```

**문항 수 출처 (DB 실측값)**

| 파트 | 문항 수 | 비고 |
|------|---------|------|
| T1   | 43문항  | 성격·기질 |
| T21  | 61문항  | 재능 |
| T22  | 33문항  | 흥미 |
| T23  | 13문항  | 가치관 |
| T3   | 6개 항목 | 슬라이더, DB의 T3 49건과 무관 (프론트 하드코딩) |

T21 파트 인트로의 `questionCount`는 `'총 107문항'` (T21+T22+T23 합산).

**예상 시간**
- 전체: 약 10분 (가이드 페이지 표기)
- T1: 5분, T2(T21~T23): 5분, T3: 미표기

**콘텐츠 수정 위치**
- 파트 인트로 문구·문항수·시간 → `useSurvey.ts` 의 `partIntros` 객체
- 가이드 페이지 문구·문항수·시간 → `SelfUnderstandingGuidePage.vue` 의 `parts` 배열

---

## 알려진 미완성 사항 (TODO)

- `SelfUnderstandingCompletePage`: 현재 결과 보고서 페이지 미구현으로 결과 확인 버튼 비활성. 결과 페이지 구현 후 연결 필요.
- `SurveyPartIntro`: 콘텐츠는 `useSurvey.ts`에 하드코딩. 추후 i18n 또는 CMS 연동 시 분리 필요.
- T21 파트 인트로는 T21(재능)이 시작되기 전에 삽입되며, T22(흥미), T23(가치관)은 별도 인트로 없이 T21 인트로에 통합됨("좋아하는 일" 그룹).
