import { useLanguageSelection } from "../contexts/LanguageSelectionContext";

export const useMenuHandlers = (onCameraFocus, isSceneReady) => {
  const { selectLanguage, viewAllLanguages } = useLanguageSelection();

  const handleLanguageFocus = (languageCode) => selectLanguage(languageCode);

  const handleViewAll = () => viewAllLanguages(onCameraFocus, isSceneReady);

  return {
    handleLanguageFocus,
    handleViewAll,
  };
};
