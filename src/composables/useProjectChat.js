import { ref } from 'vue'
import { db } from '@/services/firebase'
import { useAuthStore } from '@/stores/auth'
import {
  collection, doc, getDoc, addDoc, setDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'

export function useChat() {
  const authStore = useAuthStore()

  const chats = ref([])
  const messages = ref([])
  const loadingChats = ref(false)
  const loadingMessages = ref(false)
  const activeChatId = ref(null)

  let unsubChats = null
  let unsubMessages = null

  async function loadChats(projectId, memberUids) {
    if (!projectId || !memberUids?.length) return
    loadingChats.value = true

    const myUid = authStore.user.uid
    const otherUids = memberUids.filter(uid => uid !== myUid)

    if (!otherUids.length) {
      loadingChats.value = false
      return
    }

    let memberProfiles
    try {
      memberProfiles = await Promise.all(
        otherUids.map(async uid => {
          const snap = await getDoc(doc(db, 'Users', uid))
          const data = snap.exists() ? snap.data() : {}
          return { uid, name: data.name ?? data.email ?? uid, role: data.role ?? '' }
        })
      )
    } catch (err) {
      console.error('[useChat] Failed to fetch member profiles — check Firestore rules:', err)
      loadingChats.value = false
      return
    }

    if (unsubChats) unsubChats()

    const chatsRef = query(
      collection(db, 'projects', projectId, 'chats'),
      where('participants', 'array-contains', myUid)
    )
    unsubChats = onSnapshot(
      chatsRef,
      snapshot => {
        const existingChats = {}
        snapshot.forEach(d => {
          const data = d.data()
          if (data.participants?.includes(myUid)) {
            const otherUid = data.participants.find(p => p !== myUid)
            existingChats[otherUid] = {
              lastMessage: data.lastMessage ?? '',
              lastMessageAt: data.lastMessageAt,
            }
          }
        })

        chats.value = memberProfiles.map(member => ({
          chatId: [myUid, member.uid].sort().join('_'),
          otherUid: member.uid,
          otherName: member.name,
          otherRole: member.role,
          lastMessage: existingChats[member.uid]?.lastMessage ?? null,
          lastMessageAt: existingChats[member.uid]?.lastMessageAt ?? null,
        }))

        loadingChats.value = false
      },
      err => console.error('[useChat] Chats snapshot error:', err)
    )
  }

  function loadMessages(projectId, chatId) {
    if (unsubMessages) unsubMessages()
    activeChatId.value = chatId
    loadingMessages.value = true

    const q = query(
      collection(db, 'projects', projectId, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    unsubMessages = onSnapshot(q, snapshot => {
      const raw = snapshot.docs.map(d => ({
        id: d.id,
        text: d.data().text,
        sender: d.data().senderId === authStore.user.uid ? 'me' : 'them',
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }))
      messages.value = injectDateSeparators(raw)
      loadingMessages.value = false
    })
  }

  async function sendMessage(projectId, chatId, text, otherUid, otherName, otherRole) {
    const trimmed = text.trim()
    if (!trimmed) return

    const myUid = authStore.user.uid
    const myName = authStore.profile?.name ?? authStore.user.email
    const myRole = authStore.profile?.role ?? ''
    const participants = [myUid, otherUid].sort()

    const chatRef = doc(db, 'projects', projectId, 'chats', chatId)
    await setDoc(chatRef, {
      participants,
      participantNames: { [myUid]: myName, [otherUid]: otherName },
      participantRoles: { [myUid]: myRole, [otherUid]: otherRole },
      lastMessage: trimmed,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true })

    await addDoc(
      collection(db, 'projects', projectId, 'chats', chatId, 'messages'),
      {
        text: trimmed,
        senderId: myUid,
        senderName: myName,
        createdAt: serverTimestamp(),
      }
    )
  }

  function cleanup() {
    if (unsubChats) { unsubChats(); unsubChats = null }
    if (unsubMessages) { unsubMessages(); unsubMessages = null }
  }

  return {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    activeChatId,
    loadChats,
    loadMessages,
    sendMessage,
    cleanup,
  }
}

function injectDateSeparators(msgs) {
  const result = []
  let lastDate = null
  for (const msg of msgs) {
    const dateStr = msg.createdAt.toLocaleDateString('da-DK', {
      weekday: 'long', day: 'numeric', month: 'short',
    })
    if (dateStr !== lastDate) {
      result.push({ id: `date-${dateStr}-${msg.id}`, type: 'date', text: dateStr })
      lastDate = dateStr
    }
    result.push(msg)
  }
  return result
}
