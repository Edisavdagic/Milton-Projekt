<script setup></script>

<template>
  <section class="section-content history-page">
    <h1>Historik</h1>

    <div class="history-page__controls">
      <div class="history-page__search">
        <input type="text" placeholder="Search" />
        <img class="history-page__search-icon" src="@/assets/icons/Search.svg" alt="Søge ikon" />
      </div>

      <div class="history-page__filters">
        <button class="history-page__chip history-page__chip--active" type="button">Alle</button>

        <button class="history-page__chip" type="button">Ændringer</button>

        <button class="history-page__chip" type="button">Tilføjelser</button>

        <button class="history-page__chip" type="button">Dokumentation</button>
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
          <img src="@/assets/icons/Check square.svg" alt="Tjek ikon" />
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
@import '@/assets/styles/views/_historyview.scss';
</style>
