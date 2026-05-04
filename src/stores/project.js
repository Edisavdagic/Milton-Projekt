import { defineStore } from 'pinia'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
  }),

  getters: {
    currentProjectId: (state) => state.currentProject?.id ?? null,
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      try {
        const snapshot = await getDocs(collection(db, 'projects'))
        this.projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async fetchUserProject(uid) {
      try {
        const q = query(collection(db, 'projects'), where('memberUid', 'array-contains', uid))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          this.currentProject = { id: doc.id, ...doc.data() }
        }
      } catch (error) {
        console.error(error)
      }
    },

    setCurrentProject(project) {
      this.currentProject = project
    },
  },
})
