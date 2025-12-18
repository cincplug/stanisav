import { useLanguageSelection } from "../contexts/LanguageSelectionContext";

/**
 * Centralized hook for language selection that handles both context updates and camera focus
 * This eliminates code duplication and ensures consistent behavior across all selection methods
 */
export const useLanguageSelectionHandler = (
  onCameraFocus,
  sceneReady,
  data,
  controls
) => {
  const { selectLanguage, selectGroup } = useLanguageSelection();

  /**
   * Select a language with full functionality (selection + audio + camera focus)
   * @param {string} languageCode - The language code to select
   * @param {boolean} playAudio - Whether to play audio (default: true)
   * @param {boolean} focusCamera - Whether to focus camera (default: true)
   */
  const selectLanguageWithFocus = (
    languageCode,
    playAudio = true,
    focusCamera = true
  ) => {
    if (!sceneReady || !languageCode) return;

    const groupKey = data?.languageGroups?.[languageCode];
    const isLuka = controls?.isLuka ?? true;

    // Update language selection context
    selectLanguage(languageCode, playAudio, groupKey, isLuka);

    // Always trigger camera focus when requested
    if (focusCamera && onCameraFocus) {
      onCameraFocus("language", languageCode);
    }
  };

  /**
   * Select a group with full functionality (selection + camera focus)
   * @param {string} groupKey - The group key to select
   * @param {boolean} focusCamera - Whether to focus camera (default: true)
   */
  const selectGroupWithFocus = (groupKey, focusCamera = true) => {
    if (!sceneReady || !groupKey) return;

    // Update group selection context
    selectGroup(groupKey);

    // Always trigger camera focus when requested
    if (focusCamera && onCameraFocus) {
      onCameraFocus("group", groupKey);
    }
  };

  /**
   * View all languages (camera focus only)
   */
  const viewAllLanguages = () => {
    if (onCameraFocus && sceneReady) {
      onCameraFocus("viewAll");
    }
  };

  return {
    selectLanguageWithFocus,
    selectGroupWithFocus,
    viewAllLanguages
  };
};
