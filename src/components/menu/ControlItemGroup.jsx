import controlsConfig from "../../config/controls.json";
import { localizeControlConfig } from "../../utils/configI18nUtils";
import ControlItem from "./ControlItem";

function ControlItemGroup({ groupName, controls, onChange }) {
  const groupControls = Object.entries(controlsConfig)
    .filter(
      ([_id, config]) => config.group === groupName && config.isShownInMenu,
    )
    .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) }));

  if (groupControls.length === 0) return null;

  return groupControls.map((control) => (
    <ControlItem
      key={control.id}
      control={control}
      value={controls[control.id]}
      onChange={(value) => onChange(control.id, value)}
    />
  ));
}

export default ControlItemGroup;
