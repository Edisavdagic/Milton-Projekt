<script setup>
import { onMounted } from 'vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { useProjectsStore } from '@/stores/project'

const projectsStore = useProjectsStore()

onMounted(() => {
  projectsStore.fetchProjects()
})

function editProject(project) {
  console.log(project)
}

function showHistory(project) {
  console.log(project)
}
</script>

<template>
  <section class="projects-overview">
    <ProjectCard
      v-for="project in projectsStore.projects"
      :key="project.id"
      :project="project"
      @edit-project="editProject"
      @show-history="showHistory"
    />
  </section>
</template>
