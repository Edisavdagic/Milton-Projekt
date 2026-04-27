<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="project-item">
    <img
      class="project-item__img"
      :src="project.image"
      :alt="project.adress"
    />

    <div class="project-item__info">
      <div class="project-item__title">
        <h3>{{ project.adress }}</h3>

        <span v-if="project.notifications" class="notice">
          {{ project.notifications }} ny notifikation
        </span>
      </div>

      <div class="project-item__tags">
        <span>{{ project.type }}</span>
        <span>Byggeleder: {{ project.buildManager }}</span>
      </div>

      <p>{{ project.description }}</p>

      <span class="status">
        Status: {{ project.status }}
      </span>
    </div>

    <div class="project-item__buttons">
      <button v-if="project.isActive" type="button">
        Rediger
      </button>

      <button type="button" class="history-btn">
        Historik
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.project-item {
  display: grid;
  grid-template-columns: 220px 1fr 160px;
  gap: 24px;
  padding: 28px;
  margin-bottom: 24px;
  border-radius: 10px;
  background: #006b78;
  color: #fff;

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
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 14px;

    h3 {
      margin: 0;
      font-size: 42px;
      font-weight: 800;
      line-height: 1;
    }
  }

  &__tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 14px;

    span {
      padding: 7px 14px;
      border-radius: 8px;
      background: #fff;
      color: #1e1e1e;
      font-size: 14px;
      font-weight: 700;
    }
  }

  p {
    margin: 0 0 14px;
    max-width: 760px;
    font-size: 18px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.92);
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    gap: 14px;

    button {
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      background: #fff;
      color: #222;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}

.notice,
.status {
  display: inline-block;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 8px;
  background: #ffe08a;
  color: #222;
  font-size: 14px;
  font-weight: 800;
}

</style>
