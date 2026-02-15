import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import SourceVideoGallery from "./pages/source-video-gallery/SourceVideoGallery.jsx";
import Mosha from "./pages/mosha/Mosha.jsx";
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
                <Route path="/mosha" element={<Mosha />} />
              </Routes>
            </BrowserRouter>
          </PlaylistProvider>
        </LanguageSelectionProvider>
      </ControlsProvider>
    </AppStateProvider>
  </React.StrictMode>,
);
