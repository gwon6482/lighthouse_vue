<template>
  <div class="cd-proj-curr" :style="{ '--cat-color': currentColor }">
    <CdYellowHeader
      title="주차별 커리큘럼"
      :subtitle="`${draftProject.name || '프로젝트'} · 총 ${curriculum.length}주`"
      :color="currentColor"
      back-to="/career-design/project/new"
    />

    <div class="cd-proj-curr__body">
      <p class="cd-proj-curr__guide">
        주차 제목은 기본값이 채워져 있어요. 원하는 내용으로 바꾸고, 세부 항목을 추가해보세요
      </p>

      <div class="cd-proj-curr__weeks">
        <div
          v-for="(week, wi) in curriculum"
          :key="wi"
          class="cd-proj-curr__week-card"
        >
          <!-- 주차 헤더 -->
          <div class="cd-proj-curr__week-head">
            <span class="cd-proj-curr__week-num">{{ week.week }}주차</span>
            <input
              v-model="week.title"
              class="cd-proj-curr__week-title"
              :placeholder="defaultWeekTitle(draftProject.name ?? '', week.week)"
            />
          </div>

          <!-- 항목 목록 -->
          <ol v-if="week.items.length" class="cd-proj-curr__week-items">
            <li
              v-for="(item, ii) in week.items"
              :key="ii"
              class="cd-proj-curr__week-item"
            >
              <span class="cd-proj-curr__week-item-text">{{ item }}</span>
              <button class="cd-proj-curr__item-del" @click="deleteItem(wi, ii)">✕</button>
            </li>
          </ol>

          <!-- 항목 추가 input -->
          <div class="cd-proj-curr__item-add">
            <input
              v-model="weekItemInputs[wi]"
              class="cd-proj-curr__item-input"
              placeholder="항목 입력 후 Enter"
              @keyup.enter="addItem(wi)"
            />
            <button
              class="cd-proj-curr__item-btn"
              :style="{ color: currentColor }"
              @click="addItem(wi)"
            >추가</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="cd-proj-curr__footer">
      <button class="cd-proj-curr__cta" :disabled="saving" @click="saveProject">
        {{ editingProjectId ? '수정하기' : '추가하기' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useCareerDesign } from '../composables/useCareerDesign'
import { DEFAULT_WEEKS, defaultWeekTitle, syncCurriculumLength } from '../composables/useProjectCurriculum'
import CdYellowHeader from '../components/CdYellowHeader.vue'
import type { ProjectCategory, WeekCurriculum } from '../types/career-design'

const router = useRouter()
const { draftPlan, draftProject, editingProjectId, syncAddProject, syncUpdateProject } = useCareerDesign()

const WRITE_PATH = '/career-design/project/new'

const categoryColorMap: Record<ProjectCategory, string> = {
  qualification: '#1DB95A',
  knowledge:     '#F47820',
  skill:         '#A855F7',
  portfolio:     '#4480F5',
}

const currentColor = computed(() => categoryColorMap[draftProject.category ?? 'knowledge'])

// 작성 내용은 draftProject.curriculum 에 직접 쓴다.
// 로컬 ref 에 들고 있으면 기간을 고치러 1단계에 다녀오는 사이 입력이 날아가고,
// useCareerDesign 의 draft 자동저장(R3)에도 실리지 않는다.
const curriculum = computed<WeekCurriculum[]>(() => draftProject.curriculum ?? [])
const weekItemInputs = ref<string[]>([])
const saving = ref(false)
let saved = false
let baseline = ''

onMounted(() => {
  window.scrollTo(0, 0)
  // 1단계를 건너뛰고 직접 들어온 경우 — 채울 프로젝트가 없으니 되돌린다.
  if (!draftProject.name) {
    router.replace(WRITE_PATH)
    return
  }
  draftProject.curriculum = syncCurriculumLength(
    draftProject.curriculum,
    draftProject.weeks ?? DEFAULT_WEEKS,
    draftProject.name,
  )
  weekItemInputs.value = curriculum.value.map(() => '')
  baseline = JSON.stringify(draftProject.curriculum)
})

// 미저장 이탈 가드 (R2). 단, 기간을 고치러 1단계로 돌아가는 건 정상 흐름이라 묻지 않는다.
onBeforeRouteLeave((to) => {
  if (saved || to.path === WRITE_PATH) return true
  if (JSON.stringify(draftProject.curriculum) === baseline) return true
  return confirm('작성 중인 커리큘럼이 저장되지 않았어요.\n정말 나가시겠어요?')
})

function addItem(wi: number) {
  const text = weekItemInputs.value[wi]?.trim()
  const week = curriculum.value[wi]
  if (!text || !week) return
  week.items.push(text)
  weekItemInputs.value[wi] = ''
}

function deleteItem(wi: number, ii: number) {
  curriculum.value[wi]?.items.splice(ii, 1)
}

async function saveProject() {
  if (saving.value) return
  saving.value = true

  // 제목을 지운 주차는 기본 제목으로 되돌려 빈 값이 저장되지 않게 한다.
  const finalCurriculum = curriculum.value.map((w: WeekCurriculum) => ({
    week: w.week,
    title: w.title.trim() || defaultWeekTitle(draftProject.name ?? '', w.week),
    items: [...w.items],
  }))
  draftProject.curriculum = finalCurriculum

  const projectData = {
    category: draftProject.category ?? 'knowledge',
    name: draftProject.name ?? '',
    goal: draftProject.goal ?? '',
    days: [...(draftProject.days ?? [])],
    duration: draftProject.duration ?? 60,
    priority: draftProject.priority ?? 'normal',
    notification: draftProject.notification ?? false,
    missedNotification: draftProject.missedNotification ?? true,
    notificationTime: draftProject.notificationTime ?? '09:00',
    memo: draftProject.memo ?? '',
    weeks: finalCurriculum.length,
    curriculum: finalCurriculum.map(w => ({ ...w, items: [...w.items] })),
  }

  if (editingProjectId.value) {
    const idx = draftPlan.projects.findIndex(p => p.id === editingProjectId.value)
    const target = idx >= 0 ? draftPlan.projects[idx] : undefined
    if (target) {
      Object.assign(target, projectData)
      await syncUpdateProject(target)
    }
    editingProjectId.value = null
  } else {
    const newProject = { id: `draft-${Date.now()}`, ...projectData }
    draftPlan.projects.push(newProject)
    await syncAddProject(newProject)
  }

  saved = true
  saving.value = false
  // safeBack 은 히스토리를 되감아 1단계(기간 설정)로 돌아가버린다. 저장을 끝냈으니 목록으로 대체 이동.
  router.replace('/career-design/plan/projects')
}
</script>

<style lang="scss">
.cd-proj-curr {
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

  &__guide {
    font-size: 13px;
    color: #888;
    line-height: 1.5;
    padding: 0 4px;
  }

  &__weeks {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__week-card {
    background: #fff;
    border-radius: 16px;
    border-left: 3px solid var(--cat-color);
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__week-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  &__week-num {
    font-size: 12px;
    font-weight: 700;
    color: var(--cat-color);
    white-space: nowrap;
    background: color-mix(in srgb, var(--cat-color) 10%, white);
    padding: 2px 8px;
    border-radius: 20px;
  }

  &__week-title {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    font-size: 15px;
    font-weight: 700;
    color: #222;
    padding: 0;
    background: transparent;

    &::placeholder { color: #ccc; font-weight: 400; }
  }

  &__week-items {
    list-style: decimal;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;

    ::marker { color: var(--cat-color); font-weight: 600; }
  }

  &__week-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 14px;
    color: #444;
    line-height: 1.5;
    padding: 2px 0;
  }

  &__week-item-text {
    flex: 1;
  }

  &__item-del {
    background: none;
    border: none;
    font-size: 11px;
    color: #ddd;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
    line-height: 1;

    &:hover { color: #FF5555; }
  }

  &__item-add {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1.5px dashed #ddd;
    border-radius: 8px;
    padding: 8px 12px;
    transition: border-color 0.15s;

    &:focus-within { border-color: var(--cat-color); }
  }

  &__item-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    color: #333;

    &::placeholder { color: #ccc; }
  }

  &__item-btn {
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;

    &:hover { text-decoration: underline; }
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
    &:disabled { opacity: 0.6; cursor: default; }
  }
}
</style>
