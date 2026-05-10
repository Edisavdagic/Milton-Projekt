import { defineStore } from 'pinia';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { actorList } from '@/utils/calendar';

const GROUP_IDS = ['construction', 'framing', 'interior'];

function toDateString(value) {
  if (!value) return '';
  if (value?.toDate) return value.toDate().toISOString().split('T')[0];
  return value;
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
        col.items.map((item) => ({ ...item, column: col.title })),
      ),

    progress: () => (items) => {
      if (!items.length) return 0;
      const done = items.filter((i) => i.status === 'færdig').length;
      return Math.round((done / items.length) * 100);
    },
  },

  actions: {
    async fetchMilestones(projectId) {
      this.loading = true;
      this.error = null;
      this.projectId = projectId;
      try {
        this.milestones = await Promise.all(
          GROUP_IDS.map(async (groupId, idx) => {
            const groupRef = doc(db, 'projects', projectId, 'milestoneGroups', groupId);
            const milestonesRef = collection(db, 'projects', projectId, 'milestoneGroups', groupId, 'milestones');

            const [groupSnap, milestonesSnap] = await Promise.all([
              getDoc(groupRef),
              getDocs(milestonesRef),
            ]);

            const groupData = groupSnap.data() ?? {};

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
                actors: actorList(d.data().actors),
              })),
            };
          }),
        );
        this.milestones.sort((a, b) => a.order - b.order);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(taskId, updates) {
      for (const col of this.milestones) {
        const task = col.items.find((t) => t.id === taskId);
        if (task) {
          Object.assign(task, updates);
          if (this.projectId && !taskId.startsWith('local-')) {
            const taskRef = doc(
              db, 'projects', this.projectId,
              'milestoneGroups', col.groupId,
              'milestones', taskId,
            );
            await updateDoc(taskRef, updates);
          }
          return;
        }
      }
    },

    async updateActors(taskId, value) {
      await this.updateTask(taskId, { actors: actorList(value) });
    },

    async updateStartDate(taskId, date) {
      await this.updateTask(taskId, { startDate: date });
    },

    async updateEndDate(taskId, date) {
      await this.updateTask(taskId, { endDate: date });
    },

    async addItem(colIndex) {
      const col = this.milestones[colIndex];
      const item = {
        title: 'Ny milepæl',
        status: 'ikke',
        startDate: '',
        endDate: '',
        actors: [],
      };

      if (this.projectId) {
        const milestonesRef = collection(
          db, 'projects', this.projectId,
          'milestoneGroups', col.groupId,
          'milestones',
        );
        const itemRef = await addDoc(milestonesRef, item);
        col.items.push({ id: itemRef.id, ...item });
        return;
      }

      col.items.push({
        id: `local-${Date.now()}`,
        ...item,
      });
    },

    async removeItem(colIndex, itemIndex) {
      const col = this.milestones[colIndex];
      const item = col.items[itemIndex];

      if (!item) return;

      if (this.projectId && !item.id.startsWith('local-')) {
        const itemRef = doc(
          db, 'projects', this.projectId,
          'milestoneGroups', col.groupId,
          'milestones', item.id,
        );
        await deleteDoc(itemRef);
      }

      col.items.splice(itemIndex, 1);
    },

    async updateItem(colIndex, itemIndex, data) {
      const col = this.milestones[colIndex];
      const item = col?.items[itemIndex];

      if (!item) return;

      Object.assign(item, data);

      if (this.projectId && !item.id.startsWith('local-')) {
        const itemRef = doc(
          db, 'projects', this.projectId,
          'milestoneGroups', col.groupId,
          'milestones', item.id,
        );
        await updateDoc(itemRef, data);
      }
    },
  },
});
