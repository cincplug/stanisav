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
import { useAppControls } from "./AppControlsContext.jsx";

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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioElement, setCurrentAudioElement] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [groupColors, setGroupColors] = useState(getInitialGroupColors);

  const { appControls } = useAppControls();

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
      const { isLuka } = appControls;
      const { animationDuration } = appControls;

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
    [appControls, stopCurrentAudio]
  );

  // Select a language (with optional audio playback)
  const selectLanguage = useCallback(
    (languageCode, playAudio = false, groupKey = null) => {
      setSelectedLanguage(languageCode);

      // Auto-select parent group if provided
      if (groupKey) {
        setSelectedGroup(groupKey);
      }

      // Play audio if requested
      if (playAudio && languageCode) {
        playLanguageAudio(languageCode);
      }
    },
    [playLanguageAudio]
  );

  // Select a group
  const selectGroup = useCallback(
    (groupKey) => {
      setSelectedGroup(groupKey);
      setSelectedLanguage(null);
      stopCurrentAudio();
    },
    [stopCurrentAudio]
  );

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedLanguage(null);
    setSelectedGroup(null);
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const updatefilteringUtils = useCallback(
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
    selectedGroup,
    isPlayingAudio,
    filteringUtils,
    filteredLanguages,
    selectLanguage,
    selectGroup,
    clearSelection,
    playLanguageAudio,
    stopCurrentAudio,
    updatefilteringUtils,
    groupColors,
    setGroupColor
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
