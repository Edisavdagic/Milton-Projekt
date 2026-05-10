<script setup></script>

<!-- TODO: Skal senere renderes dynamisk via notifications som "nice to have funktionalitet"-->
<template>
  <section class="section-content notifications-page">
    <h1>Mine Notifikationer</h1>
    <section class="notifications-list">
      <article class="notification-item">
        <div class="notification-item__icon">
          <img src="@/assets/icons/MessageSecond.svg" alt="Besked ikon" />
        </div>

        <div class="notification-item__text">
          <h2>Besked fra *Navn*</h2>
          <p>Dato</p>
        </div>
      </article>

      <article class="notification-item">
        <div class="notification-item__icon">
          <img src="@/assets/icons/MessageSecond.svg" alt="Besked ikon" />
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
@use '@/assets/styles/views/notificationsview';
</style>
