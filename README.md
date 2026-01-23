# vue3-project

This template should help get you started developing with Vue 3 in Vite.

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
