<template>
  <div class="cd-proj-write" :style="{ '--cat-color': currentColor }">
    <CdYellowHeader
      title="새로운 프로젝트 추가"
      :subtitle="`${draftPlan.targetJob || '목표 직업'}을 위한 프로젝트를 만들어 보세요`"
      :color="currentColor"
      back-to="/career-design/plan/projects"
    />

    <div class="cd-proj-write__body">
      <!-- 카테고리 선택 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">카테고리</h3>
        <div class="cd-proj-write__categories">
          <div
            v-for="cat in categories"
            :key="cat.value"
            class="cd-proj-write__cat-item"
            :class="{ 'cd-proj-write__cat-item--active': draftProject.category === cat.value }"
            :style="draftProject.category === cat.value ? { borderColor: categoryColorMap[cat.value] } : {}"
            @click="draftProject.category = cat.value"
          >
            <img
              class="cd-proj-write__cat-icon"
              :src="`/career-design/icon-${cat.value}.svg`"
              :alt="cat.label"
            />
            <span
              class="cd-proj-write__cat-label"
              :style="draftProject.category === cat.value ? { color: categoryColorMap[cat.value], fontWeight: '700' } : {}"
            >{{ cat.label }}</span>
          </div>
        </div>
      </div>

      <!-- 프로젝트 이름 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">프로젝트 이름</h3>
        <input
          v-model="draftProject.name"
          class="cd-proj-write__input"
          placeholder="예 : OO강의 듣기"
        />
      </div>

      <!-- 계획 목표 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">계획 목표</h3>
        <input
          v-model="draftProject.goal"
          class="cd-proj-write__input"
          placeholder="예 : OO강의의 완강, OO자격 취득, OO 완성하기"
        />
      </div>

      <!-- 실행 주기 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">실행 주기</h3>
        <div class="cd-proj-write__days">
          <button
            v-for="day in allDays"
            :key="day"
            class="cd-proj-write__day-btn"
            :class="{ 'cd-proj-write__day-btn--active': draftProject.days?.includes(day) }"
            @click="toggleDay(day)"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <!-- 실행 시간 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">실행 시간</h3>
        <p class="cd-proj-write__sub-label">1회 당 실행 시간</p>
        <div class="cd-proj-write__slider-row">
          <input
            v-model.number="draftProject.duration"
            type="range"
            min="15"
            max="180"
            step="15"
            class="cd-proj-write__slider"
          />
          <span class="cd-proj-write__duration-badge">{{ draftProject.duration }}분</span>
        </div>
        <div class="cd-proj-write__slider-labels">
          <span>15분</span><span>3시간</span>
        </div>
        <div class="cd-proj-write__tip">
          💡 추천: 처음 시작할 때는 30-60분이 적당해요. 너무 긴 시간을 설정하면 부담스러울 수 있어요
        </div>
      </div>

      <!-- 우선순위 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">우선순위</h3>
        <div class="cd-proj-write__priorities">
          <button
            v-for="p in priorities"
            :key="p.value"
            class="cd-proj-write__priority-btn"
            :class="[`cd-proj-write__priority-btn--${p.value}`, { 'cd-proj-write__priority-btn--active': draftProject.priority === p.value }]"
            @click="draftProject.priority = p.value"
          >
            {{ p.icon }} {{ p.label }}
          </button>
        </div>
      </div>

      <!-- 알림 설정 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">알림설정</h3>
        <div class="cd-proj-write__notify-row">
          <div class="cd-proj-write__notify-text">
            <span class="cd-proj-write__notify-title">요일 알림</span>
            <span class="cd-proj-write__notify-desc">계획 실행 예정 요일에 아침에 알림을 받아요</span>
          </div>
          <input type="checkbox" v-model="draftProject.notification" class="cd-proj-write__checkbox" />
        </div>
        <div class="cd-proj-write__divider" />
        <div class="cd-proj-write__notify-row">
          <div class="cd-proj-write__notify-text">
            <span class="cd-proj-write__notify-title">놓친 계획 다시 알림</span>
            <span class="cd-proj-write__notify-desc">계획을 실행하지 못했다면, 다음날 다시 알림이 가요</span>
          </div>
          <input type="checkbox" v-model="draftProject.missedNotification" class="cd-proj-write__checkbox" />
        </div>
        <div v-if="draftProject.notification || draftProject.missedNotification" class="cd-proj-write__time-field">
          <label class="cd-proj-write__time-label">알림 시간</label>
          <div class="cd-proj-write__time-input">
            <input v-model="draftProject.notificationTime" type="time" class="cd-proj-write__time-raw" />
            <span class="cd-proj-write__time-display">오전 {{ draftProject.notificationTime }}</span>
            <span>🕐</span>
          </div>
        </div>
      </div>

      <!-- 메모 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">메모 (선택)</h3>
        <textarea
          v-model="draftProject.memo"
          class="cd-proj-write__textarea"
          placeholder="추가로 기억하고 싶은 내용이나 세부 계획을 작성하세요"
          rows="4"
        />
      </div>

      <!-- 프로젝트 기간 -->
      <div class="cd-proj-write__section">
        <h3 class="cd-proj-write__label">프로젝트 기간</h3>
        <p class="cd-proj-write__sub-label">몇 주차 계획으로 만들까요?</p>
        <div class="cd-proj-write__stepper">
          <button
            class="cd-proj-write__step-btn"
            :disabled="weeks <= MIN_WEEKS"
            @click="setWeeks(weeks - 1)"
          >−</button>
          <span class="cd-proj-write__step-value">{{ weeks }}<em>주</em></span>
          <button
            class="cd-proj-write__step-btn"
            :disabled="weeks >= MAX_WEEKS"
            @click="setWeeks(weeks + 1)"
          >+</button>
        </div>
        <div class="cd-proj-write__tip">
          💡 다음 화면에서 {{ weeks }}개 주차의 커리큘럼을 채워요. 기간은 언제든 다시 바꿀 수 있어요
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="cd-proj-write__footer">
      <button class="cd-proj-write__cta" @click="goNext">다음</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUnsavedGuard } from '@/shared/composables/useUnsavedGuard'
import { useCareerDesign } from '../composables/useCareerDesign'
import { MIN_WEEKS, MAX_WEEKS, DEFAULT_WEEKS, clampWeeks } from '../composables/useProjectCurriculum'
import CdYellowHeader from '../components/CdYellowHeader.vue'
import type { DayOfWeek, Priority, ProjectCategory } from '../types/career-design'

const router = useRouter()
const { draftPlan, draftProject } = useCareerDesign()

onMounted(() => {
  window.scrollTo(0, 0)
  // 서버는 weeks 를 저장하지 않는다(curriculum 만 왕복) → 수정 진입 시 커리큘럼 길이에서 되살린다.
  draftProject.weeks = clampWeeks(draftProject.weeks ?? draftProject.curriculum?.length ?? DEFAULT_WEEKS)
})

// 미저장 이탈 가드 (R2)
const { bypass } = useUnsavedGuard(() => JSON.stringify(draftProject))

const categories: { value: ProjectCategory; label: string }[] = [
  { value: 'qualification', label: '자격요건' },
  { value: 'knowledge',     label: '분야지식' },
  { value: 'skill',         label: '직무기술' },
  { value: 'portfolio',     label: '포트폴리오' },
]

const categoryColorMap: Record<ProjectCategory, string> = {
  qualification: '#1DB95A',
  knowledge:     '#F47820',
  skill:         '#A855F7',
  portfolio:     '#4480F5',
}

const currentColor = computed(() => categoryColorMap[draftProject.category ?? 'knowledge'])

const allDays: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일']

const weeks = computed(() => draftProject.weeks ?? DEFAULT_WEEKS)

function setWeeks(n: number) {
  const next = clampWeeks(n)
  // 기간을 줄이면 잘려나가는 뒤쪽 주차의 작성 내용이 사라진다 → 실제로 채운 게 있을 때만 확인.
  const dropped = (draftProject.curriculum ?? []).slice(next).filter(w => w.items.length > 0).length
  if (dropped > 0 && !confirm(`${next + 1}주차부터 작성한 내용 ${dropped}개가 삭제돼요.\n계속할까요?`)) return
  if (dropped > 0) draftProject.curriculum = (draftProject.curriculum ?? []).slice(0, next)
  draftProject.weeks = next
}

const priorities: { value: Priority; icon: string; label: string }[] = [
  { value: 'high', icon: '🔥', label: '높음' },
  { value: 'normal', icon: '⭐', label: '보통' },
  { value: 'low', icon: '📈', label: '낮음' },
]

function toggleDay(day: DayOfWeek) {
  if (!draftProject.days) draftProject.days = []
  const idx = draftProject.days.indexOf(day)
  if (idx >= 0) draftProject.days.splice(idx, 1)
  else draftProject.days.push(day)
}

function goNext() {
  if (!draftProject.name) return
  bypass()
  router.push('/career-design/project/curriculum')
}
</script>

<style lang="scss">
.cd-proj-write {
  --cat-color: #F47820;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F5F5F5;

  &__body {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__section {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
  }

  &__label {
    font-size: 15px;
    font-weight: 700;
    color: #222;
    margin-bottom: 12px;
  }

  &__sub-label {
    font-size: 12px;
    color: #aaa;
    margin-bottom: 10px;
  }

  /* 카테고리 선택 */
  &__categories {
    display: flex;
    justify-content: space-around;
  }

  &__cat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 8px;
    border-radius: 12px;
    border: 2px solid transparent;
    transition: border-color 0.15s;
  }

  &__cat-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }

  &__cat-label {
    font-size: 12px;
    color: #888;
    transition: color 0.15s, font-weight 0.15s;
  }

  &__input {
    width: 100%;
    border: 1.5px solid #eee;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    outline: none;
    color: #333;
    transition: border-color 0.15s;

    &::placeholder { color: #bbb; }
    &:focus { border-color: var(--cat-color); }
  }

  &__days {
    display: flex;
    gap: 8px;
  }

  &__day-btn {
    flex: 1;
    padding: 10px 0;
    border: 1.5px solid #eee;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #aaa;
    cursor: pointer;
    transition: all 0.15s;

    &--active {
      background: var(--cat-color);
      border-color: var(--cat-color);
      color: #fff;
    }
  }

  &__slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }

  &__slider {
    flex: 1;
    accent-color: var(--cat-color);
    height: 4px;
  }

  &__duration-badge {
    background: #F0F0F0;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
  }

  &__slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #aaa;
    margin-bottom: 12px;
  }

  &__tip {
    background: #EEF4FF;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    color: #4A6FA5;
    line-height: 1.5;
  }

  &__priorities {
    display: flex;
    gap: 10px;
  }

  &__priority-btn {
    flex: 1;
    padding: 12px 0;
    border: 1.5px solid #eee;
    border-radius: 12px;
    background: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #aaa;
    cursor: pointer;
    transition: all 0.15s;

    &--high.cd-proj-write__priority-btn--active {
      background: #FFF0F0;
      border-color: #FF6B6B;
      color: #FF6B6B;
    }

    &--normal.cd-proj-write__priority-btn--active {
      background: #FFFBEC;
      border-color: #FFC700;
      color: #CC9D00;
    }

    &--low.cd-proj-write__priority-btn--active {
      background: #F0F8FF;
      border-color: #4A8CF7;
      color: #4A8CF7;
    }
  }

  &__notify-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
  }

  &__notify-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__notify-title {
    font-size: 14px;
    font-weight: 600;
    color: #222;
  }

  &__notify-desc {
    font-size: 12px;
    color: #aaa;
    line-height: 1.4;
  }

  &__checkbox {
    width: 20px;
    height: 20px;
    accent-color: var(--cat-color);
    flex-shrink: 0;
  }

  &__divider {
    height: 1px;
    background: #f0f0f0;
    margin: 12px 0;
  }

  &__time-field {
    margin-top: 12px;
  }

  &__time-label {
    font-size: 12px;
    color: #aaa;
    display: block;
    margin-bottom: 6px;
  }

  &__time-input {
    position: relative;
    border: 1.5px solid #eee;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__time-raw {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }

  &__time-display {
    font-size: 14px;
    color: #333;
  }

  &__textarea {
    width: 100%;
    border: 1.5px solid #eee;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    outline: none;
    color: #333;
    resize: none;
    font-family: inherit;
    transition: border-color 0.15s;

    &::placeholder { color: #bbb; }
    &:focus { border-color: var(--cat-color); }
  }

  /* 프로젝트 기간 스테퍼 */
  &__stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1.5px solid #eee;
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 12px;
  }

  &__step-btn {
    width: 40px;
    height: 40px;
    border: 1.5px solid var(--cat-color);
    border-radius: 10px;
    background: #fff;
    font-size: 22px;
    font-weight: 600;
    line-height: 1;
    color: var(--cat-color);
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.12s, opacity 0.12s;

    &:hover:not(:disabled) { background: color-mix(in srgb, var(--cat-color) 8%, transparent); }

    &:disabled {
      border-color: #eee;
      color: #ddd;
      cursor: default;
    }
  }

  &__step-value {
    font-size: 24px;
    font-weight: 700;
    color: #222;

    em {
      font-size: 15px;
      font-weight: 600;
      font-style: normal;
      color: #888;
      margin-left: 3px;
    }
  }

  &__footer {
    padding: 16px 20px 32px;
  }

  &__cta {
    width: 100%;
    padding: 18px;
    background: var(--cat-color);
    border: none;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;

    &:active { opacity: 0.85; }
  }
}
</style>
