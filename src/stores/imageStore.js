// stores/imageStore.js
import { defineStore } from "pinia";

export const useImageStore = defineStore("images", {
  state: () => ({
    images: []
  }),

  actions: {
    addImage(image) {
      this.images.push(image);
    },

    removeImage(id) {
      this.images = this.images.filter(img => img.id !== id);
    }
  }
});