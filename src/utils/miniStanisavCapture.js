const DEFAULT_STORAGE_KEY = "mini-stanisav-png-counter";

export function getNextCaptureNumber(storageKey = DEFAULT_STORAGE_KEY) {
  try {
    const current = Number.parseInt(
      window.localStorage.getItem(storageKey) || "0",
      10,
    );

    const next = Number.isFinite(current) && current > 0 ? current + 1 : 1;
    window.localStorage.setItem(storageKey, String(next));
    return next;
  } catch {
    return 1;
  }
}

export function saveCanvasAsPng(
  canvas,
  { prefix = "stanisav", storageKey = DEFAULT_STORAGE_KEY } = {},
) {
  const capture = () => {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return null;
    }

    const nextNumber = getNextCaptureNumber(storageKey);
    const filename = `${prefix}-${String(nextNumber).padStart(3, "0")}.png`;

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = filename;
    downloadLink.rel = "noopener";
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    return filename;
  };

  if (!canvas) return null;

  requestAnimationFrame(() => {
    requestAnimationFrame(capture);
  });

  return null;
}
