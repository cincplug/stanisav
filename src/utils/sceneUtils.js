import { Box3, Vector3 } from "three";

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
        // Special handling for family filter
        if (feature === "family") {
          const languageGroup = languageGroups?.[langCode];
          const languageFamily =
            typologicalFeatures?._groupInfo?.[languageGroup]?.family;
          return values.includes(languageFamily);
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
  const bounds = new Box3();
  languages.forEach((langCode) => {
    const pos = positions[langCode];
    if (pos) {
      bounds.expandByPoint(new Vector3(pos.x, pos.y, pos.z));
    }
  });
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const radius = Math.max(size.x, size.y, size.z) / 2;
  return {
    center: [center.x, center.y, center.z],
    radius: Math.max(radius, 10),
  };
};
export const calculateLabelSizeConfig = (
  sortBy,
  data,
  layoutConfig
) => {
  const { outMin, outMax } = layoutConfig.labelSizeNormalization;

  // Determine which data source to use
  let values = [];

  if (sortBy === "phonemeCount" || sortBy === "caseCount") {
    // Get values from typological features
    if (data?.typologicalFeatures) {
      Object.values(data.typologicalFeatures).forEach((features) => {
        const val = features[sortBy];
        if (val !== undefined && val !== null) {
          values.push(val);
        }
      });
    }
  } else {
    // Get speaker counts
    if (data?.speakerData) {
      values = Object.values(data.speakerData).filter(
        (v) => v !== undefined && v !== null
      );
    }
  }

  if (values.length === 0) {
    return { uniqueValues: [1], outMin, outMax };
  }

  // Get unique values and sort them
  const uniqueValues = [...new Set(values)].sort((a, b) => a - b);

  return {
    uniqueValues,
    outMin,
    outMax,
  };
};
