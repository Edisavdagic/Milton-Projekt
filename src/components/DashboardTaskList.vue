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
        class="edit-all"
        type="button"
        @click="editDetails = !editDetails"
      >
      <img
          class="edit-all__icon"
          src="@/assets/icons/Edit 2.svg"
          alt="Rediger ikon"
      />

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
import { computed, reactive, ref } from 'vue';
import { useMilestoneStore } from '@/stores/milestones';
import { useAuthStore } from '@/stores/auth';

const store = useMilestoneStore();
const authStore = useAuthStore();

/* STATE (UI only) */
const search = ref('');
const filter = ref('');
const editDetails = ref(false);
const actorDrafts = reactive({});

/* DATA fra store */
const tasks = computed(() => store.flatTasks);

const actorList = (task) => {
  if (Array.isArray(task.actors)) {
    return task.actors.map((actor) => String(actor).trim()).filter(Boolean);
  }

  if (typeof task.actors === 'string') {
    return task.actors.split(',').map((actor) => actor.trim()).filter(Boolean);
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
    (currentActor) => currentActor.toLowerCase() === actor.toLowerCase(),
  );

  if (!actorExists) {
    await store.updateActors(task.id, [...actors, actor]);
  }

  actorDrafts[task.id] = '';
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
    ].join(' ').toLowerCase();

    const matchesSearch = searchableText.includes(search.value.toLowerCase());

    return matchesFilter && matchesSearch;
  });
});

/* LABELS */
const statusMap = {
  færdig: 'Færdig',
  igang: 'I gang',
  ikke: 'Ikke begyndt',
};

const statusLabel = (status) => statusMap[status] ?? status;
</script>

<style scoped lang="scss">
@import '@/assets/styles/components/_dashboardtasklist.scss';
</style>
