<script setup>
</script>

<template>
  <section class="history-page">
    <h1> Historik </h1>

    <div class="history-page__controls">
        <div class="history-page__search">
          <input
            type="text"
            placeholder="Search"
          />
          <img
            class="history-page__search-icon"
            src="@/assets/icons/Search.svg"
            alt="Søge ikon"
          />
        </div>

        <div class="history-page__filters">
          <button class="history-page__chip history-page__chip--active" type="button">
            Alle
          </button>

          <button class="history-page__chip" type="button">
            Ændringer
          </button>

          <button class="history-page__chip" type="button">
            Tilføjelser
          </button>

          <button class="history-page__chip" type="button">
            Dokumentation
          </button>
        </div>
      </div>


    <section class="history-group">
      <h2>I dag</h2>

      <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Upload.svg" alt="Tilføj ikon" />
        </div>

        <div class="history-item__text">
          <h3>Billede Tilføjet</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

      <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Edit.svg" alt="Rediger ikon" />
        </div>

        <div class="history-item__text">
          <h3>1 Fil ændret</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

            <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Check Square.svg" alt="Tjek ikon" />
        </div>

        <div class="history-item__text">
          <h3>Dokumentation godkendt</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

            <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Send.svg" alt="Send ikon" />
        </div>

        <div class="history-item__text">
          <h3>Dokumentation sendt</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>
    </section>

    <section class="history-group">
      <h2>I går</h2>

      <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Upload.svg" alt="Tilføj ikon" />
        </div>

        <div class="history-item__text">
          <h3>3 Filer tilføjet</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

      <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Calendar.svg" alt="Kalender ikon" />
        </div>

        <div class="history-item__text">
          <h3>Tidsplan opdateret</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

       <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Edit.svg" alt="Rediger ikon" />
        </div>

        <div class="history-item__text">
          <h3>2 Opgaver rettet</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

       <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Upload.svg" alt="Tilføj ikon" />
        </div>

        <div class="history-item__text">
          <h3>1 3D fil opdateret</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

      <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Upload.svg" alt="Tilføj ikon" />
        </div>

        <div class="history-item__text">
          <h3>1 3D fil tilføjet</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>

      <article class="history-item">
        <div class="history-item__icon">
          <img src="@/assets/icons/Edit.svg" alt="Rediger ikon" />
        </div>

        <div class="history-item__text">
          <h3>1 Fil ændret</h3>
          <p>Ansvarlig & dato</p>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

h1 {
  font-size: $h1-size;
  font-weight: $h1-weight;
  line-height: 1.15;
  color: #000;
}

.history-page {
  width: 100%;
  min-height: 100%;
  padding: $spacing-sm $spacing-xl $spacing-xl;
  font-family: $font-family;

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-wrap: wrap;
    margin-bottom: 31px;
  }

  &__search {
    position: relative;
    flex: 0 0 420px;
    max-width: 420px;
    min-width: 260px;

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
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  &__chip {
    border: 1px solid $border-color;
    background: #fff;
    color: $primary;
    padding: $spacing-xxs $spacing-sm;
    border-radius: 5px;
    cursor: default;
    font-size: $body-size;
  }

  &__chip--active {
    background: $accent-2;
    color: #fff;
    border-color: $accent-2;
  }
}

.history-group {
  margin-bottom: 48px;
}

.history-group h2 {
  margin: 0 0 24px;
  font-size: $h3-size;
  font-weight: $h2-weight;
  color: #201d24;
}

.history-item {
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
      width: 30px;
      height: 30px;
      object-fit: contain;
      display: block;
    }
  }

  &__text {
    width: 100%;

    h3 {
      margin: 0 0 2px;
      font-size: 32px;
      font-weight: $h2-weight;
      line-height: 1.15;
      color: #201d24;
    }

    p {
      margin: 0;
      font-size: 22px;
      font-weight: $h3-weight;
      line-height: 1.2;
      color: $tertiary;
    }
  }
}
</style>


