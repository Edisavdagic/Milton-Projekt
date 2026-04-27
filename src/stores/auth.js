import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";

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
 * @property {Function} fetchRole
 * @property {Function} initAuth
 * @property {Function} signIn
 * @property {Function} signOutUser
 */

/**
 * Pinia store for Firebase authentication state and actions.
 *
 * @returns {AuthStore}
 */
export const useAuthStore = defineStore("auth", () => {
  /** @type {*} */
  const user = ref(null);
  /** @type {*} */
  const role = ref(null);
  const authReady = ref(false);
  const loading = ref(false);
  /** @type {*} */
  const error = ref(null);

  /** @type {FirebaseUnsubscribe | null} */
  let unsubscribeAuth = null;
  /** @type {Promise<(FirebaseUser|null)> | null} */
  let initPromise = null;

  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => role.value === "admin");

  /** Clears any previously stored auth error message. */
  function clearError() {
    error.value = null;
  }

  /**
   * Fetches the role for a user from Firestore Users/{uid}.
   *
   * @param {string} uid
   * @returns {Promise<UserRole>}
   */
  async function fetchRole(uid) {
    if (!uid) {
      role.value = null;
      return null;
    }

    const userRef = doc(db, "Users", uid);
    const userSnap = await getDoc(userRef);

    role.value = userSnap.exists() ? userSnap.data().role || null : null;
    return role.value;
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

      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser;

        if (firebaseUser) {
          try {
            await fetchRole(firebaseUser.uid);
          } catch (err) {
            role.value = null;
            error.value = err.message || "Role lookup failed.";
          }
        } else {
          role.value = null;
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
      await fetchRole(credential.user.uid);
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
      role.value = null;
    } catch (err) {
      error.value = err.message || "Sign out failed.";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    role,
    isAdmin,
    authReady,
    loading,
    error,
    isAuthenticated,
    clearError,
    fetchRole,
    initAuth,
    signIn,
    signOutUser,
  };
});
