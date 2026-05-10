<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
import { useChat } from '@/composables/useProjectChat';
import { useProjectsStore } from '@/stores/project';
import ChatList from './ChatList.vue';
import ChatConversation from './ChatConversation.vue';

const emit = defineEmits(['close']);

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
const newMessage = ref('');
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
  newMessage.value = '';
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

      <ChatList v-if="!selectedChat" :chats="chats" @open-chat="openChat" />

      <ChatConversation
        v-else
        :selected-chat="selectedChat"
        :messages="messages"
        v-model="newMessage"
        :is-sending="isSending"
        @back="backToList"
        @send="handleSend"
      />
    </section>
  </Transition>
</template>

<style lang="scss">
@use "@/assets/styles/components/chatwidget";
</style>
