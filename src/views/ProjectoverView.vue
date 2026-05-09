<script setup>
import { onMounted, computed, ref } from 'vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { useProjectsStore } from '@/stores/project'

const projectsStore = useProjectsStore()
const search = ref('')
const statusFilter = ref('all')
const sortOrder = ref('newest')

onMounted(() => {
  projectsStore.fetchProjects()
  projectsStore.setCurrentProject(null)
})

const filterProjects = computed(() => {
  const term = search.value.toLowerCase().trim()

  return projectsStore.projects
    .filter((project) => {
      if (statusFilter.value === 'active') return project.isActive
      if (statusFilter.value === 'completed') return !project.isActive
      return true
    })
    .filter((project) => {
      if (!term) return true
      return [project.name, project.projectType, project.siteManagerName, project.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0

      if (sortOrder.value === 'newest') {
        return bTime - aTime
      }

      return aTime - bTime
    })
})

const activeProjects = computed(() =>
  filterProjects.value.filter((project) => project.isActive)
)

const completedProjects = computed(() =>
  filterProjects.value.filter((project) => !project.isActive)
)

function setStatusFilter(value) {
  statusFilter.value = value
}

function setSortOrder(value) {
  sortOrder.value = value
}

function editProject(project) {
  console.log(project)
}

function showHistory(project) {
  console.log(project)
}
</script>

<template>
  <section class="projects-overview">
    <div class="projects-overview__top">
      <h1 class="projects-overview__title">Projekt Oversigt</h1>

      <div class="projects-overview__controls">
        <div class="projects-overview__search">
          <input
            v-model="search"
            type="text"
            placeholder="Search"
          />
          <img
            class="projects-overview__search-icon"
            src="@/assets/icons/Search.svg"
            alt="Søge ikon"
          />
        </div>

        <div class="projects-overview__filters">
          <button
            type="button"
            :class="[
              'projects-overview__chip',
              { 'projects-overview__chip--active': statusFilter === 'active' }
            ]"
            @click="setStatusFilter('active')"
          >
            Aktive
          </button>

          <button
            type="button"
            :class="[
              'projects-overview__chip',
              { 'projects-overview__chip--active': statusFilter === 'completed' }
            ]"
            @click="setStatusFilter('completed')"
          >
            Afsluttet
          </button>

          <button
            type="button"
            :class="[
              'projects-overview__chip',
              { 'projects-overview__chip--active': sortOrder === 'newest' }
            ]"
            @click="setSortOrder('newest')"
          >
            Nyeste
          </button>

          <button
            type="button"
            :class="[
              'projects-overview__chip',
              { 'projects-overview__chip--active': sortOrder === 'oldest' }
            ]"
            @click="setSortOrder('oldest')"
          >
            Ældste
          </button>
        </div>

        <button class="projects-overview__new-button">
          <img
            class="projects-overview__new-button-icon"
            src="@/assets/icons/Home 2.svg"
            alt="Hus ikon"
          />
          Nyt Projekt
        </button>
      </div>
    </div>

    <div class="projects-overview__section">
      <h2 class="projects-overview__section-title">Aktive</h2>
      <div class="projects-overview__list">
        <ProjectCard
          v-for="project in activeProjects"
          :key="project.id"
          :project="project"
          @edit-project="editProject"
          @show-history="showHistory"
        />
      </div>
    </div>

    <div class="projects-overview__section">
      <h2 class="projects-overview__section-title">Afsluttet</h2>
      <div class="projects-overview__list">
        <ProjectCard
          v-for="project in completedProjects"
          :key="project.id"
          :project="project"
          @edit-project="editProject"
          @show-history="showHistory"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@import '@/assets/styles/views/_projectoverview.scss';
</style>
