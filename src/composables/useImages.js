import { ref, unref } from 'vue';
import { db, storage } from '@/services/firebase';
import { useAuthStore } from '@/stores/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';

function normalizeProjectId(projectId) {
  const value = unref(projectId);
  return Array.isArray(value) ? value[0] : value;
}

function toImage(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    ...data,
    src: data.src ?? data.url ?? '',
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

function sanitizeFileName(fileName) {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}

export function useImages(projectIdSource) {
  const authStore = useAuthStore();
  const images = ref([]);
  const loading = ref(false);
  const uploading = ref(false);
  const error = ref(null);
  const activeUploads = ref(0);

  let unsubscribeImages = null;

  function getProjectId(projectId = projectIdSource) {
    return normalizeProjectId(projectId);
  }

  function imageCollection(projectId) {
    return collection(db, 'projects', projectId, 'images');
  }

  function cleanup() {
    if (unsubscribeImages) {
      unsubscribeImages();
      unsubscribeImages = null;
    }
  }

  function loadImages(projectId = projectIdSource) {
    const resolvedProjectId = getProjectId(projectId);

    cleanup();
    images.value = [];

    if (!resolvedProjectId) return;

    loading.value = true;
    error.value = null;

    const imagesQuery = query(
      imageCollection(resolvedProjectId),
      orderBy('createdAt', 'desc'),
    );

    unsubscribeImages = onSnapshot(
      imagesQuery,
      (snapshot) => {
        images.value = snapshot.docs.map(toImage);
        loading.value = false;
      },
      (err) => {
        console.error('[useImages] Failed to load images:', err);
        error.value = err.message;
        loading.value = false;
      },
    );
  }

  async function addImage(file) {
    const projectId = getProjectId();
    const user = authStore.user;
    let uploadedFileRef = null;

    if (!projectId) {
      throw new Error('Mangler projectId til billedupload.');
    }

    if (!user?.uid) {
      throw new Error('Du skal være logget ind for at uploade billeder.');
    }

    activeUploads.value += 1;
    uploading.value = true;
    error.value = null;

    try {
      const imageDocRef = doc(imageCollection(projectId));
      const cleanName = sanitizeFileName(file.name || 'image');
      const path = `projects/${projectId}/images/${imageDocRef.id}/${cleanName}`;
      const fileRef = storageRef(storage, path);

      await uploadBytes(fileRef, file, {
        contentType: file.type,
      });
      uploadedFileRef = fileRef;

      const src = await getDownloadURL(fileRef);

      await setDoc(imageDocRef, {
        src,
        storagePath: path,
        name: file.name,
        size: file.size,
        contentType: file.type,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });

      return imageDocRef.id;
    } catch (err) {
      if (uploadedFileRef) {
        await deleteObject(uploadedFileRef).catch(() => {});
      }

      console.error('[useImages] Failed to upload image:', err);
      error.value = err.message;
      throw err;
    } finally {
      activeUploads.value -= 1;
      uploading.value = activeUploads.value > 0;
    }
  }

  async function removeImage(id) {
    const projectId = getProjectId();
    const image = images.value.find((item) => item.id === id);

    if (!projectId || !id) return;

    error.value = null;

    try {
      if (image?.storagePath) {
        await deleteObject(storageRef(storage, image.storagePath)).catch((err) => {
          if (err.code !== 'storage/object-not-found') throw err;
        });
      }

      await deleteDoc(doc(db, 'projects', projectId, 'images', id));
    } catch (err) {
      console.error('[useImages] Failed to remove image:', err);
      error.value = err.message;
      throw err;
    }
  }

  return {
    images,
    loading,
    uploading,
    error,
    loadImages,
    addImage,
    removeImage,
    cleanup,
  };
}
