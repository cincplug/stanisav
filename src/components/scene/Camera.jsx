import { useCameraController } from "../../hooks/useCameraController";

const Camera = ({ languagePositions, selectedLanguage }) => {
  useCameraController({ languagePositions, selectedLanguage });
  return null;
};

export default Camera;
