import { useMemo } from "react";
import {
  getGroupedLanguages,
  getAvailableGroups
} from "../utils/groupingUtils";

export const useTabHandlers = (data, handleGroupFocus, handleViewAll) => {
  const availableGroups = useMemo(() => getAvailableGroups(data), [data]);
  const groupedLanguages = useMemo(() => getGroupedLanguages(data), [data]);

  const handleGroupSelectChange = (e) => {
    const groupKey = e.target.value;
    if (groupKey === "all") {
      handleViewAll();
    } else {
      handleGroupFocus(groupKey);
    }
  };

  return {
    availableGroups,
    groupedLanguages,
    handleGroupSelectChange
  };
};
