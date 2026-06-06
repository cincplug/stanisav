import controlsConfig from "../../config/controls.json";
import { useControlsContext } from "../../contexts/ControlsContext";
import AdvancedControls from "./AdvancedControls";
import ControlItemGroup from "./ControlItemGroup";
import "./ControlsTab.css";

const ControlsTab = ({ className }) => {
  const { controls, updateControl } = useControlsContext();

  const uniqueGroups = Object.keys(controlsConfig).filter(
    (group) => group !== "Header",
  );

  return (
    <div className={`control-section ${className}`}>
      {uniqueGroups.map((groupName) => (
        <ControlItemGroup
          key={groupName}
          groupName={groupName}
          controls={controls}
          onChange={updateControl}
          showFieldset
        />
      ))}
      <AdvancedControls />
    </div>
  );
};

export default ControlsTab;
