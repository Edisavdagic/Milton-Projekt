<script setup>
defineProps({
  selectedChat: {
    type: Object,
    required: true,
  },
  messages: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  isSending: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['back', 'send', 'update:modelValue']);
</script>

<template>
  <div class="chat-widget__conversation">
    <header class="chat-widget__conversation-header">
      <button class="chat-widget__back" @click="emit('back')">‹</button>

      <div class="chat-widget__avatar chat-widget__avatar--large"></div>

      <div>
        <h2>{{ selectedChat.otherName }}</h2>
        <p>{{ selectedChat.otherRole === 'admin' ? 'Byggeleder' : 'Bygherre' }}</p>
      </div>
    </header>

    <div class="chat-widget__messages">
      <template v-for="message in messages" :key="message.id">
        <div v-if="message.type === 'date'" class="chat-widget__date">
          <span>{{ message.text }}</span>
        </div>

        <div
          v-else
          class="chat-widget__message"
          :class="{
            'chat-widget__message--me': message.sender === 'me',
            'chat-widget__message--them': message.sender === 'them',
          }"
        >
          {{ message.text }}
        </div>
      </template>
    </div>

    <div class="chat-widget__composer">
      <input
        type="text"
        placeholder="Aa"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        @keydown.enter.prevent="emit('send')"
      />

      <div class="chat-widget__composer-actions">
        <button type="button">
          <img src="@/assets/icons/Image.svg" alt="Billede ikon" />
        </button>

        <button type="button">
          <img src="@/assets/icons/Mic.svg" alt="Mikrofon ikon" />
        </button>

        <button type="button">
          <img src="@/assets/icons/Paperclip.svg" alt="Vedhæft ikon" />
        </button>

        <button type="button" class="chat-widget__send" @click="emit('send')">
          <img src="@/assets/icons/Send.svg" alt="Send ikon" />
        </button>
      </div>
    </div>
  </div>
</template>
