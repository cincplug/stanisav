import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

export const useMenuHandlers = (
  onCameraFocus,
  sceneReady,
  data,
  appControls
) => {
  const { selectLanguageWithFocus, selectGroupWithFocus, viewAllLanguages } =
    useLanguageSelectionHandler(onCameraFocus, sceneReady, data, appControls);

  return {
    handleLanguageFocus: selectLanguageWithFocus,
    handleGroupFocus: selectGroupWithFocus,
    handleViewAll: viewAllLanguages
  };
};
