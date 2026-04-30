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
@use "../assets/styles/variables" as *;

.projects-overview {
  padding: $spacing-xl;
  font-family: $font-family;

  &__top {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  &__title {
    margin: 0;
    font-size: $h1-size;
    font-weight: $h1-weight;
    color: $primary;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  &__search {
    position: relative;
    flex: 0 0 280px;
    max-width: 280px;
    min-width: 220px;

    input {
      box-sizing: border-box;
      width: 100%;
      padding: $spacing-xs $spacing-lg $spacing-xs $spacing-sm;
      border-radius: 999px;
      border: 1px solid $border-color;
      font-size: $body-size;
      outline: none;
      background: #fff;
      color: $primary;
    }
  }

  &__search-icon {
    position: absolute;
    right: $spacing-sm;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: $tertiary;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    flex: 1 1 auto;
    min-width: 260px;
  }

  &__new-button {
    background: $accent-2;
    border: 1px sollid $border-color;
    color: #fff;
    padding: $spacing-xxs $spacing-sm;
    border-radius: 5px;
    font-size: $body-size;
    cursor: pointer;
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__new-button-icon {
    width: 20px;
    height: 20px;
    display: inline-block;
  }

  &__chip {
    border: 1px solid $border-color;
    background: #fff;
    color: $primary;
    padding: $spacing-xxs $spacing-sm;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  &__chip--active {
    background: $accent-2;
    color: #fff;
    border-color: $accent-2;
  }

  &__section {
    margin-bottom: $spacing-xl;
  }

  &__section-title {
    margin: 0 0 $spacing-sm 0;
    font-size: $h2-size;
    color: $primary;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
}
</style>
