import { useConfigContext } from "../../contexts/ConfigContext";
import { useI18nContext } from "../../contexts/I18nContext";
import { formatCamelCase } from "../../utils/stringUtils.js";
import { inferControlType } from "../../utils/configUtils";
import ControlItem from "./ControlItem";

// Tries i18n key "controls.<key>.label", falls back to the raw key
const resolveLabel = (groupRelativeKey, t) => {
  const i18nKey = `controls.${groupRelativeKey}.label`;
  const translated = t(i18nKey);
  return translated !== i18nKey ? translated : groupRelativeKey;
};

// Maps a primitive options array to [{ value, label }] shape expected by Select.
// Labels come from i18n "controls.<key>.options.<value>", falling back to the raw value.
const resolveSelectOptions = (rawOptions, groupRelativeKey, t) =>
  rawOptions.map((val) => {
    const i18nKey = `controls.${groupRelativeKey}.options.${val}`;
    const translated = t(i18nKey);
    return {
      value: val,
      label: translated !== i18nKey ? translated : String(val),
    };
  });

function ControlItemGroup({ groupName, showFieldset = false }) {
  const { getConfigGroup, updateConfigValue, resetConfigValue } =
    useConfigContext();
  const { t } = useI18nContext();

  const controls = getConfigGroup(groupName).flatMap(
    ({ dotKey, groupRelativeKey, options, value, isChanged }) => {
      const inferred = inferControlType(options ?? value);
      if (!inferred) return [];
      return [
        {
          dotKey,
          type: inferred.type,
          options: options
            ? resolveSelectOptions(options, groupRelativeKey, t)
            : null,
          value,
          label: resolveLabel(groupRelativeKey, t),
          isChanged,
        },
      ];
    },
  );

  if (controls.length === 0) return null;

  const items = controls.map((control, controlIndex) => (
    <ControlItem
      key={control.dotKey}
      control={control}
      onChange={(value) => updateConfigValue(control.dotKey, value)}
      onReset={() => resetConfigValue(control.dotKey)}
      controlIndex={controlIndex}
    />
  ));

  const { config } = useConfigContext();
  const { usesCamelCase } = config;
  const legend = usesCamelCase ? groupName : formatCamelCase(groupName);

  if (showFieldset) {
    return (
      <fieldset className="control-group">
        <legend>{legend}</legend>
        <div className="controls-grid">{items}</div>
      </fieldset>
    );
  }

  return items;
}

export default ControlItemGroup;
