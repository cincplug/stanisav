import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext";

export const useMenuHandlers = (onCameraFocus, isSceneReady) => {
  const { selectLanguage, viewAllLanguages } = useLanguageSelectionContext();

  const handleLanguageFocus = (languageCode) => selectLanguage(languageCode);

  const handleViewAll = () => viewAllLanguages(onCameraFocus, isSceneReady);

  return {
    handleLanguageFocus,
    handleViewAll,
  };
};
