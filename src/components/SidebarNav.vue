<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar__logo">
      <div>
        <img class="sidebar__logo-img" src="../assets/img/logo.webp" alt="Milton Huse logo" />
      </div>
    </div>
    <!-- Navigation layout -->
    <nav class="sidebar__nav">
      <div class="item active"><img src="@/assets/icons/home.svg" alt="Hus ikon" />Dashboard</div>
      <div class="item"><img src="@/assets/icons/calendar.svg" alt="Kalender ikon" />Kalender</div>
      <div class="item"><img src="@/assets/icons/file.svg" alt="Dokumenter ikon" />Dokumenter</div>
      <div class="item"><img src="@/assets/icons/clock.svg" alt="Historik ikon" />Historik</div>
      <div class="item"><img src="@/assets/icons/user.svg" alt="Profil ikon" />Profil</div>
      <div class="item">
        <img src="@/assets/icons/settings.svg" alt="Indstillinger ikon" />Indstillinger
      </div>
    </nav>
    <!-- Logout -->
    <div class="sidebar__bottom">
      <div class="item">
        <img src="@/assets/icons/log out.svg" alt="Log ud ikon" />Indstillinger
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.sidebar {
  width: 260px;
  height: 100vh;
  background: white;
  border-right: 1px solid $border-color;

  display: flex;
  flex-direction: column;

  // LOGO
  &__logo {
    height: 75px;
    width: 50%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid $border-color;

    &-img {
      width: 100%;
      object-fit: contain;
    }
  }

  // NAVIGATION
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

      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background: $secondary;
      }

      &.active {
        background: $accent-2;
        color: white;
      }
      //dette skal fikses senere, da der skal bruges svg i template og ikke png
      &.active img {
        color: white;
        //denne burde være stroke til farve af linjerne men bruger denne midlertidig som en lille hack
        filter: invert(1);
      }
    }
  }

  // LOGOUT (bund)
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

      cursor: pointer;
      border-radius: 6px;

      &:hover {
        background: $secondary;
      }
    }
  }
}
</style>
