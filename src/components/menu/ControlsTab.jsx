import React from "react";
import guiConfig from "../../config/guiConfig.json";
import ControlItem from "./ControlItem";

const getControlsByGroup = (groupName) =>
  Object.entries(guiConfig)
    .filter(
      ([_id, config]) => config.group === groupName && config.isUserEditable
    )
    .map(([id, config]) => ({ id, ...config }));

const ControlGroup = ({ groupName, state, setState }) => {
  const controls = getControlsByGroup(groupName);
  if (controls.length === 0) return null;

  const gridClass =
    groupName === "Colors" ? "controls-grid-colors" : "controls-grid";

  return (
    <fieldset className="control-group">
      <legend>{groupName}</legend>
      <div className={gridClass}>
        {controls.map((control) => (
          <ControlItem
            key={control.id}
            control={control}
            groupName={groupName}
            state={state}
            setState={setState}
          />
        ))}
      </div>
    </fieldset>
  );
};

const ControlsTab = ({ controlGroups: { state, handlers } }) => {
  const uniqueGroups = Array.from(
    new Set(Object.values(guiConfig).map(({ group }) => group))
  ).filter(Boolean);

  return (
    <div className="control-section">
      {uniqueGroups.map((groupName) => (
        <ControlGroup
          key={groupName}
          groupName={groupName}
          state={state}
          setState={handlers}
        />
      ))}
      <div className="control-item">
        <a className="playlist" href="/gopofajlija.m3u">
          Get Playlist
        </a>
      </div>
    </div>
  );
};

export default ControlsTab;
