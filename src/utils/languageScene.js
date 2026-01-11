import * as THREE from "three";

export const calculateLanguageFilterStatus = (
  languages,
  typologicalFeatures,
  filteringUtils,
  languageGroups
) => {
  if (Object.keys(filteringUtils).length === 0) {
    return languages.reduce((acc, langCode) => {
      acc[langCode] = { isVisible: true, isFiltered: false };
      return acc;
    }, {});
  }

  return languages.reduce((acc, langCode) => {
    const matchesFilters = Object.entries(filteringUtils).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }

        // Special handling for group filter
        if (feature === "group") {
          const languageGroup = languageGroups?.[langCode];
          return values.includes(languageGroup);
        }

        // Handle typological features
        const features = typologicalFeatures?.[langCode];
        if (!features) {
          return false;
        }

        const featureValue = features[feature];
        if (typeof featureValue === "number") {
          return values.map(Number).includes(featureValue);
        }
        return values.includes(featureValue);
      }
    );

    acc[langCode] = { isVisible: matchesFilters, isFiltered: !matchesFilters };
    return acc;
  }, {});
};

export const calculateGroupBounds = (positions, languages) => {
  if (!positions || languages.length === 0) {
    return { center: [0, 0, 0], radius: 10 };
  }
  const bounds = new THREE.Box3();
  languages.forEach((langCode) => {
    const pos = positions[langCode];
    if (pos) {
      bounds.expandByPoint(new THREE.Vector3(pos.x, pos.y, pos.z));
    }
  });
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z) / 2;
  return {
    center: [center.x, center.y, center.z],
    radius: Math.max(radius, 10),
  };
};
