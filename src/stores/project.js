import { defineStore } from 'pinia'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

// Pinia store for managing project data
export const useProjectsStore = defineStore('projects', {
  // State definition
  state: () => ({
    projects: [],
    loading: false
  }),

  // Actions for state mutations
  actions: {
    // Async action to fetch projects from Firestore
    async fetchProjects() {
      this.loading = true

      try {
        // Get reference to 'projects' collection in Firestore
        const snapshot = await getDocs(collection(db, 'projects'))


        this.projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false // Always set loading to false when done
      }
    }
  }
})
