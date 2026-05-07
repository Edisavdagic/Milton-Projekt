<template>
  <div class="container">
    <div class="header">
      <h2>Seneste billeder</h2>
      <button class="edit-btn" v-if="authStore.isAdmin" @click="toggleEdit">
        {{ editing ? "Færdig" : "Rediger" }}
      </button>
    </div>

    <!-- Upload -->
    <input
      v-if="editing"
      ref="fileInput"
      class="file-input"
      type="file"
      multiple
      accept="image/*"
      :disabled="uploading"
      @change="handleFiles"
    />

    <div class="gallery">
      <div
        v-for="image in images"
        :key="image.id"
        class="card"
      >
        <img :src="image.src" :alt="image.name || 'Uploaded image'" />

        <button
          v-if="editing"
          class="delete-btn"
          :disabled="uploading"
          @click="handleRemoveImage(image.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useImages } from "@/composables/useImages";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();
const projectId = computed(() => route.params.projectId);
const {
  images,
  uploading,
  loadImages,
  addImage,
  removeImage,
  cleanup,
} = useImages(projectId);

const editing = ref(false);
const fileInput = ref(null);
const maxSize = 5 * 1024 * 1024;

watch(projectId, (id) => loadImages(id), { immediate: true });
onUnmounted(cleanup);

// toggle edit
const toggleEdit = () => {
  editing.value = !editing.value;
};

// upload handler
const handleFiles = async (event) => {
  const files = Array.from(event.target.files ?? []);
  const validFiles = [];

  files.forEach((file) => {
    // check if it's an image
    if (!file.type.startsWith("image/")) return;

    // check file size
    if (file.size > maxSize) {
      alert(`"${file.name}" er for stort (max 5MB)`);
      return;
    }

    validFiles.push(file);
  });

  try {
    await Promise.all(validFiles.map((file) => addImage(file)));
  } catch {
    alert("Billedet kunne ikke uploades. Prøv igen.");
  }

  // reset input
  if (fileInput.value) fileInput.value.value = "";
};

const handleRemoveImage = async (id) => {
  try {
    await removeImage(id);
  } catch {
    alert("Billedet kunne ikke slettes. Prøv igen.");
  }
};
</script>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.container {
  margin: 0 0 $dashboard-section-gap;
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $dashboard-section-title-gap;

  h2 {
    margin: 0;
    color: $textcolor-4;
    font-size: $h2-size;
    font-weight: $h2-weight;
    line-height: 1;
  }
}

.edit-btn {
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
}

/* Upload */
.file-input {
  margin-bottom: $spacing-sm;
  color: $textcolor-4;
  font-family: $font-family;
  font-size: $dashboard-small-font-size;
}

/* Gallery */
.gallery {
  display: grid;
  grid-template-columns: repeat(4, minmax($dashboard-gallery-card-min-width, 1fr));
  gap: 20px;
}

/* Cards */
.card {
  position: relative;
  min-width: 0;
  height: $dashboard-gallery-card-height;
  border-radius: $radius-xl;
  overflow: hidden;
  background: $tertiary;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Delete button */
.delete-btn {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  background: rgba($textcolor-1, 0.6);
  color: $textcolor-2;
  border: none;
  border-radius: $radius-pill;
  width: $spacing-md;
  height: $spacing-md;
  cursor: pointer;
}

@media (max-width: $breakpoint-lg) {
  .gallery {
    grid-template-columns: repeat(2, minmax($dashboard-gallery-card-min-width, 1fr));
  }
}

@media (max-width: $breakpoint-sm) {
  .gallery {
    grid-template-columns: 1fr;
  }
}
</style>
