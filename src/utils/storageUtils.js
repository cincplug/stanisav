// Reads and parses the persisted config from sessionStorage.
// Returns null if unavailable, unset, or unparseable.
export const readStoredConfig = (storageKey) => {
  if (typeof window === "undefined") return null;
  try {
    const rawStoredConfig = window.sessionStorage.getItem(storageKey);
    return rawStoredConfig ? JSON.parse(rawStoredConfig) : null;
  } catch {
    return null;
  }
};

// Writes the config to sessionStorage. Fails silently (e.g. private browsing quota).
export const writeStoredConfig = (storageKey, config) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(config));
  } catch {
    // sessionStorage may be unavailable - fail silently
  }
};

// Triggers a browser download of the given object as a formatted JSON file.
export const downloadJsonFile = (data, fileName) => {
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(jsonBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = fileName;
  downloadLink.click();
  URL.revokeObjectURL(objectUrl);
};
