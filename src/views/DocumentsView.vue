<script setup>
import { computed, onMounted, ref } from "vue";
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/services/firebase";

const searchQuery = ref("");
const selectedFilter = ref("all");
const documents = ref([]);
const isLoading = ref(true);
const error = ref("");
const isUploading = ref(false);
const fileInput = ref(null);
const pendingFile = ref(null);
const pendingBeskrivelse = ref("");

function onFileChosen(e) {
  const file = e.target.files[0];
  if (!file) return;
  fileInput.value.value = "";
  pendingFile.value = file;
  pendingBeskrivelse.value = "";
}

function cancelUpload() {
  pendingFile.value = null;
  pendingBeskrivelse.value = "";
}

async function confirmUpload() {
  const file = pendingFile.value;
  if (!file) return;

  isUploading.value = true;
  error.value = "";
  try {
    const path = `documents/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    const snapshot = await uploadBytesResumable(fileRef, file, { contentType: file.type });
    const url = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "documents"), {
      name: file.name,
      file: file.name,
      beskrivelse: pendingBeskrivelse.value.trim(),
      url,
      storagePath: path,
      uploadedAt: serverTimestamp(),
    });

    pendingFile.value = null;
    pendingBeskrivelse.value = "";
    await loadDocuments();
  } catch (e) {
    error.value = e.message;
  } finally {
    isUploading.value = false;
  }
}

async function loadDocuments() {
  isLoading.value = true;
  error.value = "";
  try {
    const q = query(collection(db, "documents"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    documents.value = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        type: getTypeDetails(data.file),
        uploadedAtLabel: formatDate(data.uploadedAt?.toDate()),
      };
    });
  } catch (e) {
    error.value = e.message;
    documents.value = [];
  } finally {
    isLoading.value = false;
  }
}

const filterOptions = [
  {
    value: "all",
    label: "Alle filer",
  },
  {
    value: "pdf",
    label: "PDF",
  },
  {
    value: "image",
    label: "Billeder",
  },
];

const imageExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);

function getFileExtension(fileName) {
  const segments = fileName.split(".");

  if (segments.length < 2) {
    return "";
  }

  return segments.pop().toLowerCase();
}

function getTypeDetails(fileName) {
  const extension = getFileExtension(fileName);

  if (extension === "pdf") {
    return {
      key: "pdf",
      label: "pdf",
    };
  }

  if (imageExtensions.has(extension)) {
    return {
      key: "image",
      label: extension,
    };
  }

  return {
    key: "file",
    label: extension || "ukendt",
  };
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ukendt dato";
  }

  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const visibleDocuments = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return documents.value.filter((document) => {
    const matchesFilter =
      selectedFilter.value === "all" || document.type.key === selectedFilter.value;

    if (!query) {
      return matchesFilter;
    }

    const matchesQuery = [document.name, document.beskrivelse, document.type.label].some((field) =>
      field.toLowerCase().includes(query),
    );

    return matchesFilter && matchesQuery;
  });
});


onMounted(loadDocuments);
</script>

<template>
  <section class="documents-page">
    <header class="documents-page__header">
      <h1 class="documents-page__title">Dokumenter</h1>

      <div class="documents-page__controls">
        <div class="documents-page__search-wrap">
          <input
            v-model="searchQuery"
            class="documents-page__search"
            type="search"
            placeholder="Søg i dokumenter"
          />
          <svg class="documents-page__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>

        <div class="documents-page__filter-wrap">
          <img
            class="documents-page__filter-icon"
            src="@/assets/icons/Filter.svg"
            alt="Filter ikon"
          />
          <span class="documents-page__filter-label">Filter</span>
          <select
            v-model="selectedFilter"
            class="documents-page__filter"
            aria-label="Filtrer dokumenter"
          >
            <option v-for="option in filterOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf,image/*"
          style="display:none"
          @change="onFileChosen"
        />
        <button
          class="documents-page__upload-btn"
          type="button"
          :disabled="isUploading"
          @click="fileInput.click()"
        >
        <img
          class="documents-page__upload-icon"
          src="@/assets/icons/File 2.svg"
          alt="Fil ikon"
        />
          {{ isUploading ? "Uploader..." : "Tilføj fil" }}
        </button>
      </div>
    </header>

    <Teleport to="body">
      <div v-if="pendingFile" class="upload-modal__backdrop" @click.self="cancelUpload">
        <div class="upload-modal">
          <h2 class="upload-modal__title">Tilføj fil</h2>

          <p class="upload-modal__filename">{{ pendingFile.name }}</p>

          <label class="upload-modal__label" for="upload-beskrivelse">Beskrivelse</label>
          <textarea
            id="upload-beskrivelse"
            v-model="pendingBeskrivelse"
            class="upload-modal__textarea"
            placeholder="Kort beskrivelse af filen (valgfrit)"
            rows="3"
          />

          <div class="upload-modal__actions">
            <button class="upload-modal__cancel" type="button" @click="cancelUpload">Annuller</button>
            <button class="upload-modal__confirm" type="button" :disabled="isUploading" @click="confirmUpload">
              {{ isUploading ? "Uploader..." : "Upload" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="error" class="documents-page__status documents-page__status--error">
      <p>{{ error }}</p>
      <button class="documents-page__retry" type="button" @click="loadDocuments">Prøv igen</button>
    </div>

    <p v-else-if="isLoading" class="documents-page__status">Indlæser dokumenter...</p>

    <p v-else-if="!visibleDocuments.length" class="documents-page__status">
      Ingen dokumenter matcher din søgning.
    </p>

    <div v-else class="documents-page__table-wrap">
      <table class="documents-page__table">
        <thead>
          <tr>
            <th>Navn</th>
            <th>Beskrivelse</th>
            <th>Type</th>
            <th>Ændringsdato</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="document in visibleDocuments" :key="document.id">
            <td>
              <a
                class="documents-page__name"
                :href="document.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ document.name }}
              </a>
            </td>
            <td class="documents-page__description">{{ document.beskrivelse }}</td>
            <td>
              <div class="documents-page__type">
                <svg v-if="document.type.key === 'image'" class="documents-page__type-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <svg v-else class="documents-page__type-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="documents-page__type-label">{{ document.type.label }}</span>
              </div>
            </td>
            <td>{{ document.uploadedAtLabel }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.documents-page {
  min-height: 100vh;
  padding: 2rem;
  background: $secondary;

  &__header {
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  &__title {
    margin: 0;
    font-size: 2.25rem;
    color: #1f1f1f;
  }

  &__controls {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__search-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-width: 16rem;
  }

  &__search {
    border: 1px solid #d2cecb;
    border-radius: 20px;
    background-color: #fff;
    min-height: 2.5rem;
    padding: 0 2.2rem 0 0.75rem;
    font-size: 0.95rem;
    width: 100%;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__search-icon {
    position: absolute;
    right: 0.7rem;
    width: 1rem;
    height: 1rem;
    color: #909090;
    pointer-events: none;
    flex-shrink: 0;
  }

  &__filter-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid #d2cecb;
    border-radius: 20px;
    background-color: #fff;
    padding: 0 0.9rem;
    min-height: 2.5rem;
    cursor: pointer;
    user-select: none;

    &:hover {
      border-color: #b5b0ad;
    }
  }

  &__filter-icon {
    width: 1rem;
    height: 1rem;
    color: #505050;
    flex-shrink: 0;
    pointer-events: none;
  }

  &__filter-label {
    font-size: 0.95rem;
    color: #1f1f1f;
    white-space: nowrap;
    pointer-events: none;
  }

  &__filter {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  &__table-wrap {
    overflow: auto;
    border: 1px solid #d7d3d0;
    border-radius: 0.75rem;
    background-color: #fff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid #ece9e7;
      font-size: 0.95rem;
      white-space: nowrap;
    }

    th {
      font-size: 0.8rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      background-color: #fff;
      color: #505050;
    }

    tbody tr:nth-child(odd) {
      background-color: $secondary;
    }
  }

  &__name {
    color: #1f1f1f;
    font-weight: $h2-weight;
    text-decoration: none;

    &:hover {
      color: $accent-2;
      text-decoration: underline;
    }
  }

  &__description {
    color: #5f5f5f;
    max-width: 22rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__type {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__type-icon {
    width: 1.1rem;
    height: 1.1rem;
    color: #909090;
    flex-shrink: 0;
  }

  &__type-label {
    font-size: 0.9rem;
    color: #505050;
  }

  &__status {
    margin: 1rem 0;
    color: #4b5563;

    &--error {
      color: #991b1b;
    }
  }

  &__retry {
    margin-top: 0.5rem;
    background-color: $primary;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
  }

  &__upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background-color: $primary;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 0 1rem;
    min-height: 2.5rem;
    font-size: 0.95rem;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;

    svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    &:hover:not(:disabled) {
      background-color: $accent-2;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 768px) {
  .documents-page {
    padding: 1rem;

    &__search-wrap {
      min-width: 100%;
    }

    &__controls {
      width: 100%;
    }

    &__filter-wrap {
      width: 100%;
    }
  }
}
</style>

<style lang="scss">
@use "../assets/styles/variables" as *;

.upload-modal {
  &__backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  width: min(28rem, 90vw);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

  &__title {
    margin: 0;
    font-size: 1.2rem;
    color: #1f1f1f;
  }

  &__filename {
    margin: 0;
    font-size: 0.9rem;
    color: #505050;
    background: #f4f3f3;
    border-radius: 0.5rem;
    padding: 0.4rem 0.75rem;
    word-break: break-all;
  }

  &__label {
    font-size: 0.85rem;
    font-weight: $h2-weight;
    color: #1f1f1f;
  }

  &__textarea {
    resize: vertical;
    border: 1px solid #d2cecb;
    border-radius: 0.5rem;
    padding: 0.6rem 0.75rem;
    font-size: 0.95rem;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;

    &:focus {
      outline: 2px solid $primary;
      outline-offset: 1px;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  &__cancel {
    background: none;
    border: 1px solid #d2cecb;
    border-radius: 20px;
    padding: 0 1rem;
    min-height: 2.5rem;
    font-size: 0.95rem;
    font-family: inherit;
    cursor: pointer;
    color: #505050;

    &:hover {
      border-color: #a09a97;
    }
  }

  &__confirm {
    background-color: $primary;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 0 1.25rem;
    min-height: 2.5rem;
    font-size: 0.95rem;
    font-family: inherit;
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: $accent-2;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
