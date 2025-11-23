import { useState, useMemo } from "react";
import tabsConfig from "../config/tabsConfig.json";

// Relevance score constants
const RELEVANCE_SCORES = {
  EXACT_MATCH: 100,
  STARTS_WITH: 80,
  WORD_BOUNDARY: 70, // Starts with after space/hyphen
  CONTAINS: 50,
  FUZZY_BASE: 30, // Base score for fuzzy matches
  FUZZY_MAX: 45, // Maximum fuzzy match score
  NO_MATCH: 0
};

// Bonus for matching in primary name vs native name
const NAME_TYPE_BONUS = {
  PRIMARY: 10, // Bonus for matching in main name
  NATIVE: 0 // No bonus for native name matches
};

// Maximum edit distance to consider for fuzzy matching
const MAX_EDIT_DISTANCE_RATIO = 0.4; // 40% of search term length

export function useLanguageSearch(data) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const searchResults = useMemo(() => {
    if (
      !data ||
      !data.languageData ||
      !data.languageGroups ||
      !data.groupInfo
    ) {
      return { languages: [], groups: [] };
    }

    const term = searchTerm.toLowerCase().trim();
    const threshold = tabsConfig.searchLengthThreshold;

    // If no search term or below threshold, return empty results
    if (!term || term.length < threshold) {
      return { languages: [], groups: [] };
    }

    // Search in language names and native names
    const matchingLanguages = Object.keys(data.languageData)
      .map((code) => {
        const language = data.languageData[code];
        const groupName = language.group;
        const groupMatch =
          selectedGroup === "all" || groupName === selectedGroup;

        if (!groupMatch) {
          return null;
        }

        // Calculate scores for both name and nativeName
        const nameScore = calculateRelevanceScore(language.name, term);
        const nativeNameScore = language.nativeName
          ? calculateRelevanceScore(language.nativeName, term)
          : RELEVANCE_SCORES.NO_MATCH;

        // Take the best score, with bonus for primary name matches
        const bestScore = Math.max(
          nameScore +
            (nameScore > RELEVANCE_SCORES.NO_MATCH
              ? NAME_TYPE_BONUS.PRIMARY
              : 0),
          nativeNameScore +
            (nativeNameScore > RELEVANCE_SCORES.NO_MATCH
              ? NAME_TYPE_BONUS.NATIVE
              : 0)
        );

        // Only include if there's a match
        if (bestScore <= RELEVANCE_SCORES.NO_MATCH) {
          return null;
        }

        return {
          code,
          name: language.name,
          nativeName: language.nativeName,
          groupName,
          score: bestScore,
          matchedIn: nameScore >= nativeNameScore ? "name" : "nativeName"
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    // Search in group names
    const matchingGroups = Object.keys(data.groupInfo)
      .filter((groupName) => {
        const groupDisplayName = groupName.toLowerCase();
        return groupDisplayName.includes(term);
      })
      .map((groupName) => ({
        name: groupName,
        score: calculateRelevanceScore(groupName, term)
      }))
      .sort((a, b) => b.score - a.score);

    return {
      languages: matchingLanguages,
      groups: matchingGroups
    };
  }, [data, searchTerm, selectedGroup]);

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedGroup("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedGroup,
    setSelectedGroup,
    searchResults,
    clearSearch
  };
}

function calculateRelevanceScore(text, searchTerm) {
  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();

  // Exact match gets highest score
  if (lowerText === lowerTerm) {
    return RELEVANCE_SCORES.EXACT_MATCH;
  }

  // Starts with search term gets high score
  if (lowerText.startsWith(lowerTerm)) {
    return RELEVANCE_SCORES.STARTS_WITH;
  }

  // Check for word boundary match (term appears after space or hyphen)
  const wordBoundaryRegex = new RegExp(`[\\s-]${escapeRegex(lowerTerm)}`, "i");
  if (wordBoundaryRegex.test(lowerText)) {
    return RELEVANCE_SCORES.WORD_BOUNDARY;
  }

  // Contains search term gets medium score
  if (lowerText.includes(lowerTerm)) {
    return RELEVANCE_SCORES.CONTAINS;
  }

  // Fuzzy match for typos (only if edit distance is reasonable)
  const distance = levenshteinDistance(lowerText, lowerTerm);
  const maxAllowedDistance = Math.ceil(
    lowerTerm.length * MAX_EDIT_DISTANCE_RATIO
  );

  if (distance <= maxAllowedDistance) {
    // Score decreases linearly from FUZZY_MAX to FUZZY_BASE based on distance
    const scoreRange = RELEVANCE_SCORES.FUZZY_MAX - RELEVANCE_SCORES.FUZZY_BASE;
    const normalizedDistance = distance / maxAllowedDistance;
    return RELEVANCE_SCORES.FUZZY_MAX - scoreRange * normalizedDistance;
  }

  return RELEVANCE_SCORES.NO_MATCH;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
