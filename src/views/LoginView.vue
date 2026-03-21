<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function login() {
  // Her kan du senere tilføje rigtig login logik
  router.push('/dashboard')
}
</script>

<template>
  <div class="login-container">
    <h1>Login</h1>

    <form @submit.prevent="login">
      <input type="text" placeholder="Brugernavn" required />
      <input type="password" placeholder="Adgangskode" required />

      <button type="submit">Log ind</button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.5rem;
}

button {
  padding: 0.5rem;
  cursor: pointer;
}
</style>
