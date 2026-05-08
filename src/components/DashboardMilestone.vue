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
        <span v-if="column.icon" class="milestone-icon" v-html="iconSvg(column.icon)"></span>
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
import { reactive, computed, watch, onMounted } from "vue";

import hammerIcon from "@/assets/icons/hammer-solid.png";
import plugIcon from "@/assets/icons/plug-solid.png";
import paintRollerIcon from "@/assets/icons/paint-roller-solid.png";

const ICONS = {
  hammer: hammerIcon,
  plug: plugIcon,
  brush: paintRollerIcon,
};

const iconSvg = (name) => {
  const src = ICONS[name];
  return src ? `<img src="${src}" width="18" height="18" alt="${name}" />` : "";
};
import { useRoute } from "vue-router";
import { useMilestoneStore } from "@/stores/milestones";
import { useAuthStore } from "@/stores/auth";

const store = useMilestoneStore();
const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  store.fetchMilestones(route.params.projectId);
});

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
  align-items: flex-start;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  h2 {
    margin: 0 0 $spacing-xxs;
    color: $textcolor-4;
    font-size: $h2-size;
    font-weight: $h2-weight;
    line-height: 1;
  }

  p {
    margin: 0;
    color: $textcolor-5;
    font-size: $dashboard-subtitle-size;
    font-weight: $h3-weight;
    line-height: 1;
  }
}

.edit-all {
  background: $accent-2;
  color: $textcolor-2;
  border: $border-width solid $accent-2;
  min-height: $dashboard-control-height;
  padding: 0 $spacing-sm;
  border-radius: $radius-sm;
  font-family: $font-family;
  font-size: $dashboard-small-font-size;
  font-weight: $h2-weight;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.milestones-wrapper {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $dashboard-section-gap;
}

.milestone-column {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  min-height: $dashboard-milestone-card-min-height;
  padding: $spacing-sm;
  border: $border-width solid $accent-2;
  border-radius: $radius-xl;
  background: $secondary;
  color: $textcolor-3;
  box-sizing: border-box;

  &:nth-child(1) {
    border-color: $tertiary;
    background: $tertiary;
  }

  &:nth-child(3) {
    border-color: $accent-2;
    background: $accent-2;
    color: $textcolor-2;
  }
}

.header {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: $spacing-sm;
  padding-top: 0;

  h3 {
    margin: 0;
    color: inherit;
    font-size: $h3-size;
    font-weight: $h1-weight;
    line-height: 1.05;
  }

  p {
    margin: $spacing-xxs 0 0;
    color: inherit;
    font-size: $dashboard-small-font-size;
    font-weight: $body-weight;
    line-height: 1.2;
  }
}

.header--with-icon {
  padding-top: $spacing-xl;
}

.milestone-icon {
  position: absolute;
  top: 0;
  left: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: $dashboard-milestone-icon-size;
  height: $dashboard-milestone-icon-size;
  transform: translateX(-50%);
  border: $border-width solid $accent-2;
  border-radius: $radius-pill;
  background: $accent-1;
  color: $textcolor-3;
  font-size: $body-size;
  line-height: 1;
}

.milestone-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: $spacing-sm;
  align-items: center;
  min-height: $spacing-xl;
  margin: 0;

  > span:first-child {
    color: inherit;
    font-size: $body-size;
    font-weight: $h1-weight;
    line-height: 1.18;
  }

  input,
  select {
    min-height: $dashboard-control-height;
    border: $border-width solid $accent-2;
    border-radius: $radius-sm;
    font-family: $font-family;
    font-size: $dashboard-small-font-size;
  }

  input {
    width: 100%;
    min-width: 0;
  }
}

.milestone-item--editing {
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: $dashboard-status-min-width;
  min-height: $dashboard-chip-height;
  padding: $dashboard-status-padding-y $spacing-xs;
  border: $border-width solid transparent;
  border-radius: $radius-sm;
  color: $textcolor-3;
  font-size: $dashboard-status-font-size;
  font-weight: $h2-weight;
  line-height: 1;
  text-align: center;
  box-sizing: border-box;
}

.status.færdig {
  border-color: $accent-1;
  background: $accent-1;
}

.status.igang {
  border-color: $accent-1;
  background: $accent-1;
}

.status.ikke {
  border-color: $tertiary;
  background: $secondary;
  color: $textcolor-5;
}

button {
  cursor: pointer;
  font-family: $font-family;
}

.delete {
  color: $primary;
}

.add {
  margin-top: $spacing-sm;
  min-height: $dashboard-control-height;
  border: $border-width solid $accent-2;
  border-radius: $radius-sm;
  background: $accent-1;
  color: $textcolor-3;
  font-size: $dashboard-small-font-size;
  font-weight: $h2-weight;
}

.progress {
  margin-top: auto;
  color: inherit;
  font-size: $dashboard-status-font-size;
  font-weight: $body-weight;
  line-height: 1;
  text-align: center;
  opacity: 0.72;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: $dashboard-milestone-progress-height;
  margin-top: $spacing-xs;
  overflow: hidden;
  border-radius: $radius-pill;
  background: rgba($textcolor-1, 0.16);

  &::after {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--progress);
    border-radius: inherit;
    background: $accent-2;
  }
}

.milestone-column:nth-child(3) .progress-bar {
  background: rgba($textcolor-2, 0.28);

  &::after {
    background: $tertiary;
  }
}

@media (max-width: $breakpoint-lg) {
  .milestones-wrapper {
    flex-direction: column;
  }

  .milestone-column {
    min-height: auto;
  }
}

@media (max-width: $breakpoint-sm) {
  .top-header {
    flex-direction: column;
  }
}
</style>
