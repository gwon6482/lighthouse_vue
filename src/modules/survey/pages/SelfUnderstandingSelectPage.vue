<template>
  <div class="self-understanding-select">
    <h2 class="select-title">답변 방식을 골라주세요</h2>
    <div class="select-button-group">
      <button class="select-button" @click="handleScaleSelect(2)">
        <img src="/ScaleQuestion2.png" alt="Scale Question 2" />
      </button>
      <button class="select-button" @click="handleScaleSelect(5)">
        <img src="/ScaleQuestion5.png" alt="Scale Question 5" />
      </button>
      <button class="select-button" @click="handleScaleSelect(10)">
        <img src="/ScaleQuestion10.png" alt="Scale Question 10" />
      </button>
    </div>
  </div>
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
