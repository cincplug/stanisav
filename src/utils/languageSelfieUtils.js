export function getLanguageSelfieUrl(languageCode) {
  if (!languageCode) return null;

  return `/selfies/${encodeURIComponent(languageCode)}.png`;
}
