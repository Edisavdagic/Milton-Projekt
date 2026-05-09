<script setup>
import { computed } from 'vue';
import DashboardGallery from '@/components/DashboardGallery.vue';
import DashboardMilestone from '@/components/DashboardMilestone.vue';
import DashboardTaskList from '@/components/DashboardTaskList.vue';
import { useProjectsStore } from '@/stores/project';

const projectsStore = useProjectsStore();
const projectStatus = computed(() => projectsStore.currentProject?.statusText ?? '');
</script>

<template>
  <section class="section-content dashboard">
    <div class="dashboard__top">
      <h1 class="dashboard__title">Dashboard</h1>
      <span v-if="projectStatus" class="dashboard__status"> Status: {{ projectStatus }} </span>
    </div>

    <DashboardGallery />
    <DashboardMilestone />
    <DashboardTaskList />
  </section>
</template>

<style scoped lang="scss">
@import '@/assets/styles/views/_dashboardview.scss';
</style>
