import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./components/App.jsx";
import { AppStateProvider } from "./contexts/AppStateContext";
import { ConfigProvider } from "./contexts/ConfigContext.jsx";
import { EntranceProvider } from "./contexts/EntranceContext";
import { I18nProvider } from "./contexts/I18nContext";
import { LanguageColorsProvider } from "./contexts/LanguageColorsContext.jsx";
import { LanguageSelectionProvider } from "./contexts/LanguageSelectionContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";

import LocaleLayout from "./components/routing/LocaleLayout.jsx";
import { defaultUrlSlug } from "./i18n/runtime";
import "./index.css";

registerSW({
  immediate: true,
});

// react-markdown + the README aren't needed on the main page, only /article
const Article = lazy(() => import("./pages/article/Article.jsx"));
const Capture =
  import.meta.env.DEV && import.meta.env.MODE === "capture"
    ? lazy(() => import("./pages/capture/Capture.jsx"))
    : null;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <AppStateProvider>
        <ConfigProvider>
          <LanguageColorsProvider>
            <LanguageSelectionProvider>
              <EntranceProvider>
                <PlaylistProvider>
                  <BrowserRouter>
                    <Routes>
                      {Capture && (
                        <Route
                          path="/__capture"
                          element={
                            <Suspense fallback={null}>
                              <Capture />
                            </Suspense>
                          }
                        />
                      )}
                      <Route
                        path="/"
                        element={<Navigate to={`/${defaultUrlSlug}`} replace />}
                      />
                      <Route path=":locale" element={<LocaleLayout />}>
                        <Route index element={<App />} />
                        <Route
                          path="article"
                          element={
                            <Suspense fallback={null}>
                              <Article />
                            </Suspense>
                          }
                        />
                      </Route>
                      <Route
                        path="*"
                        element={<Navigate to={`/${defaultUrlSlug}`} replace />}
                      />
                    </Routes>
                  </BrowserRouter>
                </PlaylistProvider>
              </EntranceProvider>
            </LanguageSelectionProvider>
          </LanguageColorsProvider>
        </ConfigProvider>
      </AppStateProvider>
    </I18nProvider>
  </React.StrictMode>,
);
