import React from "react";
import { generateLinguisticDescription } from "../../utils/linguisticUtils";

/**
 * Component for rendering linguistic properties section
 */
function LinguisticPropertiesSection({ features }) {
  const linguisticUtils = generateLinguisticDescription(features);

  if (linguisticUtils.length === 0) return null;

  return (
    <div className="control-section linguistic-properties">
      {linguisticUtils.map((description, index) => (
        <div key={index} className="control-item">
          <p className="linguistic-description">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default LinguisticPropertiesSection;
