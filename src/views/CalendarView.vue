<script setup>
import Calendar from '@/components/Calendar.vue';
</script>

<template>
  <section class="section-content calendar-page">
    <h1>Kalender</h1>
    <p>Se dine kommende aktiviteter</p>
    <Calendar />
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/views/calendarview';
</style>
