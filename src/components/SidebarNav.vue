<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProjectsStore } from '@/stores/project';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const projectsStore = useProjectsStore();

const currentProjectId = computed(
  () => route.params.projectId || projectsStore.currentProjectId || '',
);

const isProjectRoute = computed(
  () =>
    (currentProjectId.value && ['dashboard', 'calendar', 'documents', 'history'].includes(route.name)) ||
    (currentProjectId.value && route.name === 'notifications'),
);

const isAdminProjectOverview = computed(
  () => authStore.isAdmin && route.name === 'projectoverview',
);

async function logout() {
  await authStore.signOutUser();
  router.replace({ name: 'login' });
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

    <!-- Project Navigation (for users inside a project, including notifications) -->
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
      <RouterLink
        :to="{ name: 'history' }"
        class="item"
        active-class="active"
        exact-active-class="active"
      >
          <img src="@/assets/icons/Clock.svg" alt="Historik ikon" />
          Historik
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

    <!-- Admin Navigation on project overview only -->
    <nav v-else-if="isAdminProjectOverview" class="sidebar__nav">
      <!-- Project Overview -->
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
    <nav v-else-if="currentProjectId" class="sidebar__nav">
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
@import '@/assets/styles/components/_sidebarNav.scss';
</style>
