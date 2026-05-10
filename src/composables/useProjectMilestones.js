import { watch } from 'vue';
import { useMilestoneStore } from '@/stores/milestones';

export function useProjectMilestones(projectId) {
  const milestoneStore = useMilestoneStore();

  async function fetchProjectMilestones(id) {
    if (!id) {
      return;
    }

    if (milestoneStore.projectId !== id || milestoneStore.milestones.length === 0) {
      await milestoneStore.fetchMilestones(id);
    }
  }

  watch(projectId, fetchProjectMilestones, { immediate: true });

  return {
    milestoneStore,
    fetchProjectMilestones,
  };
}
