<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function login() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="login-container">
    <h1>Login</h1>

    <form @submit.prevent="login">

    </form>
  </div>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.login-container {
  max-width: 300px;
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h1 {
    color: $primary;
  }
}

input {
  padding: 0.5rem;
  border: 1px solid $secondary;
}

button {
  padding: 0.5rem;
  cursor: pointer;
  color: white;
  background-color: $primary;
}
</style>

