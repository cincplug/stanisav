import { Color } from "three";

export function shiftHue(hex, degree) {
  const c = new Color(hex);
  const hsl = c.getHSL({});
  let h = (hsl.h * 360 + degree) % 360;
  if (h < 0) h += 360;
  c.setHSL(h / 360, hsl.s, hsl.l);
  return `#${c.getHexString()}`;
}

/**
 * Calculates color variations for languages within the same group
 * @param {Object} languageData - Language data object
 * @param {Object} languageGroups - Language groups mapping
 * @param {Object} groupColors - Base colors for each group
 * @returns {Object} Mapping of language codes to their shifted colors
 */
export function calculateLanguageColors(
  languageData,
  languageGroups,
  groupColors,
  hueShiftAngle = 5,
) {
  if (!languageData || !languageGroups || !groupColors) return {};

  // Group languages by their group
  const groupedLanguages = {};
  Object.keys(languageData).forEach((langCode) => {
    const groupKey = languageData[langCode]?.group || languageGroups[langCode];
    if (!groupedLanguages[groupKey]) {
      groupedLanguages[groupKey] = [];
    }
    groupedLanguages[groupKey].push(langCode);
  });

  // Sort languages within each group alphabetically by name
  Object.keys(groupedLanguages).forEach((groupKey) => {
    groupedLanguages[groupKey].sort((a, b) => {
      const nameA = languageData[a]?.name || a;
      const nameB = languageData[b]?.name || b;
      return nameA.localeCompare(nameB);
    });
  });

  // Calculate shifted colors
  const languageColors = {};

  Object.entries(groupedLanguages).forEach(([groupKey, languages]) => {
    const baseColor = groupColors[groupKey];
    const totalInGroup = languages.length;

    languages.forEach((langCode, index) => {
      if (totalInGroup > 1) {
        // Center the shifts around the base color
        const centerOffset = (totalInGroup - 1) / 2;
        const hueShift = (index - centerOffset) * hueShiftAngle;
        languageColors[langCode] = shiftHue(baseColor, hueShift);
      } else {
        languageColors[langCode] = baseColor;
      }
    });
  });

  return languageColors;
}
