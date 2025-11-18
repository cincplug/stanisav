import { useMemo } from "react";
import {
  getGroupedLanguages,
  getAvailableGroups
} from "../utils/groupingUtils";

export const useTabHandlers = (data, handleGroupFocus) => {
  const availableGroups = useMemo(() => getAvailableGroups(data), [data]);
  const groupedLanguages = useMemo(() => getGroupedLanguages(data), [data]);

  const handleGroupSelectChange = (e) => {
    const groupKey = e.target.value;
    if (groupKey === "all") {
      // Handle "all" selection if needed
    } else {
      // Focus camera on the selected group
      handleGroupFocus(groupKey);
    }
  };

  return {
    availableGroups,
    groupedLanguages,
    handleGroupSelectChange
  };
};
