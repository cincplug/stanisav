import staticConfig from "../../config/config.json";
import controlsHideConfig from "../../config/controlsHideConfig.json";
import { useConfigContext } from "../../contexts/ConfigContext";
import ControlItemGroup from "./ControlItemGroup";
import "./ControlsTab.css";

const allGroupNames = Object.keys(staticConfig);

// Searches every group for a key and returns its current value.
// Used to evaluate conditional hide rules that watch a key living in another group.
const findConfigValueByKey = (getConfigGroup, targetKey) => {
  for (const groupName of allGroupNames) {
    const match = getConfigGroup(groupName).find(
      ({ groupRelativeKey }) => groupRelativeKey === targetKey,
    );
    if (match) return match.value;
  }
  return undefined;
};

// Resolves whether a group should be hidden, based on controlsHideConfig.json.
// A group is hidden if its rule is unconditional (isAlwaysHidden), or if the
// watched key currently equals the value that should trigger hiding.
const shouldHideGroup = (groupName, getConfigGroup) => {
  const hideRule = controlsHideConfig[groupName];
  if (!hideRule) return false;
  if (hideRule.isAlwaysHidden) return true;

  const { watchKey, hideWhenValue } = hideRule;
  return findConfigValueByKey(getConfigGroup, watchKey) === hideWhenValue;
};

const ControlsTab = ({ className }) => {
  const { getConfigGroup } = useConfigContext();

  const visibleGroupNames = allGroupNames.filter(
    (groupName) => !shouldHideGroup(groupName, getConfigGroup),
  );

  return (
    <div className={`control-section ${className}`}>
      {visibleGroupNames.map((groupName) => (
        <ControlItemGroup key={groupName} groupName={groupName} showFieldset />
      ))}
    </div>
  );
};

export default ControlsTab;
