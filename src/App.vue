<script setup>
import { RouterView } from 'vue-router'
import SidebarNav from '@/components/SidebarNav.vue'
import TopbarNav from '@/components/TopbarNav.vue'

// Temporary mock user data for UI development
// TODO: Replace with Firebase authentication and Pinia store
const user = {
  name: 'user',
  email: 'email@example.com'
}

const address = '123 Main St'
</script>

<template>
  <div class="app">
    <!-- Fixed sidebar -->
    <SidebarNav />

    <!-- Main area -->
    <div class="app__main">
      <!-- Topbar -->
      <TopbarNav
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
  margin-left: 260px; /* same width as sidebar */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main page area */
.content {
  flex: 1;
  padding: 24px;
  box-sizing: border-box;
  width: 100%;
}
</style>
