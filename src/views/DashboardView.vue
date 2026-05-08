<script setup>
import { computed } from "vue";
import DashboardGallery from "@/components/DashboardGallery.vue";
import DashboardMilestone from "@/components/DashboardMilestone.vue";
import DashboardTaskList from "@/components/DashboardTaskList.vue";
import { useProjectsStore } from "@/stores/project";

const projectsStore = useProjectsStore();
const projectStatus = computed(() => projectsStore.currentProject?.statusText ?? "");
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
@use "../assets/styles/variables" as *;

.dashboard {
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  background: $secondary;
  color: $textcolor-4;
  font-family: $font-family;
}

.dashboard__top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.dashboard__title {
  margin: 0;
  color: $textcolor-4;
  font-size: $h1-size;
  font-weight: $h1-weight;
  line-height: 0.95;
}

.dashboard__status {
  display: inline-flex;
  align-items: center;
  min-height: $dashboard-chip-height;
  padding: $dashboard-status-padding-y $spacing-xs;
  border: $border-width solid $accent-2;
  border-radius: $radius-sm;
  background: $accent-1;
  color: $textcolor-3;
  font-size: $dashboard-status-font-size;
  font-weight: $h2-weight;
  line-height: 1;
}
</style>
