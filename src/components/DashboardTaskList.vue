<template>
  <div class="task-list">
    <h2>Opgaver</h2>
    <p>Dyk ned i detaljerne for hver opgave</p>

    <!-- CONTROLS -->
    <div class="controls">
      <input v-model="search" placeholder="Søg opgaver..." />

      <select v-model="filter">
        <option value="">Alle</option>
        <option value="ikke">Ikke begyndt</option>
        <option value="igang">I gang</option>
        <option value="færdig">Færdig</option>
      </select>

      <button
        v-if="authStore.isAdmin"
        class="controls__edit"
        type="button"
        @click="editDetails = !editDetails"
      >
        {{ editDetails ? "Færdig" : "Rediger" }}
      </button>
    </div>

    <!-- LIST -->
    <div class="list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task"
      >
        <div class="left">

          <!-- TITLE -->
          <div class="text">{{ task.title }}</div>
          <div class="column">{{ task.column }}</div>

          <!-- DETAILS -->
          <div class="details">

            <!-- START DATE -->
            <input
              v-if="editDetails"
              type="date"
              :value="task.startDate"
              @input="store.updateStartDate(task.id, $event.target.value)"
            />
            <span v-else-if="task.startDate">
              Startet: {{ task.startDate }}
            </span>

            <!-- END DATE -->
            <input
              v-if="editDetails"
              type="date"
              :value="task.endDate"
              @input="store.updateEndDate(task.id, $event.target.value)"
            />
            <span v-else-if="task.endDate">
              Afsluttet: {{ task.endDate }}
            </span>

            <!-- ACTORS -->
            <div
              v-if="editDetails"
              class="actor-editor"
            >
              <div
                v-if="actorList(task).length"
                class="actor-chips"
                aria-label="Aktører"
              >
                <span
                  v-for="(actor, actorIndex) in actorList(task)"
                  :key="`${task.id}-${actorIndex}-${actor}`"
                  class="actor-chip"
                >
                  {{ actor }}
                  <button
                    type="button"
                    class="actor-remove"
                    :aria-label="`Fjern ${actor}`"
                    @click="removeActor(task, actorIndex)"
                  >
                    x
                  </button>
                </span>
              </div>

              <form
                class="actor-add"
                @submit.prevent="addActor(task)"
              >
                <input
                  v-model="actorDrafts[task.id]"
                  placeholder="Tilføj aktør"
                />
                <button type="submit">Tilføj</button>
              </form>
            </div>
            <span
              v-else-if="actorList(task).length"
              class="actor-summaries"
            >
              <span
                v-for="actor in actorList(task)"
                :key="`${task.id}-${actor}`"
                class="actor-summary"
              >
                {{ actor }}
              </span>
            </span>

          </div>
        </div>

        <!-- STATUS -->
        <div :class="['status', task.status]">
          {{ statusLabel(task.status) }}
        </div>
      </div>

      <div v-if="filteredTasks.length === 0" class="empty">
        Ingen opgaver matcher din søgning
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useMilestoneStore } from "@/stores/milestones";
import { useAuthStore } from "@/stores/auth";

const store = useMilestoneStore();
const authStore = useAuthStore();

/* STATE (UI only) */
const search = ref("");
const filter = ref("");
const editDetails = ref(false);
const actorDrafts = reactive({});

/* DATA fra store */
const tasks = computed(() => store.flatTasks);

const actorList = (task) => {
  if (Array.isArray(task.actors)) {
    return task.actors.map((actor) => String(actor).trim()).filter(Boolean);
  }

  if (typeof task.actors === "string") {
    return task.actors.split(",").map((actor) => actor.trim()).filter(Boolean);
  }

  return [];
};

const addActor = async (task) => {
  const actor = actorDrafts[task.id]?.trim();

  if (!actor) {
    return;
  }

  const actors = actorList(task);
  const actorExists = actors.some(
    (currentActor) => currentActor.toLowerCase() === actor.toLowerCase()
  );

  if (!actorExists) {
    await store.updateActors(task.id, [...actors, actor]);
  }

  actorDrafts[task.id] = "";
};

const removeActor = async (task, actorIndex) => {
  const actors = actorList(task).filter((_, index) => index !== actorIndex);
  await store.updateActors(task.id, actors);
};

/* FILTER */
const filteredTasks = computed(() => {
  return tasks.value.filter((t) => {
    const matchesFilter =
      !filter.value || t.status === filter.value;

    const searchableText = [
      t.title,
      t.column,
      ...actorList(t),
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(search.value.toLowerCase());

    return matchesFilter && matchesSearch;
  });
});

/* LABELS */
const statusMap = {
  færdig: "Færdig",
  igang: "I gang",
  ikke: "Ikke begyndt",
};

const statusLabel = (status) => statusMap[status] ?? status;
</script>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.task-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  color: $textcolor-4;
  font-family: $font-family;

  h2 {
    margin: 0 0 $spacing-xxs;
    color: $textcolor-4;
    font-size: $h2-size;
    font-weight: $h2-weight;
    line-height: 1;
  }

  > p {
    margin: 0 0 $spacing-md;
    color: $textcolor-5;
    font-size: $dashboard-subtitle-size;
    font-weight: $h3-weight;
    line-height: 1;
  }
}

/* CONTROLS */
.controls {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
}

.controls input,
.controls select {
  min-height: $dashboard-control-height;
  border: $border-width solid $border-color;
  border-radius: $radius-pill;
  background: $textcolor-2;
  color: $textcolor-5;
  font-family: $font-family;
  font-size: $dashboard-small-font-size;
  line-height: 1;
  box-sizing: border-box;
}

.controls input {
  width: min(100%, $dashboard-search-width);
  padding: 0 $spacing-sm;
}

.controls select {
  padding: 0 $spacing-md 0 $spacing-sm;
  cursor: pointer;
}

.controls button {
  min-height: $dashboard-control-height;
  padding: 0 $spacing-sm;
  border: $border-width solid $accent-2;
  border-radius: $radius-md;
  background: $accent-2;
  color: $textcolor-2;
  font-family: $font-family;
  font-size: $dashboard-small-font-size;
  font-weight: $h2-weight;
  cursor: pointer;
}

.controls__edit {
  margin-left: auto;
}

/* LIST */
.list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $dashboard-task-grid-gap;
  overflow: visible;
  max-height: none;
}

/* TASK */
.task {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: $spacing-sm;
  min-height: $dashboard-task-card-min-height;
  padding: $spacing-sm $spacing-md $spacing-sm $spacing-sm;
  border-radius: $radius-md;
  background: $accent-2;
  color: $textcolor-2;
  box-sizing: border-box;
}

.left {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.column {
  margin-top: $spacing-xs;
  color: $secondary;
  font-size: $dashboard-small-font-size;
  font-weight: $body-weight;
  line-height: 1.4;
}

.text {
  max-width: calc(100% - #{$dashboard-status-min-width} - #{$spacing-md});
  color: $textcolor-2;
  font-size: $dashboard-task-title-size;
  font-weight: $h1-weight;
  line-height: 1.05;
}

/* DETAILS */
.details {
  display: flex;
  gap: $spacing-xs;
  margin-top: auto;
  flex-wrap: wrap;
  padding-top: $spacing-sm;
}

.details input {
  min-height: $dashboard-control-height;
  padding: 0 $spacing-xs;
  border: $border-width solid $border-color;
  border-radius: $radius-sm;
  font-family: $font-family;
  font-size: $dashboard-small-font-size;
}

.actor-editor {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.actor-chips {
  display: flex;
  gap: $spacing-xxs;
  flex-wrap: wrap;
}

.actor-chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xxs;
  min-height: $dashboard-chip-height;
  padding: 0 $spacing-xs;
  border: $border-width solid $border-color;
  border-radius: $radius-sm;
  background: $secondary;
  color: $textcolor-4;
  font-size: $dashboard-status-font-size;
  font-weight: $h2-weight;
  line-height: 1;
}

.actor-remove {
  width: $dashboard-chip-height;
  height: $dashboard-chip-height;
  padding: 0;
  border: none;
  border-radius: $radius-pill;
  background: $secondary;
  color: $primary;
  line-height: 1;
  cursor: pointer;
}

.actor-add {
  display: flex;
  gap: $spacing-xxs;
}

.actor-add button {
  min-height: $dashboard-control-height;
  padding: 0 $spacing-xs;
  border: none;
  border-radius: $radius-sm;
  background: $accent-2;
  color: $textcolor-2;
  font-size: $dashboard-small-font-size;
  cursor: pointer;
}

.actor-summaries {
  display: flex;
  gap: $spacing-xxs;
  flex-wrap: wrap;
}

.actor-summary {
  display: inline-flex;
  align-items: center;
  min-height: $dashboard-chip-height;
  padding: 0 $spacing-xs;
  border-radius: $radius-sm;
  background: $secondary;
  color: $textcolor-4;
  font-size: $dashboard-status-font-size;
  font-weight: $h2-weight;
  line-height: 1;
}

/* STATUS */
.status {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
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
  border-color: $border-color;
  background: $secondary;
  color: $textcolor-5;
}

/* EMPTY */
.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: $textcolor-5;
  padding: $spacing-md;
}

@media (max-width: $breakpoint-md) {
  .list {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}

@media (max-width: $breakpoint-sm) {
  .task {
    padding-right: $spacing-sm;
  }

  .text {
    max-width: 100%;
    padding-right: $dashboard-status-min-width;
  }
}
</style>
