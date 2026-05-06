<script setup>
import { computed } from "vue";
import { useRouter, RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useProjectsStore } from "@/stores/project";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const projectsStore = useProjectsStore();

const currentProjectId = computed(
  () => route.params.projectId || projectsStore.currentProjectId || ""
);

const isProjectRoute = computed(
  () => ["dashboard", "calendar", "documents"].includes(route.name)
);

async function logout() {
  await authStore.signOutUser();
  router.replace({ name: "login" });
}
</script>

<template>
  <aside class="sidebar">
    <routerLink
      v-if="currentProjectId"
      :to="{ name: 'dashboard', params: { projectId: currentProjectId } }"
    >
      <div class="sidebar__logo">
        <div>
          <img class="sidebar__logo-img" src="../assets/img/logo.webp" alt="Milton Huse logo" />
        </div>
      </div>
    </routerLink>
    <div v-else class="sidebar__logo">
      <img class="sidebar__logo-img" src="../assets/img/logo.webp" alt="Milton Huse logo" />
    </div>

    <!-- Project Navigation (for users and admins inside a project) -->
    <nav v-if="isProjectRoute" class="sidebar__nav">
      <!-- Dashboard -->
      <RouterLink :to="{ name: 'dashboard', params: { projectId: currentProjectId } }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Home.svg" alt="Hus ikon" />
        Dashboard
      </RouterLink>

      <!-- Calendar -->
      <RouterLink :to="{ name: 'calendar', params: { projectId: currentProjectId } }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Calendar.svg" alt="Kalender ikon" />
        Kalender
      </RouterLink>

      <!-- Documents -->
      <RouterLink :to="{ name: 'documents', params: { projectId: currentProjectId } }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/File.svg" alt="Dokumenter ikon" />
        Dokumenter
      </RouterLink>

      <!-- History -->
      <div class="item">
        <img src="@/assets/icons/Clock.svg" alt="Historik ikon" />
        Historik
      </div>

      <!-- Profile -->
      <div class="item">
        <img src="@/assets/icons/User.svg" alt="Profil ikon" />
        Profil
      </div>

      <!-- Settings -->
      <div class="item">
        <img src="@/assets/icons/Settings.svg" alt="Indstillinger ikon" />
        Indstillinger
      </div>
    </nav>

    <!-- Admin Navigation -->
    <nav v-else-if="authStore.isAdmin" class="sidebar__nav">
      <!-- roject Overview -->
      <RouterLink :to="{ name: 'projectoverview' }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Home.svg" alt="Projektoversigt ikon" />
        Projektoversigt
      </RouterLink>

      <!-- Profile -->
      <div class="item">
        <img src="@/assets/icons/User.svg" alt="Profil ikon" />
        Profil
      </div>

      <!-- Settings -->
      <div class="item">
        <img src="@/assets/icons/Settings.svg" alt="Indstillinger ikon" />
        Indstillinger
      </div>
    </nav>

    <!-- Regular User Navigation (Project) -->
    <nav v-else class="sidebar__nav">
      <!-- Dashboard -->
      <RouterLink :to="{ name: 'dashboard', params: { projectId: currentProjectId } }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Home.svg" alt="Hus ikon" />
        Dashboard
      </RouterLink>

      <!-- Calendar -->
      <RouterLink :to="{ name: 'calendar', params: { projectId: currentProjectId } }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Calendar.svg" alt="Kalender ikon" />
        Kalender
      </RouterLink>

      <!-- Documents -->
      <RouterLink :to="{ name: 'documents', params: { projectId: currentProjectId } }" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/File.svg" alt="Dokumenter ikon" />
        Dokumenter
      </RouterLink>

      <!-- History -->
      <div class="item">
        <img src="@/assets/icons/Clock.svg" alt="Historik ikon" />
        Historik
      </div>

      <!-- Profile -->
      <div class="item">
        <img src="@/assets/icons/User.svg" alt="Profil ikon" />
        Profil
      </div>

      <!-- Settings -->
      <div class="item">
        <img src="@/assets/icons/Settings.svg" alt="Indstillinger ikon" />
        Indstillinger
      </div>
    </nav>

    <!-- Logout -->
    <div class="sidebar__bottom">
      <button to="/" type="button" class="item" @click="logout">
        <img src="@/assets/icons/Log out.svg" alt="Log ud ikon" />
        Log ud
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: white;
  border-right: 1px solid $border-color;
  z-index: 1000;

  display: flex;
  flex-direction: column;

  &__logo {
    height: 75px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid $border-color;
    box-sizing: border-box;

    &-img {
      width: 120px;
      max-width: 100%;
      object-fit: contain;
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px 0;

    .item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 24px;

      font-size: $body-size;
      font-weight: $h2-weight;
      color: inherit;
      text-decoration: none;

      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background: $secondary;
      }

      &.active {
        background: $accent-2;
        color: white;
      }

      &.active img {
        filter: invert(1);
      }

      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
    }
  }

  &__bottom {
    margin-top: auto;
    padding: 16px 0;

    .item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 24px;
      background: transparent;
      border: none;
      width: 100%;

      font-size: $body-size;
      font-weight: $h2-weight;
      color: inherit;
      text-decoration: none;

      cursor: pointer;
      border-radius: 6px;
      transition: 0.2s;

      &:hover {
        background: $secondary;
      }

      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
    }
  }
}
</style>
