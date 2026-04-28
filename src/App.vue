<script setup>
import { computed } from "vue";
import { RouterView } from "vue-router";
import SidebarNav from "@/components/SidebarNav.vue";
import TopbarNav from "@/components/TopbarNav.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const user = computed(() => ({
  name: authStore.user?.displayName || authStore.user?.email || "Guest",
  email: authStore.user?.email || "Not signed in",
}));

const address = "123 Main St";
</script>

<template>
  <div class="app">
    <!-- Fixed sidebar -->
    <SidebarNav v-if="authStore.authReady && authStore.isAuthenticated" />

    <!-- Main area -->
    <div
      :class="[
        'app__main',
        { 'app__main--with-sidebar': authStore.authReady && authStore.isAuthenticated },
      ]"
    >
      <!-- Topbar -->
      <TopbarNav
        v-if="authStore.authReady && authStore.isAuthenticated"
        :projectAddress="address"
        :currentUser="user"
      />

      <!-- Page content -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  background: #f8f8f8;
}

/* Everything except sidebar */
.app__main {
  margin-left: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main--with-sidebar {
  margin-left: 260px;
}

/* Main page area */
.content {
  flex: 1;
  box-sizing: border-box;
  width: 100%;
}
</style>
