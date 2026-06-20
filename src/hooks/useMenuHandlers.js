import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext";

export const useMenuHandlers = (onCameraFocus, isSceneReady) => {
  const { setSelectedLanguage, viewAllLanguages } =
    useLanguageSelectionContext();

  const handleLanguageFocus = (languageCode) =>
    setSelectedLanguage(languageCode);

  const handleViewAll = () => viewAllLanguages(onCameraFocus, isSceneReady);

  return {
    handleLanguageFocus,
    handleViewAll,
  };
};
