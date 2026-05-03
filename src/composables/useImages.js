// composables/useImages.js
import { ref } from "vue";

const images = ref([]);

export function useImages() {
  const addImage = (image) => {
    images.value.push(image);
  };

  const removeImage = (id) => {
    images.value = images.value.filter(img => img.id !== id);
  };

  return {
    images,
    addImage,
    removeImage
  };
}