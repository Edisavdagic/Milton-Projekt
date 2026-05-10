import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'Ugyldig e-mailadresse.',
  'auth/user-disabled': 'Denne konto er deaktiveret.',
  'auth/user-not-found': 'Ingen konto med denne e-mail.',
  'auth/wrong-password': 'Forkert adgangskode.',
  'auth/invalid-credential': 'Ugyldig e-mail eller adgangskode.',
  'auth/too-many-requests': 'For mange forsøg. Prøv igen senere.',
  'auth/network-request-failed': 'Netværksfejl. Tjek din forbindelse og prøv igen.',
};

function mapAuthError(err) {
  return AUTH_ERROR_MESSAGES[err.code] ?? 'Login mislykkedes. Prøv igen.';
}

/** @typedef {Object} FirebaseUser */
/** @typedef {Function} FirebaseUnsubscribe */
/** @typedef {"admin" | "user" | null} UserRole */

/**
 * @typedef {Object} AuthStore
 * @property {*} user
 * @property {*} role
 * @property {*} isAdmin
 * @property {*} authReady
 * @property {*} loading
 * @property {*} error
 * @property {*} isAuthenticated
 * @property {Function} clearError
 * @property {Function} initAuth
 * @property {Function} signIn
 * @property {Function} signOutUser
 */

/**
 * Pinia store for Firebase authentication state and actions.
 *
 * @returns {AuthStore}
 */
export const useAuthStore = defineStore('auth', () => {
  /** @type {*} */
  const user = ref(null);
  /** @type {*} */
  const role = ref(null);
  const profile = ref(null);
  const authReady = ref(false);
  const loading = ref(false);
  /** @type {*} */
  const error = ref(null);

  /** @type {FirebaseUnsubscribe | null} */
  let unsubscribeAuth = null;
  /** @type {Promise<(FirebaseUser|null)> | null} */
  let initPromise = null;

  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => role.value === 'admin');

  /** Clears any previously stored auth error message. */
  function clearError() {
    error.value = null;
  }

  async function fetchUserData(uid) {
    if (!uid) {
      role.value = null;
      profile.value = null;
      return;
    }

    const userSnap = await getDoc(doc(db, 'Users', uid));
    const data = userSnap.exists() ? userSnap.data() : null;

    role.value = data?.role ?? null;
    profile.value = data;
  }

  /**
   * Fetches the role for a user from Firestore Users/{uid}.
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

      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser;

        if (firebaseUser) {
          try {
            await fetchUserData(firebaseUser.uid);
          } catch (err) {
            role.value = null;
            error.value = err.message || 'Kunne ikke hente brugerdata.';
          }
        } else {
          role.value = null;
          profile.value = null;
        }

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

      await fetchUserData(credential.user.uid);
      return credential.user;
    } catch (err) {
      error.value = mapAuthError(err);
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
      role.value = null;
      profile.value = null;
    } catch (err) {
      error.value = err.message || 'Log ud fejlede.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    role,
    profile,
    isAdmin,
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
