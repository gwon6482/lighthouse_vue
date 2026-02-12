<template>
  <div class="button-container">
    <RouterLink v-for="menu in menus" :key="menu.name" class="main-button" :to="menu.route">
      <span class="button-icon">{{ menu.icon }}</span>
      <span class="button-text">{{ menu.name }}</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  menus: { name: string; icon: string; route: string }[]
}>()
</script>
