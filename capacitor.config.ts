import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vue3.app',
  appName: 'Vue3 App',
  webDir: 'dist',

  // 프로덕션 웹서버 URL (배포 후 실제 URL로 변경)
  server: {
    // 프로덕션 URL - 배포된 웹사이트 주소
    url: process.env.CAPACITOR_SERVER_URL || 'https://your-production-domain.com',
    // 클리어텍스트(HTTP) 허용 여부 - 개발시에만 true
    cleartext: process.env.NODE_ENV === 'development',
  },

  // iOS 설정
  ios: {
    // 쿠키 및 세션 유지
    allowsLinkPreview: true,
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },

  // Android 설정
  android: {
    // 하드웨어 가속 사용
    allowMixedContent: false,
  },

  // 플러그인 설정 (캐시, 세션 등)
  plugins: {
    // 스플래시 스크린
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
