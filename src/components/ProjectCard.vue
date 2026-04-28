<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit-project", "show-history"]);
</script>

<template>
  <article class="project-item">
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
      <button v-if="project.isActive" type="button" @click="emit('edit-project', project)">
        Rediger
      </button>

      <button type="button" class="history-btn" @click="emit('show-history', project)">
        Historik
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use "@/assets/styles/variables" as *;

.project-item {
  display: grid;
  grid-template-columns: 220px 1fr 160px;
  gap: $spacing-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  border-radius: 10px;
  background: $accent-2;
  color: #fff;
  font-family: $font-family;

  &__img {
    width: 100%;
    height: 170px;
    object-fit: cover;
    border-radius: 14px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-wrap: wrap;
    margin-bottom: $spacing-sm;

    h3 {
      margin: 0;
      font-size: $h3-size;
      font-weight: $h3-weight;
      line-height: 1;
    }
  }

  &__tags {
    display: flex;
    gap: $spacing-xs;
    flex-wrap: wrap;
    margin-bottom: $spacing-sm;

    span {
      padding: $spacing-xs $spacing-sm;
      border-radius: 8px;
      background: $secondary;
      color: $primary;
      font-size: 14px;
      font-weight: $h2-weight;
    }
  }

  p {
    margin: 0 0 $spacing-sm;
    max-width: 760px;
    font-size: $body-size;
    font-weight: $body-weight;
    line-height: 1.45;
    color: $secondary;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    gap: $spacing-sm;

    button {
      border: none;
      border-radius: 8px;
      padding: $spacing-xs $spacing-sm;
      background: $secondary;
      color: $primary;
      font-family: $font-family;
      font-size: 15px;
      font-weight: $h2-weight;
      cursor: pointer;
    }
  }
}

.notice,
.status {
  display: inline-block;
  width: fit-content;
  padding: $spacing-xs $spacing-sm;
  border-radius: 8px;
  background: $accent-1;
  color: $primary;
  font-size: 14px;
  font-weight: $h2-weight;
}

.history-btn {
  background: $accent-1 !important;
  color: $primary;
}
</style>
