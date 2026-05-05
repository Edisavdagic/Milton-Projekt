import { ref, watch } from "vue";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";

export function useProjectChat(projectId, currentUser) {
  const chats = ref([]);
  const messages = ref([]);

  let unsubscribeMessages = null;

  const isProjectReady = () => Boolean(projectId && projectId !== "");

  const cleanupMessages = () => {
    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }
    messages.value = [];
  };

  // FETCH CHATS (1 per user in project)
  const loadChats = () => {
    if (!isProjectReady()) {
      chats.value = [];
      return;
    }

    const chatsRef = collection(db, "projects", projectId, "chats");

    onSnapshot(chatsRef, (snapshot) => {
      chats.value = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        // find "the other user"
        const otherUser = data.members.find(
          (m) => m.id !== currentUser?.id
        );

        return {
          chatId: docSnap.id,
          otherName: otherUser?.name || "Ukendt",
          otherRole: otherUser?.role || "",
          lastMessage: data.lastMessage || "",
        };
      });
    });
  };

  // LISTEN TO MESSAGES
  const listenToMessages = (chatId) => {
    if (!isProjectReady() || !chatId) {
      cleanupMessages();
      return;
    }

    if (unsubscribeMessages) unsubscribeMessages();

    const messagesRef = collection(
      db,
      "projects",
      projectId,
      "chats",
      chatId,
      "messages"
    );

    const q = query(messagesRef, orderBy("createdAt", "asc"));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          text: data.text,
          sender: data.senderId === currentUser?.id ? "me" : "them",
        };
      });
    });
  };

  // SEND MESSAGE
  const sendMessage = async ({ chatId, text }) => {
    if (!isProjectReady() || !chatId) return;

    const messagesRef = collection(
      db,
      "projects",
      projectId,
      "chats",
      chatId,
      "messages"
    );

    await addDoc(messagesRef, {
      text,
      senderId: currentUser?.id,
      createdAt: serverTimestamp(),
    });

    // update lastMessage
    const chatRef = doc(db, "projects", projectId, "chats", chatId);

    await addDoc(collection(chatRef, "meta"), {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    });
  };

  // WATCH PROJECT ID
  watch(
    () => projectId,
    (newId) => {
      if (newId) {
        loadChats();
      } else {
        chats.value = [];
        cleanupMessages();
      }
    },
    { immediate: true }
  );

  return {
    chats,
    messages,
    listenToMessages,
    sendMessage,
  };
}
