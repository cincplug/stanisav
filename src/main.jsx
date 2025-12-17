import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { LanguageSelectionProvider } from "./contexts/LanguageSelectionContext";
import { AppControlsProvider } from "./contexts/AppControlsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppControlsProvider>
      <LanguageSelectionProvider>
        <App />
      </LanguageSelectionProvider>
    </AppControlsProvider>
  </React.StrictMode>
);
