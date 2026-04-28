<template>
  <aside class="sidebar">
    <!-- Logo -->
    <routerLink to="/dashboard">
      <div class="sidebar__logo">
        <div>
          <img class="sidebar__logo-img" src="../assets/img/logo.webp" alt="Milton Huse logo" />
        </div>
      </div>
    </routerLink>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <!-- Dashboard -->
      <RouterLink to="/dashboard" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Home.svg" alt="Hus ikon" />
        Dashboard
      </RouterLink>

      <!-- Kalender -->
      <RouterLink to="/kalender" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/Calendar.svg" alt="Kalender ikon" />
        Kalender
      </RouterLink>

      <!-- Dokumenter -->
      <RouterLink to="/dokumenter" class="item" active-class="active" exact-active-class="active">
        <img src="@/assets/icons/File.svg" alt="Dokumenter ikon" />
        Dokumenter
      </RouterLink>

      <!-- Notifikationer -->
      <RouterLink
        to="/notifikationer"
        class="item"
        active-class="active"
        exact-active-class="active"
      >
        <img src="@/assets/icons/Clock.svg" alt="Historik ikon" />
        Historik
      </RouterLink>

      <!-- Ikke lavet -->
      <div class="item">
        <img src="@/assets/icons/User.svg" alt="Profil ikon" />
        Profil
      </div>

      <!-- Ikke lavet -->
      <div class="item">
        <img src="@/assets/icons/Settings.svg" alt="Indstillinger ikon" />
        Indstillinger
      </div>
    </nav>

    <!-- Logout -->
    <div class="sidebar__bottom">
      <RouterLink to="/" class="item" @click.prevent="logout">
        <img src="@/assets/icons/Log out.svg" alt="Log ud ikon" />
        Log ud
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

async function logout() {
  try {
    await authStore.signOutUser();
  } finally {
    router.push("/");
  }
}
</script>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: white;
  border-right: 1px solid $border-color;
  z-index: 1000;

  display: flex;
  flex-direction: column;

  &__logo {
    height: 75px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid $border-color;
    box-sizing: border-box;

    &-img {
      width: 120px;
      max-width: 100%;
      object-fit: contain;
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px 0;

    .item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 24px;

      font-size: $body-size;
      font-weight: $h2-weight;
      color: inherit;
      text-decoration: none;

      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background: $secondary;
      }

      &.active {
        background: $accent-2;
        color: white;
      }

      &.active img {
        filter: invert(1);
      }

      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
    }
  }

  &__bottom {
    margin-top: auto;
    padding: 16px 0;

    .item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 24px;

      font-size: $body-size;
      font-weight: $h2-weight;
      color: inherit;
      text-decoration: none;

      cursor: pointer;
      border-radius: 6px;
      transition: 0.2s;

      &:hover {
        background: $secondary;
      }

      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
    }
  }
}
</style>
