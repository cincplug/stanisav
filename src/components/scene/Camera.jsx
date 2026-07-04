import { useCameraController } from "../../hooks/useCameraController";

const Camera = ({ languageNodes, selectedLanguage }) => {
  useCameraController({ languageNodes, selectedLanguage });
  return null;
};

export default Camera;
