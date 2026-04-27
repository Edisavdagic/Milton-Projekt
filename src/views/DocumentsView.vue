<script setup>
import { computed, onMounted, ref } from "vue";

const searchQuery = ref("");
const selectedFilter = ref("all");
const documents = ref([]);
const isLoading = ref(true);
const error = ref("");

// hardcoded data.
// TODO Firebase: erstat med rigtige data fra Firestore. Husk at tilføje type og uploadedAtLabel til hvert dokument.
const mockDocuments = [
  {
    id: "test",
    file: "test.pdf",
    name: "test",
    beskrivelse: "Kontrakt mellem byggherre og leverandør.",
    uploadedAt: "2026-02-07",
  },
  {
    id: "endnu en test",
    file: "endnu en test.pdf",
    name: "endnu en test",
    beskrivelse: "Opsummering af fremdrift og økonomi for februar.",
    uploadedAt: "2026-02-08",
  },
  {
    id: "render",
    file: "render.svg",
    name: "Render",
    beskrivelse: "Visualisering af facaden fra sydsiden.",
    uploadedAt: "2026-02-08",
  },
  {
    id: "grundfoto",
    file: "grundfoto.svg",
    name: "Grundfoto",
    beskrivelse: "Dronefoto af byggegrund med markering af skel.",
    uploadedAt: "2026-02-07",
  },
];

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

function fileUrl(fileName) {
  return `/documents/${fileName}`;
}

function iconLabel(typeKey) {
  if (typeKey === "pdf") {
    return "PDF";
  }

  if (typeKey === "image") {
    return "IMG";
  }

  return "FIL";
}

async function loadDocuments() {
  isLoading.value = true;
  error.value = "";

  try {
    // Hold async for at simulere indlæsningstid. Fjern når der hentes rigtige data.
    await new Promise((resolve) => setTimeout(resolve, 150));

    // TODO Firebase: Hent dokumenter fra Firestore og erstat mock data. Husk at tilføje type og uploadedAtLabel til hvert dokument.
    documents.value = mockDocuments.map((item) => {
      return {
        ...item,
        type: getTypeDetails(item.file),
        uploadedAtLabel: formatDate(item.uploadedAt),
      };
    });
  } catch (loadError) {
    error.value =
      loadError instanceof Error ? loadError.message : "Noget gik galt under indlæsning.";
    documents.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadDocuments);
</script>

<template>
  <section class="documents-page">
    <header class="documents-page__header">
      <h1 class="documents-page__title">Dokumenter</h1>

      <div class="documents-page__controls">
        <input
          v-model="searchQuery"
          class="documents-page__search"
          type="search"
          placeholder="Søg i dokumenter"
        />

        <select
          v-model="selectedFilter"
          class="documents-page__filter"
          :class="{ 'documents-page__filter--icon-only': selectedFilter === 'all' }"
          aria-label="Filtrer dokumenter"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </header>

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
                :href="fileUrl(document.file)"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ document.name }}
              </a>
            </td>
            <td class="documents-page__description">{{ document.beskrivelse }}</td>
            <td>
              <div class="documents-page__type">
                <span
                  class="documents-page__icon"
                  :class="`documents-page__icon--${document.type.key}`"
                >
                  {{ iconLabel(document.type.key) }}
                </span>
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
  background: linear-gradient(180deg, #eae8e7 0%, #f4f3f3 100%);

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

  &__search,
  &__filter {
    border: 1px solid #d2cecb;
    border-radius: 20px;
    background-color: #fff;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.95rem;
  }

  &__search {
    min-width: 16rem;
  }

  &__filter {
    min-width: 7.5rem;
    padding: 0 2rem 0 0.75rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23505550' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6h16'/%3E%3Cpath d='M7 12h10'/%3E%3Cpath d='M10 18h4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    background-size: 0.9rem;
  }

  &__filter--icon-only {
    width: 2.5rem;
    min-width: 2.5rem;
    padding: 0;
    color: transparent;
    text-indent: -9999px;
    background-position: center;
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
      background-color: #f4f2f1;
      color: #505050;
    }

    tbody tr:nth-child(even) {
      background-color: #faf9f8;
    }
  }

  &__name {
    color: #1f1f1f;
    font-weight: 600;
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
    gap: 0.5rem;
  }

  &__icon {
    display: inline-flex;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;

    &--pdf {
      background-color: #fee2e2;
      color: #b91c1c;
    }

    &--image {
      background-color: #dbeafe;
      color: #1d4ed8;
    }

    &--file {
      background-color: #e5e7eb;
      color: #1f2937;
    }
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
}

@media (max-width: 768px) {
  .documents-page {
    padding: 1rem;

    &__search {
      min-width: 100%;
    }

    &__controls {
      width: 100%;
    }

    &__filter {
      width: 100%;
    }
  }
}
</style>
