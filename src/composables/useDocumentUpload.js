import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/services/firebase";

/**
 * Composable for uploading documents to Firebase Storage and saving metadata to Firestore.
 *
 * @returns {{ uploadFile: Function }}
 */
export function useDocumentUpload() {
  /**
   * Uploads a file to Firebase Storage and saves its metadata to the "documents" Firestore collection.
   *
   * @param {File} file - The file to upload.
   * @param {string} [beskrivelse=""] - An optional description of the document.
   * @returns {Promise<void>}
   */
  async function uploadFile(file, beskrivelse = "") {
    const path = `documents/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);

    const snapshot = await uploadBytesResumable(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "documents"), {
      name: file.name,
      file: file.name,
      beskrivelse,
      url,           // direct download URL from Storage
      storagePath: path,
      uploadedAt: serverTimestamp(),
    });
  }

  return { uploadFile };
}