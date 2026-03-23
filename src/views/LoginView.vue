<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function login() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-box-stack">
        <img class="logo" src="../assets/img/logo.webp" alt="Milton Huse logo" />

        <form @submit.prevent="login">
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" name="password" placeholder="Adgangskode" required
          />
          <button type="submit">Log ind</button>
          <a href="#" class="forgot-password">Glemt adgangskode?</a>
        </form>
      </div>
    </div>

    <div class="login-right">
      <img src="../assets/img/image-1.webp" alt="Hus" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.login-container {
  display: flex;
  flex-direction: row;

  .login-left {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $secondary;

    .login-box-stack {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .logo {
        width: 100%;
        margin-bottom: 3rem;
      }

      form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;

        input {
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

        button {
          width: 100%;
          padding: 0.9rem 1rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          color: white;
          background-color: $primary;
          font-size: $body-size;
          font-weight: 500;
        }

        .forgot-password {
          text-align: center;
          font-size: $body-size;
          color: $primary;
          text-decoration: underline;
        }
      }
    }
  }

  .login-right {
    width: 50%;
    height: 100vh;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
