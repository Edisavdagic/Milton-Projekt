import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { addDoc } from 'firebase/firestore'
import { useDocumentUpload } from '../useDocumentUpload'

vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => 'mock-file-ref'),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}))

vi.mock('@/services/firebase', () => ({
  storage: 'mock-storage',
  db: 'mock-db',
}))

describe('useDocumentUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadBytesResumable.mockResolvedValue({ ref: 'mock-snapshot-ref' })
    getDownloadURL.mockResolvedValue('https://storage.example.com/file.pdf')
    addDoc.mockResolvedValue({})
  })

  it('builds a storage path using the file name and a timestamp', async () => {
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf' })
    const { uploadFile } = useDocumentUpload()
    await uploadFile(file)

    const path = storageRef.mock.calls[0][1]
    expect(path).toMatch(/^documents\/\d+_report\.pdf$/)
  })

  it('saves the download URL and file metadata to Firestore', async () => {
    const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
    const { uploadFile } = useDocumentUpload()
    await uploadFile(file, 'Årsrapport 2024')

    const [, docData] = addDoc.mock.calls[0]
    expect(docData.name).toBe('contract.pdf')
    expect(docData.file).toBe('contract.pdf')
    expect(docData.url).toBe('https://storage.example.com/file.pdf')
    expect(docData.beskrivelse).toBe('Årsrapport 2024')
    expect(docData.uploadedAt).toBe('mock-timestamp')
  })

  it('defaults beskrivelse to an empty string when not provided', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const { uploadFile } = useDocumentUpload()
    await uploadFile(file)

    const [, docData] = addDoc.mock.calls[0]
    expect(docData.beskrivelse).toBe('')
  })

  it('uses the snapshot ref to get the download URL', async () => {
    const mockRef = 'specific-snapshot-ref'
    uploadBytesResumable.mockResolvedValue({ ref: mockRef })

    const file = new File(['content'], 'file.pdf', { type: 'application/pdf' })
    const { uploadFile } = useDocumentUpload()
    await uploadFile(file)

    expect(getDownloadURL).toHaveBeenCalledWith(mockRef)
  })
})
