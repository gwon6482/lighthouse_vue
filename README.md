# Lighthouse Vue - 자기이해 설문 시스템

Vue 3 + TypeScript + Vite로 구축된 라이트하우스 자기이해 설문 조사 프론트엔드

## 주요 기능

- ✅ 5가지 파트별 설문 진행 (성격, 재능, 흥미, 가치관, 근무환경)
- ✅ 4가지 질문 타입 지원 (척도형, 다중선택, 우선순위, 3지선다)
- ✅ 진행률 표시 및 페이지 네비게이션
- ✅ 응답 JSON 파일 다운로드
- ✅ 반응형 디자인

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Mobile App (Capacitor)

이 프로젝트는 Capacitor를 사용하여 웹앱을 iOS/Android 앱으로 배포할 수 있습니다.
앱은 WebView 역할만 하며, 웹서버의 콘텐츠를 로드합니다.

### 구조

```
src/           ← Vue 3 개발 (웹 + 앱 공용)
dist/          ← 빌드 결과물
ios/           ← iOS WebView 앱
android/       ← Android WebView 앱
```

### 앱 빌드

```sh
# iOS 앱 빌드 (Xcode 필요, Mac 전용)
npm run app:ios

# Android 앱 빌드 (Android Studio 필요)
npm run app:android

# 네이티브 프로젝트 동기화만
npm run cap:sync
```

### 빌드 후 실행

| 플랫폼 | IDE | 실행 방법 |
|--------|-----|----------|
| iOS | Xcode | 시뮬레이터 선택 → ▶ 클릭 |
| Android | Android Studio | 에뮬레이터 선택 → ▶ 클릭 |

### 앱스토어 배포

```sh
# iOS: Xcode에서
Product → Archive → Distribute App

# Android: Android Studio에서
Build → Generate Signed Bundle / APK
```

### 프로덕션 URL 설정

`capacitor.config.ts`에서 웹서버 URL 수정:

```ts
server: {
  url: 'https://your-production-domain.com',
}
```

## Vercel 배포 가이드

### 1. 환경변수 파일 확인

프로젝트에 다음 파일들이 있어야 합니다:
- `.env.development` - 로컬 개발용 (프록시 사용)
- `.env.production` - 프로덕션용 (실제 API URL)

### 2. GitHub에 코드 푸시

```sh
git add .
git commit -m "Add deployment config"
git push origin main
```

### 3. Vercel 배포

#### 방법 1: Vercel 웹사이트 (권장)

1. [Vercel](https://vercel.com) 로그인
2. **Add New** → **Project** 클릭
3. GitHub 저장소 `lighthouse_vue` 선택 및 Import
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. 환경변수 설정:
   - **Settings** → **Environment Variables**
   - 추가할 변수:
     - Name: `VITE_API_BASE_URL`
     - Value: `https://your-api-server.com` (실제 API 서버 URL로 변경)
     - Environment: Production

6. **Deploy** 클릭

#### 방법 2: Vercel CLI

```sh
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 4. 환경변수 설정 (CLI 사용 시)

```sh
# 프로덕션 환경변수 설정
vercel env add VITE_API_BASE_URL production
# 값 입력: https://your-api-server.com

# 재배포
vercel --prod
```

### 5. 도메인 연결 (선택사항)

Vercel 프로젝트 설정에서:
1. **Settings** → **Domains**
2. 커스텀 도메인 추가
3. DNS 레코드 설정 (Vercel이 안내)

## ⚠️ 배포 전 필수 확인사항

### API 서버 배포

프론트엔드만 배포해서는 동작하지 않습니다. **API 서버도 함께 배포**해야 합니다.

#### 옵션 1: Railway / Render (무료 시작 가능)
```sh
# Railway 사용 예시
npm i -g @railway/cli
railway login
railway init
railway up
```

#### 옵션 2: Vercel Serverless Functions
- API를 `/api` 폴더에 Serverless Function으로 구현
- 같은 도메인에서 운영 가능
- CORS 문제 없음

#### 옵션 3: AWS / GCP / Azure
- EC2, Cloud Run, App Service 등 사용
- 더 많은 제어 및 확장성

### CORS 설정

API 서버에서 Vercel 도메인을 허용해야 합니다:

```js
// Express 예시
app.use(cors({
  origin: [
    'https://your-vercel-domain.vercel.app',
    'https://your-custom-domain.com'
  ]
}))
```

### 환경변수 업데이트

`.env.production` 파일의 API URL을 실제 배포된 API 서버 주소로 변경:

```
VITE_API_BASE_URL=https://your-api-server.com
```

## 프로젝트 구조

```
src/
├── components/survey/   # 설문 질문 컴포넌트
│   ├── ScaleQuestion.vue        # 척도형 (2/5/10지선다)
│   ├── MultiSelectQuestion.vue  # 다중선택
│   ├── PriorityQuestion.vue     # 우선순위
│   └── ThreeChoiceQuestion.vue  # 3지선다 (O/M/X)
├── composables/         # Vue Composables
│   └── useSurvey.ts    # 설문 상태 관리
├── services/           # API 서비스
│   └── surveyApi.ts    # API 통신
├── views/              # 페이지 컴포넌트
│   ├── HomeView.vue
│   ├── SelfUnderstandingView.vue
│   └── SurveyTestView.vue
└── router/             # 라우터 설정
    └── index.ts
```
