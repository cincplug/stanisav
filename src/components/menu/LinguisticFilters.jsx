import React from "react";
import {
  getLinguisticFeatures,
  getFeatureValues
} from "../../utils/filteringUtils";

function filteringUtils({ data, filteringUtils, onfilteringUtilsChange }) {
  const features = getLinguisticFeatures();

  const handleCheckboxChange = (feature, value, checked) => {
    onfilteringUtilsChange((prev) => {
      const currentValues = prev[feature] || [];

      // If "all" is clicked
      if (value === "all") {
        if (checked) {
          // Clear the feature's filters (remove the key entirely)
          const { [feature]: _, ...rest } = prev;
          return rest;
        }
        // When unchecking "all", do nothing (stay in "all" state)
        return prev;
      }

      // For non-"all" values
      if (checked) {
        // Add the value to the filter
        return {
          ...prev,
          [feature]: [...currentValues, value]
        };
      } else {
        // Remove the value
        const updatedValues = currentValues.filter((v) => v !== value);
        if (updatedValues.length === 0) {
          // If no values left, remove the key (back to "all")
          const { [feature]: _, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [feature]: updatedValues
        };
      }
    });
  };

  return (
    <div className="linguistic-filters">
      {features.map(({ key: feature, label }) => {
        const values = getFeatureValues(data, feature);
        const currentValues = filteringUtils[feature] || [];
        const isAllSelected =
          !filteringUtils[feature] || filteringUtils[feature].length === 0;

        return (
          <div key={feature} className="filter-group">
            <h4 className="filter-group-title">{label}</h4>
            <p>{JSON.stringify(currentValues)}</p>
            <div className="checkbox-button-group">
              <input
                type="checkbox"
                id={`${feature}-all`}
                checked={isAllSelected}
                onChange={(e) =>
                  handleCheckboxChange(feature, "all", e.target.checked)
                }
              />
              <label
                htmlFor={`${feature}-all`}
                className={`checkbox-button ${isAllSelected ? "active" : ""}`}
              >
                All
              </label>
              {values.map((value) => (
                <React.Fragment key={value}>
                  <input
                    type="checkbox"
                    id={`${feature}-${value}`}
                    checked={currentValues.includes(value)}
                    onChange={(e) =>
                      handleCheckboxChange(feature, value, e.target.checked)
                    }
                  />
                  <label
                    htmlFor={`${feature}-${value}`}
                    className={`checkbox-button ${
                      currentValues.includes(value) ? "active" : ""
                    }`}
                  >
                    {value}
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default filteringUtils;
