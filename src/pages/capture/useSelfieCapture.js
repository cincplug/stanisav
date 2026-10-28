import { useEffect } from "react";

const CANVAS_SELECTOR = ".mini-stanisav canvas";

export function useSelfieCapture({
  languageCode,
  languages,
  setLanguageCode,
}) {
  useEffect(() => {
    window.__stanisavCapture = {
      getLanguages: () => languages,
      setLanguage: setLanguageCode,
      captureDataUrl: () =>
        document.querySelector(CANVAS_SELECTOR)?.toDataURL("image/png") || null,
    };
    return () => {
      delete window.__stanisavCapture;
    };
  }, [languages, setLanguageCode]);

  useEffect(() => {
    window.__stanisavCaptureReady = false;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__stanisavCaptureReady = true;
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [languageCode]);
}