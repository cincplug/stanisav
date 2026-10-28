import { useState } from "react";
import MiniStanisav from "../../components/MiniStanisav.jsx";
import { useAppStateContext } from "../../contexts/AppStateContext.jsx";
import { useDataManager } from "../../hooks/useDataManager.js";
import { useSelfieCapture } from "./useSelfieCapture.js";

export default function Capture() {
  const { data, setData, setIsLoading } = useAppStateContext();
  useDataManager(setData, setIsLoading);
  const languages = Object.keys(data?.languages || {});
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const languageCode = selectedLanguage || languages[0];

  useSelfieCapture({
    languageCode,
    languages,
    setLanguageCode: setSelectedLanguage,
  });

  if (!languageCode) return null;

  return (
    <MiniStanisav
      languageCode={languageCode}
      position={[0, 0, 102]}
      customSpinSpeed={0}
      forcesHighQualityCapture
    />
  );
}
