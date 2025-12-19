import { useMemo } from "react";
import {
  getGroupedLanguages,
  getAvailableGroups
} from "../utils/groupingUtils";

export const useTabHandlers = (data, handleViewAll) => {
  const availableGroups = useMemo(() => getAvailableGroups(data), [data]);
  const groupedLanguages = useMemo(() => getGroupedLanguages(data), [data]);

  const handleGroupSelectChange = (e) => {
    const groupKey = e.target.value;
    handleViewAll();
  };

  return {
    availableGroups,
    groupedLanguages,
    handleGroupSelectChange
  };
};
