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
});
</script>

<template>
  <header class="topbarNav">
    <div class="address-pill">
      <p>
        {{ projectAddress }}
      </p>
    </div>

    <div class="topbar-actions">
      <!-- Fix chat(1) and notification(2) and color icons later -->
      <img src="@/assets/icons/Message.svg" alt="Besked ikon" />
      <img src="@/assets/icons/Notification.svg" alt="Notifikation ikon" />
      <img src="@/assets/icons/Profile.svg" alt="Profil ikon" />

      <div class="user-meta">
        <span class="user-name">{{ currentUser.name }}</span>
        <span class="user-email">{{ currentUser.email }}</span>
      </div>

      <div class="language-switch">
        <img src="@/assets/icons/Globe.svg" alt="Notifikation ikon" />
        <span>Sprog</span>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use "@/assets/styles/topbarNav";
</style>
