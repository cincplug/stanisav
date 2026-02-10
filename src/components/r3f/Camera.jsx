import { useCameraController } from "../../hooks/useCameraController";

const Camera = ({ languageNodes, data, controls, selectedLanguage }) => {
  useCameraController({
    languageNodes,
    data,
    controls,
    selectedLanguage,
  });
  return null;
};

export default Camera;
