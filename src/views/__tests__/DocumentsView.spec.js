import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import DocumentsView from '../DocumentsView.vue'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
}))

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  db: {},
  storage: {},
}))

function makeDoc({ id = 'doc-1', uploadedAt = { toDate: () => new Date('2024-03-15') }, ...rest } = {}) {
  return {
    id,
    data: () => ({
      name: 'report.pdf',
      file: 'report.pdf',
      beskrivelse: 'Annual report',
      url: 'https://example.com/report.pdf',
      storagePath: 'documents/report.pdf',
      uploadedAt,
      ...rest,
    }),
  }
}

describe('DocumentsView', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    getDocs.mockResolvedValue({ docs: [makeDoc()] })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders documents fetched from Firestore on mount', async () => {
    wrapper = mount(DocumentsView)
    await flushPromises()

    expect(wrapper.text()).toContain('report.pdf')
    expect(wrapper.text()).toContain('Annual report')
  })

  it('shows a loading message while fetching', () => {
    getDocs.mockImplementation(() => new Promise(() => {}))
    wrapper = mount(DocumentsView)

    expect(wrapper.text()).toContain('Indlæser dokumenter')
  })

  it('shows the error message when Firestore fetch fails', async () => {
    getDocs.mockRejectedValue(new Error('Netværksfejl'))
    wrapper = mount(DocumentsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Netværksfejl')
  })

  it('filters documents by search query across name, description and type', async () => {
    getDocs.mockResolvedValue({
      docs: [
        makeDoc({ id: 'doc-1', name: 'report.pdf', file: 'report.pdf', beskrivelse: 'Annual report' }),
        makeDoc({ id: 'doc-2', name: 'photo.jpg', file: 'photo.jpg', beskrivelse: 'Team photo' }),
      ],
    })
    wrapper = mount(DocumentsView)
    await flushPromises()

    await wrapper.find('input[type="search"]').setValue('photo')

    expect(wrapper.text()).toContain('photo.jpg')
    expect(wrapper.text()).not.toContain('report.pdf')
  })

  it('filters documents by type using the filter dropdown', async () => {
    getDocs.mockResolvedValue({
      docs: [
        makeDoc({ id: 'doc-1', name: 'report.pdf', file: 'report.pdf' }),
        makeDoc({ id: 'doc-2', name: 'photo.jpg', file: 'photo.jpg' }),
      ],
    })
    wrapper = mount(DocumentsView)
    await flushPromises()

    await wrapper.find('select').setValue('pdf')

    expect(wrapper.text()).toContain('report.pdf')
    expect(wrapper.text()).not.toContain('photo.jpg')
  })

  it('shows empty state message when no documents match the search', async () => {
    wrapper = mount(DocumentsView)
    await flushPromises()

    await wrapper.find('input[type="search"]').setValue('xyz-ingenting')

    expect(wrapper.text()).toContain('Ingen dokumenter matcher')
  })

  it('shows the upload modal when a file is chosen', async () => {
    wrapper = mount(DocumentsView, { attachTo: document.body })
    await flushPromises()

    const file = new File(['content'], 'newfile.pdf', { type: 'application/pdf' })
    const fileInput = wrapper.find('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true })
    await fileInput.trigger('change')

    expect(document.querySelector('.upload-modal')).not.toBeNull()
    expect(document.body.textContent).toContain('newfile.pdf')
  })

  it('closes the upload modal when cancel is clicked', async () => {
    wrapper = mount(DocumentsView, { attachTo: document.body })
    await flushPromises()

    const file = new File(['content'], 'newfile.pdf', { type: 'application/pdf' })
    const fileInput = wrapper.find('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true })
    await fileInput.trigger('change')

    await document.querySelector('.upload-modal__cancel').click()
    await flushPromises()

    expect(document.querySelector('.upload-modal')).toBeNull()
  })

  it('displays "pdf" type label for PDF documents', async () => {
    wrapper = mount(DocumentsView)
    await flushPromises()

    expect(wrapper.text()).toContain('pdf')
  })

  it('displays the file extension as type label for image documents', async () => {
    getDocs.mockResolvedValue({
      docs: [makeDoc({ name: 'photo.jpg', file: 'photo.jpg' })],
    })
    wrapper = mount(DocumentsView)
    await flushPromises()

    expect(wrapper.text()).toContain('jpg')
  })

  it('shows "Ukendt dato" for documents with no uploadedAt', async () => {
    getDocs.mockResolvedValue({
      docs: [makeDoc({ uploadedAt: null })],
    })
    wrapper = mount(DocumentsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Ukendt dato')
  })

  it('uploads file and refreshes the document list on confirm', async () => {
    uploadBytesResumable.mockResolvedValue({ ref: 'snap-ref' })
    getDownloadURL.mockResolvedValue('https://example.com/new.pdf')
    addDoc.mockResolvedValue({})

    wrapper = mount(DocumentsView, { attachTo: document.body })
    await flushPromises()

    const file = new File(['content'], 'new.pdf', { type: 'application/pdf' })
    const fileInput = wrapper.find('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true })
    await fileInput.trigger('change')

    await document.querySelector('.upload-modal__confirm').click()
    await flushPromises()

    expect(addDoc).toHaveBeenCalledTimes(1)
    expect(getDocs).toHaveBeenCalledTimes(2) // once on mount, once after upload
  })
})
