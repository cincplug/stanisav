import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

export const useMenuHandlers = (onCameraFocus, sceneReady, data, controls) => {
  const { selectLanguageWithFocus, selectGroupWithFocus, viewAllLanguages } =
    useLanguageSelectionHandler(onCameraFocus, sceneReady, data, controls);

  return {
    handleLanguageFocus: selectLanguageWithFocus,
    handleGroupFocus: selectGroupWithFocus,
    handleViewAll: viewAllLanguages
  };
};
