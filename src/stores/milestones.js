import { defineStore } from 'pinia'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

const GROUP_IDS = ['construction', 'framing', 'interior']

function toDateString(value) {
  if (!value) return ''
  if (value?.toDate) return value.toDate().toISOString().split('T')[0]
  return value
}

export const useMilestoneStore = defineStore('milestones', {
  state: () => ({
    milestones: [],
    projectId: null,
    loading: false,
    error: null,
  }),

  getters: {
    flatTasks: (state) =>
      state.milestones.flatMap((col) =>
        col.items.map((item) => ({ ...item, column: col.title }))
      ),

    progress: () => (items) => {
      if (!items.length) return 0
      const done = items.filter((i) => i.status === 'færdig').length
      return Math.round((done / items.length) * 100)
    },
  },

  actions: {
    async fetchMilestones(projectId) {
      this.loading = true
      this.error = null
      this.projectId = projectId
      try {
        this.milestones = await Promise.all(
          GROUP_IDS.map(async (groupId, idx) => {
            const groupRef = doc(db, 'projects', projectId, 'milestoneGroups', groupId)
            const milestonesRef = collection(db, 'projects', projectId, 'milestoneGroups', groupId, 'milestones')

            const [groupSnap, milestonesSnap] = await Promise.all([
              getDoc(groupRef),
              getDocs(milestonesRef),
            ])

            const groupData = groupSnap.data() ?? {}

            return {
              id: idx + 1,
              title: groupData.title ?? groupId,
              subtitle: groupData.subtitle ?? '',
              icon: groupData.icon ?? '',
              order: groupData.order ?? idx,
              groupId,
              items: milestonesSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                startDate: toDateString(d.data().startDate),
                endDate: toDateString(d.data().endDate),
              })),
            }
          })
        )
        this.milestones.sort((a, b) => a.order - b.order)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async updateTask(taskId, updates) {
      for (const col of this.milestones) {
        const task = col.items.find((t) => t.id === taskId)
        if (task) {
          Object.assign(task, updates)
          if (this.projectId && !taskId.startsWith('local-')) {
            const taskRef = doc(
              db, 'projects', this.projectId,
              'milestoneGroups', col.groupId,
              'milestones', taskId
            )
            await updateDoc(taskRef, updates)
          }
          return
        }
      }
    },

    async updateActors(taskId, value) {
      const actors = value.split(',').map((a) => a.trim()).filter(Boolean)
      await this.updateTask(taskId, { actors })
    },

    async updateStartDate(taskId, date) {
      await this.updateTask(taskId, { startDate: date })
    },

    async updateEndDate(taskId, date) {
      await this.updateTask(taskId, { endDate: date })
    },

    addItem(colIndex) {
      this.milestones[colIndex].items.push({
        id: `local-${Date.now()}`,
        title: 'Ny milepæl',
        status: 'ikke',
        startDate: '',
        endDate: '',
        actors: [],
      })
    },

    removeItem(colIndex, itemIndex) {
      this.milestones[colIndex].items.splice(itemIndex, 1)
    },

    updateItem(colIndex, itemIndex, data) {
      this.milestones[colIndex].items[itemIndex] = {
        ...this.milestones[colIndex].items[itemIndex],
        ...data,
      }
    },
  },
})
