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
      @change="handleFiles"
    />

    <div class="gallery">
      <div
        v-for="image in images"
        :key="image.id"
        class="card"
      >
        <img :src="image.src" alt="Uploaded image" />

        <button
          v-if="editing"
          class="delete-btn"
          @click="removeImage(image.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useImages } from "@/composables/useImages";
import { useAuthStore } from "@/stores/auth";

const { images, addImage, removeImage } = useImages();
const authStore = useAuthStore();

const editing = ref(false);
const fileInput = ref(null);
const maxSize = 5 * 1024 * 1024;

// toggle edit
const toggleEdit = () => {
  editing.value = !editing.value;
};

// upload handler
const handleFiles = (event) => {
  const files = Array.from(event.target.files);

  files.forEach(file => {
    // check if it's an image
    if (!file.type.startsWith("image/")) return;

    // check file size
    if (file.size > maxSize) {
      alert(`"${file.name}" er for stort (max 5MB)`);
      return;
    }

    const reader = new FileReader();

    // when file is loaded, add to gallery
    reader.onload = (e) => {
      addImage({
        id: crypto.randomUUID(),
        src: e.target.result
      });
    };

    reader.readAsDataURL(file);
  });

  // reset input
  fileInput.value.value = "";
};
</script>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.container {
  max-width: flex;
  margin: auto;
  padding: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.edit-btn {
  background: $primary;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

/* Upload */
.file-input {
  margin-bottom: 10px;
}

/* Gallery */
.gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

/* Cards */
.card {
  position: relative;
  min-width: 220px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  background: #eee;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Delete button */
.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}
</style>