<template>
  <div class="prep-tab">
    <section class="prep-section">
      <div class="prep-section__head">
        <h3 class="prep-section__title">현직자들의 준비과정 ({{ journeys.length }})</h3>
        <p class="prep-section__desc">이 직업에 도달한 사람들이 쌓아온 준비과정과 루틴이에요.</p>
      </div>

      <div v-if="journeys.length === 0" class="prep-empty">
        아직 준비과정이 등록되지 않았습니다.
      </div>

      <ul v-else class="prep-list">
        <li v-for="journey in journeys" :key="journey.id" class="prep-card">
          <!-- 인물 헤더 -->
          <div class="prep-card__head">
            <div class="prep-card__person">
              <span class="prep-card__avatar">🧑</span>
              <div class="prep-card__who">
                <span class="prep-card__author">{{ journey.author }}</span>
                <span class="prep-card__role">現 {{ journey.role }}</span>
              </div>
            </div>
            <span class="prep-card__years">{{ journey.years }}년 준비</span>
          </div>

          <p class="prep-card__headline">“{{ journey.headline }}”</p>

          <!-- 준비과정 -->
          <div class="prep-block">
            <span class="prep-block__label">준비과정 {{ journey.projects.length }}</span>
            <div class="prep-block__groups">
              <div v-for="group in groupedProjects(journey)" :key="group.category" class="prep-block__group">
                <p class="prep-block__group-head" :style="{ color: categoryMeta[group.category].color }">
                  {{ categoryMeta[group.category].label }} {{ group.items.length }}
                </p>
                <ul class="prep-block__list">
                  <li v-for="item in group.items" :key="item" class="prep-block__item">
                    <span class="list-dot" />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 루틴 (프로젝트와 별개) -->
          <div class="prep-block prep-block--routine">
            <span class="prep-block__label">루틴 {{ journey.routines.length }}</span>
            <ul class="prep-block__list">
              <li v-for="routine in journey.routines" :key="routine.name" class="prep-routine">
                <span class="prep-routine__freq">{{ routine.freq }}</span>
                <span class="prep-routine__name">{{ routine.name }}</span>
              </li>
            </ul>
          </div>

          <!-- 요약 푸터 -->
          <!-- <div class="prep-card__footer">
            <span
              v-for="cat in categoryOrder"
              v-show="categoryCount(journey, cat)"
              :key="cat"
              class="prep-card__cat"
              :style="{ background: categoryMeta[cat].bg, color: categoryMeta[cat].color }"
            >{{ categoryMeta[cat].label }} {{ categoryCount(journey, cat) }}</span>
          </div> -->
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectCategory } from '@/modules/career-design/types/career-design'

const props = defineProps<{ jobCode: string }>()

/** 한 직업인의 준비 여정 (백엔드 준비 전 하드코딩). jobCode 별로 분리 */
interface JourneyItem {
  category: ProjectCategory
  name: string
}
interface RoutineItem {
  freq: string   // 예: '매일', '주 2회'
  name: string
}
interface PreparationJourney {
  id: string
  author: string
  role: string         // 現 직함
  years: number
  headline: string     // 한줄 소개
  projects: JourneyItem[]
  routines: RoutineItem[]
}

const categoryMeta: Record<ProjectCategory, { label: string; color: string; bg: string }> = {
  qualification: { label: '자격요건', color: '#1DB95A', bg: '#E8F9EF' },
  knowledge:     { label: '분야지식', color: '#F47820', bg: '#FFF2E8' },
  skill:         { label: '직무기술', color: '#A855F7', bg: '#F5EEFF' },
  portfolio:     { label: '포트폴리오', color: '#4480F5', bg: '#EBF2FF' },
}
const categoryOrder: ProjectCategory[] = ['qualification', 'knowledge', 'skill', 'portfolio']

// 예술·디자인·방송관리자(013601): 문화·예술·방송 기관 운영 관리자로 도달한 현직자 여정
const SAMPLE_JOURNEYS_BY_JOB: Record<string, PreparationJourney[]> = {
  '013601': [
    {
      id: 'j1',
      author: '김서연',
      role: '세종문화회관 공연기획 팀장',
      years: 3,
      headline: '무대 뒤 잡일부터 시작했어요. 공연은 결국 사람이랑 예산 싸움이더라고요.',
      projects: [
        { category: 'knowledge', name: '문화예술경영 기초 다지기' },
        { category: 'skill', name: '공연장 운영 현장 경험' },
        { category: 'skill', name: '공연 프로젝트 매니지먼트' },
        { category: 'skill', name: '예산·정산 실무' },
        { category: 'qualification', name: '예술경영 아카데미 수료' },
        { category: 'portfolio', name: '기획공연 1건 총괄' },
        { category: 'skill', name: '팀 리더십·조직관리' },
      ],
      routines: [
        { freq: '매일', name: '공연 리뷰·업계 뉴스 스크랩' },
        { freq: '주 2회', name: '타 공연장 관람하며 기획 벤치마킹' },
      ],
    },
    {
      id: 'j2',
      author: '이도현',
      role: 'CJ ENM 방송제작 운영 매니저',
      years: 4,
      headline: 'PD만 꿈꿨는데, 판을 굴러가게 하는 건 결국 운영이더라고요.',
      projects: [
        { category: 'knowledge', name: '방송 콘텐츠 제작 파이프라인 이해' },
        { category: 'skill', name: '조연출 현장 실무' },
        { category: 'skill', name: '편성·제작 예산 관리' },
        { category: 'knowledge', name: '프로그램 기획 실무' },
        { category: 'skill', name: '외주 제작 관리' },
        { category: 'qualification', name: '저작권·계약 실무 교육' },
        { category: 'portfolio', name: '시즌 프로그램 제작 총괄' },
        { category: 'skill', name: '제작팀 리소스 운영' },
      ],
      routines: [
        { freq: '매일', name: '담당 프로그램 시청률·피드백 정리' },
        { freq: '주 1회', name: '경쟁사 편성표·제작 트렌드 리서치' },
      ],
    },
    {
      id: 'j3',
      author: '박민정',
      role: '국립현대미술관 전시운영 파트장',
      years: 5,
      headline: '도슨트로 3년, 관람객 동선 하나에도 기획이 숨어있다는 걸 배웠어요.',
      projects: [
        { category: 'knowledge', name: '미술사·큐레이팅 기초' },
        { category: 'skill', name: '도슨트·전시 운영 보조' },
        { category: 'skill', name: '전시 기획 실무' },
        { category: 'skill', name: '전시 예산·공간 운영' },
        { category: 'portfolio', name: '대형 기획전 코디네이션' },
        { category: 'qualification', name: '예술경영지원센터 심화과정' },
        { category: 'skill', name: '전시운영팀 관리·조직 리더십' },
      ],
      routines: [
        { freq: '매일 30분', name: '전시 아카이브·도록 리서치' },
        { freq: '주 1회', name: '타 미술관 전시 관람·기록' },
      ],
    },
  ],

  // 광고·홍보·마케팅전문가(024101): 브랜드·퍼포먼스·PR 세 갈래로 도달한 현직자 여정
  '024101': [
    {
      id: 'j1',
      author: '정하늘',
      role: '이커머스 브랜드 퍼포먼스 마케팅 리드',
      years: 3,
      headline: '숫자를 못 읽으면 감으로 돈을 태우게 돼요. 광고비는 곧 실력입니다.',
      projects: [
        { category: 'knowledge', name: '마케팅 원론·소비자행동 기초' },
        { category: 'skill', name: 'GA4·데이터 분석 실무' },
        { category: 'skill', name: '메타·구글 광고 운영' },
        { category: 'skill', name: 'A/B 테스트 설계와 해석' },
        { category: 'qualification', name: '구글 애널리틱스 자격 취득' },
        { category: 'portfolio', name: '자사몰 ROAS 개선 캠페인 1건' },
        { category: 'skill', name: '광고 예산 배분·성과 리포팅' },
      ],
      routines: [
        { freq: '매일', name: '전일 광고 지표 대시보드 점검' },
        { freq: '주 2회', name: '경쟁사 광고 소재 수집·분석' },
      ],
    },
    {
      id: 'j2',
      author: '서지훈',
      role: '종합광고대행사 AE 팀장',
      years: 4,
      headline: '좋은 기획서보다 광고주를 설득하는 한 문장이 더 어렵더라고요.',
      projects: [
        { category: 'knowledge', name: '광고 기획·카피라이팅 기초' },
        { category: 'skill', name: '경쟁 PT 기획서 작성' },
        { category: 'skill', name: '광고주 커뮤니케이션 실무' },
        { category: 'knowledge', name: '매체 특성·미디어 플래닝 이해' },
        { category: 'skill', name: '제작팀·매체팀 협업 조율' },
        { category: 'portfolio', name: '통합 캠페인 수주 및 집행' },
        { category: 'skill', name: '캠페인 예산·일정 관리' },
      ],
      routines: [
        { freq: '매일', name: '광고 트렌드·수상작 아카이빙' },
        { freq: '주 1회', name: '자사 제안서 리뷰·피드백 정리' },
      ],
    },
    {
      id: 'j3',
      author: '한예은',
      role: '스타트업 브랜드 커뮤니케이션 매니저',
      years: 5,
      headline: 'PR은 기사 한 줄이 아니라 회사의 말투를 만드는 일이었어요.',
      projects: [
        { category: 'knowledge', name: '언론홍보·PR 이론 학습' },
        { category: 'skill', name: '보도자료 작성·배포 실무' },
        { category: 'skill', name: '기자 네트워크 관리' },
        { category: 'skill', name: '브랜드 메시지·톤앤매너 정립' },
        { category: 'qualification', name: '컨벤션기획사 자격 취득' },
        { category: 'portfolio', name: '브랜드 리뉴얼 캠페인 총괄' },
        { category: 'skill', name: '위기관리 커뮤니케이션 대응' },
      ],
      routines: [
        { freq: '매일', name: '자사·업계 기사 모니터링' },
        { freq: '주 1회', name: '콘텐츠 채널 반응 분석·회고' },
      ],
    },
  ],
}

const journeys = computed<PreparationJourney[]>(() => SAMPLE_JOURNEYS_BY_JOB[props.jobCode] ?? [])

function categoryCount(j: PreparationJourney, cat: ProjectCategory): number {
  return j.projects.filter(i => i.category === cat).length
}

// 준비 활동을 카테고리별로 묶고, 항목 많은 그룹부터 노출
function groupedProjects(journey: PreparationJourney): { category: ProjectCategory; items: string[] }[] {
  const groups = new Map<ProjectCategory, string[]>()
  for (const item of journey.projects) {
    if (!groups.has(item.category)) groups.set(item.category, [])
    groups.get(item.category)!.push(item.name)
  }
  return [...groups.entries()]
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => b.items.length - a.items.length)
}
</script>
