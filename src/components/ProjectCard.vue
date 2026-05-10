<script setup>
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/project';

defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edit-project', 'show-history']);
const router = useRouter();
const projectsStore = useProjectsStore();

function openDashboard(project) {
  projectsStore.setCurrentProject(project);
  router.push({ name: 'dashboard', params: { projectId: project.id } });
}
</script>

<template>
  <article class="project-item" @click="openDashboard(project)">
    <img class="project-item__img" :src="project.imageUrl" :alt="project.name" />

    <div class="project-item__info">
      <div class="project-item__title">
        <h3>{{ project.name }}</h3>

        <span v-if="project.notificationsCount" class="notice">
          {{ project.notificationsCount }} ny notifikation
        </span>
      </div>

      <div class="project-item__tags">
        <span>{{ project.projectType }}</span>
        <span>Byggeleder: {{ project.siteManagerName }}</span>
      </div>

      <p>{{ project.description }}</p>

      <span class="status"> Status: {{ project.statusText }} </span>
    </div>

    <div class="project-item__buttons">
      <button v-if="project.isActive" type="button" @click.stop="emit('edit-project', project)">
        <img src="@/assets/icons/Edit.svg" alt="Edit icon" />
        Rediger
      </button>

      <button type="button" class="history-btn" @click.stop="emit('show-history', project)">
        <img src="@/assets/icons/Eye.svg" alt="Eye icon" />
        Historik
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/components/projectCard';
</style>
