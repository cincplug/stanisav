import { useLanguageSelection } from "../contexts/LanguageSelectionContext";

export const useMenuHandlers = (onCameraFocus, sceneReady) => {
  const { selectLanguage, viewAllLanguages } = useLanguageSelection();

  const handleLanguageFocus = (languageCode) => selectLanguage(languageCode);

  const handleViewAll = () => viewAllLanguages(onCameraFocus, sceneReady);

  return {
    handleLanguageFocus,
    handleViewAll,
  };
};
