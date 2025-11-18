import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

export const useMenuHandlers = (
  onCameraFocus,
  sceneReady,
  data,
  sceneControls
) => {
  const { selectLanguageWithFocus, selectGroupWithFocus, viewAllLanguages } =
    useLanguageSelectionHandler(onCameraFocus, sceneReady, data, sceneControls);

  return {
    handleLanguageFocus: selectLanguageWithFocus,
    handleGroupFocus: selectGroupWithFocus,
    handleViewAll: viewAllLanguages
  };
};
