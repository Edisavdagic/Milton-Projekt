<template>
  <div class="top-header">
    <h2>Milepæle</h2>
    <button class="edit-all" @click="toggleAll">
      {{ editing ? "Færdig" : "Rediger" }}
    </button>
  </div>

  <div class="milestones-wrapper">
    <div
      v-for="(column, colIndex) in store.milestones"
      :key="column.id"
      class="milestone-column"
    >
      <div class="header">
        <h3>{{ column.title }}</h3>
      </div>

      <div
        v-for="(item, index) in column.items"
        :key="item.id"
        class="milestone-item"
      >
        <!-- TEXT -->
        <input
          v-if="editMode[colIndex]"
          v-model="item.text"
        />

        <span v-else>{{ item.text }}</span>

        <!-- STATUS -->
        <select
          v-if="editMode[colIndex]"
          v-model="item.status"
        >
          <option value="ikke">Ikke begyndt</option>
          <option value="igang">I gang</option>
          <option value="færdig">Færdig</option>
        </select>

        <span
          v-else
          :class="statusClass(item.status)"
        >
          {{ statusLabel(item.status) }}
        </span>

        <!-- DELETE -->
        <button
          v-if="editMode[colIndex]"
          class="delete"
          @click="remove(colIndex, index)"
        >
          ✕
        </button>
      </div>

      <!-- ADD -->
      <button
        v-if="editMode[colIndex]"
        class="add"
        @click="add(colIndex)"
      >
        + Tilføj milepæl
      </button>

      <div class="progress">
        {{ store.progress(column.items) }}% færdig
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from "vue";
import { useMilestoneStore } from "@/stores/milestones";

const store = useMilestoneStore();

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
  { immediate: true }
);

/**
 * Global editing state
 */
const editing = computed(() => editMode.every(e => e));

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

/**
 * Status helpers
 */
const statusMap = {
  færdig: "Færdig",
  igang: "I gang",
  ikke: "Ikke begyndt",
};

const statusLabel = (status) => statusMap[status] ?? status;

const statusClass = (status) => `status ${status}`;
</script>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.edit-all {
  background: $primary;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.milestones-wrapper {
  display: flex;
  gap: 20px;
}

.milestone-column {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: #f4f4f4;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.milestone-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 10px 0;
}

.status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.status.færdig {
  background: #ffe08a;
}

.status.igang {
  background: #cce5ff;
}

.status.ikke {
  background: #e0e0e0;
}

button {
  cursor: pointer;
}

.delete {
  color: red;
}

.add {
  margin-top: 10px;
}

.progress {
  margin-top: 12px;
  font-size: 12px;
  opacity: 0.7;
}
</style>