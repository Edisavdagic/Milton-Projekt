<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import ChatWidget from "@/components/ChatWidget.vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isChatOpen = ref(false);

const showBackToProjectOverview = computed(
  () =>
    authStore.isAdmin &&
    ["dashboard", "calendar", "documents", "notifications", "history"].includes(route.name),
);

const goToProjectOverview = () => {
  router.push({ name: "projectoverview" });
};

const goToNotifications = () => {
  router.push({ name: "notifications" });
};

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
    <div class="topbarNav__address-pill">
      <button
        v-if="showBackToProjectOverview"
        class="topbarNav__back"
        @click="goToProjectOverview"
        type="button"
      >
        <img src="@/assets/icons/Arrow.svg" alt="Tilbage til projektoverview" />
      </button>
      <h4 class="topbarNav__address">{{ projectAddress }}</h4>
    </div>

    <div class="topbarNav__actions">
      <div class="topbarNav__icons">
        <button class="topbarNav__icon-button" @click="isChatOpen = !isChatOpen">
          <img src="@/assets/icons/Message.svg" alt="Besked ikon" />
        </button>
        <button class="topbarNav__icon-button" @click="goToNotifications">
          <img src="@/assets/icons/Notification.svg" alt="Notifikation ikon" />
        </button>
        <img src="@/assets/icons/Profile.svg" alt="Profil ikon" />
      </div>

      <div class="topbarNav__user">
        <div class="topbarNav__user-meta">
          <span class="topbarNav__user-name">{{ currentUser.name }}</span>
          <span class="topbarNav__user-email">{{ currentUser.email }}</span>
        </div>
        <div class="topbarNav__language-switch">
          <img src="@/assets/icons/Globe.svg" alt="Sprog ikon" />
          <span>Sprog</span>
        </div>
      </div>
    </div>

    <ChatWidget :is-open="isChatOpen" @close="isChatOpen = false" />
  </header>
</template>

<style lang="scss" src="@/assets/styles/_topbarNav.scss"></style>
