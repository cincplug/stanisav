import staticConfig from "../../config/config.json";
import ControlItemGroup from "./ControlItemGroup";
import "./ControlsTab.css";

// All top-level group names from config, excluding "header" which renders above the tabs
const configGroupNames = Object.keys(staticConfig).filter(
  (group) => !["header", "global", "entrance"].includes(group),
);

const ControlsTab = ({ className }) => {
  // ConfigContext is consumed inside ControlItemGroup; nothing extra needed here
  return (
    <div className={`control-section ${className}`}>
      {configGroupNames.map((groupName) => (
        <ControlItemGroup key={groupName} groupName={groupName} showFieldset />
      ))}
    </div>
  );
};

export default ControlsTab;
