export const generateDownloadUrl = (cloudinaryUrl: string, filename: string): string => {
  if (typeof cloudinaryUrl !== 'string') return '';
  try {
    const url = new URL(cloudinaryUrl);
    const segments = url.pathname.split('/');
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex !== -1) {
      segments.splice(uploadIndex + 1, 0, `fl_attachment:${filename}`);
      url.pathname = segments.join('/');
    }
    return url.toString();
  } catch (err) {
    console.error('Failed to generate download URL:', err);
    return cloudinaryUrl;
  }
};
