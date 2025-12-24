import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AppStateProvider } from "./contexts/AppStateContext";
import { LanguageSelectionProvider } from "./contexts/LanguageSelectionContext";
import { ControlsProvider } from "./contexts/ControlsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppStateProvider>
      <ControlsProvider>
        <LanguageSelectionProvider>
          <App />
        </LanguageSelectionProvider>
      </ControlsProvider>
    </AppStateProvider>
  </React.StrictMode>
);
