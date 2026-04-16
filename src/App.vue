<script setup>
import { RouterView } from 'vue-router'
import SidebarNav from "@/components/SidebarNav.vue";
import TopbarNav from "@/components/TopbarNav.vue";


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
    <TopbarNav
    :projectAddress="address"
    :currentUser="user" 
    />
    <SidebarNav />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>
