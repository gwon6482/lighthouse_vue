<template>
  <div class="search-bar">
    <div class="search-bar__inner">
      <input
        class="search-bar__input"
        type="text"
        placeholder="직업을 검색해보세요"
        :value="query"
        @input="inputValue = ($event.target as HTMLInputElement).value"
        @keydown.enter="handleSearch"
      />
      <button
        v-if="query"
        class="search-bar__clear"
        @click="handleClear"
      >
        ✕
      </button>
      <button class="search-bar__btn" @click="handleSearch">
        검색
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  query: string
}>()

const emit = defineEmits<{
  search: [query: string]
  clear: []
}>()

const inputValue = ref(props.query)

function handleSearch() {
  emit('search', inputValue.value)
}

function handleClear() {
  inputValue.value = ''
  emit('clear')
}
</script>

<style scoped lang="scss">
.search-bar {
  width: 100%;
  padding: 0 20px;

  &__inner {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    background-color: #f5f5f5;
    border-radius: 14px;
    padding: 10px 14px;
  }

  &__input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 15px;
    color: #333;
    outline: none;

    &::placeholder { color: #aaa; }
  }

  &__clear {
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: #aaa;
    font-size: 13px;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
  }

  &__btn {
    flex-shrink: 0;
    border: none;
    border-radius: 10px;
    background-color: #333;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 18px;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:active { background-color: #555; }

    @media (hover: hover) {
      &:hover { background-color: #555; }
    }
  }
}
</style>
