// 피처 플래그 — 런칭 후 재오픈용.
// 나브 노출·라우트 진입점을 이 플래그로 감싸되, 화면/라우트 코드 자체는 보존한다.
// 재오픈 시 해당 값만 true 로 바꾸면 나브·딥링크가 함께 살아난다.
// (2026-07-31 나브 3탭 축소: 커뮤니티·커리어 베타 비활성)
export const features = {
  community: false,
  career: false,
} as const

export type FeatureKey = keyof typeof features
