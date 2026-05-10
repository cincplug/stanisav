import controlsConfig from "../../config/controls.json";
import { localizeControlConfig } from "../../utils/i18nUtils";
import ControlItem from "./ControlItem";

function ControlItemGroup({
  groupName,
  controls,
  onChange,
  isCompact = false,
}) {
  const groupControls = Object.entries(controlsConfig[groupName] ?? {})
    .filter(([_id, config]) =>
      isCompact ? !!config.compactMenuIcon : config.isShownInMenu,
    )
    .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) }));

  if (groupControls.length === 0) return null;

  return groupControls.map((control) => (
    <ControlItem
      key={control.id}
      control={control}
      value={controls[control.id]}
      onChange={(value) => onChange(control.id, value)}
      isCompact={isCompact}
    />
  ));
}

export default ControlItemGroup;
