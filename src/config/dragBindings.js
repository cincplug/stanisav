// Maps each Mesha component to drag axis bindings.
// Each axis maps to either configKey (controls.json) or configKey (dot-notation into config.json).
// x axis: horizontal drag, y axis: vertical drag.

export const dragBindings = {
  eyes: {
    x: { configKey: "mesha.eyeX" },
    y: { configKey: "mesha.eyeY" },
  },
  ears: {
    // horizontal drag widens/narrows ear spread; no vertical binding yet
    x: { configKey: "mesha.earWidth" },
    y: { configKey: "mesha.earHeight" },
  },
  nose: {
    y: { configKey: "mesha.noseSize" },
  },
  tongue: {
    x: { configKey: "mesha.tongueWidth" },
    y: { configKey: "mesha.tongueLength" },
  },
  teeth: {
    y: { configKey: "mesha.toothSize" },
  },
  moustache: {
    // horizontal drag on moustache adjusts its spread (mirrors eyeX)
    x: { configKey: "mesha.tuftSpacing" },
    y: { configKey: "mesha.tuftSize" },
  },
};
