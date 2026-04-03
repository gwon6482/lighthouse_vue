<template>
  <div class="self-understanding-select">
    <h2 class="select-title">답변 방식을 골라주세요</h2>
    <div class="select-button-group">
      <button class="select-button" @click="handleScaleSelect(2)">
        <h2 class="select-button__title">심플</h2>
        <img src="/ScaleQuestion2.png" alt="Scale Question 2" />
        <p class="select-button__description">빠르게 검사하고 싶어요</p>
        <p class="select-button__estimated-time">예상 소요시간: 5분</p>
      </button>
      <button class="select-button" @click="handleScaleSelect(5)">
        <h2 class="select-button__title">베이직</h2>
        <img src="/ScaleQuestion5.png" alt="Scale Question 5" />
        <p class="select-button__description">일반적인 검사 방식이에요</p>
        <p class="select-button__estimated-time">예상 소요시간: 10분</p>
      </button>
      <button class="select-button" @click="handleScaleSelect(10)">
        <h2 class="select-button__title">디테일</h2>
        <img src="/ScaleQuestion10.png" alt="Scale Question 10" />
        <p class="select-button__description">자세히 검사할 수 있어요</p>
        <p class="select-button__estimated-time">예상 소요시간: 15분</p>
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
