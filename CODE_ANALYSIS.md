# LightHouse Vue 프로젝트 코드 분석 노트

> 이 문서는 프로젝트 코드 학습 및 분석 내용을 정리한 노트입니다.

---

## 프로젝트 구조

```
src/
├── App.vue                 # 메인 앱 컴포넌트
├── main.ts                 # 앱 진입점
├── appearance/             # 스타일 관련
│   ├── styles.scss         # 전역 스타일
│   └── modules/survey/     # 설문 모듈 스타일
│       ├── Home.scss
│       ├── SelfUnderstandingIntro.scss
│       └── SelfUnderstandingTest.scss
├── components/             # 공통 컴포넌트
├── modules/                # 기능별 모듈 (도메인 기반 구조)
│   ├── survey/             # 자기이해 설문 모듈
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── components/     # 모듈 전용 컴포넌트
│   │   ├── composables/    # Vue 컴포저블 (상태/로직)
│   │   └── survey.routes.ts
│   └── encyclopedia/       # 진로백과 모듈
│       ├── pages/
│       └── encyclopedia.routes.ts
└── shared/                 # 공유 코드
    ├── api/                # API 호출 함수
    │   └── surveyApi.ts
    └── router/             # 라우터 설정
        └── index.ts
```

### 아키텍처 패턴

- **모듈 기반 구조**: 기능별로 모듈을 분리 (survey, encyclopedia)
- **각 모듈 구성**: pages, components, composables로 구분
- **스타일 분리**: appearance 폴더에서 스타일을 별도 관리

---

## 주요 모듈 분석

### 1. Survey (자기이해) 모듈

#### 페이지 구성

| 파일                            | 설명                   |
| ------------------------------- | ---------------------- |
| `HomePage.vue`                  | 설문 홈 페이지         |
| `SelfUnderstandingIntroPage.vue` | 자기이해 페이지        |
| `SelfUnderstandingTestPage.vue` | 자기이해 테스트 페이지 |

#### 컴포넌트 구성

| 파일                            | 설명                 |
| ------------------------------- | -------------------- |
| `HomeForm.vue`                  | 홈 폼 컴포넌트       |
| `SelfUnderstandingForm.vue`     | 자기이해 폼          |
| `SelfUnderstandingTestForm.vue` | 자기이해 테스트 폼   |
| `SUQuestions/`                  | 질문 유형별 컴포넌트 |

#### 질문 유형 컴포넌트 (SUQuestions/)

- `MultiSelectQuestion.vue` - 다중 선택 질문
- `PriorityQuestion.vue` - 우선순위 질문
- `ScaleQuestion5.vue` - 척도 질문
- `ThreeChoiceQuestion.vue` - 3지선다 질문

#### Composables

- `useSurvey.ts` - 설문 관련 상태 및 로직 관리

---

### 2. Encyclopedia (진로백과) 모듈

#### 페이지 구성

| 파일                       | 설명               |
| -------------------------- | ------------------ |
| `EncyclopediaHomePage.vue` | 진로백과 홈 페이지 |

---

## 데이터 흐름

```
[API Layer]          [Composables]           [Components]          [Pages]
surveyApi.ts    →    useSurvey.ts      →    *Form.vue        →    *Page.vue
                     (상태 관리/로직)        (UI 컴포넌트)         (라우트 페이지)
```

---

## 학습 메모

### 날짜: 2026-01-27

#### 오늘 분석한 내용

- 프로젝트 기본 구조 파악
- 모듈 기반 아키텍처 확인 (survey, encyclopedia)

#### 배운 점

- (분석하면서 추가 예정)

#### 궁금한 점 / 더 분석할 내용

- [ ] useSurvey.ts의 상태 관리 로직 분석
- [ ] 각 질문 유형 컴포넌트의 동작 방식
- [ ] API 호출 구조 분석
- [ ] 라우터 설정 분석

---

## 코드 분석 상세

### SelfUnderstandingTestForm.vue 분석

#### 1~26번째 줄: 템플릿 - 상태별 UI 분기 & 헤더 (상세 분석)

---

**Line 1: `<template>`**

```vue
<template></template>
```

- Vue 컴포넌트의 **템플릿 섹션 시작**
- Vue Single File Component(SFC)는 3개 섹션으로 구성: `<template>`, `<script>`, `<style>`
- 이 안에 HTML과 Vue 디렉티브를 작성

---

**Line 2: `<div class="survey-test">`**

```vue
  <div class="survey-test">
```

- 컴포넌트의 **루트(최상위) 요소**
- `class="survey-test"`: CSS 클래스 지정 → 스타일링에 사용
- Vue 3에서는 여러 루트 요소 가능하지만, 여기선 하나로 감싸는 패턴 사용

---

**Line 3: `<!-- 로딩 -->`**

```vue
<!-- 로딩 -->
```

- HTML 주석 (브라우저에 렌더링되지 않음)
- 코드 가독성을 위한 섹션 구분 용도

---

**Line 4-7: 로딩 상태 UI**

```vue
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>설문지를 불러오는 중...</p>
    </div>
```

| 요소                             | 설명                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `v-if="isLoading"`               | **조건부 렌더링 디렉티브**. `isLoading`이 `true`일 때만 이 `<div>`가 DOM에 존재 |
| `class="loading"`                | 로딩 UI 스타일링용 클래스                                                       |
| `<div class="spinner">`          | 로딩 애니메이션 (CSS로 회전하는 원 등 구현)                                     |
| `<p>설문지를 불러오는 중...</p>` | 사용자에게 보여주는 로딩 메시지                                                 |

**`v-if` vs `v-show` 차이점:**

- `v-if`: 조건이 false면 **DOM에서 완전히 제거** (여기서 사용)
- `v-show`: 조건이 false면 `display: none` (DOM에는 존재)

---

**Line 9: `<!-- 에러 -->`**

```vue
<!-- 에러 -->
```

- 에러 섹션 시작 주석

---

**Line 10-13: 에러 상태 UI**

```vue
<div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadSurvey">다시 시도</button>
    </div>
```

| 요소                  | 설명                                                                |
| --------------------- | ------------------------------------------------------------------- |
| `v-else-if="error"`   | `isLoading`이 false이고, `error`가 truthy(값이 존재)할 때 렌더링    |
| `{{ error }}`         | **머스태시 문법(Mustache Syntax)**: `error` 변수 값을 텍스트로 출력 |
| `@click="loadSurvey"` | **이벤트 바인딩**: 클릭 시 `loadSurvey` 함수 호출                   |

**`@click`은 `v-on:click`의 단축 문법:**

```vue
<!-- 아래 두 줄은 동일 -->
<button @click="loadSurvey">
<button v-on:click="loadSurvey">
```

---

**Line 15: `<!-- 설문 내용 -->`**

```vue
<!-- 설문 내용 -->
```

- 메인 설문 콘텐츠 섹션 시작 주석

---

**Line 16: `<template v-else-if="currentPage">`**

```vue
<template v-else-if="currentPage"></template>
```

**왜 `<div>` 대신 `<template>`을 사용했나?**

- `<template>`은 **가상 요소** → 실제 DOM에 렌더링되지 않음
- 불필요한 wrapper `<div>` 없이 여러 요소를 그룹화할 때 사용
- `currentPage`가 존재할 때 내부 요소들이 렌더링됨

```
렌더링 결과 비교:

<div v-else-if> 사용 시:        <template v-else-if> 사용 시:
<div>                           <header>...</header>
  <header>...</header>          <main>...</main>
  <main>...</main>              (wrapper div 없음!)
</div>
```

---

**Line 17-18: 헤더 시작**

```vue
      <!-- 헤더 -->
      <header class="survey-header">
```

- `<header>`: HTML5 시맨틱 태그 (페이지/섹션의 헤더 영역)
- 설문 상단에 파트 정보와 페이지 정보를 표시

---

**Line 19-22: 파트 정보**

```vue
<div class="part-info">
          <span class="part-number">파트 {{ currentPartInfo?.number }}</span>
          <span class="part-name">{{ currentPartInfo?.name }}</span>
        </div>
```

| 요소                      | 설명                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `currentPartInfo?.number` | **Optional Chaining**: `currentPartInfo`가 null/undefined면 에러 대신 undefined 반환 |
| `파트 {{ ... }}`          | 텍스트와 변수를 조합하여 "파트 1", "파트 2" 등 출력                                  |

**Optional Chaining (`?.`) 없이 작성하면:**

```javascript
// 이렇게 써야 함 (번거로움)
currentPartInfo && currentPartInfo.number

// Optional Chaining으로 간단히
currentPartInfo?.number
```

---

**Line 23-25: 페이지 진행 정보**

```vue
<div class="page-info">
          {{ currentPartPageInfo?.current }} / {{ currentPartPageInfo?.total }} 페이지
        </div>
```

- 현재 파트 내에서 몇 번째 페이지인지 표시
- 예: "2 / 5 페이지" → 5페이지 중 2페이지

---

**Line 26: 헤더 닫기**

```vue
      </header>
```

- `<header>` 태그 종료

---

### 전체 흐름 다이어그램

```
┌─────────────────────────────────────────────────┐
│              isLoading === true?                │
│                      │                          │
│         ┌───────YES──┴──NO───────┐              │
│         ▼                        ▼              │
│   ┌──────────┐            error가 있나?         │
│   │ 로딩 UI  │                   │              │
│   │ spinner  │      ┌───YES──────┴───NO────┐    │
│   └──────────┘      ▼                      ▼    │
│               ┌──────────┐          currentPage │
│               │ 에러 UI  │          가 있나?    │
│               │ 재시도   │               │      │
│               └──────────┘      ┌──YES───┴──┐   │
│                                 ▼           ▼   │
│                           ┌──────────┐  (없으면 │
│                           │ 설문 UI  │   아무것도│
│                           │ 헤더...  │   안보임) │
│                           └──────────┘          │
└─────────────────────────────────────────────────┘
```

---

### 핵심 Vue 문법 정리

| 문법        | 예시                  | 설명                              |
| ----------- | --------------------- | --------------------------------- |
| `v-if`      | `v-if="isLoading"`    | 조건부 렌더링 (DOM 추가/제거)     |
| `v-else-if` | `v-else-if="error"`   | else if 조건                      |
| `{{ }}`     | `{{ error }}`         | 머스태시 - 데이터 바인딩          |
| `@click`    | `@click="loadSurvey"` | 이벤트 리스너 (`v-on:click` 단축) |
| `?.`        | `obj?.prop`           | Optional Chaining (JS 문법)       |

---

### 심화: `ref()`와 `onMounted` 이해하기

4번째줄 코드 <div v-if="isLoading" class="loading">

#### Q: `ref(false)`면 isLoading은 항상 false 아닌가요?

**A: 아니요!** `ref(false)`는 **초기값**일 뿐, 나중에 값을 변경할 수 있습니다.

**useSurvey.ts에서의 정의:**

```typescript
const isLoading = ref(false) // 초기값: false
```

**값이 변경되는 시점 (useSurvey.ts):**

```typescript
// loadSurvey 함수 (Line 154-168)
async function loadSurvey() {
  isLoading.value = true    // ← 로딩 시작: true로 변경!
  error.value = null

  try {
    const data = await fetchSurveyForm()  // API 호출 (시간 소요)
    surveyData.value = data
  } catch (e) {
    error.value = ...
  } finally {
    isLoading.value = false  // ← 로딩 끝: false로 변경!
  }
}
```

**`ref()`의 핵심 개념:**
| 개념 | 설명 |
|------|------|
| `ref(초기값)` | **반응형 변수** 생성. 값이 바뀌면 UI 자동 업데이트 |
| `.value` | ref의 실제 값에 접근/수정할 때 사용 |
| 템플릿에서는 | `.value` 없이 바로 사용 (`v-if="isLoading"`) |

---

#### Q: 템플릿에서 loadSurvey()를 호출하는 곳이 없는데, 언제 실행되나요?

**A: `onMounted` 훅에서 자동 실행됩니다!**

**SelfUnderstandingTestForm.vue의 script 섹션 (Line 139-141):**

```typescript
onMounted(() => {
  loadSurvey()
})
```

**`onMounted`란?**

- Vue의 **라이프사이클 훅** 중 하나
- 컴포넌트가 DOM에 마운트된 직후(화면에 나타난 직후) 실행
- 초기 데이터 로딩에 자주 사용

**컴포넌트 라이프사이클 흐름:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. 컴포넌트 생성                                            │
│       ↓                                                     │
│  2. setup() 실행 (변수, 함수 정의)                           │
│       ↓                                                     │
│  3. 템플릿 컴파일 & DOM 생성                                  │
│       ↓                                                     │
│  4. DOM에 마운트 완료                                        │
│       ↓                                                     │
│  5. ★ onMounted() 실행 ★  ←── 여기서 loadSurvey() 호출!     │
│       ↓                                                     │
│  6. isLoading = true → 로딩 스피너 표시                      │
│       ↓                                                     │
│  7. API 응답 수신                                            │
│       ↓                                                     │
│  8. isLoading = false → 설문 내용 표시                       │
└─────────────────────────────────────────────────────────────┘
```

**주요 라이프사이클 훅:**
| 훅 | 실행 시점 | 용도 |
|----|----------|------|
| `onBeforeMount` | DOM 마운트 직전 | 거의 안 씀 |
| `onMounted` | DOM 마운트 직후 | **API 호출, DOM 접근** |
| `onBeforeUpdate` | 반응형 데이터 변경 직전 | 거의 안 씀 |
| `onUpdated` | 반응형 데이터 변경 후 | DOM 업데이트 후 작업 |
| `onBeforeUnmount` | 컴포넌트 제거 직전 | 정리 작업 (이벤트 해제 등) |
| `onUnmounted` | 컴포넌트 제거 후 | 정리 작업 |

**정리:**

- 사용자가 페이지에 접속 → 컴포넌트 마운트 → `onMounted` 실행 → `loadSurvey()` 자동 호출
- 에러 발생 시 "다시 시도" 버튼 → `@click="loadSurvey"`로 수동 재호출

---

### 심화: API 응답 데이터 저장 로직

useSurvey.ts의 `loadSurvey()` 함수 중 try 블록 내부 코드 분석

```typescript
try {
  const data = await fetchSurveyForm()  // API 호출
  surveyData.value = data               // Line 160
  surveyId.value = data.survey_id       // Line 161
  currentPageIndex.value = 0            // Line 162
}
```

---

#### `data`의 구조 (API 응답)

`fetchSurveyForm()`이 반환하는 데이터 (surveyApi.ts의 `SurveyFormResponse` 타입):

```typescript
interface SurveyFormResponse {
  survey_id: string // 설문 고유 ID (예: "survey_2024_001")
  '2_values': number[] // 2점 척도 값 [1, 2]
  '5_values': number[] // 5점 척도 값 [1, 2, 3, 4, 5]
  survey: SurveyPart[] // 실제 설문 파트들 (T1, T21, T22, T23, T3)
}
```

**실제 데이터 예시:**

```json
{
  "survey_id": "self_understanding_v1",
  "2_values": [1, 2],
  "5_values": [1, 2, 3, 4, 5],
  "survey": [
    { "survey_part": "T1", "page_1": [...], "page_2": [...] },
    { "survey_part": "T21", "page_1": [...] },
    { "survey_part": "T22", "items": [...] },
    { "survey_part": "T23", "items": [...] },
    { "survey_part": "T3", "items": [...] }
  ]
}
```

---

#### 각 라인 상세 설명

| 코드                              | Before           | After                        | 의미                               |
| --------------------------------- | ---------------- | ---------------------------- | ---------------------------------- |
| `surveyData.value = data`         | `null`           | `SurveyFormResponse` 객체    | 전체 설문 데이터를 저장            |
| `surveyId.value = data.survey_id` | `''` (빈 문자열) | `"self_understanding_v1"` 등 | 설문 ID만 별도 저장 (제출 시 사용) |
| `currentPageIndex.value = 0`      | `0`              | `0`                          | 첫 페이지부터 시작 (초기화)        |

---

#### 왜 이렇게 나눠서 저장하나요?

```
surveyData ─────────┬──→ 설문 전체 데이터 (질문들, 파트 정보 등)
                    │    → computed로 가공해서 UI에 표시
                    │
surveyId ───────────┴──→ 설문 ID만 별도 저장
                         → 제출할 때 "어떤 설문에 대한 응답인지" 식별용

currentPageIndex ──────→ 현재 보고 있는 페이지 번호
                         → 이전/다음 버튼으로 변경
```

**`surveyId`를 별도로 저장하는 이유:**

```typescript
// submitSurvey 함수에서 사용 (Line 231)
const response = await submitSurveyResponse({
  survey_id: surveyId.value, // ← 여기서 사용!
  respondent_id: respondentId,
  answers,
})
```

---

#### 데이터 흐름 다이어그램

```
┌──────────────────────────────────────────────────────────────────┐
│                      loadSurvey() 실행                           │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  const data = await fetchSurveyForm()                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ data = {                                                    │ │
│  │   survey_id: "self_understanding_v1",                       │ │
│  │   survey: [ {T1...}, {T21...}, {T22...}, {T23...}, {T3...}] │ │
│  │ }                                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ surveyData.value│  │ surveyId.value  │  │currentPageIndex │
│ = data          │  │ = data.survey_id│  │.value = 0       │
│                 │  │                 │  │                 │
│ (전체 설문 저장) │  │ (ID만 추출)     │  │ (첫 페이지로)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ computed들이    │  │ 제출 시 사용    │  │ 현재 페이지     │
│ 이 데이터로     │  │ survey_id 전송  │  │ UI 결정         │
│ UI 데이터 생성  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

#### `surveyData`가 저장되면 일어나는 일

`surveyData`가 변경되면 이를 의존하는 **computed** 속성들이 자동으로 재계산됩니다:

```typescript
// useSurvey.ts에서 surveyData를 사용하는 computed들

// 1. 모든 페이지 목록 생성 (Line 49)
const allPages = computed(() => {
  if (!surveyData.value) return []  // surveyData 없으면 빈 배열
  // surveyData.value.survey를 순회하며 페이지 목록 생성
})

// 2. 현재 페이지 정보 (Line 107)
const currentPage = computed(() => allPages.value[currentPageIndex.value])

// 3. 현재 파트 정보 (Line 113)
const currentPartInfo = computed(() => { ... })

// 4. 진행률 (Line 143)
const progress = computed(() => { ... })
```

**반응형 체인:**

```
surveyData 변경
    ↓ (자동 트리거)
allPages 재계산
    ↓ (자동 트리거)
currentPage, totalPages 재계산
    ↓ (자동 트리거)
currentPartInfo, progress 등 재계산
    ↓ (자동 트리거)
템플릿 UI 업데이트 (v-if="currentPage" 조건 충족!)
```

---

### 심화: Composable 패턴 - `useSurvey()` 이해하기

#### Q: `useSurvey()`는 페이지 목록을 생성하는 함수인가요?

**A: 아니요!** `useSurvey()`는 페이지 목록 생성만 하는 게 아니라 **설문 관련 모든 것을 관리하는 Composable**입니다.

```
useSurvey() = 설문 기능의 "종합 세트"
```

---

#### Composable이란?

Vue 3의 **Composition API**에서 사용하는 패턴으로, 관련된 로직을 하나의 함수로 묶어서 재사용할 수 있게 만든 것입니다.

**네이밍 규칙:** `use` + 기능명 (예: `useSurvey`, `useAuth`, `useCart`)

---

#### `useSurvey()`가 반환하는 것들 (Line 250-281)

| 분류                     | 항목                                                                                                                                                           | 역할             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **상태 (State)**         | `surveyId`, `surveyData`, `isLoading`, `error`, `answers`, `currentPageIndex`                                                                                  | 현재 데이터      |
| **계산된 값 (Computed)** | `allPages`, `currentPage`, `totalPages`, `currentPartInfo`, `currentPartPageInfo`, `progress`, `canGoPrev`, `canGoNext`, `isLastPage`, `isCurrentPageComplete` | 상태를 가공한 값 |
| **함수 (Methods)**       | `loadSurvey`, `setScaleAnswer`, `setMultiSelectAnswer`, `setPriorityAnswer`, `setThreeChoiceAnswer`, `goToNextPage`, `goToPrevPage`, `submitSurvey`            | 동작 실행        |

---

#### 비유: 설문용 "리모컨"

```
┌─────────────────────────────────┐
│         useSurvey()             │
│      (설문 기능 리모컨)          │
├─────────────────────────────────┤
│ 📊 상태 보기                     │
│   - isLoading: 로딩중?          │
│   - error: 에러 발생?           │
│   - answers: 사용자 답변        │
├─────────────────────────────────┤
│ 🔢 계산된 정보                   │
│   - allPages: 전체 페이지 목록   │
│   - currentPage: 현재 페이지    │
│   - progress: 진행률 몇 %?      │
├─────────────────────────────────┤
│ 🎮 조작 버튼                     │
│   - loadSurvey(): 불러오기      │
│   - goToNextPage(): 다음        │
│   - goToPrevPage(): 이전        │
│   - submitSurvey(): 제출        │
└─────────────────────────────────┘
```

---

#### 사용 방법

**SelfUnderstandingTestForm.vue (Line 117-137):**

```typescript
// useSurvey()를 호출하고, 필요한 것만 꺼내서 사용
const {
  surveyId,
  isLoading, // 상태: 로딩 중인지
  error, // 상태: 에러 메시지
  scaleType,
  answers,
  currentPage, // computed: 현재 페이지 데이터
  totalPages, // computed: 전체 페이지 수
  currentPageIndex,
  currentPartInfo, // computed: 현재 파트 정보
  currentPartPageInfo,
  progress, // computed: 진행률
  canGoPrev,
  isLastPage,
  isCurrentPageComplete,
  loadSurvey, // 함수: 설문 불러오기
  setScaleAnswer,
  goToNextPage, // 함수: 다음 페이지로
  goToPrevPage, // 함수: 이전 페이지로
  submitSurvey, // 함수: 설문 제출
} = useSurvey()
```

**구조 분해 할당(Destructuring):** 객체에서 필요한 속성만 꺼내서 변수로 사용

---

#### 왜 Composable 패턴을 사용하나요?

**1. 관심사 분리 (Separation of Concerns)**

```
컴포넌트 (.vue)     →  UI만 담당 (템플릿, 스타일)
Composable (.ts)    →  로직만 담당 (상태, 함수)
```

**2. 재사용성**

```typescript
// 다른 컴포넌트에서도 동일한 로직 사용 가능
// SelfUnderstandingTestForm.vue
const { loadSurvey, currentPage } = useSurvey()

// 다른 컴포넌트에서도
const { progress, answers } = useSurvey() // 같은 상태 공유!
```

**3. 테스트 용이성**

- 로직이 컴포넌트와 분리되어 있어서 단위 테스트하기 쉬움

---

#### 싱글톤 패턴 (이 프로젝트의 특징)

useSurvey.ts의 상태들은 **함수 밖(모듈 레벨)**에 정의되어 있습니다:

```typescript
// useSurvey.ts (Line 27-44)

// 상태를 모듈 레벨에서 정의 (싱글톤)  ← 주목!
const surveyId = ref<string>('')
const surveyData = ref<SurveyFormResponse | null>(null)
const isLoading = ref(false)
// ...

export function useSurvey() {
  // 위에서 정의한 상태들을 반환
  return { surveyId, surveyData, isLoading, ... }
}
```

**의미:**

- 어떤 컴포넌트에서 `useSurvey()`를 호출하든 **같은 상태를 공유**
- A 컴포넌트에서 답변을 저장하면, B 컴포넌트에서도 그 답변이 보임
- 전역 상태 관리 (Pinia/Vuex 대신 사용 가능)

```
┌─────────────────┐     ┌─────────────────┐
│ ComponentA.vue  │     │ ComponentB.vue  │
│                 │     │                 │
│ useSurvey()─────┼─────┼──useSurvey()    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌─────────────────────┐
         │  공유되는 상태       │
         │  (모듈 레벨 변수)    │
         │  surveyData, answers│
         └─────────────────────┘
```

---

### 심화: `allPages` computed 상세 분석

`allPages`는 API에서 받은 설문 데이터(`surveyData`)를 **페이지 단위로 가공**하는 computed입니다.

#### 전체 코드 (useSurvey.ts Line 49-104)

```typescript
const allPages = computed<PageInfo[]>(() => {
  // 1. surveyData가 없으면 빈 배열 반환
  if (!surveyData.value) return []

  // 2. 결과를 담을 빈 배열
  const pages: PageInfo[] = []

  // 3. survey 배열을 순회 (T1, T21, T22, T23, T3)
  for (const part of surveyData.value.survey) {
    const partName = part.survey_part

    // 4. 파트 종류에 따라 다르게 처리
    if (partName === 'T1' || partName === 'T21') {
      // T1, T21: 여러 페이지로 나뉨
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
      // T22: 1페이지 (다중 선택)
      pages.push({
        part: partName,
        pageKey: 'items',
        pageNumber: 1,
        items: part.items,
        type: 'multiSelect',
      })
    } else if (partName === 'T23') {
      // T23: 1페이지 (우선순위)
      pages.push({
        part: partName,
        pageKey: 'items',
        pageNumber: 1,
        items: part.items,
        type: 'priority',
      })
    } else if (partName === 'T3') {
      // T3: 1페이지 (3지선다)
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
```

---

#### 단계별 상세 설명

**Step 1: Early Return (조기 반환)**

```typescript
if (!surveyData.value) return []
```

- `surveyData`가 아직 없으면 (API 로딩 전) 빈 배열 반환
- 이렇게 하면 나머지 코드에서 `surveyData.value`가 확실히 존재함

---

**Step 2: 결과 배열 준비**

```typescript
const pages: PageInfo[] = []
```

- 최종 결과를 담을 빈 배열 생성
- 타입: `PageInfo[]` (페이지 정보 객체의 배열)

---

**Step 3: survey 배열 순회**

```typescript
for (const part of surveyData.value.survey) {
  const partName = part.survey_part  // "T1", "T21", "T22", "T23", "T3"
```

**입력 데이터 구조:**

```json
surveyData.value.survey = [
  { "survey_part": "T1", "page_1": [...], "page_2": [...], "page_3": [...] },
  { "survey_part": "T21", "page_1": [...], "page_2": [...] },
  { "survey_part": "T22", "items": [...] },
  { "survey_part": "T23", "items": [...] },
  { "survey_part": "T3", "items": [...] }
]
```

---

**Step 4-A: T1, T21 처리 (여러 페이지)**

```typescript
if (partName === 'T1' || partName === 'T21') {
  // "page_"로 시작하는 키들만 필터링
  const pageKeys = Object.keys(part).filter(k => k.startsWith('page_'))
  // 결과: ["page_1", "page_2", "page_3", ...]
```

**정렬 로직:**

```typescript
pageKeys.sort((a, b) => {
  const numA = parseInt(a.split('_').pop() || '0') // "page_1" → 1
  const numB = parseInt(b.split('_').pop() || '0') // "page_2" → 2
  return numA - numB // 오름차순 정렬
})
```

| 입력        | `split('_')`     | `.pop()` | `parseInt()` |
| ----------- | ---------------- | -------- | ------------ |
| `"page_1"`  | `["page", "1"]`  | `"1"`    | `1`          |
| `"page_10"` | `["page", "10"]` | `"10"`   | `10`         |

**페이지 객체 생성:**

```typescript
for (const pageKey of pageKeys) {
  pages.push({
    part: partName, // "T1" 또는 "T21"
    pageKey, // "page_1", "page_2", ...
    pageNumber: pageNum, // 1, 2, 3, ...
    questions: part[pageKey], // 해당 페이지의 질문 배열
    type: 'scale', // 스케일 타입 (5점 척도 등)
  })
}
```

---

**Step 4-B: T22, T23, T3 처리 (각각 1페이지)**

```typescript
} else if (partName === 'T22') {
  pages.push({
    part: partName,       // "T22"
    pageKey: 'items',
    pageNumber: 1,
    items: part.items,    // 선택 항목들
    type: 'multiSelect'   // 다중 선택
  })
}
// T23: 'priority' (우선순위)
// T3: 'threeChoice' (3지선다)
```

---

#### 변환 결과 예시

**입력 (surveyData.value.survey):**

```json
[
  { "survey_part": "T1", "page_1": [q1, q2], "page_2": [q3, q4] },
  { "survey_part": "T21", "page_1": [q5, q6] },
  { "survey_part": "T22", "items": [item1, item2] },
  { "survey_part": "T23", "items": [item3, item4] },
  { "survey_part": "T3", "items": [item5, item6] }
]
```

**출력 (allPages.value):**

```typescript
;[
  { part: 'T1', pageKey: 'page_1', pageNumber: 1, questions: [q1, q2], type: 'scale' },
  { part: 'T1', pageKey: 'page_2', pageNumber: 2, questions: [q3, q4], type: 'scale' },
  { part: 'T21', pageKey: 'page_1', pageNumber: 1, questions: [q5, q6], type: 'scale' },
  { part: 'T22', pageKey: 'items', pageNumber: 1, items: [item1, item2], type: 'multiSelect' },
  { part: 'T23', pageKey: 'items', pageNumber: 1, items: [item3, item4], type: 'priority' },
  { part: 'T3', pageKey: 'items', pageNumber: 1, items: [item5, item6], type: 'threeChoice' },
]
// 총 6페이지
```

---

#### 데이터 변환 흐름 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                    surveyData.value.survey                      │
│  (API 응답 - 파트별로 묶인 데이터)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      allPages computed                          │
│                                                                 │
│  T1 ──→ page_1, page_2, page_3 ... (여러 페이지로 분리)          │
│  T21 ─→ page_1, page_2 ...         (여러 페이지로 분리)          │
│  T22 ─→ 1페이지                     (그대로)                     │
│  T23 ─→ 1페이지                     (그대로)                     │
│  T3 ──→ 1페이지                     (그대로)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      allPages.value                             │
│  (페이지 단위로 평탄화된 배열)                                    │
│                                                                 │
│  [0] T1-page_1   ←── currentPageIndex = 0 이면 이 페이지 표시    │
│  [1] T1-page_2   ←── currentPageIndex = 1 이면 이 페이지 표시    │
│  [2] T1-page_3                                                  │
│  [3] T21-page_1                                                 │
│  [4] T22-items                                                  │
│  [5] T23-items                                                  │
│  [6] T3-items                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### `allPages`를 사용하는 다른 computed들

```typescript
// 현재 페이지 (Line 107)
const currentPage = computed(() => allPages.value[currentPageIndex.value] || null)

// 총 페이지 수 (Line 110)
const totalPages = computed(() => allPages.value.length)

// 진행률 (Line 143)
const progress = computed(() => {
  if (totalPages.value === 0) return 0
  return Math.round(((currentPageIndex.value + 1) / totalPages.value) * 100)
})
```

**예시:**

```
allPages.length = 7 (총 7페이지)
currentPageIndex = 2

currentPage = allPages[2]  → T1의 3번째 페이지
totalPages = 7
progress = Math.round((3/7) * 100) = 43%
```

---

#### 핵심 포인트 정리

| 개념              | 설명                                             |
| ----------------- | ------------------------------------------------ |
| **computed**      | 의존하는 데이터(surveyData)가 바뀌면 자동 재계산 |
| **데이터 평탄화** | 중첩된 구조 → 1차원 배열로 변환                  |
| **type 필드**     | 각 페이지가 어떤 UI 컴포넌트를 사용할지 결정     |
| **인덱스 기반**   | `currentPageIndex`로 현재 페이지 결정            |

---

### 심화: Props와 Emit - 컴포넌트 간 통신

Vue에서 컴포넌트 간 데이터를 주고받는 핵심 방법입니다.

```
┌─────────────────────────────────────────────────────────┐
│                    부모 컴포넌트                         │
│                                                         │
│    ┌─────────────┐                  ┌─────────────┐    │
│    │   데이터    │ ─── props ────▶ │  자식에게   │    │
│    │  (상태)     │                  │  전달       │    │
│    └─────────────┘                  └─────────────┘    │
│                                                         │
│    ┌─────────────┐                  ┌─────────────┐    │
│    │   이벤트   │ ◀─── emit ───── │  자식에서   │    │
│    │  핸들러    │                  │  알림       │    │
│    └─────────────┘                  └─────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ (자식 컴포넌트)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    자식 컴포넌트                         │
│                                                         │
│    props로 받은 데이터 표시                              │
│    사용자 액션 → emit으로 부모에게 알림                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**핵심 원칙:**

- **Props**: 부모 → 자식 (데이터 전달, 단방향)
- **Emit**: 자식 → 부모 (이벤트 알림)

---

#### 예제 1: SurveyError - Props + Emit 기본 패턴

**부모 (SelfUnderstandingTestPage.vue):**

```vue
<SurveyError
  :error="error"              <!-- props: 에러 메시지 전달 -->
  @loadSurvey="loadSurvey"    <!-- emit: 이벤트 수신 -->
/>
```

**자식 (SurveyError.vue):**

```vue
<template>
  <div class="error">
    <p>{{ error }}</p>
    <!-- props 사용 -->
    <button @click="loadSurvey">다시 시도</button>
    <!-- emit 발생 -->
  </div>
</template>

<script setup lang="ts">
// 1. Props 정의 - 부모로부터 받을 데이터
defineProps<{
  error: string
}>()

// 2. Emit 정의 - 부모에게 보낼 이벤트
const emit = defineEmits<{
  (e: 'loadSurvey'): void
}>()

// 3. 버튼 클릭 시 emit 호출
const loadSurvey = () => emit('loadSurvey')
</script>
```

**데이터 흐름:**

```
┌─────────────────────────────────────────────────────────┐
│  SelfUnderstandingTestPage.vue (부모)                   │
│                                                         │
│  error = "네트워크 오류"                                │
│         │                                               │
│         │ :error="error" (props)                        │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  SurveyError.vue (자식)                         │   │
│  │                                                 │   │
│  │  "네트워크 오류" 표시                            │   │
│  │  [다시 시도] 버튼 클릭                          │   │
│  │         │                                       │   │
│  │         │ emit('loadSurvey')                    │   │
│  └─────────┼───────────────────────────────────────┘   │
│            │                                            │
│            │ @loadSurvey="loadSurvey"                   │
│            ▼                                            │
│  loadSurvey() 함수 실행 → API 재호출                    │
└─────────────────────────────────────────────────────────┘
```

---

#### 예제 2: ScaleQuestion5 - v-model 패턴 (Props + Emit 조합)

`v-model`은 props와 emit을 합친 **양방향 바인딩** 단축 문법입니다.

**부모 (SelfUnderstandingTestPage.vue):**

```vue
<ScaleQuestion
  v-for="q in currentPage.questions"
  :key="q.question_id"
  :question-id="q.question_id"
  :question-num="q.question_num"
  :question-text="q.question_text"
  :model-value="answers[currentPage.part][q.question_id] || ''"
  :scale-type="scaleType"
  @update:model-value="handleScaleAnswer(q.question_id, $event)"
/>
```

**v-model 단축 문법 (동일한 코드):**

```vue
<!-- 이렇게 쓸 수도 있음 -->
<ScaleQuestion v-model="answers[currentPage.part][q.question_id]" ... />

<!-- 위 코드는 아래와 동일 -->
<ScaleQuestion
  :model-value="answers[currentPage.part][q.question_id]"
  @update:model-value="answers[currentPage.part][q.question_id] = $event"
/>
```

**자식 (ScaleQuestion5.vue):**

```vue
<script setup lang="ts">
// Props 정의
const props = defineProps<{
  questionId: string
  questionNum: string
  questionText: string
  modelValue: string // v-model의 값 (현재 선택된 답변)
  scaleType?: 2 | 5 | 10
}>()

// Emit 정의 - v-model 규칙: 'update:modelValue'
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 옵션 클릭 시 부모에게 새 값 전달
function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="scale-question">
    <p>{{ questionNum }}. {{ questionText }}</p>
    <div class="options">
      <button
        v-for="option in options"
        :class="{ selected: modelValue === option.value }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
```

**데이터 흐름:**

```
사용자가 "그렇다" 버튼 클릭
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  ScaleQuestion5.vue                                     │
│                                                         │
│  selectOption('D') 호출                                 │
│         │                                               │
│         ▼                                               │
│  emit('update:modelValue', 'D')                         │
└─────────────────────────────────────────────────────────┘
         │
         │ @update:model-value="handleScaleAnswer(q.id, $event)"
         ▼
┌─────────────────────────────────────────────────────────┐
│  SelfUnderstandingTestPage.vue                          │
│                                                         │
│  handleScaleAnswer('Q1', 'D')                           │
│         │                                               │
│         ▼                                               │
│  setScaleAnswer('T1', 'Q1', 'D')                        │
│         │                                               │
│         ▼                                               │
│  answers.T1['Q1'] = 'D'  (상태 업데이트)                │
│         │                                               │
│         ▼                                               │
│  :model-value가 'D'로 변경됨                            │
│         │                                               │
│         ▼                                               │
│  ScaleQuestion5의 버튼에 'selected' 클래스 적용        │
└─────────────────────────────────────────────────────────┘
```

---

#### 예제 3: SurveyHeader - Props만 사용 (읽기 전용)

자식이 데이터를 **표시만** 하고 수정하지 않으면 emit이 필요 없습니다.

**부모:**

```vue
<SurveyHeader :currentPartInfo="currentPartInfo" :currentPartPageInfo="currentPartPageInfo" />
```

**자식 (SurveyHeader.vue):**

```vue
<template>
  <header class="survey-header">
    <div class="part-info">
      <span>파트 {{ currentPartInfo.number }}</span>
      <span>{{ currentPartInfo.name }}</span>
    </div>
    <div class="page-info">
      {{ currentPartPageInfo.current }} / {{ currentPartPageInfo.total }} 페이지
    </div>
  </header>
</template>

<script setup lang="ts">
// Props만 정의 (emit 없음)
defineProps<{
  currentPartInfo: { number: number; name: string }
  currentPartPageInfo: { current: number; total: number }
}>()
</script>
```

**특징:**

- 데이터를 받아서 **보여주기만** 함
- 사용자 상호작용이 없음 → emit 불필요

---

#### Props/Emit 패턴 요약

| 컴포넌트              | Props (부모→자식)                                       | Emit (자식→부모)    | 용도                |
| --------------------- | ------------------------------------------------------- | ------------------- | ------------------- |
| `SurveyError`         | `error`                                                 | `loadSurvey`        | 에러 표시 + 재시도  |
| `SurveyHeader`        | `currentPartInfo`, `currentPartPageInfo`                | 없음                | 정보 표시만         |
| `SurveyProgressBar`   | `progress`                                              | 없음                | 진행률 표시만       |
| `ScaleQuestion5`      | `questionId`, `questionText`, `modelValue`, `scaleType` | `update:modelValue` | 답변 선택 (v-model) |
| `MultiSelectQuestion` | `items`, `modelValue`                                   | `update:modelValue` | 다중 선택 (v-model) |

---

#### v-model 규칙 정리

```typescript
// 자식 컴포넌트에서 v-model을 지원하려면:

// 1. props로 'modelValue' 받기
defineProps<{
  modelValue: string // 이름이 반드시 'modelValue'
}>()

// 2. emit으로 'update:modelValue' 정의
const emit = defineEmits<{
  'update:modelValue': [value: string] // 이름이 반드시 'update:modelValue'
}>()

// 3. 값 변경 시 emit 호출
emit('update:modelValue', newValue)
```

**부모에서 사용:**

```vue
<!-- 전체 문법 -->
<Child :model-value="data" @update:model-value="data = $event" />

<!-- v-model 단축 문법 (동일) -->
<Child v-model="data" />
```

---

### useSurvey()와 onMounted() 실행 흐름

#### 질문: useSurvey.ts에 onMounted()가 있는데, useSurvey는 어디에 연결되어있어?

#### 연결 위치

`useSurvey()`는 **SelfUnderstandingTestPage.vue**에서 호출됩니다:

```typescript
// src/modules/survey/pages/SelfUnderstandingTestPage.vue
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
} = useSurvey() // ← 여기서 useSurvey() 호출!
```

#### 실행 순서 (단계별)

```
1. 사용자가 /self-understanding/test 페이지 접속
         ↓
2. Vue Router가 SelfUnderstandingTestPage.vue 컴포넌트 생성
         ↓
3. <script setup> 코드 실행 시작
         ↓
4. useSurvey() 함수 호출
   - 내부의 ref, computed 등 생성
   - onMounted() 콜백 등록 (아직 실행 X, 예약만!)
         ↓
5. 템플릿 렌더링 & DOM에 마운트
         ↓
6. ★ 마운트 완료 → onMounted() 실행! ★
         ↓
7. loadSurvey() 호출 → API 요청 시작
```

#### 핵심 개념: onMounted()는 "예약"이다

```typescript
// useSurvey.ts 내부
export function useSurvey() {
  // ... ref, computed 정의 ...

  onMounted(() => {
    loadSurvey() // 바로 실행 X, 나중에 실행될 "예약"
  })

  // ...
}
```

`onMounted()`를 호출하면:

- 콜백 함수가 **즉시 실행되지 않음**
- Vue 내부에 "컴포넌트가 마운트되면 이 함수 실행해줘"라고 **등록**만 함
- 실제 실행은 **DOM 마운트 완료 후**

#### 왜 Composable 안에 onMounted()를 넣을 수 있나?

Vue의 `onMounted()`는 **현재 활성화된 컴포넌트 인스턴스**에 자동으로 연결됩니다:

```typescript
// SelfUnderstandingTestPage.vue의 <script setup> 실행 중...

useSurvey() // 이 시점에 "현재 컴포넌트"는 SelfUnderstandingTestPage

// useSurvey() 내부의 onMounted()는
// SelfUnderstandingTestPage의 마운트 시점에 실행됨
```

이 메커니즘 덕분에:

- Composable 안에서 lifecycle hook 사용 가능
- 해당 Composable을 호출한 컴포넌트의 lifecycle에 연결됨

#### 시각적 타임라인

```
시간 →

[페이지 접속] → [script setup 실행] → [DOM 마운트] → [onMounted 실행]
                     ↓                                    ↓
              useSurvey() 호출                    loadSurvey() 실행
              onMounted 등록                      API 호출 시작
              (예약만!)                           isLoading = true
```

---

### 네비게이션 버튼 분석

설문 페이지 하단의 이전/다음/제출 버튼 동작 원리입니다.

#### "이전" 버튼

```vue
<button class="nav-btn prev" :disabled="!canGoPrev" @click="goToPrevPage">이전</button>
```

| 부분                     | 설명                        |
| ------------------------ | --------------------------- |
| `class="nav-btn prev"`   | CSS 클래스 (스타일링용)     |
| `:disabled="!canGoPrev"` | 비활성화 조건 (동적 바인딩) |
| `@click="goToPrevPage"`  | 클릭 이벤트 핸들러          |
| `이전`                   | 버튼에 표시되는 텍스트      |

**`:disabled="!canGoPrev"` 상세:**

```typescript
// useSurvey.ts에서 정의됨
const canGoPrev = computed(() => currentPageIndex.value > 0)
```

| `currentPageIndex` | `canGoPrev` | `!canGoPrev` | 버튼 상태    |
| ------------------ | ----------- | ------------ | ------------ |
| `0` (첫 페이지)    | `false`     | `true`       | **비활성화** |
| `1` 이상           | `true`      | `false`      | 활성화       |

**`goToPrevPage()` 함수:**

```typescript
// useSurvey.ts
function goToPrevPage() {
  if (canGoPrev.value) {
    currentPageIndex.value--
  }
}
```

**동작 흐름:**

```
[이전] 버튼 클릭
      │
      ▼
goToPrevPage() 실행
      │
      ▼
currentPageIndex.value-- (예: 3 → 2)
      │
      ▼ (자동 재계산)
currentPage = allPages[2] (이전 페이지 데이터)
      │
      ▼ (자동 UI 업데이트)
화면에 이전 페이지 질문들 표시
```

---

#### "다음" / "제출" 버튼 전환

```vue
<SurveyNavBtnNext v-if="!isLastPage" :disabled="!isCurrentPageComplete" @click="goToNextPage" />
<SurveyNavBtnSubmit v-else :disabled="!isCurrentPageComplete" @click="handleSubmit" />
```

| 조건                               | 표시되는 버튼 |
| ---------------------------------- | ------------- |
| `!isLastPage` (마지막 페이지 아님) | "다음" 버튼   |
| `isLastPage` (마지막 페이지)       | "제출" 버튼   |

```typescript
// useSurvey.ts
const isLastPage = computed(() => currentPageIndex.value === totalPages.value - 1)
```

---

### v-if / v-else 규칙 - 컴포넌트 분리 시 주의사항

#### 핵심 규칙: v-if와 v-else는 "형제 요소"여야 함

```vue
<!-- ✅ 작동함 - 형제 요소 -->
<button v-if="!isLastPage">다음</button>
<button v-else>제출</button>
```

#### 문제 상황: 컴포넌트 내부에 v-else를 넣으면 안 됨

```vue
<!-- ❌ 작동 안 함 -->
<button v-if="!isLastPage">다음</button>

<!-- SurveyNavBtnSubmit.vue 내부 -->
<template>
  <button v-else>제출</button>
  <!-- v-else가 형제가 아님! -->
</template>
```

**v-else가 컴포넌트 내부에 있으면:**

- `v-if`와 형제 관계가 끊어짐
- Vue가 조건 연결을 인식하지 못함
- 버튼이 항상 표시됨

#### 해결 방법: 부모에서 조건 처리

```vue
<!-- 부모 컴포넌트 -->
<SurveyNavBtnNext v-if="!isLastPage" ... />
<SurveyNavBtnSubmit v-else ... />
```

```vue
<!-- SurveyNavBtnSubmit.vue (v-else 없음) -->
<template>
  <button class="nav-btn submit">제출</button>
</template>
```

#### 시각적 설명

```
┌─────────────────────────────────────────────────────────┐
│  부모 컴포넌트 템플릿                                     │
│                                                         │
│  <SurveyNavBtnNext v-if="!isLastPage" />  ← 형제 1      │
│  <SurveyNavBtnSubmit v-else />            ← 형제 2      │
│                                                         │
│  v-if / v-else가 같은 레벨에서 연결됨 ✅                 │
└─────────────────────────────────────────────────────────┘
```

---

### Vue 3 Fallthrough Attributes (속성 자동 상속)

#### 개념

Vue 3에서 **단일 루트 요소**를 가진 컴포넌트는 명시적으로 정의하지 않은 속성과 이벤트를 **루트 요소에 자동 전달**합니다.

#### 예제: SurveyNavBtnSubmit.vue

**자식 컴포넌트 (간단한 버전):**

```vue
<template>
  <button class="nav-btn submit">제출</button>
</template>

<script setup lang="ts">
// props나 emit 정의 없음!
</script>
```

**부모에서 사용:**

```vue
<SurveyNavBtnSubmit :disabled="!isCurrentPageComplete" @click="handleSubmit" />
```

**실제 렌더링 결과:**

```html
<!-- disabled와 @click이 자동으로 button에 전달됨! -->
<button class="nav-btn submit" disabled>제출</button>
```

#### 작동 원리

```
┌─────────────────────────────────────────┐
│  부모가 전달한 것들                       │
│  :disabled, @click                       │
└─────────────────────────────────────────┘
                    │
                    ▼ (Fallthrough - 자동 전달)
┌─────────────────────────────────────────┐
│  <button class="nav-btn submit">        │
│    ← disabled 속성 자동 적용             │
│    ← click 이벤트 자동 바인딩            │
│  </button>                              │
└─────────────────────────────────────────┘
```

#### 주의사항

**단일 루트 요소일 때만 작동:**

```vue
<!-- ✅ Fallthrough 작동 -->
<template>
  <button>제출</button>
</template>

<!-- ❌ Fallthrough 작동 안 함 (다중 루트) -->
<template>
  <div class="wrapper">
    <button>제출</button>
  </div>
</template>
```

**다중 루트일 경우 명시적 정의 필요:**

```vue
<template>
  <div class="wrapper">
    <button :disabled="disabled" @click="$emit('click')">제출</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ disabled: boolean }>()
defineEmits<{ (e: 'click'): void }>()
</script>
```

#### Fallthrough vs 명시적 정의 비교

| 방식                    | 장점                 | 단점                    |
| ----------------------- | -------------------- | ----------------------- |
| **Fallthrough (자동)**  | 코드 간결            | 루트 요소가 하나여야 함 |
| **명시적 (props/emit)** | 의도 명확, 타입 안전 | 코드가 더 김            |

#### 실무 권장

- **간단한 래퍼 컴포넌트**: Fallthrough 사용 (코드 간결)
- **복잡한 컴포넌트**: 명시적 props/emit 정의 (의도 명확)

---

### fetch에서 axios(req 래퍼)로 변환하기

#### 기존 fetch 코드 vs axios 래퍼 코드

**surveyApi.ts 변환 예시:**

```typescript
// ❌ 기존 fetch 버전
export async function submitSurveyResponse(
  data: SurveySubmitRequest,
): Promise<SurveySubmitResponse> {
  const res = await fetch(`${API_BASE}/api/survey/response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// ✅ axios 래퍼 버전
export const submitSurveyResponse = (data: SurveySubmitRequest) =>
  req.post<SurveySubmitResponse>(`/api/survey/response`, { data })
```

---

#### 핵심 차이점: 반환값 구조

| 방식                 | 반환값                                                            |
| -------------------- | ----------------------------------------------------------------- |
| **fetch**            | 응답 데이터 직접 반환 (`SurveySubmitResponse`)                    |
| **req (axios 래퍼)** | 래퍼 객체 반환 (`{ data: SurveySubmitResponse, status: number }`) |

```typescript
// fetch 반환값
{
  success: true,
  message: "제출 완료",
  data: { ... }
}

// req.post 반환값
{
  data: {           // ← 실제 응답은 여기 안에!
    success: true,
    message: "제출 완료",
    data: { ... }
  },
  status: 200       // ← HTTP 상태 코드도 함께 제공
}
```

---

#### 호출하는 쪽 코드 수정 방법

**useSurvey.ts의 submitSurvey 함수:**

```typescript
// ❌ 기존 코드 (fetch 버전에 맞춤)
const response = await submitSurveyResponse({
  survey_id: surveyId.value,
  respondent_id: respondentId,
  answers,
})

if (!response.success) {
  // ← 에러! response는 { data, status } 형태
  throw new Error(response.error?.message || '제출에 실패했습니다.')
}

// ✅ 수정된 코드 (axios 래퍼에 맞춤)
const { data: response } = await submitSurveyResponse({
  survey_id: surveyId.value,
  respondent_id: respondentId,
  answers,
})

if (!response.success) {
  // ← 이제 정상 작동!
  throw new Error(response.error?.message || '제출에 실패했습니다.')
}
```

---

#### 구조분해 할당 + 이름 변경

```typescript
const { data: response } = await submitSurveyResponse(...)
//      ^^^^  ^^^^^^^^
//      │     └── 꺼낸 값을 이 이름으로 사용
//      └── 원래 속성 이름
```

**동작 원리:**

```typescript
// 반환된 객체
const result = { data: { success: true, ... }, status: 200 }

// 구조분해 + 이름 변경
const { data: response } = result

// 결과
// response = { success: true, ... }  ← data 속성의 값이 response 변수에 할당
```

---

#### loadSurvey vs submitSurvey 비교

두 함수 모두 같은 패턴을 사용합니다:

```typescript
// loadSurvey (Line 159)
const { data, status } = await fetchSurveyForm()
if (status === 200) {
  surveyData.value = data
  // ...
}

// submitSurvey (Line 243)
const { data: response } = await submitSurveyResponse({...})
if (!response.success) {
  // ...
}
```

| 함수           | 구조분해 방식        | 이유                            |
| -------------- | -------------------- | ------------------------------- |
| `loadSurvey`   | `{ data, status }`   | status로 성공 여부 판단         |
| `submitSurvey` | `{ data: response }` | 응답 내부의 success 필드로 판단 |

---

#### 변환 체크리스트

fetch → axios 래퍼로 변환할 때:

1. **API 함수 수정** (surveyApi.ts)
   - `fetch()` → `req.get()` 또는 `req.post()`
   - `body: JSON.stringify(data)` → `{ data }` (자동 직렬화)
   - `headers` 설정 불필요 (axios가 자동 처리)

2. **호출하는 쪽 수정** (useSurvey.ts 등)
   - 반환값에서 `{ data }` 또는 `{ data, status }` 구조분해
   - 기존 로직에서 `response` → `response.data` 접근 필요 없음 (이미 꺼냈으므로)
