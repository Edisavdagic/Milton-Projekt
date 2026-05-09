<script setup>
import { computed, ref, watch, onUnmounted } from "vue";
import { useChat } from "@/composables/useProjectChat";
import { useProjectsStore } from "@/stores/project";

const emit = defineEmits(["close"]);

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  currentUser: {
    type: Object,
    required: true,
  },
});

const projectsStore = useProjectsStore();
const { chats, messages, loadChats, loadAllChats, loadMessages, sendMessage, cleanup } = useChat();

const selectedChatId = ref(null);
const newMessage = ref("");
const isSending = ref(false);

const selectedChat = computed(
  () => chats.value.find((c) => c.chatId === selectedChatId.value) ?? null,
);

watch(
  [() => props.isOpen, () => props.projectId],
  ([isOpen, projectId]) => {
    if (!isOpen) return;
    if (projectId) {
      const memberUids = projectsStore.currentProject?.memberUid ?? [];
      loadChats(projectId, memberUids);
    } else {
      loadAllChats();
    }
  },
  { immediate: true },
);

onUnmounted(() => cleanup());

const openChat = (chat) => {
  selectedChatId.value = chat.chatId;
  loadMessages(chat.projectId ?? props.projectId, chat.chatId);
};

const backToList = () => {
  selectedChatId.value = null;
};

const handleSend = async () => {
  if (isSending.value || !selectedChat.value || !newMessage.value.trim()) return;
  isSending.value = true;
  const text = newMessage.value;
  newMessage.value = "";
  try {
    const projectId = selectedChat.value.projectId ?? props.projectId;
    await sendMessage(
      projectId,
      selectedChat.value.chatId,
      text,
      selectedChat.value.otherUid,
      selectedChat.value.otherName,
      selectedChat.value.otherRole,
    );
  } finally {
    isSending.value = false;
  }
};
</script>

<template>
  <Transition name="chat-slide">
    <section v-if="isOpen" class="chat-widget">
      <button class="chat-widget__close" @click="emit('close')">×</button>

      <div v-if="!selectedChat" class="chat-widget__list-view">
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
          :class="{ 'chat-widget__person--active': chat.chatId === selectedChatId }"
          @click="openChat(chat)"
        >
          <div class="chat-widget__avatar"></div>

          <div class="chat-widget__person-info">
            <h3>{{ chat.otherName }}</h3>
            <p>{{ chat.lastMessage }}</p>
          </div>

          <span>{{
            chat.lastMessageAt?.toDate()?.toLocaleDateString("da-DK") ?? "Start en samtale"
          }}</span>
        </button>
      </div>

      <div v-else class="chat-widget__conversation">
        <header class="chat-widget__conversation-header">
          <button class="chat-widget__back" @click="backToList">‹</button>

          <div class="chat-widget__avatar chat-widget__avatar--large"></div>

          <div>
            <h2>{{ selectedChat.otherName }}</h2>
            <p>{{ selectedChat.otherRole === "admin" ? "Byggeleder" : "Bygherre" }}</p>
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
            v-model="newMessage"
            @keydown.enter.prevent="handleSend"
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

            <button type="button" class="chat-widget__send" @click="handleSend">
              <img src="@/assets/icons/Send.svg" alt="Send ikon" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
@import "@/assets/styles/components/_chatwidget.scss";
</style>
