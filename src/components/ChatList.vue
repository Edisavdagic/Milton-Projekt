<script setup>
defineProps({
  chats: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['open-chat']);
</script>

<template>
  <div class="chat-widget__list-view">
    <h2 class="chat-widget__title">Beskeder</h2>

    <div class="chat-widget__search">
      <input type="text" placeholder="Søg i beskeder" />
      <img src="@/assets/icons/Search.svg" alt="Søge ikon" />
    </div>

    <div class="chat-widget__tabs">
      <button class="chat-widget__tab chat-widget__tab--active">Alle</button>
      <button class="chat-widget__tab">Ulæste</button>
    </div>

    <button
      v-for="chat in chats"
      :key="chat.chatId"
      class="chat-widget__person"
      @click="emit('open-chat', chat)"
    >
      <div class="chat-widget__avatar"></div>

      <div class="chat-widget__person-info">
        <h3>{{ chat.otherName }}</h3>
        <p>{{ chat.lastMessage }}</p>
      </div>

      <span>{{
        chat.lastMessageAt?.toDate()?.toLocaleDateString('da-DK') ?? 'Start en samtale'
      }}</span>
    </button>
  </div>
</template>
