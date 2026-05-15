import controlsConfig from "../../config/controls.json";
import {
  getControlGroupLabel,
  localizeControlConfig,
} from "../../utils/i18nUtils";
import ControlItem from "./ControlItem";

function ControlItemGroup({
  groupName,
  controls,
  onChange,
  isCompact = false,
  showFieldset = false,
}) {
  const groupControls = Object.entries(controlsConfig[groupName] ?? {})
    .filter(([_id, config]) =>
      isCompact ? !!config.compactMenuIcon : config.isShownInMenu,
    )
    .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) }));

  if (groupControls.length === 0) return null;

  const items = groupControls.map((control) => (
    <ControlItem
      key={control.id}
      control={control}
      value={controls[control.id]}
      onChange={(value) => onChange(control.id, value)}
      isCompact={isCompact}
    />
  ));

  if (showFieldset) {
    return (
      <fieldset className="control-group">
        <legend>{getControlGroupLabel(groupName)}</legend>
        <div className="controls-grid">{items}</div>
      </fieldset>
    );
  }

  return items;
}

export default ControlItemGroup;
