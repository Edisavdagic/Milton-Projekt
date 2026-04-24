import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/services/firebase";

/** @typedef {import("firebase/auth").User} FirebaseUser */
/** @typedef {import("firebase/auth").Unsubscribe} FirebaseUnsubscribe */

/**
 * Pinia store for Firebase authentication state and actions.
 *
 * @returns {{
 *   user: import("vue").Ref<FirebaseUser | null>,
 *   authReady: import("vue").Ref<boolean>,
 *   loading: import("vue").Ref<boolean>,
 *   error: import("vue").Ref<string | null>,
 *   isAuthenticated: import("vue").ComputedRef<boolean>,
 *   clearError: () => void,
 *   initAuth: () => Promise<FirebaseUser | null>,
 *   signIn: (email: string, password: string) => Promise<FirebaseUser>,
 *   signOutUser: () => Promise<void>
 * }}
 */
export const useAuthStore = defineStore("auth", () => {
  /** @type {import("vue").Ref<FirebaseUser | null>} */
  const user = ref(null);
  const authReady = ref(false);
  const loading = ref(false);
  /** @type {import("vue").Ref<string | null>} */
  const error = ref(null);

  /** @type {FirebaseUnsubscribe | null} */
  let unsubscribeAuth = null;
  /** @type {Promise<FirebaseUser | null> | null} */
  let initPromise = null;

  const isAuthenticated = computed(() => Boolean(user.value));

  /** Clears any previously stored auth error message. */
  function clearError() {
    error.value = null;
  }

  /**
   * Starts listening to Firebase auth state and resolves once the first user value is received.
   *
   * @returns {Promise<FirebaseUser | null>}
   */
  function initAuth() {
    if (initPromise) {
      return initPromise;
    }

    initPromise = new Promise((resolve) => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }

      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
        authReady.value = true;
        resolve(firebaseUser);
      });
    });

    return initPromise;
  }

  /**
   * Signs in a user with email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<FirebaseUser>}
   */
  async function signIn(email, password) {
    loading.value = true;
    clearError();

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      user.value = credential.user;
      return credential.user;
    } catch (err) {
      error.value = err.message || "Login failed.";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Signs out the current authenticated user.
   *
   * @returns {Promise<void>}
   */
  async function signOutUser() {
    loading.value = true;
    clearError();

    try {
      await signOut(auth);
      user.value = null;
    } catch (err) {
      error.value = err.message || "Sign out failed.";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    authReady,
    loading,
    error,
    isAuthenticated,
    clearError,
    initAuth,
    signIn,
    signOutUser,
  };
});
