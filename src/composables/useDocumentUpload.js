import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/firebase"; // your existing firebase init file

export function useDocumentUpload() {
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