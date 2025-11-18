import * as THREE from "three";

export const calculateLanguageFilterStatus = (
  languages,
  typologicalFeatures,
  filteringUtils
) => {
  if (!typologicalFeatures || Object.keys(filteringUtils).length === 0) {
    return languages.reduce((acc, langCode) => {
      acc[langCode] = { isVisible: true, isFiltered: false };
      return acc;
    }, {});
  }
  return languages.reduce((acc, langCode) => {
    const features = typologicalFeatures[langCode];
    if (!features) {
      acc[langCode] = { isVisible: false, isFiltered: true };
      return acc;
    }
    const matchesFilters = Object.entries(filteringUtils).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }
        return values.includes(features[feature]);
      }
    );
    acc[langCode] = { isVisible: true, isFiltered: !matchesFilters };
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
    radius: Math.max(radius, 10)
  };
};
