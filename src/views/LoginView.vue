<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProjectsStore } from '@/stores/project';

const router = useRouter();
const authStore = useAuthStore();
const projectsStore = useProjectsStore();

const email = ref('');
const password = ref('');
const localError = ref('');

async function login() {
  localError.value = '';

  try {
    await authStore.signIn(email.value, password.value);

    if (authStore.isAdmin) {
      router.push({ name: 'projectoverview' });
    } else {
      await projectsStore.fetchUserProject(authStore.user.uid);
      router.push({ name: 'dashboard', params: { projectId: projectsStore.currentProjectId } });
    }
  } catch {
    localError.value = authStore.error || 'Login mislykkedes. Prøv igen.';
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
@use '@/assets/styles/views/loginview';
</style>
