<script setup>
import { ref } from "vue";
import ChatWidget from "@/components/ChatWidget.vue";

defineProps({
  projectAddress: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  currentUser: {
    type: Object,
    required: true,
  },
});

const isChatOpen = ref(false);
</script>

<template>
  <header class="topbarNav">
    <div class="address-pill">
      <p>{{ projectAddress }}</p>
    </div>

    <div class="topbar-actions">
      <button class="icon-button" @click="isChatOpen = !isChatOpen">
        <img src="@/assets/icons/Message.svg" alt="Besked ikon" />
      </button>

      <img src="@/assets/icons/Notification.svg" alt="Notifikation ikon" />
      <img src="@/assets/icons/Profile.svg" alt="Profil ikon" />

      <div class="user-meta">
        <span class="user-name">{{ currentUser.name }}</span>
        <span class="user-email">{{ currentUser.email }}</span>
      </div>

      <div class="language-switch">
        <img src="@/assets/icons/Globe.svg" alt="Sprog ikon" />
        <span>Sprog</span>
      </div>
    </div>

    <ChatWidget
      :is-open="isChatOpen"
      :project-id="projectId"
      :current-user="currentUser"
      @close="isChatOpen = false"
    />
  </header>
</template>

<style lang="scss" src="@/assets/styles/_topbarNav.scss"></style>
