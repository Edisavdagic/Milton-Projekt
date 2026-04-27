<script setup>

</script>

<template>
<article class="project-card">
    <img class="project-card__image" :src="project.imageUrl" :alt="project.title" />

    <section class="project-card__content">
      <div class="project-card__header">
        <h3>{{ project.title }}</h3>

        <span v-if="project.notifications > 0" class="badge badge--yellow">
          {{ project.notifications }} ny notifikation
        </span>
      </div>

      <p>{{ project.description }}</p>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;


</style>
