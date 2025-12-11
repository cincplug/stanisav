import groupInfo from "../config/groupInfo.json";

// Helper function to get grouped languages
export const getGroupedLanguages = (data) => {
  if (!data?.languageGroups || !data?.groupInfo || !data?.languageData) {
    return {};
  }

  const groupOrder = Object.keys(groupInfo);

  const groups = {};
  const visibleGroups = new Set(Object.values(data.languageGroups));

  groupOrder.forEach((groupName) => {
    if (visibleGroups.has(groupName) && data.groupInfo[groupName]) {
      const groupLanguages = Object.keys(data.languageGroups)
        .filter((code) => data.languageGroups[code] === groupName)
        .sort((a, b) =>
          data.languageData[a].name.localeCompare(data.languageData[b].name)
        );

      if (groupLanguages.length > 0) {
        groups[groupName] = {
          info: data.groupInfo[groupName],
          languages: groupLanguages
        };
      }
    }
  });

  return groups;
};

// Helper function to get available groups for search
export const getAvailableGroups = (data) => {
  if (!data || !data.groupInfo) {
    return [];
  }
  return Object.keys(data.groupInfo)
    .map((name) => ({
      name,
      displayName: data.groupInfo[name].family || name
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

import languages from "../config/languages.json";

/**
 * Formats a list of items with proper comma separation and Oxford comma
 * @param {Array<string>} items - Array of items to format
 * @returns {string} Formatted string with proper punctuation
 */
export const formatLanguageList = (items) => {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  // For 3 or more items, use Oxford comma
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(", ")}, and ${lastItem}`;
};

/**
 * Gets the language group information for a given language
 * @param {string} languageCode - The language code (e.g., 'eng', 'fra')
 * @returns {Object} Object containing group name and other languages in the group
 */
export const getGroupInfo = (languageCode) => {
  const languageInfo = languages[languageCode];
  const groupName = languageInfo?.group;
  if (!groupName) return null;

  // Find all languages in the same group
  const languagesInGroup = Object.entries(languages)
    .filter(([code, info]) => info.group === groupName && code !== languageCode)
    .map(([_code, info]) => info.name)
    .filter(Boolean)
    .sort();

  return {
    groupName,
    otherLanguages: languagesInGroup
  };
};

/**
 * Generates the language group description sentence
 * @param {string} languageCode - The language code
 * @returns {string|null} Formatted sentence or null if no group info
 */
export const generateGroupDescription = (languageCode) => {
  const groupInfo = getGroupInfo(languageCode);
  if (!groupInfo) return null;

  const { groupName, otherLanguages } = groupInfo;

  if (otherLanguages.length === 0) {
    return `It belongs to the ${groupName} language group.`;
  }

  const formattedLanguages = formatLanguageList(otherLanguages);
  return `It belongs to the ${groupName} language group, along with ${formattedLanguages}.`;
};
