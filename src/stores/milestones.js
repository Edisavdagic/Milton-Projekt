import { defineStore } from "pinia";

export const useMilestoneStore = defineStore("milestones", {
  state: () => ({
    milestones: [
      {
        title: "Konstruktion begynder",
        items: [
          { text: "Fundament", status: "færdig" },
          { text: "Vinduer", status: "igang" },
        ],
      },
      {
        title: "Opmuring & isolering",
        items: [
          { text: "Strøm", status: "igang" },
        ],
      },
      {
        title: "Interiør",
        items: [],
      },
    ],
  }),

  actions: {
    addItem(colIndex) {
      this.milestones[colIndex].items.push({
        text: "Ny milepæl",
        status: "ikke",
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

  getters: {
    progress: (state) => (items) => {
      if (!items.length) return 0;
      const done = items.filter(i => i.status === "færdig").length;
      return Math.round((done / items.length) * 100);
    },
  },
});