# 프로젝트 아키텍처 분석 (CODE_ANALYSIS3.md)

이 문서는 프로젝트의 전반적인 기술 스택, 아키텍처 및 핵심 구조에 대해 분석한 내용을 담고 있습니다.

## 1. 개요

이 프로젝트는 **Vue.js 3**를 기반으로 한 모던 웹 애플리케이션입니다. **Vite**를 빌드 도구로 사용하여 빠른 개발 환경을 구축했으며, **TypeScript**를 통해 코드의 안정성과 유지보수성을 높였습니다.

가장 큰 특징은 **Capacitor**를 도입하여 단일 웹 코드베이스로 **iOS와 Android 네이티브 앱까지 빌드**할 수 있는 크로스플랫폼 구조를 채택했다는 점입니다.

또한, 기능별로 코드를 분리하는 **모듈형 아키텍처(Modular Architecture)**를 적용하여 확장성과 팀원 간의 협업 효율성을 극대화했습니다.

## 2. 핵심 기술 스택

- **프레임워크**: Vue.js 3 (Composition API, `<script setup>`)
- **빌드 도구**: Vite
- **언어**: TypeScript
- **라우팅**: Vue Router
- **상태 관리**: Pinia (Vue의 공식 상태 관리 라이브러리)
- **모바일 앱 프레임워크**: Capacitor
- **UI 스타일링**: SCSS (Sass), Pretendard 폰트
- **단위 테스트**: Vitest, Vue Test Utils
- **코드 품질**: ESLint (린팅), Prettier (코드 포매팅)

## 3. 디렉터리 구조 분석

프로젝트의 구조는 기능 중심의 모듈화와 역할 분리를 명확하게 따르고 있습니다.

```
/
├── android/              # Capacitor 안드로이드 네이티브 프로젝트
├── ios/                  # Capacitor iOS 네이티브 프로젝트
├── public/               # 정적 에셋 (이미지, 폰트 등)
├── src/                  # 애플리케이션 소스 코드
│   ├── appearance/       # 전역 스타일(SCSS), 폰트 등 UI 관련 코드
│   ├── components/       # 여러 모듈에서 공통으로 사용하는 컴포넌트 (존재한다면)
│   ├── modules/          # ★ 핵심: 기능별 모듈 디렉터리
│   │   ├── encyclopedia/ # '도감' 모듈
│   │   └── survey/       # '설문조사' 모듈
│   │       ├── components/ # survey 모듈 내부에서만 사용하는 컴포넌트
│   │       ├── composables/ # survey 모듈의 Vue Composition API 함수 (e.g., useSurvey.ts)
│   │       ├── pages/      # survey 모듈의 메인 페이지 컴포넌트
│   │       ├── survey.api.ts # survey 관련 API 호출 함수
│   │       ├── survey.routes.ts # survey 모듈의 라우팅 설정
│   │       └── types/      # survey 모듈의 TypeScript 타입 정의
│   ├── shared/           # 여러 모듈이 공유하는 핵심 로직
│   │   ├── api/          # API 클라이언트 설정 (axios 인스턴스 등)
│   │   └── router/       # ★ 전역 라우터. 각 모듈의 라우트를 통합
│   ├── App.vue           # 애플리케이션의 루트 컴포넌트 (<RouterView />)
│   └── main.ts           # ★ 애플리케이션의 시작점 (Vue 인스턴스 생성, 라우터/전역 스타일 적용)
├── capacitor.config.ts   # Capacitor 설정 파일
├── package.json          # 프로젝트 의존성 및 스크립트 정의
└── vite.config.ts        # Vite 빌드 도구 설정 파일
```

## 4. 아키텍처 패턴 및 주요 흐름

### 모듈형 아키텍처

-   `src/modules` 디렉터리 안에 `survey`, `encyclopedia`와 같이 기능 단위로 코드를 그룹화합니다.
-   각 모듈은 자신만의 `routes.ts`, `components`, `pages`, `api.ts` 등을 가짐으로써 높은 독립성을 유지합니다.
-   **장점**:
    -   새로운 기능을 추가할 때 다른 코드에 미치는 영향을 최소화할 수 있습니다.
    -   특정 기능을 찾거나 수정하기 용이하여 유지보수성이 향상됩니다.
    -   팀 단위 개발 시, 개발자들이 각자 맡은 모듈에 집중하여 작업할 수 있어 충돌이 줄어듭니다.

### 라우팅 흐름

1.  애플리케이션이 시작되면 `src/main.ts`가 실행됩니다.
2.  `main.ts`는 `src/shared/router/index.ts`에 정의된 메인 라우터를 Vue 앱에 등록합니다.
3.  `src/shared/router/index.ts`는 각 모듈(`survey`, `encyclopedia`)의 `*.routes.ts` 파일을 `import`하여 모든 라우트 규칙을 하나로 통합합니다.
4.  사용자가 특정 URL로 접근하면, 통합된 라우팅 규칙에 따라 해당 URL에 매핑된 모듈의 페이지 컴포넌트가 `App.vue`의 `<RouterView />`에 렌더링됩니다.

### 상태 관리

-   `package.json`에 `pinia`가 포함되어 있어, 전역 상태 관리가 필요할 경우 Pinia를 사용할 것으로 보입니다.
-   모듈별로 `store`를 만들어 관리하면 더욱 체계적인 상태 관리가 가능합니다. (현재 파일 구조에서는 명시적으로 보이지 않으나 일반적인 패턴)

### 크로스플랫폼 빌드 (Capacitor)

-   `npm run app:build` 와 같은 스크립트를 실행하면 `vite build`를 통해 웹 애플리케이션을 `dist` 폴더에 빌드합니다.
-   이후 `npx cap sync` 명령어가 `dist` 폴더의 빌드 결과물을 `android/` 와 `ios/` 네이티브 프로젝트에 동기화합니다.
-   개발자는 Android Studio나 Xcode를 열어 네이티브 앱을 빌드하고 실행할 수 있습니다.
-   `capacitor.config.ts` 파일에서 앱 ID, 이름, 서버 URL 등 네이티브 앱의 동작을 상세히 제어합니다.

## 5. 컴포넌트 상세 분석 및 Q&A

이 섹션에서는 주요 컴포넌트와 Vue 기능에 대한 분석 및 대화 내용을 기록합니다.

### **`HomePage.vue` 와 `HomeButtonContainer.vue` (부모-자식 관계)**

-   **요약**: `HomePage.vue`는 데이터(menus 배열)를 소유하고 `HomeButtonContainer.vue`에게 props로 전달합니다. `HomeButtonContainer.vue`는 전달받은 데이터로 버튼 목록을 렌더링하는 역할에만 집중하며, 이는 역할 분리 원칙의 좋은 예시입니다.

### **`HomeButtonContainer.vue` 분석 (`v-for` 및 속성)**

-   **`v-for="menu in menus"` (디렉티브)**:
    -   `menus` 배열을 순회하면서 배열의 각 `menu` 객체에 대해 `<RouterLink>` 컴포넌트를 하나씩 생성합니다. Vue에서 목록 렌더링을 위한 핵심 기능입니다.
-   **`:key="menu.name"` (특수 속성)**:
    -   `v-for` 사용 시 각 항목을 고유하게 식별하기 위한 '이름표'입니다. Vue는 이 `key`를 사용하여 화면을 효율적으로 업데이트하므로, 각 항목마다 겹치지 않는 고유한 값으로 지정해야 합니다.
-   **`class="main-button"` (정적 속성)**:
    -   `:`가 없으므로, 생성되는 모든 `<RouterLink>`에 `'main-button'`이라는 동일한 클래스명을 문자열 그대로 부여합니다.
-   **`:to="menu.route"` (동적 속성)**:
    -   `:`는 `v-bind:`의 축약형으로, 속성 값을 JavaScript 표현식과 연결(바인딩)합니다.
    -   `RouterLink`의 `to` prop에 `menu` 객체의 `route` 속성 값(예: `'/self-understanding'`)을 동적으로 전달합니다. 이 덕분에 각 버튼은 서로 다른 경로로 이동할 수 있습니다.
-   **`: ` 유무의 차이**:
    -   `:` 없음 (정적): 값을 단순 **문자열**로 취급합니다. (예: `class="main-button"`)
    -   `:` 있음 (동적, `v-bind`): 값을 **JavaScript 표현식**으로 취급하여, `script`의 데이터와 연결합니다. (예: `:to="menu.route"`)

### **`defineProps` 타입 정의 (`{...}[]`) 이해**

-   **질문**: `HomeButtonContainer.vue`에서 `defineProps` 부분의 `menus: {}[]` 형태는 무엇을 의미하는가? `{}` 안에는 불러올 값들에 대한 정의가 들어가고, `[]`가 붙어있는 이유는 `menus`가 배열이기 때문인지? 배열이 아닌 경우엔 `[]`를 붙이지 않아도 되는지?
-   **답변**:
    -   **`{ name: string; icon: string; route: string }`**: 이 중괄호 `{}` 부분은 `menus` 배열 안에 들어갈 **개별 객체의 구조(Shape)**를 TypeScript 문법으로 정의하는 것입니다. `name`, `icon`, `route` 세 가지 속성이 `string` 타입임을 명시합니다. 이는 이 타입의 객체가 가져야 할 필수적인 속성과 그 타입을 계약(Contract)하는 역할을 합니다.
    -   **`[]`**: 이 대괄호 `[]`가 붙어있는 이유는 `menus` prop이 **이러한 구조를 가진 객체들의 배열(Array)**임을 나타냅니다. 즉, `menus`는 단일 객체가 아니라 여러 개의 동일한 구조를 가진 객체들로 구성된 목록임을 의미합니다.
    -   **배열이 아닌 경우**: 네, 맞습니다. 만약 `menus` prop이 배열이 아니라 단 하나의 객체만을 받는다면, 타입 정의에서 마지막의 `[]`는 붙이지 않습니다. 예를 들어, `menu: { name: string; icon: string; route: string }` 와 같이 정의할 수 있습니다.

### **`SelfUnderstandingTestPage.vue`와 `useSurvey.ts`의 로딩 및 실행 흐름**

-   **질문**: `SelfUnderstandingTestPage.vue` 파일이 불러와질 때, 연결되어 있는 `useSurvey.ts` 파일도 읽어와지고, 그 때 `onMounted`로 인해 `loadSurvey()`가 가장 먼저 실행되는지?
-   **답변**: 네, 사용자님의 이해가 정확합니다. 다음은 그 과정에 대한 상세 설명입니다.
    1.  **컴포넌트 로딩 및 스크립트 실행**: `SelfUnderstandingTestPage.vue`가 로드되고 초기화될 때 (예: 해당 라우트로 이동할 때), 해당 컴포넌트의 `<script setup>` 블록이 실행됩니다.
    2.  **`useSurvey` 가져오기 및 실행**:
        *   `SelfUnderstandingTestPage.vue`의 `<script setup>` 내부에는 `import { useSurvey } from '../composables/useSurvey'` 코드가 있습니다.
        *   이후 `const { ... } = useSurvey()`가 바로 호출되면서 `useSurvey.ts`에 정의된 `useSurvey` 함수가 실행됩니다.
        *   이 시점에서 `useSurvey` 내부의 모든 반응형 상태(`ref`, `reactive`) 및 계산된 속성(`computed`)이 초기화됩니다.
    3.  **`onMounted` 훅 등록**: `useSurvey.ts` 내부의 `onMounted(() => { loadSurvey() })` 라인은 `loadSurvey()` 함수를 `SelfUnderstandingTestPage.vue` 컴포넌트의 특정 생명주기 시점(`mounted` 후)에 호출하도록 등록합니다.
    4.  **컴포넌트 마운팅**: Vue는 `SelfUnderstandingTestPage.vue`의 설정을 계속하고 렌더링합니다. 컴포넌트(및 해당 템플릿)가 DOM에 성공적으로 마운트되면 (즉, 페이지에 표시되고 상호작용할 수 있게 되면), Vue는 `onMounted` 훅에 등록된 콜백 함수들을 트리거합니다.
    5.  **`loadSurvey()` 실행**: `onMounted` 훅에 따라, 설문 데이터를 가져오는 `loadSurvey()` 함수가 실행됩니다.

    요약하자면, `useSurvey` 컴포저블 자체는 `SelfUnderstandingTestPage.vue` 스크립트가 실행될 때 "읽혀지고" 초기 설정 코드가 실행됩니다. 그런 다음, 컴포넌트가 마운트되고 데이터를 표시할 준비가 된 *후*에 실제로 데이터를 가져오는 `loadSurvey()` 함수가 "가장 먼저" 실행됩니다.

### **`loadSurvey()` 및 `fetchSurveyForm()` 함수 분석**

-   **`loadSurvey()`**: 설문 데이터를 비동기적으로 불러오는 핵심 함수입니다. `isLoading`과 `error` 상태를 관리하며 `try...catch...finally` 구문을 통해 안전하게 API를 호출합니다.
-   **`fetchSurveyForm()`**: `axios` 인스턴스(`req`)를 사용하여 실제 API 엔드포인트 (`/api/survey/form`)에 GET 요청을 보내는 서비스 함수입니다.

### **조건부 렌더링 (`v-if`, `v-else-if`)**

-   **질문**: `SelfUnderstandingTestPage.vue`에서 `<template v-else-if="currentPage">`는 왜 `v-else-if`인가?
-   **답변**: 페이지의 상태에 따라 하나의 화면만 보여주기 위함입니다.
    1.  `v-if="isLoading"`: 로딩 중이면 **로딩 화면**을 보여줍니다.
    2.  `v-else-if="error"`: 로딩 중이 아니고 에러가 있으면 **에러 화면**을 보여줍니다.
    3.  `v-else-if="currentPage"`: 로딩 중도 아니고 에러도 없으며, 표시할 페이지 데이터가 있을 때만 **실제 설문 내용**을 보여줍니다. 이는 명확한 UI 흐름을 만듭니다.

### **`currentPage`의 이중 역할 (조건문과 데이터 소스)**

-   **질문**: `<template v-else-if="currentPage">`에서 `currentPage`는 단순히 값이 Truthy/Falsy인지 판단하기 위한 것인지, 아니면 실제 값이 중요한지?
-   **답변**: 두 가지 역할 모두 수행하며, 아주 정확한 질문입니다.
    1.  **게이트키퍼(Gatekeeper) 역할**: `v-else-if` 조건문 자체에서는 `currentPage`의 값이 Truthy인지 Falsy인지만 확인합니다. 데이터가 성공적으로 로드되어 객체가 할당되면 Truthy가 되어 템플릿 렌더링을 허용하고, 초기값이거나 로딩 실패 시 `null`이면 Falsy가 되어 렌더링을 막습니다.
    2.  **데이터 소스(Data Source) 역할**: 일단 렌더링이 허용되면, `<template>` 블록 **내부**에서는 `currentPage`의 실제 내용(객체)이 매우 중요해집니다. 내부 코드들은 `currentPage.type`, `currentPage.questions`와 같이 객체의 속성에 직접 접근하여 화면을 동적으로 구성하기 때문입니다.
-   **결론**: `currentPage`는 렌더링 여부를 결정하는 '조건'인 동시에, 렌더링할 내용을 구성하는 '데이터'입니다.

### **`currentPartInfo` 분석 (`src/modules/survey/composables/useSurvey.ts`)**

-   **질문**: `return partLabels[page.part] || null`은 무엇을 반환하는가?
-   **답변**: 이 코드는 `partLabels` 객체에서 현재 페이지의 파트 코드(`page.part`)에 해당하는 정보를 찾아 반환하고, 만약 해당하는 정보가 없을 경우 `undefined` 대신 `null`을 반환합니다. 이는 인덱스가 아닌 **key 기반 조회 방식**입니다.
    -   **`partLabels[page.part]`**: `partLabels` 객체에서 `page.part` 변수가 가진 값(예: 'T1')을 `key`로 사용하여 해당하는 값(예: `{ number: 1, name: '성격' }`)을 찾습니다. 일치하는 `key`가 없으면 `undefined`를 반환합니다.
    -   **`|| null`**: 왼쪽 표현식(`partLabels[page.part]`)의 결과가 Falsy 값(`undefined` 등)일 경우, 오른쪽의 `null`을 대신 반환합니다. 이는 `currentPartInfo`가 항상 예측 가능한 값(객체 또는 `null`)을 갖도록 보장하는 안전 장치입니다.
-   **결론**: `currentPartInfo`는 `computed` 속성으로서, 현재 페이지(`currentPage`)에 따라 `partLabels` 조회 테이블을 참조하여 현재 설문 파트의 번호와 이름이 담긴 객체를 동적으로 계산하여 반환합니다.

### **`page` 객체와 `part` 속성에 대한 추가 설명**

-   **질문**: `page`라는 객체는 `currentPage.value`를 값으로 가지니까, 숫자 데이터 아니야? 그 `page` 객체에 `part`라는 속성이 들어있어?
-   **답변**:
    -   **`page`는 숫자 데이터가 아닙니다.** `page` 변수는 `currentPage.value`에서 할당받으며, `currentPage.value`는 `allPages` 배열에서 `currentPageIndex.value`(숫자 인덱스)에 해당하는 요소를 가져온 것입니다. 이 요소는 `PageInfo` 타입의 **객체**입니다.
    -   **네, `page` 객체 안에는 `part`라는 속성이 들어 있습니다.** `useSurvey.ts`에서 `PageInfo` 타입을 임포트하며, 이 `PageInfo` 인터페이스(정의는 `src/modules/survey/types/survey.ts`에 있을 것으로 예상)에 `part: string;` 속성이 명시되어 있습니다. 이 `part` 속성은 현재 설문 페이지가 어떤 파트에 속하는지를 나타내는 문자열 값(예: `'T1'`, `'T21'`)을 가집니다. 그래서 `partLabels[page.part]`와 같이 객체의 동적인 키로 사용될 수 있는 것입니다.
    -   **요약**: `currentPageIndex.value`가 숫자 인덱스이지만, `currentPage.value`와 그 값인 `page`는 그 인덱스에 해당하는 페이지 정보를 담고 있는 객체이며, 이 객체는 `part` 속성을 포함합니다.
