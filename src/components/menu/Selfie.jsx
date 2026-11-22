import { memo } from "react";
import { getLanguageSelfieUrl } from "../../utils/languageSelfieUtils.js";
import MiniStanisav from "../MiniStanisav.jsx";

const Selfie = memo(function Selfie({ langCode, isSelected }) {
  if (isSelected) {
    return (
      <MiniStanisav
        className="language-selfie"
        hasSelfieButton={false}
        languageCode={langCode}
        position={[0, 0, 104]}
      />
    );
  }

  return (
    <img
      className="language-selfie"
      src={getLanguageSelfieUrl(langCode)}
      alt=""
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      draggable="false"
    />
  );
});

export default Selfie;
