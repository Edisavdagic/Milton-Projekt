<template>
  <div class="top-header">
    <div>
      <h2>Milepæle</h2>
      <p>Få et overblik over processen</p>
    </div>
    <button v-if="authStore.isAdmin" class="edit-all" @click="toggleAll">
      <img
        class="edit-all__icon"
        src="@/assets/icons/Edit 2.svg"
        alt="Rediger ikon"
      />
      {{ editing ? "Færdig" : "Rediger" }}
    </button>
  </div>

  <p v-if="store.loading">Indlæser milepæle...</p>

  <div v-else class="milestones-wrapper">
    <div v-for="(column, colIndex) in store.milestones" :key="column.id" class="milestone-column">
      <div class="header" :class="{ 'header--with-icon': column.icon }">
        <span v-if="ICONS[column.icon]" class="milestone-icon">
          <img :src="ICONS[column.icon]" width="18" height="18" :alt="column.icon" />
        </span>
        <div>
          <h3>{{ column.title }}</h3>
          <p v-if="column.subtitle">{{ column.subtitle }}</p>
        </div>
      </div>

      <div
        v-for="(item, index) in column.items"
        :key="item.id"
        class="milestone-item"
        :class="{ 'milestone-item--editing': editMode[colIndex] }"
      >
        <!-- TITLE -->
        <input
          v-if="editMode[colIndex]"
          v-model="item.title"
          @blur="store.updateTask(item.id, { title: item.title })"
        />

        <span v-else>{{ item.title }}</span>

        <!-- STATUS -->
        <select
          v-if="editMode[colIndex]"
          :value="item.status"
          @change="store.updateTask(item.id, { status: $event.target.value })"
        >
          <option value="ikke">Ikke begyndt</option>
          <option value="igang">I gang</option>
          <option value="færdig">Færdig</option>
        </select>

        <span v-else :class="statusClass(item.status)">
          {{ statusLabel(item.status) }}
        </span>

        <!-- DELETE -->
        <button v-if="editMode[colIndex]" class="delete" @click="remove(colIndex, index)">✕</button>
      </div>

      <!-- ADD -->
      <button v-if="editMode[colIndex]" class="add" @click="add(colIndex)">+ Tilføj milepæl</button>

      <div class="progress" :style="{ '--progress': `${store.progress(column.items)}%` }">
        <span>{{ store.progress(column.items) }}% færdig</span>
        <div class="progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProjectMilestones } from '@/composables/useProjectMilestones';
import { statusLabel } from '@/utils/calendar';
import hammerIcon from '@/assets/icons/hammer-solid.png';
import plugIcon from '@/assets/icons/plug-solid.png';
import paintRollerIcon from '@/assets/icons/paint-roller-solid.png';

const ICONS = {
  hammer: hammerIcon,
  plug: plugIcon,
  brush: paintRollerIcon,
};

const route = useRoute();
const authStore = useAuthStore();
const projectId = computed(() => route.params.projectId);
const { milestoneStore: store } = useProjectMilestones(projectId);

/**
 * Dynamisk editMode baseret på antal kolonner
 */
const editMode = reactive([]);

/**
 * Sync editMode med milestones
 */
watch(
  () => store.milestones,
  (cols) => {
    editMode.length = 0;
    cols.forEach(() => editMode.push(false));
  },
  { immediate: true },
);

/**
 * Global editing state
 */
const editing = computed(() => editMode.every((e) => e));

/**
 * Toggle alle kolonner
 */
const toggleAll = () => {
  const newState = !editing.value;
  editMode.forEach((_, i) => (editMode[i] = newState));
};

/**
 * Store actions wrappers
 */
const remove = (col, index) => {
  store.removeItem(col, index);
};

const add = (col) => {
  store.addItem(col);
};

const statusClass = (status) => `status ${status}`;
</script>

<style scoped lang="scss">
@use '@/assets/styles/components/dashboardmilestone';
</style>
