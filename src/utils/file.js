export const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

export function getFileExtension(fileName) {
  const segments = String(fileName ?? '').split('.');

  if (segments.length < 2) {
    return '';
  }

  return segments.pop().toLowerCase();
}

export function getTypeDetails(fileName) {
  const extension = getFileExtension(fileName);

  if (extension === 'pdf') {
    return { key: 'pdf', label: 'pdf' };
  }

  if (imageExtensions.has(extension)) {
    return { key: 'image', label: extension };
  }

  return { key: 'file', label: extension || 'ukendt' };
}
