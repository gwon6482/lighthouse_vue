import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { req } from '@/shared/api'
import { useAchievement } from '@/modules/career-achievement/composables/useAchievement'
import { useAchievementEntries } from '@/modules/career-achievement/composables/useAchievementEntries'
import { useCurriculumCompletion } from '@/modules/career-achievement/composables/useCurriculumCompletion'
import type { Project, Routine, DayOfWeek, TimelineSlot } from '@/modules/career-design/types/career-design'

interface ActivePlan {
  planId: string
  name: string
  targetJob: string
  startDate: string
  endDate: string
  reviewDay: DayOfWeek | ''
  status: 'draft' | 'active' | 'completed'
  projects: Project[]
  routines: Routine[]
  timeline: TimelineSlot[]
}

export const useAchievementStore = defineStore('achievement', () => {
  const plan = ref<ActivePlan | null>(null)
  const loaded = ref(false)
  const loading = ref(false)

  const hasActivePlan = computed(() => !!plan.value && plan.value.status === 'active')

  const todayPendingCount = computed(() => {
    if (!plan.value) return 0
    const ach = useAchievement()
    const projects = ach.todayProjects(
      plan.value.projects,
      plan.value.timeline,
      plan.value.startDate,
      plan.value.endDate,
    )
    const routines = ach.todayRoutines(plan.value.routines)
    const pendingProjects = projects.filter(p => !ach.isProjectDone(p.id)).length
    const pendingRoutines = routines.filter(r => !ach.isRoutineDone(r.id)).length
    return pendingProjects + pendingRoutines
  })

  async function loadActivePlan(force = false): Promise<void> {
    if (loading.value) return
    if (loaded.value && !force) return
    loading.value = true
    try {
      const listRes = await req.get('/api/career-plan')
      const plans = listRes.data.plans ?? []
      const target = plans.find((p: any) => p.status === 'active')
      if (!target) {
        plan.value = null
        return
      }
      const detailRes = await req.get(`/api/career-plan/${target.planId}`)
      const p = detailRes.data.plan
      plan.value = {
        planId:    p.planId,
        name:      p.name      ?? '',
        targetJob: p.targetJob ?? '',
        startDate: p.startDate ?? '',
        endDate:   p.endDate   ?? '',
        reviewDay: p.reviewDay ?? '',
        status:    p.status    ?? 'draft',
        projects:  p.projects  ?? [],
        routines:  p.routines  ?? [],
        timeline:  p.timeline  ?? [],
      }
      // 달성 기록·커리큘럼 완료 상태를 서버에서 로드 (localStorage → DB 전환)
      await Promise.all([
        useAchievement().loadFromServer(p.planId),
        useAchievementEntries().loadFromServer(p.planId),
        useCurriculumCompletion().loadFromServer(p.planId),
      ])
    } catch {
      plan.value = null
    } finally {
      loaded.value = true
      loading.value = false
    }
  }

  function reset() {
    plan.value = null
    loaded.value = false
    loading.value = false
  }

  return {
    plan,
    loaded,
    loading,
    hasActivePlan,
    todayPendingCount,
    loadActivePlan,
    reset,
  }
})
