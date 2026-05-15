import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import controlsConfig from "../../config/controls.json";
import ControlItemGroup from "./ControlItemGroup";
import "./ControlsTab.css";

const ControlsTab = ({ className }) => {
  const { controls, updateControl } = useControls();
  const { selectedLanguage } = useLanguageSelection();

  const uniqueGroups = Object.keys(controlsConfig).filter(
    (group) =>
      group !== "Header" &&
      (selectedLanguage ? group !== "Stage light" : group !== "Mesha light"),
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
    </div>
  );
};

export default ControlsTab;
