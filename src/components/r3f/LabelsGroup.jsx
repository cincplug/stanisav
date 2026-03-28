import { useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import Label from "./Label";

const OCCLUSION_FADE_NEAR = 10;
const OCCLUSION_FADE_FAR = 25;

const computeOpacities = (camera, formattedPositions, selectedLanguage) => {
  const opacities = {};

  if (!selectedLanguage || !formattedPositions[selectedLanguage]) {
    Object.keys(formattedPositions).forEach((code) => {
      opacities[code] = 1;
    });
    return opacities;
  }

  const focusPos = formattedPositions[selectedLanguage];
  const cameraPos = camera.position;

  const toFocus = new Vector3(
    focusPos.x - cameraPos.x,
    focusPos.y - cameraPos.y,
    focusPos.z - cameraPos.z,
  );
  const focusDistance = toFocus.length();
  const toFocusNorm = toFocus.clone().normalize();

  Object.entries(formattedPositions).forEach(([langCode, pos]) => {
    if (langCode === selectedLanguage) {
      opacities[langCode] = 1;
      return;
    }

    const toNode = new Vector3(
      pos.x - cameraPos.x,
      pos.y - cameraPos.y,
      pos.z - cameraPos.z,
    );

    const projectedDepth = toNode.dot(toFocusNorm);

    // Node is behind camera or beyond focus — fully visible
    if (projectedDepth <= 0 || projectedDepth >= focusDistance) {
      opacities[langCode] = 1;
      return;
    }

    const projected = toFocusNorm.clone().multiplyScalar(projectedDepth);
    const perpendicularDist = toNode.clone().sub(projected).length();

    // Smooth fade between the two thresholds
    const t = Math.max(
      0,
      Math.min(
        1,
        (perpendicularDist - OCCLUSION_FADE_NEAR) /
          (OCCLUSION_FADE_FAR - OCCLUSION_FADE_NEAR),
      ),
    );
    opacities[langCode] = t;
  });

  return opacities;
};

const LabelsGroup = ({
  sortedLanguageCodes,
  formattedPositions,
  languageFilterStatus,
  languageColors,
  languageData,
  selectedLanguage,
}) => {
  const { camera } = useThree();
  const [opacities, setOpacities] = useState(() =>
    computeOpacities(camera, formattedPositions, selectedLanguage),
  );
  const prevOpacitiesRef = useRef(opacities);

  useFrame(() => {
    const next = computeOpacities(camera, formattedPositions, selectedLanguage);

    // Only trigger re-render if any opacity changed meaningfully
    const prev = prevOpacitiesRef.current;
    const hasChanged = Object.keys(next).some(
      (code) => Math.abs((next[code] ?? 1) - (prev[code] ?? 1)) > 0.01,
    );

    if (hasChanged) {
      prevOpacitiesRef.current = next;
      setOpacities(next);
    }
  });

  return sortedLanguageCodes.map((langCode) => {
    const position = formattedPositions[langCode];
    const filterStatus = languageFilterStatus[langCode];

    if (!position || !filterStatus?.isVisible) return null;

    const opacity = opacities[langCode] ?? 1;
    if (opacity === 0) return null;

    return (
      <Label
        key={langCode}
        languageCode={langCode}
        language={languageData[langCode]}
        position={[position.x, position.y, position.z]}
        isSelected={selectedLanguage === langCode}
        color={languageColors[langCode]}
        opacity={opacity}
      />
    );
  });
};

export default LabelsGroup;
