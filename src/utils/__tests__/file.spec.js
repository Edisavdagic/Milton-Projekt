import { describe, it, expect } from 'vitest';
import { getFileExtension, getTypeDetails, imageExtensions } from '../file';

describe('getFileExtension', () => {
  it('returns the lowercased extension', () => {
    expect(getFileExtension('Report.PDF')).toBe('pdf');
  });

  it('returns the trailing segment for multi-dot file names', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('README')).toBe('');
  });

  it('returns an empty string for empty or nullish input', () => {
    expect(getFileExtension('')).toBe('');
    expect(getFileExtension(null)).toBe('');
    expect(getFileExtension(undefined)).toBe('');
  });
});

describe('getTypeDetails', () => {
  it('classifies PDFs as the "pdf" type', () => {
    expect(getTypeDetails('contract.pdf')).toEqual({ key: 'pdf', label: 'pdf' });
  });

  it('classifies known image extensions as the "image" type with the extension as label', () => {
    for (const ext of imageExtensions) {
      expect(getTypeDetails(`photo.${ext}`)).toEqual({ key: 'image', label: ext });
    }
  });

  it('falls back to the "file" type with the extension as label for unknown extensions', () => {
    expect(getTypeDetails('notes.txt')).toEqual({ key: 'file', label: 'txt' });
  });

  it('uses "ukendt" as the label when the file has no extension', () => {
    expect(getTypeDetails('README')).toEqual({ key: 'file', label: 'ukendt' });
  });
});
