import { useEffect } from "react";

const CANVAS_SELECTOR = ".mini-stanisav canvas";

/**
 * Drives scripts/capture-selfies.js: exposes a tiny window API so a headless
 * browser can iterate every language code and read back a clean capture of
 * just the Stanisav canvas (via canvas.toDataURL, which reads the WebGL
 * framebuffer directly and is immune to any overlapping DOM/UI chrome).
 * No-op unless isEnabled is true, so it never runs for real users.
 */
export function useSelfieCapture({
  isEnabled,
  languageCode,
  languages,
  setLanguageCode,
}) {
  useEffect(() => {
    if (!isEnabled) return;

    window.__stanisavCapture = {
      getLanguages: () => languages,
      setLanguage: setLanguageCode,
      captureDataUrl: () =>
        document.querySelector(CANVAS_SELECTOR)?.toDataURL("image/png") || null,
    };
    return () => {
      delete window.__stanisavCapture;
    };
  }, [isEnabled, languages, setLanguageCode]);

  useEffect(() => {
    if (!isEnabled) return;

    // Signals readiness only once the shape driven by the new language has
    // actually committed and painted, not just once React state updates.
    window.__stanisavCaptureReady = false;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__stanisavCaptureReady = true;
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [isEnabled, languageCode]);
}
