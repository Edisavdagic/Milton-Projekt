import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, getDocs } from 'firebase/firestore';
import { useDocuments } from '../useDocuments';

vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => 'mock-file-ref'),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

vi.mock('@/services/firebase', () => ({
  storage: 'mock-storage',
  db: 'mock-db',
}));

function makeDocSnapshot(overrides = {}) {
  return {
    id: overrides.id ?? 'doc-1',
    data: () => ({
      name: 'report.pdf',
      file: 'report.pdf',
      beskrivelse: 'Annual report',
      url: 'https://example.com/report.pdf',
      storagePath: 'documents/report.pdf',
      uploadedAt: { toDate: () => new Date('2024-03-15T12:00:00Z') },
      ...overrides,
    }),
  };
}

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadBytesResumable.mockResolvedValue({ ref: 'mock-snapshot-ref' });
    getDownloadURL.mockResolvedValue('https://storage.example.com/file.pdf');
    addDoc.mockResolvedValue({});
    getDocs.mockResolvedValue({ docs: [makeDocSnapshot()] });
  });

  describe('loadDocuments', () => {
    it('populates documents with type details and a formatted date label', async () => {
      const { documents, loadDocuments } = useDocuments();
      await loadDocuments();

      expect(documents.value).toHaveLength(1);
      expect(documents.value[0].type).toEqual({ key: 'pdf', label: 'pdf' });
      expect(documents.value[0].uploadedAtLabel).toMatch(/15\.\s*mar\.\s*2024/);
    });

    it('toggles isLoading around the fetch', async () => {
      let resolveFetch;
      getDocs.mockImplementation(() => new Promise((resolve) => { resolveFetch = resolve; }));

      const { isLoading, loadDocuments } = useDocuments();
      const pending = loadDocuments();
      expect(isLoading.value).toBe(true);

      resolveFetch({ docs: [] });
      await pending;
      expect(isLoading.value).toBe(false);
    });

    it('captures the error message and clears documents on failure', async () => {
      getDocs.mockRejectedValue(new Error('Netværksfejl'));

      const { documents, error, loadDocuments } = useDocuments();
      await loadDocuments();

      expect(error.value).toBe('Netværksfejl');
      expect(documents.value).toEqual([]);
    });
  });

  describe('uploadDocument', () => {
    it('builds a storage path using the file name and a timestamp', async () => {
      const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
      const { uploadDocument } = useDocuments();
      await uploadDocument(file);

      const path = storageRef.mock.calls[0][1];
      expect(path).toMatch(/^documents\/\d+_report\.pdf$/);
    });

    it('passes the file content type to the storage upload', async () => {
      const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
      const { uploadDocument } = useDocuments();
      await uploadDocument(file);

      const [, uploadedFile, options] = uploadBytesResumable.mock.calls[0];
      expect(uploadedFile).toBe(file);
      expect(options).toEqual({ contentType: 'application/pdf' });
    });

    it('saves the download URL and trimmed metadata to Firestore', async () => {
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' });
      const { uploadDocument } = useDocuments();
      await uploadDocument(file, '  Årsrapport 2024  ');

      const [, docData] = addDoc.mock.calls[0];
      expect(docData.name).toBe('contract.pdf');
      expect(docData.file).toBe('contract.pdf');
      expect(docData.url).toBe('https://storage.example.com/file.pdf');
      expect(docData.beskrivelse).toBe('Årsrapport 2024');
      expect(docData.uploadedAt).toBe('mock-timestamp');
    });

    it('defaults beskrivelse to an empty string when not provided', async () => {
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const { uploadDocument } = useDocuments();
      await uploadDocument(file);

      const [, docData] = addDoc.mock.calls[0];
      expect(docData.beskrivelse).toBe('');
    });

    it('uses the snapshot ref to get the download URL', async () => {
      uploadBytesResumable.mockResolvedValue({ ref: 'specific-snapshot-ref' });

      const file = new File(['content'], 'file.pdf', { type: 'application/pdf' });
      const { uploadDocument } = useDocuments();
      await uploadDocument(file);

      expect(getDownloadURL).toHaveBeenCalledWith('specific-snapshot-ref');
    });

    it('refreshes the document list after a successful upload', async () => {
      const file = new File(['content'], 'new.pdf', { type: 'application/pdf' });
      const { uploadDocument } = useDocuments();
      await uploadDocument(file);

      expect(getDocs).toHaveBeenCalledTimes(1);
    });

    it('rethrows and exposes the error when upload fails', async () => {
      uploadBytesResumable.mockRejectedValue(new Error('Upload mislykkedes'));

      const file = new File(['content'], 'file.pdf', { type: 'application/pdf' });
      const { error, uploadDocument } = useDocuments();

      await expect(uploadDocument(file)).rejects.toThrow('Upload mislykkedes');
      expect(error.value).toBe('Upload mislykkedes');
    });
  });
});
