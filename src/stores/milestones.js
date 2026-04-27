// stores/milestones.js
import { defineStore } from "pinia";

let nextColumnId = 1;
let nextItemId = 1;

export const useMilestoneStore = defineStore("milestones", {
  state: () => ({
    milestones: [
      {
        id: nextColumnId++,
        title: "Konstruktion begynder",
        items: [
          {
            id: nextItemId++,
            text: "Fundament",
            status: "færdig",
            startDate: "",
            endDate: "",
            actors: [],
          },
          {
            id: nextItemId++,
            text: "Vinduer",
            status: "igang",
            startDate: "",
            endDate: "",
            actors: [],
          },
        ],
      },
      {
        id: nextColumnId++,
        title: "Opmuring & isolering",
        items: [
          {
            id: nextItemId++,
            text: "Strøm",
            status: "igang",
            startDate: "",
            endDate: "",
            actors: [],
          },
        ],
      },
      {
        id: nextColumnId++,
        title: "Interiør",
        items: [],
      },
    ],
  }),

  getters: {
    // collection of all tasks 
    flatTasks: (state) =>
      state.milestones.flatMap((col) =>
        col.items.map((item) => ({
          ...item,
          column: col.title,
        }))
      ),

    // progress for a given list of items
    progress: (state) => (items) => {
      if (!items.length) return 0;
      const done = items.filter((i) => i.status === "færdig").length;
      return Math.round((done / items.length) * 100);
    },
  },

  actions: {
    // update a task with new values
    updateTask(taskId, updates) {
      for (const col of this.milestones) {
        const task = col.items.find((t) => t.id === taskId);
        if (task) {
          Object.assign(task, updates);
          return;
        }
      }
    },

    // helpers for updating specific fields
    updateActors(taskId, value) {
      const actors = value
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      this.updateTask(taskId, { actors });
    },

    updateStartDate(taskId, date) {
      this.updateTask(taskId, { startDate: date });
    },

    updateEndDate(taskId, date) {
      this.updateTask(taskId, { endDate: date });
    },

    // column actions
    addItem(colIndex) {
      this.milestones[colIndex].items.push({
        id: nextItemId++,
        text: "Ny milepæl",
        status: "ikke",
        startDate: "",
        endDate: "",
        actors: [],
      });
    },

    removeItem(colIndex, itemIndex) {
      this.milestones[colIndex].items.splice(itemIndex, 1);
    },

    updateItem(colIndex, itemIndex, data) {
      this.milestones[colIndex].items[itemIndex] = {
        ...this.milestones[colIndex].items[itemIndex],
        ...data,
      };
    },
  },
});