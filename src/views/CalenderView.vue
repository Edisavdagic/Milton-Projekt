<script setup>
import Calender from '@/components/Calender.vue';
</script>

<template>
  <section class="calendar-page">
    <h1>Kalender</h1>
    <p>Se dine kommende aktiviteter</p>
    <Calender />
  </section>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.calendar-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  padding: $calendar-page-padding;
  background: $secondary;
  color: $textcolor-4;
  font-family: $font-family;

  h1 {
    margin: 0 0 $spacing-xxs;
    color: $textcolor-4;
    font-size: $h1-size;
    font-weight: $h1-weight;
    line-height: 0.95;
  }

  > p {
    margin: 0 0 $spacing-md;
    color: $textcolor-5;
    font-size: $dashboard-subtitle-size;
    font-weight: $h3-weight;
    line-height: 1;
  }
}
</style>
