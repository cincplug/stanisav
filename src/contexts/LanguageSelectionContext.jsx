import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";
import {
  setupAudioVisualization,
  getLanguageAudioUrl
} from "../services/audioService.js";
import { filterLanguagesByFeatures } from "../utils/filteringUtils";
import groupInfo from "../config/groupInfo.json";
import { useControls } from "./ControlsContext.jsx";

/**
 * Language Selection Context
 * Manages centralized language selection state and audio playback
 */
const LanguageSelectionContext = createContext();

export const LanguageSelectionProvider = ({ children }) => {
  const getInitialGroupColors = () => {
    const colors = {};
    Object.entries(groupInfo).forEach(([key, info]) => {
      colors[key] = info.color;
    });
    return colors;
  };

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioElement, setCurrentAudioElement] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [groupColors, setGroupColors] = useState(getInitialGroupColors);

  const { controls } = useControls();

  // Stop any currently playing audio
  const stopCurrentAudio = useCallback(() => {
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      setCurrentAudioElement(null);
      setIsPlayingAudio(false);
    }
  }, [currentAudioElement]);

  // Play audio for a language
  const playLanguageAudio = useCallback(
    async (languageCode) => {
      const { isLuka } = controls;
      const { animationDuration } = controls;

      try {
        stopCurrentAudio();

        await new Promise((resolve) => setTimeout(resolve, animationDuration));

        const audioUrl = await getLanguageAudioUrl(languageCode, isLuka);
        if (!audioUrl) {
          console.warn(`No audio available for language: ${languageCode}`);
          return;
        }

        const audio = new Audio(audioUrl);
        audio.volume = 0.5;

        await setupAudioVisualization(audio);

        audio.addEventListener("play", () => setIsPlayingAudio(true));
        audio.addEventListener("pause", () => setIsPlayingAudio(false));
        audio.addEventListener("ended", () => {
          setIsPlayingAudio(false);
          setCurrentAudioElement(null);
        });

        setCurrentAudioElement(audio);
        await audio.play();
        return audio;
      } catch (error) {
        console.error("Error playing language audio:", error);
        setIsPlayingAudio(false);
        setCurrentAudioElement(null);
      }
    },
    [controls, stopCurrentAudio]
  );

  // Select a language (with optional audio playback)
  const selectLanguage = useCallback(
    (languageCode, playAudio = false, groupKey = null) => {
      setSelectedLanguage(languageCode);

      // Play audio if requested
      if (playAudio && languageCode) {
        playLanguageAudio(languageCode);
      }
    },
    [playLanguageAudio]
  );

  const selectLanguageWithFocus = useCallback(
    (
      languageCode,
      playAudio = true,
      focusCamera = true,
      onCameraFocus = null,
      sceneReadyFlag = true,
      dataParam = null,
      controlsParam = null
    ) => {
      if (!sceneReadyFlag || !languageCode) return;

      const groupKey = dataParam?.languageGroups?.[languageCode] || null;

      selectLanguage(languageCode, playAudio, groupKey);

      if (focusCamera && onCameraFocus) {
        onCameraFocus("language", languageCode);
      }
    },
    [selectLanguage]
  );

  const viewAllLanguages = useCallback(
    (onCameraFocus = null, sceneReadyFlag = true) => {
      if (onCameraFocus && sceneReadyFlag) {
        onCameraFocus("viewAll");
      }
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedLanguage(null);
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const updateFilteringUtils = useCallback(
    (filters, data) => {
      setFilteringUtils(filters);

      if (Object.keys(filters).length === 0) {
        setFilteredLanguages(new Set());
        return;
      }
      const filteredResults = filterLanguagesByFeatures(data, filters);
      setFilteredLanguages(new Set(filteredResults.map((lang) => lang.code)));
    },
    [filteringUtils]
  );

  const setGroupColor = useCallback((groupKey, color) => {
    setGroupColors((prev) => ({ ...prev, [groupKey]: color }));
  }, []);

  const onLanguageClick = useCallback(
    (code) => selectLanguage(code, true, true),
    [selectLanguage]
  );

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, [stopCurrentAudio]);

  useEffect(() => {
    const updatedScheme = {};
    Object.entries(groupInfo).forEach(([key, info]) => {
      updatedScheme[key] = {
        ...info,
        color: groupColors[key] || info.color
      };
    });
    // console.log("Updated color scheme:", updatedScheme);
  }, [groupColors]);

  const contextValue = {
    selectedLanguage,
    isPlayingAudio,
    filteringUtils,
    filteredLanguages,
    selectLanguage,
    selectLanguageWithFocus,
    viewAllLanguages,
    clearSelection,
    playLanguageAudio,
    stopCurrentAudio,
    updateFilteringUtils,
    groupColors,
    setGroupColor,
    controls,
    onLanguageClick
  };

  return (
    <LanguageSelectionContext.Provider value={contextValue}>
      {children}
    </LanguageSelectionContext.Provider>
  );
};

export const useLanguageSelection = () => {
  const context = useContext(LanguageSelectionContext);
  if (!context) {
    throw new Error(
      "useLanguageSelection must be used within a LanguageSelectionProvider"
    );
  }
  return context;
};

export default LanguageSelectionContext;
