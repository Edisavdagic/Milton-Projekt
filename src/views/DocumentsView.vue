<script setup>
import { computed, ref } from 'vue';
import UploadModal from '@/components/UploadModal.vue';
import { useDocuments } from '@/composables/useDocuments';

const {
  documents,
  isLoading,
  isUploading,
  error,
  loadDocuments,
  uploadDocument,
} = useDocuments();

const searchQuery = ref('');
const selectedFilter = ref('all');
const fileInput = ref(null);
/** @type {import('vue').Ref<File | null>} */
const pendingFile = ref(null);

const filterOptions = [
  { value: 'all', label: 'Alle filer' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Billeder' },
];

const visibleDocuments = computed(() => {
  const term = searchQuery.value.trim().toLowerCase();

  return documents.value.filter((document) => {
    const matchesFilter =
      selectedFilter.value === 'all' || document.type.key === selectedFilter.value;

    if (!term) return matchesFilter;

    const matchesQuery = [document.name, document.beskrivelse, document.type.label].some(
      (field) => field?.toLowerCase().includes(term),
    );

    return matchesFilter && matchesQuery;
  });
});

/** @param {Event} event */
function onFileChosen(event) {
  const input = /** @type {HTMLInputElement} */ (event.target);
  const file = input.files?.[0];
  if (!file) return;
  input.value = '';
  pendingFile.value = file;
}

function cancelUpload() {
  pendingFile.value = null;
}

/** @param {string} beskrivelse */
async function confirmUpload(beskrivelse) {
  const file = pendingFile.value;
  if (!file) return;

  try {
    await uploadDocument(file, beskrivelse);
    pendingFile.value = null;
  } catch {
    // error is surfaced via the composable's `error` ref
  }
}

loadDocuments();
</script>

<template>
  <section class="section-content documents-page">
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
          <svg
            class="documents-page__search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
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
          style="display: none"
          @change="onFileChosen"
        />
        <button
          class="documents-page__upload-btn"
          type="button"
          :disabled="isUploading"
          @click="fileInput.click()"
        >
          <img class="documents-page__upload-icon" src="@/assets/icons/File 2.svg" alt="Fil ikon" />
          {{ isUploading ? 'Uploader...' : 'Tilføj fil' }}
        </button>
      </div>
    </header>

    <UploadModal
      :file="pendingFile"
      :is-uploading="isUploading"
      @confirm="confirmUpload"
      @cancel="cancelUpload"
    />

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
                <svg
                  v-if="document.type.key === 'image'"
                  class="documents-page__type-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <svg
                  v-else
                  class="documents-page__type-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
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
@use '../assets/styles/variables' as *;

.documents-page {
  background: $secondary;
  padding-bottom: $spacing-sm;

  &__header {
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-sm;
    flex-wrap: wrap;
    margin-bottom: $spacing-md;
  }

  &__title {
    margin: 0;
    color: #1f1f1f;
  }

  &__controls {
    display: flex;
    gap: $spacing-s;
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
    font-size: $body-size;
    width: 100%;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__search-icon {
    position: absolute;
    right: 0.7rem;
    width: $spacing-sm;
    height: $spacing-sm;
    color: #909090;
    pointer-events: none;
    flex-shrink: 0;
  }

  &__filter-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    border: 1px solid #d2cecb;
    border-radius: $radius-xxxl;
    background-color: #fff;
    padding: 0 $spacing-sm;
    min-height: $spacing-vl;
    cursor: pointer;
    user-select: none;

    &:hover {
      border-color: #b5b0ad;
    }
  }

  &__filter-icon {
    width: $spacing-sm;
    height: $spacing-sm;
    color: $textcolor-5;
    flex-shrink: 0;
    pointer-events: none;
  }

  &__filter-label {
    font-size: $spacing-sm;
    color: $textcolor-1;
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
    border-radius: $radius-xl;
    background-color: $textcolor-2;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  }

  &__table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;

    th,
    td {
      text-align: left;
      padding: $spacing-s;
      border-bottom: 1px solid #ece9e7;
      font-size: $body-size;
      white-space: nowrap;
      max-width: 352px;
    }

    th {
      font-size: $small-size;
      text-transform: uppercase;
      background-color: $textcolor-2;
      color: $textcolor-4;
    }

    tbody tr:nth-child(odd) {
      background-color: $secondary;
    }
  }

  &__name {
    color: $textcolor-1;
    font-weight: $h2-weight;
    text-decoration: none;
    max-width: 352px;

    &:hover {
      color: $accent-2;
      text-decoration: underline;
    }
  }

  &__description {
    color: $textcolor-4;
    max-width: 352px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__type {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__type-icon {
    width: $spacing-sm;
    height: $spacing-sm;
    color: $textcolor-5;
    flex-shrink: 0;
  }

  &__type-label {
    font-size: $body-size;
    color: $textcolor-4;
  }

  &__status {
    margin: 1rem 0;
    color: $textcolor-4;

    &--error {
      color: $error;
    }
  }

  &__retry {
    margin-top: $spacing-xs;
    background-color: $primary;
    color: textcolor-2;
    border: none;
    border-radius: $radius-md;
    padding: $spacing-xs $spacing-s;
    cursor: pointer;
  }

  &__upload-btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    background-color: $primary;
    color: $textcolor-2;
    border: none;
    border-radius: $radius-xxxl;
    padding: 0 $spacing-sm;
    min-height: $spacing-vl;
    font-size: $body-size;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;

    svg {
      width: $spacing-sm;
      height: $spacing-sm;
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
    padding: $spacing-sm;

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
