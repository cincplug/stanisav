import { useConfigContext } from "../../contexts/ConfigContext";
import Title from "./Title";

const LabelsClusterTitle = ({ position, title }) => {
  const { config } = useConfigContext();
  const { labelSize, white } = config;

  return (
    <Title
      position={position}
      text={title}
      fontSize={labelSize}
      color={white}
    />
  );
};

export default LabelsClusterTitle;
