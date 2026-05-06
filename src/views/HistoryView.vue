<script setup>
</script>

<template>
  <section class="history-page">
    <h1> Historik </h1>

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
  margin: 0 0 36px;
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
}

.history-group {
  margin-bottom: 48px;
}

.history-group h2 {
  margin: 0 0 24px;
  font-size: 28px;
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
      font-weight: 600;
      line-height: 1.15;
      color: #201d24;
    }

    p {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      line-height: 1.2;
      color: $tertiary;
    }
  }
}
</style>


