import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import SourceVideoGallery from "./pages/source-video-gallery/SourceVideoGallery.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppStateProvider } from "./contexts/AppStateContext";
import { ControlsProvider } from "./contexts/ControlsContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { LanguageSelectionProvider } from "./contexts/LanguageSelectionContext";
import { I18nProvider } from "./contexts/I18nContext";
import { EntranceProvider } from "./contexts/EntranceContext";

import LocaleLayout from "./components/routing/LocaleLayout.jsx";
import { defaultUrlSlug } from "./i18n/runtime";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <AppStateProvider>
        <ControlsProvider>
          <EntranceProvider>
            <LanguageSelectionProvider>
              <PlaylistProvider>
                <BrowserRouter>
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to={`/${defaultUrlSlug}`} replace />}
                    />
                    <Route path=":locale" element={<LocaleLayout />}>
                      <Route index element={<App />} />
                      <Route
                        path="source-video-gallery"
                        element={<SourceVideoGallery />}
                      />
                    </Route>
                    <Route
                      path="*"
                      element={<Navigate to={`/${defaultUrlSlug}`} replace />}
                    />
                  </Routes>
                </BrowserRouter>
              </PlaylistProvider>
            </LanguageSelectionProvider>
          </EntranceProvider>
        </ControlsProvider>
      </AppStateProvider>
    </I18nProvider>
  </React.StrictMode>,
);
