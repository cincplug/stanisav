import React from "react";
import {
  getAlphabet,
  shouldDisplayAlphabet
} from "../../utils/alphabetFetcher";
import "./AlphabetSection.css";

function AlphabetSection({ languageCode }) {
  const alphabetData = getAlphabet(languageCode);

  if (!alphabetData) {
    return (
      <div className="control-item">
        <h4>Alphabet</h4>
        <div className="alphabet-placeholder">
          No alphabet information available yet
        </div>
      </div>
    );
  }

  if (!shouldDisplayAlphabet(languageCode)) {
    return null;
  }

  const { script, alphabet, length } = alphabetData;

  // Format script name for display
  const formatScriptName = (scriptName) => {
    return scriptName.charAt(0).toUpperCase() + scriptName.slice(1);
  };

  // Determine if script is right-to-left
  const isRTL = ["Arabic", "Hebrew"].includes(script);

  // Check if language has lowercase letters (Latin, Cyrillic, Greek, Armenian, Georgian)
  const hasLowercase = [
    "Latin",
    "Cyrillic",
    "Greek",
    "Armenian",
    "Georgian"
  ].includes(script);
  const lowercaseAlphabet = hasLowercase ? alphabet.toLowerCase() : null;

  return (
    <div className="control-item">
      <h4>
        Alphabet ({formatScriptName(script)} script, {length} characters)
      </h4>
      <div className="alphabet-display uppercase" dir={isRTL ? "rtl" : "ltr"}>
        {alphabet}
      </div>
      {hasLowercase && (
        <div className="alphabet-display lowercase" dir={isRTL ? "rtl" : "ltr"}>
          {lowercaseAlphabet}
        </div>
      )}
    </div>
  );
}

export default AlphabetSection;
