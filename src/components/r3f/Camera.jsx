import { useCameraController } from "../../hooks/useCameraController";

const Camera = ({ languageNodes, data, selectedLanguage }) => {
  useCameraController({
    languageNodes,
    data,
    selectedLanguage,
  });
  return null;
};

export default Camera;
