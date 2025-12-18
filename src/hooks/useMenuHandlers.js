import { useLanguageSelection } from "../contexts/LanguageSelectionContext";

export const useMenuHandlers = (onCameraFocus, sceneReady, data, controls) => {
  const { selectLanguageWithFocus, selectGroupWithFocus, viewAllLanguages } =
    useLanguageSelection();

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

  const handleGroupFocus = (groupKey, focusCamera = true) =>
    selectGroupWithFocus(groupKey, focusCamera, onCameraFocus, sceneReady);

  const handleViewAll = () => viewAllLanguages(onCameraFocus, sceneReady);

  return {
    handleLanguageFocus,
    handleGroupFocus,
    handleViewAll
  };
};
