<template>
  <div class="survey-wrap">
    <p class="survey-title">업무환경 설문</p>
    <div class="parts-container">
      <div
        v-for="(part, i) in parts"
        :key="i"
        class="part-card"
      >
        <p class="part-label">{{ part.label }}</p>
        <p class="part-question">{{ part.question }}</p>
        <div class="slider-wrap">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            :value="modelValue[keys[i]]"
            @input="handleInput(i, ($event.target as HTMLInputElement).valueAsNumber)"
          />
        </div>
        <div class="tick-row">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        <div class="level-desc">
          <div class="desc-label">레벨 {{ modelValue[keys[i]] }}</div>
          <div class="desc-text">{{ part.levels[modelValue[keys[i]] - 1] }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { T3Answers } from '../../../types/survey'

const props = defineProps<{ modelValue: T3Answers }>()
const emit = defineEmits<{ 'update:modelValue': [value: T3Answers] }>()

const keys: (keyof T3Answers)[] = ['T3_PHY', 'T3_PEO', 'T3_COM', 'T3_RES', 'T3_STR', 'T3_FLX']

function handleInput(index: number, value: number) {
  emit('update:modelValue', { ...props.modelValue, [keys[index]]: value })
}

const parts = [
  {
    label: '파트 1  ·  근무환경 강도',
    question: '근무 환경의 물리적 강도는 어느 정도까지 괜찮으신가요?',
    levels: [
      '실내, 쾌적한 환경, 신체활동 거의 없음',
      '실내 위주, 가끔 이동, 약간의 신체활동',
      '실내외 혼재, 보통 수준의 신체활동',
      '실외 활동 많음, 다양한 환경 감수',
      '극한 환경, 강한 신체활동, 위험 노출 감수',
    ],
  },
  {
    label: '파트 2  ·  대인접촉 강도',
    question: '다른 사람들과 얼마나 자주, 가깝게 일하고 싶으신가요?',
    levels: [
      '혼자 일하는 것 선호, 사람 접촉 최소',
      '소수와 가끔 접촉',
      '팀 내 적당한 협업',
      '다수와 자주 접촉, 고객응대 포함',
      '항상 사람들과 함께, 신체적 접촉도 감수',
    ],
  },
  {
    label: '파트 3  ·  커뮤니케이션 강도',
    question: '업무 중 말하고 소통하는 비중이 어느 정도이길 원하시나요?',
    levels: [
      '이메일·문서 위주, 말할 일 거의 없음',
      '소규모 팀 내 소통 위주',
      '회의·전화 등 보통 수준의 소통',
      '발표·협상·외부소통 자주',
      '항상 말하고 설득하고 이끄는 역할',
    ],
  },
  {
    label: '파트 4  ·  책임·권한 강도',
    question: '업무에서 책임지고 결정하는 역할을 얼마나 원하시나요?',
    levels: [
      '주어진 일만, 책임 최소, 결정권 없음',
      '작은 범위의 책임과 결정',
      '팀·프로젝트 단위 책임과 결정',
      '조직·다수에 영향 미치는 책임과 권한',
      '전체를 책임지는 최종 의사결정자',
    ],
  },
  {
    label: '파트 5  ·  스트레스 강도',
    question: '업무 중 압박과 긴장감을 어느 정도까지 감수할 수 있으신가요?',
    levels: [
      '여유롭고 안정적인 환경 선호',
      '가끔 마감·압박 있어도 괜찮음',
      '적당한 경쟁과 마감이 있는 환경',
      '치열한 경쟁과 압박도 성장의 원동력',
      '위기와 갈등도 즐기는 고강도 환경',
    ],
  },
  {
    label: '파트 6  ·  업무 유동성',
    question: '업무 패턴이 얼마나 변화무쌍하길 원하시나요?',
    levels: [
      '규칙적 루틴, 예측가능한 업무 선호',
      '대체로 규칙적, 가끔 변화 괜찮음',
      '규칙과 변화 적당히 혼재',
      '변화 많고 유동적인 환경 선호',
      '완전히 비정형, 매일 다른 업무도 좋음',
    ],
  },
]
</script>
