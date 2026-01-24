import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import SourceVideoGallery from "./components/sourceVideoGallery/SourceVideoGallery";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppStateProvider } from "./contexts/AppStateContext";
import { ControlsProvider } from "./contexts/ControlsContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { LanguageSelectionProvider } from "./contexts/LanguageSelectionContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppStateProvider>
      <ControlsProvider>
        <LanguageSelectionProvider>
          <PlaylistProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
                <Route
                  path="/source-video-gallery"
                  element={<SourceVideoGallery />}
                />
              </Routes>
            </BrowserRouter>
          </PlaylistProvider>
        </LanguageSelectionProvider>
      </ControlsProvider>
    </AppStateProvider>
  </React.StrictMode>,
);
