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

      <button @click="editDetails = !editDetails">
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

          <!-- TEXT -->
          <div class="text">{{ task.text }}</div>
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
              Start: {{ task.startDate }}
            </span>

            <!-- END DATE -->
            <input
              v-if="editDetails"
              type="date"
              :value="task.endDate"
              @input="store.updateEndDate(task.id, $event.target.value)"
            />
            <span v-else-if="task.endDate">
              Slut: {{ task.endDate }}
            </span>

            <!-- ACTORS -->
            <input
              v-if="editDetails"
              :value="task.actors?.join(', ')"
              @input="store.updateActors(task.id, $event.target.value)"
              placeholder="Aktører"
            />
            <span v-else-if="task.actors?.length">
              👥 {{ task.actors.join(", ") }}
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
import { computed, ref } from "vue";
import { useMilestoneStore } from "@/stores/milestones";

const store = useMilestoneStore();

/* STATE (UI only) */
const search = ref("");
const filter = ref("");
const editDetails = ref(false);

/* DATA fra store */
const tasks = computed(() => store.flatTasks);

/* FILTER */
const filteredTasks = computed(() => {
  return tasks.value.filter((t) => {
    const matchesFilter =
      !filter.value || t.status === filter.value;

    const matchesSearch = t.text
      .toLowerCase()
      .includes(search.value.toLowerCase());

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
  height: 100%;
}

/* CONTROLS */
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.controls input,
.controls select {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.controls button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: $primary;
  color: white;
  cursor: pointer;
}

/* LIST */
.list {
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* TASK */
.task {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 8px;
  background: #f4f4f4;
}

.left {
  display: flex;
  flex-direction: column;
}

.column {
  font-size: 12px;
  opacity: 0.6;
}

/* DETAILS */
.details {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.details input {
  padding: 4px;
  font-size: 12px;
}

/* STATUS */
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

/* EMPTY */
.empty {
  text-align: center;
  opacity: 0.6;
  padding: 20px;
}
</style>