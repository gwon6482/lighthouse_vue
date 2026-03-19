# CODE_ANALYSIS4.md — EncyclopediaHomePage.vue 코드 분석

> 분석 대상: `src/modules/encyclopedia/pages/EncyclopediaHomePage.vue` 및 관련 파일
> 작성일: 2026-03-19

---

## 1. 전체 구조 개요

`EncyclopediaHomePage.vue`는 **진로백과 홈 화면**을 담당하는 페이지 컴포넌트다.
이 파일을 이해하려면 함께 동작하는 파일들을 같이 봐야 한다.

```
encyclopedia/
├── pages/
│   └── EncyclopediaHomePage.vue       ← 메인 분석 파일
├── components/page/home/
│   ├── MainTitle.vue                   ← 상단 타이틀 컴포넌트
│   ├── SearchBar.vue                   ← 검색창 컴포넌트
│   ├── SearchResultCard.vue            ← 검색 결과 카드
│   └── RecommendedJobCard.vue          ← 추천 직업 카드
├── composables/
│   └── useEncyclopedia.ts              ← 상태/비즈니스 로직
└── types/
    └── encyclopedia.ts                 ← TypeScript 타입 정의
```

---

## 2. `<template>` 분석 — 화면 구조

```html
<div class="encyclopedia-home">
  <MainTitle />
  <SearchBar :query="searchQuery" @search="searchJob" @clear="clearSearch" />

  <!-- 검색어가 있을 때 -->
  <section v-if="searchQuery">
    검색 결과 목록
  </section>

  <!-- 검색어가 없을 때 -->
  <template v-else>
    진로 둘러보기 카드 목록
    나의 추천 진로 버튼
  </template>
</div>
```

### 핵심 조건 분기: `v-if` / `v-else`

| 조건 | 보이는 UI |
|------|----------|
| `searchQuery`가 빈 문자열(`""`) | 기본 메인 화면 (진로 둘러보기 + 추천 진로 버튼) |
| `searchQuery`에 값이 있음 | 검색 결과 섹션 |

```html
<section v-if="searchQuery" ...>  <!-- searchQuery가 truthy면 검색 결과 표시 -->
<template v-else>                  <!-- falsy면 메인 메뉴 표시 -->
```

> **포인트**: `v-if`는 DOM에서 요소 자체를 완전히 제거/생성한다. `v-show`와 달리 `display: none`이 아니라 실제로 렌더링되지 않는다.

### 검색 결과 섹션의 3가지 상태

```html
<div v-if="isLoading">로딩 중...</div>
<div v-else-if="searchResults.length === 0">검색 결과가 없습니다.</div>
<div v-else class="encyclopedia-home__card-list">
  <SearchResultCard v-for="job in searchResults" ... />
</div>
```

| 상태 | 조건 | 표시 내용 |
|------|------|----------|
| 로딩 중 | `isLoading === true` | "로딩 중..." 텍스트 |
| 결과 없음 | `searchResults.length === 0` | "검색 결과가 없습니다." 텍스트 |
| 결과 있음 | 그 외 | SearchResultCard 목록 |

### `v-for` 패턴

```html
<SearchResultCard
  v-for="job in searchResults"
  :key="job.jobCode"
  :job="job"
  @click="goToJobDetail(job.jobCode)"
/>
```

- `v-for="job in searchResults"`: `searchResults` 배열을 순회하면서 각 항목을 `job`이라는 이름으로 사용
- `:key="job.jobCode"`: Vue가 각 카드를 구분하기 위한 고유 키. **배열 인덱스 대신 고유 ID를 쓰는 것이 권장된다** (정렬/삭제 시 버그 방지)
- `:job="job"`: 부모 → 자식으로 데이터를 내려주는 `props` 바인딩
- `@click="goToJobDetail(job.jobCode)"`: 자식 컴포넌트에서 올라온 이벤트를 받아 처리

---

## 3. `<script setup lang="ts">` 분석 — 로직

### import 구조

```typescript
import { useRouter } from 'vue-router'                        // 라우터 (페이지 이동)
import { useEncyclopedia } from '../composables/useEncyclopedia'  // 상태/로직
import type { JobSummary } from '../types/encyclopedia'        // 타입만 import
import MainTitle from '../components/page/home/MainTitle.vue'
import SearchBar from '../components/page/home/SearchBar.vue'
import SearchResultCard from '../components/page/home/SearchResultCard.vue'
import RecommendedJobCard from '../components/page/home/RecommendedJobCard.vue'
```

> `import type`은 TypeScript 전용 문법으로, **런타임에는 아무것도 남지 않는다**. 타입 정보만 빌드 과정에서 사용되고 JS로 변환 시 사라진다.

### Composable 사용

```typescript
const {
  searchQuery,
  searchResults,
  isLoading,
  searchJob,
  clearSearch,
} = useEncyclopedia()
```

`useEncyclopedia()`가 반환하는 값 중에서 홈 화면에 필요한 것만 **구조 분해(destructuring)**해서 가져온다.

| 이름 | 종류 | 역할 |
|------|------|------|
| `searchQuery` | `ref<string>` | 현재 검색어 (반응형) |
| `searchResults` | `ref<JobSummary[]>` | 검색 결과 목록 (반응형) |
| `isLoading` | `ref<boolean>` | 로딩 상태 (반응형) |
| `searchJob` | `function` | 검색 실행 함수 |
| `clearSearch` | `function` | 검색 초기화 함수 |

### featuredJobs — 하드코딩된 진로 카드

```typescript
const featuredJobs: JobSummary[] = [
  {
    jobCode: '013601',
    classification: { primary: '경영·사무·금융·보험직', secondary: '전문서비스 관리자' },
    title: '예술·디자인·방송관리자',
  },
  // ...
]
```

현재는 **API 연동 없이 하드코딩된 데이터**를 사용한다.
타입은 `JobSummary[]`로 명시되어 있어 타입 안전성은 보장된다.

### 페이지 이동 함수

```typescript
function goToJobDetail(jobCode: string) {
  router.push(`/career-encyclopedia/job/${jobCode}`)
}

function goToRecommended() {
  router.push('/career-encyclopedia/recommended')
}
```

`router.push()`는 Vue Router의 **프로그래매틱 내비게이션** 방법이다.
`<router-link>` 컴포넌트를 사용하지 않고 코드에서 직접 페이지를 이동할 때 사용한다.

---

## 4. 자식 컴포넌트 분석

### 4-1. MainTitle.vue

```html
<header class="encyclopedia-home__header">
  <h1>진로백과</h1>
  <p>관심 있는 직업을 검색하거나 추천 진로를 확인해보세요</p>
</header>
```

- props도 emit도 없는 **순수 표현(presentational) 컴포넌트**
- `<style>` (scoped 없음) → 전역 스타일로 적용됨

> **주의**: `scoped`가 없으면 `.encyclopedia-home__header` 클래스가 전체 앱에 영향을 줄 수 있다.

### 4-2. SearchBar.vue

**Props / Emits 구조:**

```typescript
const props = defineProps<{
  query: string   // 부모로부터 현재 검색어를 받음
}>()

const emit = defineEmits<{
  search: [query: string]  // 검색 실행 시 부모로 검색어 전달
  clear: []                // 초기화 시 부모에게 알림
}>()
```

**내부 상태:**

```typescript
const inputValue = ref(props.query)  // 로컬 입력값 상태
```

props의 `query`를 직접 수정하지 않고 `inputValue`라는 **로컬 상태**를 따로 만든다.
이는 Vue의 **단방향 데이터 흐름** 원칙을 지키기 위함이다.
(props는 읽기 전용 — 자식이 props를 직접 수정하면 안 된다)

**이벤트 흐름:**

```
사용자 입력 → inputValue 업데이트
엔터키 or 검색 버튼 클릭 → handleSearch() → emit('search', inputValue.value)
↓
부모(EncyclopediaHomePage)의 searchJob() 호출
↓
useEncyclopedia의 searchJob() → API 호출 → searchResults 업데이트
```

**X 버튼 조건부 표시:**

```html
<button v-if="query" class="search-bar__clear" @click="handleClear">✕</button>
```

`query`(props)가 있을 때만 X 버튼이 나타난다.
`inputValue`가 아닌 `query`를 기준으로 하는 이유: 실제 "검색이 실행된" 상태를 부모가 관리하기 때문.

### 4-3. SearchResultCard.vue / RecommendedJobCard.vue

두 컴포넌트는 구조가 거의 동일하다.

```typescript
defineProps<{ job: JobSummary }>()
const emit = defineEmits<{ click: [] }>()
```

```html
<div class="search-result-card" @click="emit('click')">
  <div>대분류 · 중분류</div>
  <p>직업명</p>
  <span>›</span>  <!-- 오른쪽 화살표 -->
</div>
```

**화살표(›) 위치 지정 방식:**

```css
.search-result-card__arrow {
  position: absolute;    /* 카드 기준으로 절대 위치 */
  right: 20px;
  top: 50%;
  transform: translateY(-50%);  /* 세로 정중앙 */
}
```

부모 카드(`.search-result-card`)가 `position: relative`이므로 화살표가 카드 내부 오른쪽 중앙에 고정된다.

---

## 5. `useEncyclopedia.ts` — Composable 분석

### 싱글톤 패턴

```typescript
// 모듈 레벨 (함수 밖) — 앱 전체에서 하나만 존재
const searchQuery = ref<string>('')
const searchResults = ref<JobSummary[]>([])
// ...

export function useEncyclopedia() {
  // 위의 ref들을 공유해서 사용
  return { searchQuery, searchResults, ... }
}
```

`ref`들이 `useEncyclopedia()` 함수 **바깥(모듈 레벨)**에 선언되어 있다.
이렇게 하면 어떤 컴포넌트에서 `useEncyclopedia()`를 호출해도 **동일한 상태를 공유**한다.

> 일반적인 composable은 함수 내부에 `ref`를 선언해서 호출할 때마다 새 상태를 만든다.
> 이 파일은 의도적으로 전역 공유 상태를 구현한 것이다.

### searchJob 함수 흐름

```typescript
async function searchJob(query: string) {
  searchQuery.value = query      // 1. 검색어 상태 업데이트

  if (!query.trim()) {           // 2. 빈 문자열이면 결과 초기화 후 종료
    searchResults.value = []
    return
  }

  isLoading.value = true         // 3. 로딩 시작
  error.value = null
  try {
    const { data, status } = await searchJobs(query)  // 4. API 호출
    if (status === 200) {
      searchResults.value = data.data                  // 5. 결과 저장
    } else {
      throw new Error('검색에 실패했습니다.')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '검색에 실패했습니다.'  // 6. 에러 처리
  } finally {
    isLoading.value = false      // 7. 로딩 종료 (성공/실패 관계없이 항상 실행)
  }
}
```

`try-catch-finally` 패턴:
- `try`: 정상 실행 코드
- `catch`: 에러 발생 시 처리
- `finally`: 성공/실패 여부에 상관없이 **반드시** 실행 (로딩 해제에 적합)

---

## 6. TypeScript 타입 분석

### JobSummary — 목록용 간략 타입

```typescript
export interface JobSummary {
  jobCode: string              // 직업 코드 (예: '013601')
  title: string                // 직업명 (예: '게임그래픽디자이너')
  classification: JobClassification  // 분류 정보
}

export interface JobClassification {
  primary: string    // 대분류 (예: '예술·디자인·방송·스포츠직')
  secondary: string  // 중분류 (예: '디자이너')
}
```

### JobDetailTab — Union 타입

```typescript
export type JobDetailTab = 'overview' | 'review' | 'preparation' | 'recruitment'
```

탭의 종류를 **문자열 리터럴 유니온 타입**으로 정의한다.
이렇게 하면 `activeTab.value = 'wrong'` 처럼 잘못된 값을 넣으면 컴파일 에러가 발생한다.

---

## 7. 라우팅 구조

```typescript
// encyclopedia.routes.ts
export default [
  { path: '/career-encyclopedia',            component: EncyclopediaHomePage },
  { path: '/career-encyclopedia/recommended', component: EncyclopediaRecommendedPage },
  { path: '/career-encyclopedia/job/:jobCode', component: EncyclopediaJobDetailPage },
]
```

| URL 패턴 | 설명 |
|----------|------|
| `/career-encyclopedia` | 홈 (현재 분석 파일) |
| `/career-encyclopedia/recommended` | 나의 추천 진로 |
| `/career-encyclopedia/job/013601` | 직업 상세 (`:jobCode`가 동적 파라미터) |

`router.push(`/career-encyclopedia/job/${jobCode}`)` 호출 시
`:jobCode` 자리에 실제 코드값이 들어간다.

---

## 8. CSS 작성 패턴 — BEM

이 프로젝트는 **BEM(Block Element Modifier)** 방법론을 사용한다.

```
.encyclopedia-home              ← Block (컴포넌트 루트)
.encyclopedia-home__section     ← Element (블록의 하위 요소, __ 구분)
.encyclopedia-home__menu-btn    ← Element
.encyclopedia-home__menu-btn:active  ← 상태 (수정자 역할)
```

### `scoped` CSS

```html
<style scoped>  ← 이 컴포넌트에만 적용
```

Vue는 `scoped`가 있으면 자동으로 고유한 속성(예: `data-v-xxxxxx`)을 추가해
다른 컴포넌트의 같은 클래스명과 충돌하지 않도록 격리한다.

### hover 처리

```css
@media (hover: hover) {
  .encyclopedia-home__menu-btn:hover {
    background-color: #e8e8e8;
  }
}
```

`@media (hover: hover)` — 터치스크린(모바일)에서는 hover가 없으므로,
**실제로 hover가 지원되는 기기(마우스 사용 환경)**에서만 hover 스타일을 적용한다.
모바일에서 터치 시 hover 상태가 남아있는 문제를 방지한다.

---

## 9. 전체 데이터 흐름 요약

```
사용자가 검색어 입력 후 엔터
    ↓
SearchBar.vue: emit('search', '검색어')
    ↓
EncyclopediaHomePage.vue: @search="searchJob" 로 받아서 실행
    ↓
useEncyclopedia.ts: searchJob('검색어')
  - searchQuery.value = '검색어'   → template의 v-if="searchQuery" 가 true로 변경
  - isLoading.value = true         → "로딩 중..." 표시
  - API 호출
  - searchResults.value = [...]   → 카드 목록 렌더링
  - isLoading.value = false        → 로딩 숨김
    ↓
EncyclopediaHomePage.vue: searchResults를 SearchResultCard에 v-for로 렌더링
    ↓
사용자가 카드 클릭
    ↓
SearchResultCard: emit('click')
    ↓
EncyclopediaHomePage: @click="goToJobDetail(job.jobCode)"
    ↓
router.push('/career-encyclopedia/job/013601')  → 상세 페이지로 이동
```

---

---

## 11. SearchBar.vue 심화 분석

> 파일: `src/modules/encyclopedia/components/page/home/SearchBar.vue`

### 전체 코드 구조 한눈에 보기

```
SearchBar.vue
├── <template>
│   └── .search-bar
│       └── .search-bar__inner  ← flex 컨테이너
│           ├── <input>          ← 텍스트 입력
│           ├── <button> ✕       ← X 버튼 (조건부)
│           └── <button> 검색    ← 검색 버튼
├── <script setup>
│   ├── defineProps  { query }
│   ├── defineEmits  { search, clear }
│   ├── inputValue   (로컬 상태)
│   ├── handleSearch()
│   └── handleClear()
└── <style scoped>
```

---

### 11-1. Props & Emits 정의 방식 (TypeScript Generic 문법)

```typescript
const props = defineProps<{
  query: string
}>()

const emit = defineEmits<{
  search: [query: string]
  clear: []
}>()
```

Vue 3에서 props와 emits를 정의하는 방법은 두 가지가 있다:

**방법 A — 런타임 방식 (구형)**
```typescript
defineProps({ query: String })
defineEmits(['search', 'clear'])
```

**방법 B — TypeScript Generic 방식 (현재 코드)**
```typescript
defineProps<{ query: string }>()
defineEmits<{ search: [query: string]; clear: [] }>()
```

방법 B가 더 엄격하다. `search` 이벤트는 반드시 `string` 타입 인자를 하나 전달해야 하고,
`clear` 이벤트는 인자 없이 발행해야 한다. 틀리면 TypeScript 에러가 발생한다.

> `search: [query: string]` — 배열 표기가 이벤트의 **인자 목록**을 나타낸다.
> `query`는 단순 이름표(label)일 뿐, 실제로 의미있는 건 타입 `string`이다.

---

### 11-2. `inputValue` — 로컬 상태를 따로 두는 이유

```typescript
const inputValue = ref(props.query)
```

이 한 줄이 중요한 설계 포인트다.

**왜 props.query를 직접 쓰지 않는가?**

```
❌ 잘못된 방법:
<input :value="props.query" @input="props.query = ..." />
→ Vue 경고: "Avoid mutating a prop directly"
→ 부모의 데이터를 자식이 멋대로 바꾸면 데이터 흐름을 추적하기 어렵다

✅ 올바른 방법 (현재 코드):
<input :value="query" @input="inputValue = ..." />
→ 사용자가 타이핑하는 동안은 inputValue(로컬)에만 저장
→ 검색 버튼을 눌러야 비로소 emit('search')로 부모에게 알림
```

**두 상태의 역할 차이:**

| 상태 | 관리 주체 | 의미 |
|------|----------|------|
| `inputValue` | SearchBar (자식) | 현재 input창에 입력된 값 |
| `query` (props) | EncyclopediaHomePage (부모) | 실제로 **검색이 실행된** 검색어 |

즉 사용자가 "프론트엔드"를 타이핑하는 동안 `inputValue`는 계속 바뀌지만,
검색 버튼을 누르기 전까지 `query`(부모 상태)는 바뀌지 않는다.

---

### 11-3. `<input>` 이벤트 처리 방식

```html
<input
  :value="query"
  @input="inputValue = ($event.target as HTMLInputElement).value"
  @keydown.enter="handleSearch"
/>
```

**`:value="query"` vs `v-model`**

`v-model`을 쓰면 더 간단하지만, 여기서는 일부러 쓰지 않았다.

```html
<!-- v-model 사용 시 (단순하지만 props 수정 문제 발생) -->
<input v-model="props.query" />
<!-- 풀어쓰면 이것과 동일 → props 직접 수정이 되므로 ❌ -->
<input :value="props.query" @input="props.query = $event.target.value" />

<!-- 현재 코드: 로컬 inputValue에 연결 -->
<input :value="query" @input="inputValue = ..." />
```

`:value="query"`는 **표시값(display)**은 부모의 `query`를 따르고,
`@input`에서는 **로컬 inputValue**를 업데이트한다.

**`$event.target as HTMLInputElement`**

```typescript
@input="inputValue = ($event.target as HTMLInputElement).value"
```

- `$event` — Vue가 이벤트 핸들러에 자동으로 넘겨주는 DOM 이벤트 객체
- `$event.target` — 이벤트가 발생한 DOM 요소 (`<input>` 태그)
- `as HTMLInputElement` — TypeScript에게 "이건 input 요소야"라고 알려주는 **타입 단언(Type Assertion)**
  - 이게 없으면 `.value`를 쓸 때 TypeScript가 타입을 모른다고 에러를 낸다
- `.value` — input 요소의 현재 입력값

**`@keydown.enter`**

```html
@keydown.enter="handleSearch"
```

- `@keydown` — 키보드 키를 누를 때 발생
- `.enter` — Vue의 **이벤트 수식어(Event Modifier)**. Enter 키일 때만 실행된다
- `@keydown.enter.prevent`처럼 체인으로 붙여 기본 동작을 막을 수도 있다

---

### 11-4. X 버튼의 조건부 렌더링

```html
<button v-if="query" class="search-bar__clear" @click="handleClear">✕</button>
```

`v-if="query"` — `query`는 `string` 타입이므로:
- `""` (빈 문자열) → falsy → 버튼 숨김
- `"게임"` 등 값이 있음 → truthy → 버튼 표시

**중요한 설계 포인트**: `inputValue`가 아닌 `query`(props)를 기준으로 한다.

```
시나리오:
1. 사용자가 "게임" 검색 → query = "게임", X 버튼 표시
2. 사용자가 input을 지워서 inputValue = "" 로 만듦
3. 아직 검색 버튼을 안 눌렀으므로 query = "게임" 유지 → X 버튼 여전히 표시
4. X 버튼 클릭 → handleClear() → inputValue = "" + emit('clear') → 부모에서 query = ""
```

X 버튼은 "현재 input 값"이 아니라 "검색 결과가 표시되고 있는 상태"를 나타낸다.

**handleClear 함수:**

```typescript
function handleClear() {
  inputValue.value = ''   // 1. input창 비우기
  emit('clear')           // 2. 부모에게 알림
}
```

부모(EncyclopediaHomePage)의 `clearSearch()`:
```typescript
function clearSearch() {
  searchQuery.value = ''   // query를 빈 문자열로
  searchResults.value = [] // 검색 결과 초기화
}
```

---

### 11-5. CSS Flex 레이아웃 분석

```css
.search-bar__inner {
  display: flex;
  align-items: center;  /* 세로 중앙 정렬 */
  gap: 8px;             /* 요소 간 간격 */
  max-width: 480px;
  margin: 0 auto;       /* 가로 중앙 배치 */
  background-color: #f5f5f5;
  border-radius: 14px;
  padding: 10px 14px;
}
```

**각 요소의 flex 동작:**

```css
.search-bar__input {
  flex: 1;              /* 남는 공간을 모두 차지 */
  background: transparent;  /* 배경 없앰 (부모 배경색 보임) */
  outline: none;        /* 포커스 시 파란 테두리 제거 */
}

.search-bar__clear,
.search-bar__btn {
  flex-shrink: 0;       /* 공간이 부족해도 줄어들지 않음 */
}
```

```
[     input (flex: 1)     ] [✕] [검색]
 ↑ 남은 공간을 모두 차지       ↑ 고정 크기
```

**`font-family: inherit`**

```css
.search-bar__btn {
  font-family: inherit;
}
```

`<button>` 태그는 브라우저 기본 스타일로 OS 시스템 폰트를 사용한다.
`inherit`을 명시해야 부모(앱 전체)의 폰트가 버튼에도 적용된다.

**`::placeholder` 가상 요소**

```css
.search-bar__input::placeholder {
  color: #aaa;
}
```

`::placeholder`는 input이 비어있을 때 보이는 힌트 텍스트(placeholder)의 스타일을 지정한다.
이 요소는 실제 DOM에 존재하지 않아서 CSS 가상 요소(pseudo-element) `::` 문법을 사용한다.

---

### 11-6. 전체 이벤트 흐름 다이어그램

```
┌─────────────────────────────────────────────┐
│           SearchBar.vue                     │
│                                             │
│  props: query ──────────────────┐           │
│                                 ↓           │
│  [input :value="query"]  inputValue(ref)    │
│       ↑ display                 ↑ typing    │
│       │                         │           │
│  @input ─────────────────────────           │
│                                             │
│  @keydown.enter ──→ handleSearch()          │
│  검색 버튼 @click ──→ handleSearch()         │
│                        ↓                   │
│                  emit('search', inputValue) │
│                                             │
│  v-if="query" ──→ X 버튼 표시/숨김           │
│  X 버튼 @click ──→ handleClear()            │
│                        ↓                   │
│                  inputValue = ''            │
│                  emit('clear')              │
└─────────────────────────────────────────────┘
         ↕ emit
┌─────────────────────────────────────────────┐
│         EncyclopediaHomePage.vue            │
│                                             │
│  @search="searchJob"  → API 호출            │
│  @clear="clearSearch" → 결과 초기화          │
│  :query="searchQuery" → SearchBar에 전달    │
└─────────────────────────────────────────────┘
```

---

## 10. 학습 포인트 정리

| 개념 | 사용 위치 | 설명 |
|------|----------|------|
| `v-if` / `v-else` | EncyclopediaHomePage | 조건에 따라 DOM 요소 생성/제거 |
| `v-for` + `:key` | EncyclopediaHomePage | 배열 데이터를 카드 목록으로 렌더링 |
| `defineProps` | SearchBar, Card 컴포넌트 | 부모 → 자식 데이터 전달 |
| `defineEmits` | SearchBar, Card 컴포넌트 | 자식 → 부모 이벤트 전달 |
| Composable | useEncyclopedia | 재사용 가능한 상태+로직 분리 |
| 싱글톤 상태 | useEncyclopedia | 모듈 레벨 ref로 전역 공유 상태 구현 |
| `ref` | useEncyclopedia | Vue 반응형 상태 |
| `router.push()` | EncyclopediaHomePage | 코드에서 페이지 이동 |
| BEM CSS | 모든 컴포넌트 | 클래스 명명 규칙 |
| `scoped` CSS | EncyclopediaHomePage, 카드 컴포넌트 | CSS 격리 |
| `@media (hover: hover)` | 버튼/카드 스타일 | 터치 기기에서 hover 제거 |
| TypeScript 유니온 타입 | JobDetailTab | 허용 값을 타입으로 제한 |
