<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const localError = ref("");

async function login() {
  localError.value = "";

  try {
    await authStore.signIn(email.value, password.value);
    router.push(authStore.isAdmin ? "/projektoverview" : "/dashboard");
  } catch {
    localError.value = authStore.error || "Login mislykkedes. Prøv igen.";
  }
}
</script>

<template>
  <div class="login">
    <div class="login__left">
      <div class="login__box">
        <img class="login__logo" src="../assets/img/logo.webp" alt="Milton Huse logo" />

        <form class="login__form" @submit.prevent="login">
          <input class="login__input" v-model="email" type="email" placeholder="Email" required />
          <input
            class="login__input"
            v-model="password"
            type="password"
            placeholder="Adgangskode"
            required
          />

          <p v-if="localError" class="login__error">{{ localError }}</p>

          <button class="login__button" type="submit" :disabled="authStore.loading">
            {{ authStore.loading ? "Logger ind..." : "Log ind" }}
          </button>

          <a href="#" class="login__forgot-password">Glemt adgangskode?</a>
        </form>
      </div>
    </div>

    <div class="login__right">
      <img src="../assets/img/image-1.webp" alt="Hus" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.login {
  display: flex;
  flex-direction: row;

  &__left {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $secondary;
  }

  &__right {
    width: 50%;
    height: 100vh;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__box {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__logo {
    width: 100%;
    margin-bottom: 3rem;
  }

  &__form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  &__input {
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    border: none;
    font-size: $body-size;
    outline: none;
    box-sizing: border-box;

    &::placeholder {
      color: $secondary;
    }
  }

  &__button {
    width: 100%;
    padding: 0.9rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    color: white;
    background-color: $primary;
    font-size: $body-size;
    font-weight: 500;

    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  }

  &__error {
    margin: 0;
    color: #b30000;
    font-size: 0.9rem;
  }

  &__forgot-password {
    text-align: center;
    font-size: $body-size;
    color: $primary;
    text-decoration: underline;
  }
}
</style>
