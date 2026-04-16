<!-- <template>
  <div class="self-understanding">
    <h1 class="title">자기이해 테스트</h1>
    <RouterLink class="start-button" to="/self-understanding/guide"> 시작하기 </RouterLink>
  </div>
</template> -->

<template>
  <div class="lh-page">

    <!-- NAV -->
    <nav class="m-nav">
      <img src="/Symbol_Logo.svg" alt="LightHouse" class="nav-logo" />
      <RouterLink class="m-nav-btn" to="/self-understanding/guide"> 검사 시작 → </RouterLink>
    </nav>

    <!-- HERO -->
    <section class="m-hero">
      <div class="m-badge"><span class="m-badge-dot" />지금 무료로 시작할 수 있어</div>
      <h1 class="m-hero-title">
        남들 기준 말고<br>
        <span class="y">'나'를 기준</span>으로<br>
        <span class="s">진로를 찾아봐</span>
      </h1>
      <p class="m-hero-sub">나를 제대로 알면, 진로가 보여.<br>LightHouse가 나만의 방향을 밝혀줄게.</p>
      <RouterLink class="m-cta" to="/self-understanding/guide"> 무료로 검사 시작하기 → </RouterLink>
      <p class="m-hint">회원가입 없이 바로 시작 · 약 5분 소요</p>
      <div class="m-trust">
        <div class="m-trust-item">
          <span class="m-trust-num">537개</span>
          <span class="m-trust-label">직업 정보</span>
        </div>
        <div class="m-trust-div" />
        <div class="m-trust-item">
          <span class="m-trust-num">3가지</span>
          <span class="m-trust-label">검사 영역</span>
        </div>
        <div class="m-trust-div" />
        <div class="m-trust-item">
          <span class="m-trust-num">무료</span>
          <span class="m-trust-label">간이 검사</span>
        </div>
      </div>
    </section>

    <!-- PAIN -->
    <section class="m-sec gray">
      <p class="m-lbl y">공감해?</p>
      <h2 class="m-ttl">이런 고민 해본 적 있지?</h2>
      <p class="m-sub">많은 사람들이 같은 고민을 해</p>
      <div class="pain-list">
        <div v-for="item in painItems" :key="item.text" class="pain-card">
          <span class="pain-icon">{{ item.emoji }}</span>
          <p class="pain-text" v-html="item.text" />
        </div>
      </div>
    </section>

    <!-- SOLUTION -->
    <section class="m-sec white">
      <p class="m-lbl s">LightHouse가 하는 일</p>
      <h2 class="m-ttl">찾고 → 알고 →<br>실제로 이루는 플랫폼</h2>
      <p class="m-sub">나를 아는 것부터, 실제 달성까지</p>
      <div class="steps">
        <div v-for="(step, i) in solutionSteps" :key="i" class="step">
          <div class="step-left">
            <div class="step-num" :class="i % 2 === 0 ? 'y' : 's'">{{ i + 1 }}</div>
            <div v-if="i < solutionSteps.length - 1" class="step-line" />
          </div>
          <div>
            <div class="step-title">{{ step.title }}</div>
            <div class="step-desc">{{ step.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TEST -->
    <section class="m-sec gray">
      <p class="m-lbl y">검사 미리보기</p>
      <h2 class="m-ttl">3가지를 종합해서<br>나만의 진로 찾기</h2>
      <p class="m-sub">나를 입체적으로 이해하는 검사야</p>
      <div class="test-list">
        <div
          v-for="test in testCards"
          :key="test.title"
          class="test-card"
          :class="test.border"
        >
          <div class="test-head">
            <div class="test-icon" :class="test.iconBg">{{ test.emoji }}</div>
            <div>
              <div class="test-card-title">{{ test.title }}</div>
              <div class="test-card-q">{{ test.question }}</div>
            </div>
          </div>
          <div class="test-card-desc">{{ test.desc }}</div>
          <span class="badge-pill" :class="test.badge">{{ test.tag }}</span>
        </div>
      </div>
    </section>

    <!-- 결과 미리보기 -->
    <section class="result-section">
      <p class="m-lbl y">결과 미리보기</p>
      <h2 class="m-ttl">검사하면 이런 결과가 나와</h2>
      <p class="m-sub">나를 입체적으로 분석한 진짜 진로 리포트</p>
      <div class="result-preview-card">

        <!-- 진로 유형 히어로 -->
        <div class="rp-hero">
          <p class="rp-type-label">나의 진로 유형</p>
          <p class="rp-type-name">거침없는 모험가</p>
          <p class="rp-type-sub">새로운 것을 두려워하지 않고<br>직접 뛰어들며 경험으로 성장하는 유형</p>
          <div class="rp-tags">
            <span class="rptag y">높은 자극추구</span>
            <span class="rptag s">강한 자율성</span>
            <span class="rptag w">창의적 문제해결</span>
          </div>
        </div>

        <div class="rp-body">
          <!-- 성격 9가지 -->
          <p class="rp-sec-title">성격 분석 · 9가지 요소</p>
          <div class="trait-list">
            <div v-for="trait in traits" :key="trait.name" class="trait-row">
              <span class="trait-name">{{ trait.name }}</span>
              <div class="trait-bar-wrap">
                <div class="trait-bar" :class="trait.color" :style="{ width: trait.value + '%' }" />
              </div>
              <span class="trait-val" :class="trait.color">{{ trait.value }}</span>
              <span class="trait-cmp" :class="trait.cmpClass">{{ trait.cmp }}</span>
            </div>
          </div>

          <!-- 좋아하는 일 -->
          <p class="rp-sec-title">좋아하는 일</p>
          <div class="like-card">
            <p class="like-text">
              <span class="chip chip-s">콘텐츠·미디어</span> 분야에서<br>
              <span class="chip chip-y">기획력과 스토리텔링</span>을 활용해<br>
              <span class="chip chip-p">자유와 영향력</span>을 쫓는 일을 할 때 가장 빛나요.
            </p>
          </div>

          <!-- 업무환경 -->
          <p class="rp-sec-title" style="margin-top:16px;">업무 환경</p>
          <div class="env-mini-list">
            <div v-for="env in envItems" :key="env.badge" class="env-mini" :class="env.type">
              <span style="font-size:14px;flex-shrink:0;">{{ env.emoji }}</span>
              <div>
                <div class="env-mini-badge" :class="env.type">{{ env.badge }}</div>
                <div class="env-mini-text">{{ env.text }}</div>
              </div>
            </div>
          </div>

          <!-- 추천 진로 -->
          <p class="rp-sec-title">추천 진로</p>
          <div class="rec-row">
            <div class="rec-card field">
              <div class="rec-card-label y">추천 분야</div>
              <div class="rec-icon">🎬</div>
              <div class="rec-name">콘텐츠<br>크리에이티브</div>
              <div class="rec-desc">기획·제작·브랜딩 등 창의 콘텐츠 전반</div>
              <div class="rec-fit">
                <div class="rec-fit-bar"><div class="rec-fit-fill y" style="width:91%" /></div>
                <span class="rec-fit-pct y">91%</span>
              </div>
            </div>
            <div class="rec-card job">
              <div class="rec-card-label s">추천 직업</div>
              <div class="rec-icon">✏️</div>
              <div class="rec-name">콘텐츠<br>기획자</div>
              <div class="rec-desc">채널 전략부터 콘텐츠 방향 설계까지</div>
              <div class="rec-fit">
                <div class="rec-fit-bar"><div class="rec-fit-fill s" style="width:88%" /></div>
                <span class="rec-fit-pct s">88%</span>
              </div>
            </div>
          </div>

          <div class="lock-row">
            <span style="font-size:16px;flex-shrink:0;">🔒</span>
            <div class="lock-text"><strong>더 많은 추천 직업 &amp; 상세 분석</strong>은 회원가입 후 전체 결과에서 확인할 수 있어</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 지금 이용 가능한 기능 -->
    <section class="m-sec gray">
      <p class="m-lbl y">지금 이용 가능</p>
      <h2 class="m-ttl">바로 쓸 수 있는 기능들</h2>
      <p class="m-sub" style="margin-bottom:20px;">오늘부터 시작할 수 있어</p>
      <div v-for="group in liveFeatures" :key="group.name" class="fgroup">
        <div class="fgroup-header">
          <div class="fgroup-icon" :class="group.iconBg">{{ group.emoji }}</div>
          <span class="fgroup-name">{{ group.name }}</span>
          <span class="live-badge">오픈</span>
        </div>
        <div class="fitem-list">
          <div v-for="item in group.items" :key="item.title" class="fitem">
            <div class="fitem-top">
              <span class="fitem-title">{{ item.title }}</span>
              <span class="fitem-tag-live">오픈</span>
            </div>
            <div class="fitem-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 출시 예정 기능 -->
    <section class="soon-section">
      <p class="m-lbl" style="color:#6B5FCC;">곧 만나요</p>
      <h2 class="m-ttl" style="color:#2B2F6B;margin-bottom:6px;">더 강력해질<br>LightHouse</h2>
      <p class="m-sub" style="color:#8890CC;margin-bottom:20px;">AI + 현직자 연결로 진로 달성이 훨씬 빨라져</p>
      <div class="soon-header-banner">
        <span class="soon-banner-icon">🚀</span>
        <div>
          <div class="soon-banner-title">업그레이드 예고</div>
          <div class="soon-banner-sub">AI + 현직자 연결로 진로 달성이 훨씬 빨라져</div>
        </div>
      </div>
      <div v-for="group in soonFeatures" :key="group.name" class="soon-fgroup">
        <div class="soon-fgroup-header">
          <div class="soon-fgroup-icon">{{ group.emoji }}</div>
          <span class="soon-fgroup-name">{{ group.name }}</span>
          <span class="soon-badge">출시 예정</span>
        </div>
        <div class="soon-fitem-list">
          <div v-for="item in group.items" :key="item.title" class="soon-fitem">
            <div class="soon-fitem-top">
              <span class="soon-fitem-title">{{ item.title }}</span>
              <span class="soon-fitem-tag">예정</span>
            </div>
            <div class="soon-fitem-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="m-sec dark">
      <p class="m-lbl w">차별점</p>
      <h2 class="m-ttl w" style="margin-bottom:6px;">숫자로 보는 LightHouse</h2>
      <p class="m-sub w" style="margin-bottom:20px;">막연한 검사가 아닌 실질적 진로 데이터</p>
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.num" class="stat-card" :class="stat.bg">
          <div class="stat-num" :class="stat.color">{{ stat.num }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="m-sec yellow" style="text-align:center;">
      <div class="final-sky">💙 무료로 시작할 수 있어</div>
      <h2 class="final-title">지금, 나를 찾는<br>5분을 써봐</h2>
      <p class="final-sub">회원가입 없이 바로 시작.<br>결과 저장 시 더 많은 기능 이용 가능.</p>
      <RouterLink class="final-cta" to="/self-understanding/guide"> 무료로 검사 시작하기 → </RouterLink>
      <p class="final-login" style="margin-top:12px;">
        이미 계정이 있어? <a @click="onLoginClick">로그인하기</a>
      </p>
    </section>

    <!-- FOOTER -->
    <footer class="m-footer">
      <img src="/Symbol.svg" alt="LightHouse" class="footer-logo" />
      <span class="m-footer-copy">© 2025 LightHouse</span>
    </footer>

  </div>
</template>

<script setup lang="ts">
// -------------------------------------------------------
// Props / Emits
// -------------------------------------------------------
const emit = defineEmits(['start', 'login'])

function onLoginClick() {
  emit('login')
}

// -------------------------------------------------------
// Data
// -------------------------------------------------------
const painItems = [
  { emoji: '😮‍💨', text: '<strong>취업 잘 된다고 해서</strong> 선택했는데 내가 진짜 원하는 건지 모르겠어' },
  { emoji: '🤯', text: '검사 다 해봤는데 <strong>결과가 다 달라서</strong> 뭘 믿어야 할지 모르겠어' },
  { emoji: '😶', text: '하고 싶은 게 없는 건지 <strong>아직 못 찾은 건지</strong> 구분이 안 돼' },
  { emoji: '😩', text: '진로를 정해도 <strong>어디서부터 해야 할지</strong> 너무 막막해' },
]

const solutionSteps = [
  { title: '나를 제대로 알기', desc: '성격·재능·가치관·업무환경 종합 분석' },
  { title: '나에게 맞는 진로 찾기', desc: '537개 직업 정보 + 실제 직업인 후기' },
  { title: '나만의 프로젝트로 달성', desc: 'TODO 기반 진로달성 프로젝트 설계' },
  { title: '기록이 스펙이 되다', desc: '성장 데이터 → 채용 포트폴리오화' },
]

const testCards = [
  {
    title: '성격 & 기질', question: '나는 어떤 사람인가?', emoji: '🧠',
    desc: '타고난 기질과 성격 패턴 분석',
    border: 'cy', iconBg: 'iy', tag: '성격·기질 분석', badge: 'y',
  },
  {
    title: '재능 / 흥미 / 가치관', question: '내가 좋아하는 일은?', emoji: '✨',
    desc: '잘하는 것, 즐기는 것, 소중한 것 탐색',
    border: 'cs', iconBg: 'is', tag: '재능·흥미·가치관', badge: 's',
  },
  {
    title: '업무 환경', question: '최적의 환경은?', emoji: '🌿',
    desc: '내가 빛나는 업무환경·조직문화 파악',
    border: '', iconBg: 'ip', tag: '환경 적합도', badge: 'p',
  },
]

const traits = [
  { name: '외향성',     value: 82, color: 'hi', cmp: '+24↑', cmpClass: 'up' },
  { name: '기발함',     value: 76, color: 'hi', cmp: '+18↑', cmpClass: 'up' },
  { name: '자극추구',   value: 90, color: 'hi', cmp: '+32↑', cmpClass: 'up' },
  { name: '자율성',     value: 78, color: 'mi', cmp: '+20↑', cmpClass: 'up' },
  { name: '성실성',     value: 58, color: 'mi', cmp: '±0',   cmpClass: 'eq' },
  { name: '우호성',     value: 62, color: 'mi', cmp: '+4↑',  cmpClass: 'eq' },
  { name: '연대감',     value: 44, color: 'lo', cmp: '-14↓', cmpClass: 'dn' },
  { name: '위험회피',   value: 28, color: 'lo', cmp: '-30↓', cmpClass: 'dn' },
  { name: '사회적민감성', value: 50, color: 'lo', cmp: '-8↓',  cmpClass: 'dn' },
]

const envItems = [
  { type: 'good', emoji: '✅', badge: '능률 오르는 환경', text: '자율 출퇴근·수평적 조직·새 시도를 장려하는 문화' },
  { type: 'bad',  emoji: '⚠️', badge: '피하면 좋은 환경', text: '엄격한 위계·반복 단순업무·변화 없는 루틴' },
  { type: 'ok',   emoji: '🙂', badge: '적당히 괜찮은 환경', text: '가이드 안에서 자율성이 있는 환경' },
]

const liveFeatures = [
  {
    name: '적성 검사', emoji: '🔍', iconBg: 'iy',
    items: [
      { title: '성격·재능·환경 검사', desc: '3가지 영역 종합 간이 검사' },
      { title: '나만의 결과 리포트', desc: '진로 유형 · 추천 직업군 · 업무환경' },
    ],
  },
  {
    name: '진로백과', emoji: '📚', iconBg: 'is',
    items: [
      { title: '진로 정보', desc: '537개 직업의 상세 정보 탐색' },
      { title: '채용 정보', desc: '목표 직무의 현재 채용 현황' },
    ],
  },
  {
    name: '진로달성', emoji: '🎯', iconBg: 'ig',
    items: [
      { title: '메타 플랜', desc: '현재 → 목표까지의 큰 그림' },
      { title: '프로그레스 플랜', desc: '다음 목적지까지의 세부 계획' },
      { title: 'TODO', desc: '매일의 루틴 + 오늘의 세부 계획' },
    ],
  },
  {
    name: '함께성장', emoji: '🌱', iconBg: 'ip',
    items: [
      { title: '성장 피드', desc: 'TODO·루틴 등 매일의 성장을 피드로 공유' },
    ],
  },
]

const soonFeatures = [
  {
    name: '진로백과 +', emoji: '📚',
    items: [
      { title: '직업인 후기', desc: '실제 직업인들의 솔직한 직업 생활 후기' },
      { title: '직업인 플랜 공개', desc: '현직자의 메타플랜·프로그레스 플랜·루틴 공개' },
    ],
  },
  {
    name: '진로달성 AI', emoji: '🤖',
    items: [
      { title: 'AI 플래닝', desc: '현재 상황·목표 진로를 고려한 AI 맞춤 플랜 자동 생성' },
      { title: 'AI 진로 매니저', desc: '나만의 진로 달성을 24시간 돕는 AI 코치' },
    ],
  },
  {
    name: '멘토링', emoji: '🤝',
    items: [
      { title: '1:1 진로 멘토링', desc: '목표 진로의 현직 직업인과 1:1로 직접 연결' },
    ],
  },
  {
    name: '직무체험', emoji: '💼',
    items: [
      { title: '직무 체험 프로젝트', desc: '현업 직업인과 함께하는 실제 직무 체험 프로젝트' },
    ],
  },
]

const stats = [
  { num: '537개', label: '방대한 직업 정보',   bg: 'cy', color: 'y' },
  { num: '3가지', label: '입체적 검사 영역',   bg: 'cs', color: 's' },
  { num: '실제',  label: '직업인 진로 후기',   bg: 'cy', color: 'y' },
  { num: '1:1',   label: '맞춤 프로젝트 설계', bg: 'cs', color: 's' },
]
</script>
