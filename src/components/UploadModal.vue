<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  file: {
    type: File,
    default: null,
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const beskrivelse = ref('');

watch(
  () => props.file,
  (file) => {
    if (file) beskrivelse.value = '';
  },
);

function confirm() {
  emit('confirm', beskrivelse.value);
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <Teleport to="body">
    <div v-if="file" class="upload-modal__backdrop" @click.self="cancel">
      <div class="upload-modal">
        <h2 class="upload-modal__title">Tilføj fil</h2>

        <p class="upload-modal__filename">{{ file.name }}</p>

        <label class="upload-modal__label" for="upload-beskrivelse">Beskrivelse</label>
        <textarea
          id="upload-beskrivelse"
          v-model="beskrivelse"
          class="upload-modal__textarea"
          placeholder="Kort beskrivelse af filen (valgfrit)"
          rows="3"
        />

        <div class="upload-modal__actions">
          <button class="upload-modal__cancel" type="button" @click="cancel">
            Annuller
          </button>
          <button
            class="upload-modal__confirm"
            type="button"
            :disabled="isUploading"
            @click="confirm"
          >
            {{ isUploading ? 'Uploader...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
@use '@/assets/styles/variables' as *;

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
  border-radius: $radius-xl;
  padding: $spacing-sm;
  width: min(444px, 90vw);
  display: flex;
  flex-direction: column;
  gap: $spacing-s;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

  &__title {
    margin: 0;
    font-size: $h5-size;
    color: $textcolor-1;
  }

  &__filename {
    margin: 0;
    font-size: $body-size;
    color: $textcolor-4;
    background: $secondary;
    border-radius: $radius-md;
    padding: $radius-sm $spacing-s;
    word-break: break-all;
  }

  &__label {
    font-size: $small-size;
    font-weight: $h2-weight;
    color: $textcolor-1;
  }

  &__textarea {
    resize: vertical;
    border: 1px solid #d2cecb;
    border-radius: $radius-md;
    padding: $radius-lg $spacing-s;
    font-size: $body-size;
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
    gap: $spacing-xs;
    margin-top: $spacing-xxs;
  }

  &__cancel {
    background: none;
    border: 1px solid #d2cecb;
    border-radius: $radius-md;
    padding: 0 $spacing-sm;
    min-height: $spacing-md;
    font-size: $body-size;
    font-family: inherit;
    cursor: pointer;
    color: $textcolor-4;

    &:hover {
      border-color: $accent-1;
    }
  }

  &__confirm {
    background-color: $primary;
    color: #fff;
    border: none;
    border-radius: $radius-md;
    padding: 0 $spacing-md;
    min-height: $spacing-vl;
    font-size: $body-size;
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
