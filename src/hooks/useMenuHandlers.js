import { useLanguageSelection } from "../contexts/LanguageSelectionContext";

export const useMenuHandlers = (onCameraFocus, sceneReady, data, controls) => {
  const { selectLanguageWithFocus, viewAllLanguages } = useLanguageSelection();

  const handleLanguageFocus = (
    languageCode,
    playAudio = true,
    focusCamera = true
  ) =>
    selectLanguageWithFocus(
      languageCode,
      playAudio,
      focusCamera,
      onCameraFocus,
      sceneReady,
      data,
      controls
    );

  const handleViewAll = () => viewAllLanguages(onCameraFocus, sceneReady);

  return {
    handleLanguageFocus,
    handleViewAll
  };
};
