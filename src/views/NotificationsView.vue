<script setup>
</script>

<!-- TODO: Skal senere renderes dynamisk via notifications som "nice to have funktionalitet"-->
<template>
  <section class="notifications-page">
    <section class="notifications-list">
      <article class="notification-item">
        <div class="notification-item__icon">
          <img src="@/assets/icons/File.svg" alt="Besked ikon" />
        </div>

        <div class="notification-item__text">
          <h2>Besked fra *Navn*</h2>
          <p>Dato</p>
        </div>
      </article>

      <article class="notification-item">
        <div class="notification-item__icon">
          <img src="@/assets/icons/File.svg" alt="Besked ikon" />
        </div>

        <div class="notification-item__text">
          <h2>Besked fra *Navn*</h2>
          <p>Dato</p>
        </div>
      </article>

      <article class="notification-item">
        <div class="notification-item__icon">
          <img src="@/assets/icons/Home.svg" alt="Projekt ikon" />
        </div>

        <div class="notification-item__text">
          <h2>Du er nu en del af projekt *Adresse*</h2>
          <p>Dato</p>
        </div>
      </article>

      <article class="notification-item">
        <div class="notification-item__icon">
          <img src="@/assets/icons/Home.svg" alt="Projekt ikon" />
        </div>

        <div class="notification-item__text">
          <h2>Du er blevet inviteret til projekt *Adresse*</h2>
          <p>Dato</p>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.notifications-page {
  width: 100%;
  min-height: 100%;
  padding: $spacing-sm $spacing-xl $spacing-xl;
  font-family: $font-family;
  background-color: $secondary;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 28px;
  padding: 36px 0 28px;
  border-bottom: 2px solid #d8d0dc;

  &__icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    margin-top: 2px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  &__text {
    h2 {
      margin: 0 0 2px;
      font-size: 32px;
      font-weight: 600;
      line-height: 1.15;
      color: #201d24;
    }

    p {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      line-height: 1.2;
      color: #8d8992;
    }
  }
}
</style>
