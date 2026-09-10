<template>
  <div class="cd-projects">
    <CdYellowHeader
      title="진로계획 구성하기"
      :subtitle="`${draftPlan.targetJob || '목표 직업'}을 위한 프로젝트를 추가해 보세요`"
      back-to="/career-design/plan/new"
    />

    <div class="cd-projects__body">
      <div class="cd-projects__section">

        <!-- 카테고리 탭 -->
        <div class="cd-projects__categories">
          <div
            v-for="cat in categories"
            :key="cat.value"
            class="cd-projects__cat-item"
            :class="{ 'cd-projects__cat-item--active': selectedCategory === cat.value }"
            @click="selectedCategory = cat.value"
          >
            <img
              class="cd-projects__cat-icon"
              :src="`/career-design/icon-${cat.value}.svg`"
              :alt="cat.label"
            />
            <span class="cd-projects__cat-label">{{ cat.label }}</span>
            <span v-if="projectCountByCategory[cat.value]" class="cd-projects__cat-count">
              {{ projectCountByCategory[cat.value] }}
            </span>
          </div>
        </div>

        <!-- 프로젝트 목록 -->
        <div class="cd-projects__list">
          <div
            v-for="project in categoryProjects"
            :key="project.id"
            class="cd-projects__chip"
            :style="{ background: currentColors.chipBg }"
          >
            <span class="cd-projects__chip-name" :style="{ color: currentColors.chipText }">{{ project.name }}</span>
            <div class="cd-projects__chip-actions">
              <button class="cd-projects__btn cd-projects__btn--edit" @click="editProject(project)">✏️</button>
              <button class="cd-projects__btn cd-projects__btn--delete" @click="deleteProject(project.id)">✕</button>
            </div>
          </div>

          <p v-if="!categoryProjects.length" class="cd-projects__empty">
            아직 추가된 프로젝트가 없어요
          </p>
        </div>

        <button
          class="cd-projects__add-btn"
          :style="{ background: currentColors.btn }"
          @click="goToAddProject"
        >
          + 프로젝트 추가하기
        </button>
      </div>

      <!-- 전체 요약 -->
      <div class="cd-projects__summary">
        <span class="cd-projects__summary-label">총 {{ draftPlan.projects.length }}개 추가됨</span>
        <div class="cd-projects__summary-chips">
          <span
            v-for="cat in categories"
            :key="cat.value"
            class="cd-projects__summary-chip"
            :style="projectCountByCategory[cat.value]
              ? { background: categoryColorMap[cat.value].chipBg, color: categoryColorMap[cat.value].chipText }
              : {}"
          >
            {{ cat.label }} {{ projectCountByCategory[cat.value] ?? 0 }}
          </span>
        </div>
      </div>
    </div>

    <div class="cd-projects__footer">
      <button class="cd-projects__btn-secondary" @click="goPrev">이전으로</button>
      <button
        class="cd-projects__btn-primary"
        :disabled="!draftPlan.projects.length"
        @click="goNext"
      >
        다음으로
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCareerDesign } from '../composables/useCareerDesign'
import { DEFAULT_WEEKS } from '../composables/useProjectCurriculum'
import CdYellowHeader from '../components/CdYellowHeader.vue'
import type { Project, ProjectCategory } from '../types/career-design'

const router = useRouter()
const { draftPlan, draftProject, editingProjectId, resetDraftProject, syncDeleteProject } = useCareerDesign()

const selectedCategory = ref<ProjectCategory>('knowledge')

const categories = [
  { value: 'qualification' as ProjectCategory, label: '자격요건' },
  { value: 'knowledge' as ProjectCategory, label: '분야지식' },
  { value: 'skill' as ProjectCategory, label: '직무기술' },
  { value: 'portfolio' as ProjectCategory, label: '포트폴리오' },
]

const categoryColorMap: Record<ProjectCategory, { chipBg: string; chipText: string; btn: string }> = {
  qualification: { chipBg: '#E8F9EF', chipText: '#1DB95A', btn: '#1DB95A' },
  knowledge:     { chipBg: '#FFF2E8', chipText: '#F47820', btn: '#F47820' },
  skill:         { chipBg: '#F5EEFF', chipText: '#A855F7', btn: '#A855F7' },
  portfolio:     { chipBg: '#EBF2FF', chipText: '#4480F5', btn: '#4480F5' },
}

const currentColors = computed(() => categoryColorMap[selectedCategory.value])

const categoryProjects = computed(() =>
  draftPlan.projects.filter(p => p.category === selectedCategory.value)
)

const projectCountByCategory = computed(() => {
  const counts: Partial<Record<ProjectCategory, number>> = {}
  for (const p of draftPlan.projects) {
    counts[p.category] = (counts[p.category] ?? 0) + 1
  }
  return counts
})

function goToAddProject() {
  editingProjectId.value = null
  resetDraftProject()
  draftProject.category = selectedCategory.value
  router.push('/career-design/project/new')
}

function editProject(project: Project) {
  editingProjectId.value = project.id
  resetDraftProject()
  Object.assign(draftProject, {
    ...project,
    days: [...project.days],
    // 서버는 weeks 를 저장하지 않으므로 커리큘럼 길이가 곧 기간이다.
    weeks: project.curriculum?.length || project.weeks || DEFAULT_WEEKS,
    curriculum: project.curriculum?.map(w => ({ ...w, items: [...w.items] })) ?? [],
  })
  router.push('/career-design/project/new')
}

async function deleteProject(projectId: string) {
  const idx = draftPlan.projects.findIndex(p => p.id === projectId)
  if (idx >= 0) {
    draftPlan.projects.splice(idx, 1)
    await syncDeleteProject(projectId)
  }
}

function goPrev() {
  router.push('/career-design/plan/new')
}

function goNext() {
  router.push('/career-design/complete')
}
</script>

<style lang="scss">
.cd-projects {
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
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__categories {
    display: flex;
    justify-content: space-around;
  }

  &__cat-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  &__cat-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    border: 2.5px solid transparent;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  &__cat-item--active &__cat-icon {
    border-color: #222;
  }

  &__cat-label {
    font-size: 12px;
    color: #555;
  }

  &__cat-count {
    position: absolute;
    top: -4px;
    right: -2px;
    background: #FFC700;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 48px;
  }

  &__chip {
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    &-name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    &-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
  }

  &__btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1;
    transition: background 0.12s;

    &--edit   { color: #888; &:hover { background: rgba(0,0,0,0.08); } }
    &--delete { color: rgba(0,0,0,0.2); &:hover { background: #FFE8E8; color: #FF5555; } }
  }

  &__empty {
    font-size: 13px;
    color: #bbb;
    text-align: center;
    padding: 8px 0;
  }

  &__add-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;

    &:active { opacity: 0.85; }
  }

  &__summary {
    background: #fff;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__summary-label {
    font-size: 13px;
    font-weight: 600;
    color: #555;
    white-space: nowrap;
  }

  &__summary-chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__summary-chip {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    background: #F0F0F0;
    color: #aaa;
  }

  &__footer {
    padding: 16px 20px 32px;
    display: flex;
    gap: 10px;
  }

  &__btn-secondary {
    flex: 1;
    padding: 18px;
    background: #fff;
    border: 1.5px solid #ddd;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 700;
    color: #666;
    cursor: pointer;

    &:active { opacity: 0.85; }
  }

  &__btn-primary {
    flex: 2;
    padding: 18px;
    background: #FFC700;
    border: none;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.15s;

    &:disabled {
      background: #e8e8e8;
      color: #aaa;
      cursor: not-allowed;
    }

    &:not(:disabled):active { opacity: 0.85; }
  }
}
</style>
