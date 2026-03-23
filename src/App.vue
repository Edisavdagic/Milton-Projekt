<script setup>
import { RouterView } from 'vue-router'
import SidebarNav from "@/components/SidebarNav.vue";
</script>

<template>
  <div class="app">
    <SidebarNav />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>
