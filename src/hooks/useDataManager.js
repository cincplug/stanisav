import { useState, useEffect } from "react";
import { DataLoader } from "../modules/dataLoader.js";

/**
 * Data Manager Hook
 * Handles loading and managing all language data
 */
export const useDataManager = (onDataLoaded, onLoadingChange) => {
  const [data, setData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        onLoadingChange(true);
        const dataLoader = new DataLoader();
        const loadedData = await dataLoader.loadAll();
        setData(loadedData);
        onDataLoaded(loadedData);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        onLoadingChange(false);
      }
    };

    if (!isInitialized) initializeData();
  }, [isInitialized, onDataLoaded, onLoadingChange]);

  return { data, isInitialized };
};
