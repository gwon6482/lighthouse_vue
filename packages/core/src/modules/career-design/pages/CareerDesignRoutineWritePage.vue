<template>
  <div class="cd-rt-write">
    <CdYellowHeader
      :title="editingRoutineId ? '루틴 수정' : '새로운 루틴 추가'"
      subtitle="정해진 요일마다 반복할 일이에요"
      back-to="/career-design/plan/routines"
    />

    <div class="cd-rt-write__body">
      <!-- 이름 -->
      <div class="cd-rt-write__section">
        <h3 class="cd-rt-write__label">루틴 이름</h3>
        <input
          v-model="draftRoutine.name"
          class="cd-rt-write__input"
          placeholder="예: 매일 30분 코딩, 아침 스트레칭"
        />
      </div>

      <!-- 요일 -->
      <div class="cd-rt-write__section">
        <h3 class="cd-rt-write__label">실행 요일</h3>
        <div class="cd-rt-write__days">
          <button
            v-for="day in allDays"
            :key="day"
            class="cd-rt-write__day-btn"
            :class="{ 'cd-rt-write__day-btn--active': draftRoutine.days?.includes(day) }"
            @click="toggleDay(day)"
          >
            {{ day }}
          </button>
        </div>
        <div class="cd-rt-write__day-presets">
          <button class="cd-rt-write__preset" @click="setDays(['월','화','수','목','금','토','일'])">매일</button>
          <button class="cd-rt-write__preset" @click="setDays(['월','화','수','목','금'])">평일</button>
          <button class="cd-rt-write__preset" @click="setDays(['토','일'])">주말</button>
        </div>
      </div>

      <!-- 1회 소요 시간 -->
      <div class="cd-rt-write__section">
        <h3 class="cd-rt-write__label">1회 소요 시간</h3>
        <div class="cd-rt-write__slider-row">
          <input
            v-model.number="draftRoutine.duration"
            type="range"
            min="5"
            max="120"
            step="5"
            class="cd-rt-write__slider"
          />
          <span class="cd-rt-write__duration-badge">{{ draftRoutine.duration }}분</span>
        </div>
        <div class="cd-rt-write__slider-labels">
          <span>5분</span><span>2시간</span>
        </div>
      </div>

      <!-- 알림 -->
      <div class="cd-rt-write__section">
        <div class="cd-rt-write__notify-row">
          <div class="cd-rt-write__notify-text">
            <span class="cd-rt-write__notify-title">알림</span>
            <span class="cd-rt-write__notify-desc">설정한 시간에 매일 알림이 와요</span>
          </div>
          <input type="checkbox" v-model="draftRoutine.notification" class="cd-rt-write__checkbox" />
        </div>
        <div v-if="draftRoutine.notification" class="cd-rt-write__time-field">
          <label class="cd-rt-write__time-label">알림 시간</label>
          <div class="cd-rt-write__time-input">
            <input v-model="draftRoutine.notificationTime" type="time" class="cd-rt-write__time-raw" />
            <span class="cd-rt-write__time-display">{{ draftRoutine.notificationTime }}</span>
            <span>🕐</span>
          </div>
        </div>
      </div>

      <!-- 메모 -->
      <div class="cd-rt-write__section">
        <h3 class="cd-rt-write__label">메모 <span class="cd-rt-write__optional">선택</span></h3>
        <textarea
          v-model="draftRoutine.memo"
          class="cd-rt-write__textarea"
          placeholder="기억하고 싶은 내용을 적어주세요"
          rows="3"
        />
      </div>
    </div>

    <div class="cd-rt-write__footer">
      <button class="cd-rt-write__cta" :disabled="!draftRoutine.name?.trim()" @click="saveRoutine">
        {{ editingRoutineId ? '수정 완료' : '추가하기' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { safeBack } from '@/shared/utils/navigation'
import { useUnsavedGuard } from '@/shared/composables/useUnsavedGuard'
import { useCareerDesign } from '../composables/useCareerDesign'
import CdYellowHeader from '../components/CdYellowHeader.vue'
import type { DayOfWeek } from '../types/career-design'

const router = useRouter()
const { draftPlan, draftRoutine, editingRoutineId, syncAddRoutine, syncUpdateRoutine } = useCareerDesign()

const allDays: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일']

onMounted(() => window.scrollTo(0, 0))

// 미저장 이탈 가드 (R2)
const { bypass } = useUnsavedGuard(() => JSON.stringify(draftRoutine))

function toggleDay(day: DayOfWeek) {
  if (!draftRoutine.days) draftRoutine.days = []
  const idx = draftRoutine.days.indexOf(day)
  if (idx >= 0) draftRoutine.days.splice(idx, 1)
  else draftRoutine.days.push(day)
}

function setDays(days: DayOfWeek[]) {
  draftRoutine.days = [...days]
}

async function saveRoutine() {
  const name = draftRoutine.name?.trim()
  if (!name) return

  const routineData = {
    name,
    days:             [...(draftRoutine.days ?? [])],
    duration:         draftRoutine.duration ?? 30,
    notificationTime: draftRoutine.notificationTime ?? '09:00',
    notification:     draftRoutine.notification ?? false,
    memo:             draftRoutine.memo ?? '',
  }

  if (editingRoutineId.value) {
    const target = draftPlan.routines.find(r => r.id === editingRoutineId.value)
    if (target) {
      Object.assign(target, routineData)
      await syncUpdateRoutine(target)
    }
    editingRoutineId.value = null
  } else {
    const newRoutine = { id: `draft-${Date.now()}`, ...routineData }
    draftPlan.routines.push(newRoutine)
    await syncAddRoutine(newRoutine)
  }

  bypass()
  safeBack(router, '/career-design/plan/routines')
}
</script>

<style lang="scss">
.cd-rt-write {
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
    margin: 0 0 12px;
  }

  &__optional {
    font-size: 12px;
    font-weight: 400;
    color: #aaa;
    margin-left: 6px;
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
    &:focus { border-color: #FFC700; }
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
      background: #FFC700;
      border-color: #FFC700;
      color: #fff;
    }
  }

  &__day-presets {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  &__preset {
    background: #F5F5F5;
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: background 0.12s;

    &:hover { background: #FFFBEC; color: #CC9D00; }
  }

  &__slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }

  &__slider {
    flex: 1;
    accent-color: #FFC700;
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
  }

  &__notify-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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
    accent-color: #FFC700;
    flex-shrink: 0;
  }

  &__time-field {
    margin-top: 14px;
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
    &:focus { border-color: #FFC700; }
  }

  &__footer {
    padding: 16px 20px 32px;
  }

  &__cta {
    width: 100%;
    padding: 18px;
    background: #FFC700;
    border: none;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.15s;

    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:not(:disabled):active { opacity: 0.85; }
  }
}
</style>
