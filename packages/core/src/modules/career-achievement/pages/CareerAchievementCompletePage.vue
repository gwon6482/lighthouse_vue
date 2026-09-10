<template>
  <div class="cac">
    <header class="cac__header">
      <button class="cac__back" @click="goBack">←</button>
      <span class="cac__header-title">기록 작성</span>
      <span class="cac__header-spacer" />
    </header>

    <div v-if="loading" class="cac__loading">불러오는 중...</div>

    <template v-else-if="item">
      <!-- 항목 요약 -->
      <div class="cac__item">
        <span
          v-if="categoryInfo"
          class="cac__item-cat"
          :style="{ color: categoryInfo.color, background: `color-mix(in srgb, ${categoryInfo.color} 12%, white)` }"
        >{{ categoryInfo.label }}</span>
        <span v-else class="cac__item-cat cac__item-cat--routine">루틴</span>
        <h2 class="cac__item-name">{{ item.name }}</h2>
        <div class="cac__item-meta">
          <span>소요시간 · <strong>{{ elapsedLabel }}</strong></span>
          <span>계획 · {{ item.duration }}분</span>
        </div>
      </div>

      <!-- 인증사진 -->
      <section class="cac__section">
        <label class="cac__label">인증사진 <span class="cac__label-opt">(선택)</span></label>
        <div v-if="!photo" class="cac__photo-empty" @click="pickPhoto">
          <span class="cac__photo-icon">📷</span>
          <span class="cac__photo-text">사진 추가</span>
        </div>
        <div v-else class="cac__photo">
          <img :src="photo" class="cac__photo-img" alt="인증사진" />
          <button class="cac__photo-remove" @click="photo = ''">×</button>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="cac__file"
          @change="onPhotoChange"
        />
      </section>

      <!-- 체감난이도 -->
      <section class="cac__section">
        <label class="cac__label">체감난이도</label>
        <div class="cac__difficulty">
          <button
            v-for="n in 5"
            :key="n"
            class="cac__diff-btn"
            :class="{ 'cac__diff-btn--active': difficulty >= n }"
            @click="difficulty = n as 1|2|3|4|5"
          >
            ★
          </button>
        </div>
        <div class="cac__difficulty-label">{{ difficultyLabel }}</div>
      </section>

      <!-- 내용 -->
      <section class="cac__section">
        <label class="cac__label">기록</label>
        <textarea
          v-model="note"
          class="cac__note"
          placeholder="오늘 어떻게 진행했나요? 어떤 점이 어려웠나요?"
          rows="6"
          maxlength="2000"
        />
        <div class="cac__counter">{{ note.length }} / 2000</div>
      </section>

      <!-- 저장 -->
      <div class="cac__actions">
        <button class="cac__btn cac__btn--ghost" @click="goBack">취소</button>
        <button class="cac__btn cac__btn--primary" :disabled="saving" @click="save">
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </template>

    <div v-else-if="!loading" class="cac__empty">
      <p>항목을 찾을 수 없어요.</p>
      <button class="cac__btn cac__btn--ghost" @click="router.replace('/career-achievement')">돌아가기</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCareerDesign } from '@/modules/career-design/composables/useCareerDesign'
import { projectWeekIndexOn } from '@/modules/career-design/composables/usePlanTimeline'
import { weekEntriesOf } from '@/modules/career-design/composables/useProjectCurriculum'
import { useAchievement } from '../composables/useAchievement'
import { useCurriculumCompletion } from '../composables/useCurriculumCompletion'
import { useAchievementEntries, type AchievementEntry } from '../composables/useAchievementEntries'
import { uploadPhoto } from '../achievement.api'
import type { Project, Routine, ProjectCategory } from '@/modules/career-design/types/career-design'

const route = useRoute()
const router = useRouter()
const { draftPlan, draftTimeline, fetchMyPlans, loadPlanFromApi } = useCareerDesign()
const { isProjectDone, isRoutineDone, toggleProject, toggleRoutine } = useAchievement()
const { isItemDone, toggleItem } = useCurriculumCompletion()
const { saveEntry, getEntry } = useAchievementEntries()

const itemType = computed<'project' | 'routine'>(() => (route.params.type === 'routine' ? 'routine' : 'project'))
const itemId = computed(() => String(route.params.id ?? ''))
const dateKey = computed(() => String(route.query.date ?? toTodayKey()))
const elapsedSec = computed(() => {
  const n = Number(route.query.elapsed)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
})

function toTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const loading = ref(true)
const saving = ref(false)

const item = computed<Project | Routine | null>(() => {
  if (!itemId.value) return null
  if (itemType.value === 'project') {
    return draftPlan.projects.find(p => p.id === itemId.value) ?? null
  }
  return draftPlan.routines.find(r => r.id === itemId.value) ?? null
})

const categories: Record<ProjectCategory, { label: string; color: string }> = {
  qualification: { label: '자격요건',   color: '#1DB95A' },
  knowledge:     { label: '분야지식',   color: '#F47820' },
  skill:         { label: '직무기술',   color: '#A855F7' },
  portfolio:     { label: '포트폴리오', color: '#4480F5' },
}

const categoryInfo = computed(() => {
  if (itemType.value !== 'project') return null
  const cat = (item.value as Project | null)?.category
  return cat ? categories[cat] : null
})

const elapsedLabel = computed(() => {
  const s = elapsedSec.value
  if (s === 0) return '기록 없음'
  if (s < 60) return `${s}초`
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m < 60) return sec ? `${m}분 ${sec}초` : `${m}분`
  const h = Math.floor(m / 60)
  const min = m % 60
  return min ? `${h}시간 ${min}분` : `${h}시간`
})

// ── form state ───────────────────────────────────
const photo = ref('')
const difficulty = ref<1 | 2 | 3 | 4 | 5>(3)
const note = ref('')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const difficultyLabel = computed(() => {
  return ['', '아주 쉬움', '쉬움', '보통', '어려움', '아주 어려움'][difficulty.value] ?? ''
})

function pickPhoto() {
  fileInput.value?.click()
}

async function onPhotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    photo.value = await resizeToDataUrl(file, 1280)
  } catch {
    alert('사진을 불러오지 못했어요.')
  } finally {
    input.value = ''
  }
}

// 'data:image/...;base64,...' dataURL → Blob (S3 업로드용)
function dataUrlToBlob(dataUrl: string): Blob {
  const [head = '', body = ''] = dataUrl.split(',')
  const mime = head.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
  const bin = atob(body)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

function resizeToDataUrl(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const ratio = img.width > maxWidth ? maxWidth / img.width : 1
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = String(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// dateKey가 속한 프로젝트의 curriculum 주차에서 첫 미완료 item 1개를 done 처리.
// 진로달성 메인의 스플릿 progress bar를 1칸 전진시키는 트리거.
function advanceProjectCurriculum(project: Project, dateKey: string) {
  if (!project.curriculum?.length) return

  const [y, m, d] = dateKey.split('-').map(Number)
  if (!y || !m || !d) return
  const target = new Date(y, m - 1, d)

  // 커리큘럼 N주차 = 계획주차 - 타임라인 시작주차 + 1
  const wIdx = projectWeekIndexOn(draftTimeline.value, draftPlan.startDate, project.id, target)
  if (wIdx === null) return


  const cw = project.curriculum.find(c => c.week === wIdx)
  const entries = weekEntriesOf(cw)
  if (!cw || !entries.length) return

  const undoneIdx = entries.findIndex((_, k) => !isItemDone(project.id, cw.week, k))
  if (undoneIdx !== -1) toggleItem(project.id, cw.week, undoneIdx)
}

async function save() {
  if (!item.value) return
  saving.value = true
  try {
    // 사진이 새로 선택된 dataURL 이면 S3 업로드 후 URL 로 교체. 기존 http URL 이면 그대로.
    let photoUrl: string | undefined = photo.value || undefined
    if (photoUrl?.startsWith('data:')) {
      try {
        photoUrl = await uploadPhoto(dataUrlToBlob(photoUrl), 'image/jpeg')
      } catch {
        alert('사진 업로드에 실패했어요. 사진 없이 저장합니다.')
        photoUrl = undefined
      }
    }

    const entry: AchievementEntry = {
      date: dateKey.value,
      itemType: itemType.value,
      itemId: itemId.value,
      itemName: item.value.name,
      itemCategory: itemType.value === 'project' ? (item.value as Project).category : undefined,
      duration: item.value.duration,
      elapsedSec: elapsedSec.value,
      doneAt: new Date().toISOString(),
      photoUrl,
      difficulty: difficulty.value,
      note: note.value.trim(),
      planId: draftPlan.planId ?? undefined,
    }
    saveEntry(entry)

    // 완료 상태 토글 — 아직 미완료면 완료로
    const alreadyDone = itemType.value === 'project'
      ? isProjectDone(itemId.value, dateKey.value)
      : isRoutineDone(itemId.value, dateKey.value)
    if (!alreadyDone) {
      if (itemType.value === 'project') {
        toggleProject(itemId.value, dateKey.value)
        advanceProjectCurriculum(item.value as Project, dateKey.value)
      } else {
        toggleRoutine(itemId.value, dateKey.value)
      }
    }

    router.replace('/career-achievement')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.replace('/career-achievement')
}

onMounted(async () => {
  try {
    if (!draftPlan.planId) {
      const plans = await fetchMyPlans()
      const target = plans.find((p: any) => p.status === 'active') ?? plans[0]
      if (target?.planId) await loadPlanFromApi(target.planId)
    }
    // 이미 작성한 entry가 있으면 prefill (수정용)
    const existing = getEntry(dateKey.value, itemType.value, itemId.value)
    if (existing) {
      photo.value = existing.photoUrl ?? ''
      difficulty.value = existing.difficulty
      note.value = existing.note
    }
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss">
.cac {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 24px;

  &__header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    height: 52px;
    padding: 0 8px;
    background: #fff;
    border-bottom: 1px solid #EEEEE8;
  }

  &__back {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    font-size: 20px;
    color: #444;
    cursor: pointer;
  }

  &__header-title {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #222;
  }

  &__header-spacer { width: 44px; }

  &__loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
  }

  &__item {
    margin: 16px 16px 0;
    background: #fff;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  &__item-cat {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 8px;

    &--routine {
      background: #FFFBEC;
      color: #CC9D00;
    }
  }

  &__item-name {
    font-size: 17px;
    font-weight: 800;
    color: #222;
    margin: 0;
  }

  &__item-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #888;

    strong {
      color: #222;
      font-weight: 700;
    }
  }

  &__section {
    margin: 12px 16px 0;
    background: #fff;
    border-radius: 16px;
    padding: 16px 20px;
  }

  &__label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #444;
    margin-bottom: 12px;
  }

  &__label-opt {
    font-weight: 500;
    color: #aaa;
    margin-left: 6px;
  }

  &__photo-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 140px;
    border: 2px dashed #ddd;
    border-radius: 12px;
    color: #aaa;
    cursor: pointer;

    &:hover {
      border-color: #FFC700;
      color: #FFC700;
    }
  }

  &__photo-icon { font-size: 28px; }
  &__photo-text { font-size: 13px; font-weight: 600; }

  &__photo {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
  }

  &__photo-img {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    display: block;
  }

  &__photo-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  &__file { display: none; }

  &__difficulty {
    display: flex;
    gap: 8px;
  }

  &__diff-btn {
    flex: 1;
    height: 44px;
    border: 1px solid #eee;
    background: #fafafa;
    border-radius: 10px;
    font-size: 22px;
    color: #ddd;
    cursor: pointer;

    &--active {
      background: #FFFBEC;
      border-color: #FFE99A;
      color: #FFC700;
    }
  }

  &__difficulty-label {
    text-align: center;
    margin-top: 10px;
    font-size: 12px;
    color: #888;
    font-weight: 600;
  }

  &__note {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    background: #fafafa;

    &:focus {
      outline: none;
      border-color: #FFC700;
      background: #fff;
    }
  }

  &__counter {
    text-align: right;
    font-size: 11px;
    color: #aaa;
    margin-top: 4px;
  }

  &__actions {
    display: flex;
    gap: 10px;
    margin: 20px 16px 0;
  }

  &__btn {
    flex: 1;
    height: 52px;
    border-radius: 14px;
    border: none;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;

    &--primary {
      background: #FFC700;
      color: #fff;

      &:disabled {
        background: #ddd;
        cursor: not-allowed;
      }
    }

    &--ghost {
      background: #fff;
      color: #444;
      border: 1px solid #ddd;
    }
  }

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #888;
  }
}
</style>
