import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./components/App.jsx";
import { AppStateProvider } from "./contexts/AppStateContext";
import { ConfigProvider } from "./contexts/ConfigContext.jsx";
import { EntranceProvider } from "./contexts/EntranceContext";
import { I18nProvider } from "./contexts/I18nContext";
import { LanguageColorsProvider } from "./contexts/LanguageColorsContext.jsx";
import { LanguageSelectionProvider } from "./contexts/LanguageSelectionContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import Article from "./pages/article/Article.jsx";

import LocaleLayout from "./components/routing/LocaleLayout.jsx";
import { defaultUrlSlug } from "./i18n/runtime";
import "./index.css";

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
                      <Route
                        path="/"
                        element={<Navigate to={`/${defaultUrlSlug}`} replace />}
                      />
                      <Route path=":locale" element={<LocaleLayout />}>
                        <Route index element={<App />} />
                        <Route path="article" element={<Article />} />
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
