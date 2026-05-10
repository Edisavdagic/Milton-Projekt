import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([]);
  const currentProject = ref(null);
  const loading = ref(false);

  const currentProjectId = computed(() => currentProject.value?.id ?? null);

  async function fetchProjects() {
    loading.value = true;
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      projects.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserProject(uid) {
    try {
      const q = query(collection(db, 'projects'), where('memberUid', 'array-contains', uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        currentProject.value = { id: d.id, ...d.data() };
      }
    } catch (err) {
      console.error(err);
    }
  }

  function setCurrentProject(project) {
    currentProject.value = project;
  }

  return {
    projects,
    currentProject,
    currentProjectId,
    loading,
    fetchProjects,
    fetchUserProject,
    setCurrentProject,
  };
});
