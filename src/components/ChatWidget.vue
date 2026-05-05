<script setup>
import { ref } from "vue";
import { useProjectChat } from "@/composables/useProjectChat";

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

const selectedChat = ref(null);
const newMessage = ref("");

const {
  chats,
  messages,
  listenToMessages,
  sendMessage,
} = useProjectChat(props.projectId, props.currentUser);

const openChat = (chat) => {
  selectedChat.value = chat;
  listenToMessages(chat.chatId);
};

const backToList = () => {
  selectedChat.value = null;
};

const handleSend = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return;

  await sendMessage({
    chatId: selectedChat.value.chatId,
    text: newMessage.value,
  });

  newMessage.value = "";
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
          <button class="chat-widget__tab chat-widget__tab--active">
            Alle
          </button>
          <button class="chat-widget__tab">Ulæste</button>
        </div>

        <button
          v-for="chat in chats"
          :key="chat.chatId"
          class="chat-widget__person"
          @click="openChat(chat)"
        >
          <div class="chat-widget__avatar"></div>

          <div class="chat-widget__person-info">
            <h3>{{ chat.otherName }}</h3>
            <p>{{ chat.otherRole }}</p>
          </div>

          <span>{{ chat.lastMessage ?? "Start en samtale" }}</span>
        </button>
      </div>

      <div v-else class="chat-widget__conversation">
        <header class="chat-widget__conversation-header">
          <button class="chat-widget__back" @click="backToList">‹</button>

          <div class="chat-widget__avatar chat-widget__avatar--large"></div>

          <div>
            <h2>{{ selectedChat.otherName }}</h2>
            <p>{{ selectedChat.otherRole }}</p>
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

        <form class="chat-widget__composer" @submit.prevent="handleSend">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Aa"
            @keyup.enter="handleSend"
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

            <button type="submit" class="chat-widget__send">
              <img src="@/assets/icons/Send.svg" alt="Send ikon" />
            </button>
          </div>
        </form>
      </div>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.chat-widget {
  position: absolute;
  top: 225px;
  right: 0;
  width: 375px;
  height: 680px;
  background: $secondary;
  border: 1px solid #000;
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.22);
  overflow: hidden;

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    width: 42px;
    height: 40px;
    border: none;
    background: $primary;
    color: #fff;
    font-size: 34px;
    cursor: pointer;
    border-radius: 0 5px 0 8px;
    z-index: 3;
  }

  &__list-view {
    height: 100%;
    padding: 28px;
  }

  &__title {
    font-size: $h2-size;
    font-weight: $h1-weight;
    margin-bottom: $spacing-xs;
    color: #000;
  }

  &__search {
    position: relative;
    margin-bottom: 16px;

    input {
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      border-radius: 999px;
      border: none;
      padding: 0 $spacing-lg 0 $spacing-sm;
      font-size: $body-size;
      outline: none;
      background: #fff;
    }

    img {
      position: absolute;
      right: $spacing-sm;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      width: 20px;
      height: 20px;
    }
  }

  &__tabs {
    display: flex;
    gap: $spacing-xxs;
    margin-bottom: $spacing-sm;
  }

  &__tab {
    border: none;
    border-radius: 8px;
    background: #fff;
    padding: 10px 14px;
    font-weight: $h1-weight;
    font-size: $body-size;
    cursor: pointer;

    &--active {
      background: $primary;
      color: #fff;
    }
  }

  &__person {
    width: 100%;
    min-height: 82px;
    display: grid;
    grid-template-columns: 64px 1fr auto;
    align-items: center;
    gap: $spacing-xs;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 16px;
    border: 1.5px solid #9cc9d2;
    background: #fff;
    cursor: pointer;
    text-align: left;

    h3 {
      margin: 0;
      font-size: $h3-size;
      color: #000;
    }

    p {
      margin: 2px 0 0;
      font-size: $body-size;
      color: #777;
    }

    span {
      font-size: $body-size;
      color: #777;
      white-space: nowrap;
    }
  }

  &__avatar {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: #cfcfcf;

    &--large {
      width: 72px;
      height: 72px;
      flex-shrink: 0;
    }
  }

  &__conversation {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #e9e9e9;
  }

  &__conversation-header {
    min-height: 120px;
    padding: 20px 52px 20px 28px;
    display: flex;
    align-items: center;
    gap: 14px;
    background: #fff;
    border-bottom: 1px solid #d4d4d4;

    h2 {
      margin: 0;
      font-size: 30px;
      line-height: 1;
      color: #000;
    }

    p {
      margin: 6px 0 0;
      font-size: 22px;
      color: #777;
    }
  }

  &__back {
    border: none;
    background: transparent;
    font-size: 34px;
    color: #000;
    cursor: pointer;
    padding: 0;
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__message {
    max-width: 78%;
    padding: 12px 14px;
    font-size: 16px;
    line-height: 1.25;
    color: #000;

    &--me {
      align-self: flex-end;
      background: $accent-1;
      border-radius: 18px 18px 4px 18px;
    }

    &--them {
      align-self: flex-start;
      background: #fff;
      border-radius: 18px 18px 18px 4px;
    }
  }

  &__date {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #b1b1b1;
    font-size: 12px;
    font-weight: $h1-weight;

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #d2d2d2;
    }
  }

  &__composer {
    min-height: 118px;
    padding: 18px;
    background: #fff;
    border-top: 1px solid #d4d4d4;
    border-radius: 18px 18px 0 0;

    input {
      width: 100%;
      border: none;
      outline: none;
      font-size: 26px;
      color: $primary;

      &::placeholder {
        color: #b5b5b5;
      }
    }
  }

  &__composer-actions {
    margin-top: 22px;
    display: flex;
    align-items: center;
    gap: 18px;

    button {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 24px;
        height: 24px;
      }
    }
  }

  &__send {
    margin-left: auto;
    width: 42px;
    height: 42px;
    border: 2px solid $primary !important;
    border-radius: 50%;
    background: transparent;

    img {
      width: 20px;
      height: 20px;
    }
  }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.25s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px) translateX(24px);
}
</style>
