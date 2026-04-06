<template>
  <div class="empty-tab">
    <p class="empty-tab__text">내용없음</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  jobCode: string
}>()
</script>

<style scoped lang="scss">
.empty-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;

  &__text {
    font-size: 14px;
    color: #bbb;
  }
}
</style>
