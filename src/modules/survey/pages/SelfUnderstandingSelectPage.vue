<template>
  <button class="start-button" @click="handleScaleSelect(2)">2</button>
  <button class="start-button" @click="handleScaleSelect(5)">5</button>
  <button class="start-button" @click="handleScaleSelect(10)">10</button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSurvey } from '../composables/useSurvey'

const router = useRouter()
const { setScaleType } = useSurvey()

function handleScaleSelect(type: 2 | 5 | 10) {
  setScaleType(type)
  router.push('/self-understanding/test')
}
</script>
