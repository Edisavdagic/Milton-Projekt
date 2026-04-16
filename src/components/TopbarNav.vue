<script setup>
defineProps({
  projectAddress: {
    type: String,
    required: true,
  },
  currentUser: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <header class="topbarNav">
    <div class="address-pill">{{ projectAddress }}</div>

    <div class="topbar-actions">
       <!-- Fix chat(1) and notification(2) and color icons later -->
      <img src="@/assets/icons/user.svg" alt="Profil ikon" />
      <img src="@/assets/icons/user.svg" alt="Profil ikon" />
      <img src="@/assets/icons/user.svg" alt="Profil ikon" />

      <div class="user-meta">
        <span class="user-name">{{ currentUser.name }}</span>
        <span class="user-email">{{ currentUser.email }}</span>
      </div>

      <div class="language-switch">
        <span aria-hidden="true">◍</span>
        <span>Sprog</span>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/styles/topbarNav';
</style>