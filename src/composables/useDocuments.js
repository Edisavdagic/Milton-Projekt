import { ref } from 'vue';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage';
import { db, storage } from '@/services/firebase';
import { getTypeDetails } from '@/utils/file';
import { formatDate } from '@/utils/date';

function toDocument(docSnapshot) {
  const data = docSnapshot.data();

  return {
    ...data,
    id: docSnapshot.id,
    type: getTypeDetails(data.file),
    uploadedAtLabel: formatDate(data.uploadedAt?.toDate()),
  };
}

export function useDocuments() {
  const documents = ref([]);
  const isLoading = ref(false);
  const isUploading = ref(false);
  const error = ref('');

  async function loadDocuments() {
    isLoading.value = true;
    error.value = '';

    try {
      const snap = await getDocs(
        query(collection(db, 'documents'), orderBy('uploadedAt', 'desc')),
      );
      documents.value = snap.docs.map(toDocument);
    } catch (err) {
      error.value = err.message;
      documents.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadDocument(file, beskrivelse = '') {
    if (!file) return;

    isUploading.value = true;
    error.value = '';

    try {
      const path = `documents/${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, path);
      const snapshot = await uploadBytesResumable(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'documents'), {
        name: file.name,
        file: file.name,
        beskrivelse: beskrivelse.trim(),
        url,
        storagePath: path,
        uploadedAt: serverTimestamp(),
      });

      await loadDocuments();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isUploading.value = false;
    }
  }

  return {
    documents,
    isLoading,
    isUploading,
    error,
    loadDocuments,
    uploadDocument,
  };
}
