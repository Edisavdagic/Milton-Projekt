import { computed, ref } from 'vue';
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

export const useMilestoneStore = defineStore('milestones', () => {
  const milestones = ref([]);
  const projectId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const flatTasks = computed(() =>
    milestones.value.flatMap((col) =>
      col.items.map((item) => ({ ...item, column: col.title })),
    ),
  );

  function progress(items) {
    if (!items.length) return 0;
    const done = items.filter((i) => i.status === 'færdig').length;
    return Math.round((done / items.length) * 100);
  }

  async function fetchMilestones(id) {
    loading.value = true;
    error.value = null;
    projectId.value = id;

    try {
      const groups = await Promise.all(
        GROUP_IDS.map(async (groupId, idx) => {
          const groupRef = doc(db, 'projects', id, 'milestoneGroups', groupId);
          const milestonesRef = collection(db, 'projects', id, 'milestoneGroups', groupId, 'milestones');

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

      milestones.value = groups.sort((a, b) => a.order - b.order);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function updateTask(taskId, updates) {
    for (const col of milestones.value) {
      const task = col.items.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
        if (projectId.value && !taskId.startsWith('local-')) {
          const taskRef = doc(
            db, 'projects', projectId.value,
            'milestoneGroups', col.groupId,
            'milestones', taskId,
          );
          await updateDoc(taskRef, updates);
        }
        return;
      }
    }
  }

  async function updateActors(taskId, value) {
    await updateTask(taskId, { actors: actorList(value) });
  }

  async function updateStartDate(taskId, date) {
    await updateTask(taskId, { startDate: date });
  }

  async function updateEndDate(taskId, date) {
    await updateTask(taskId, { endDate: date });
  }

  async function addItem(colIndex) {
    const col = milestones.value[colIndex];
    const item = {
      title: 'Ny milepæl',
      status: 'ikke',
      startDate: '',
      endDate: '',
      actors: [],
    };

    if (projectId.value) {
      const milestonesRef = collection(
        db, 'projects', projectId.value,
        'milestoneGroups', col.groupId,
        'milestones',
      );
      const itemRef = await addDoc(milestonesRef, item);
      col.items.push({ id: itemRef.id, ...item });
      return;
    }

    col.items.push({ id: `local-${Date.now()}`, ...item });
  }

  async function removeItem(colIndex, itemIndex) {
    const col = milestones.value[colIndex];
    const item = col.items[itemIndex];

    if (!item) return;

    if (projectId.value && !item.id.startsWith('local-')) {
      const itemRef = doc(
        db, 'projects', projectId.value,
        'milestoneGroups', col.groupId,
        'milestones', item.id,
      );
      await deleteDoc(itemRef);
    }

    col.items.splice(itemIndex, 1);
  }

  async function updateItem(colIndex, itemIndex, data) {
    const col = milestones.value[colIndex];
    const item = col?.items[itemIndex];

    if (!item) return;

    Object.assign(item, data);

    if (projectId.value && !item.id.startsWith('local-')) {
      const itemRef = doc(
        db, 'projects', projectId.value,
        'milestoneGroups', col.groupId,
        'milestones', item.id,
      );
      await updateDoc(itemRef, data);
    }
  }

  return {
    milestones,
    projectId,
    loading,
    error,
    flatTasks,
    progress,
    fetchMilestones,
    updateTask,
    updateActors,
    updateStartDate,
    updateEndDate,
    addItem,
    removeItem,
    updateItem,
  };
});
