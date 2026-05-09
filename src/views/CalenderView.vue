<script setup>
import Calender from "@/components/Calender.vue";
</script>

<template>
  <section class="section-content calendar-page">
    <h1>Kalender</h1>
    <p>Se dine kommende aktiviteter</p>
    <Calender />
  </section>
</template>

<style scoped lang="scss">
@import '@/assets/styles/views/_calenderview.scss';
</style>
