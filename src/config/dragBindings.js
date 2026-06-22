// Maps each Mesha component to drag axis bindings.
// Each axis maps to either advancedKey (controls.json) or advancedKey (dot-notation into config.json).
// x axis: horizontal drag, y axis: vertical drag.

export const dragBindings = {
  eyes: {
    x: { advancedKey: "mesha.eyeX" },
    y: { advancedKey: "mesha.eyeY" },
  },
  ears: {
    // horizontal drag widens/narrows ear spread; no vertical binding yet
    x: { advancedKey: "mesha.earSize" },
  },
  nose: {
    y: { advancedKey: "mesha.noseSize" },
  },
  tongue: {
    x: { advancedKey: "mesha.tongueWidth" },
    y: { advancedKey: "mesha.tongueSize" },
  },
  teeth: {
    y: { advancedKey: "mesha.teethSize" },
  },
  moustache: {
    // horizontal drag on moustache adjusts its spread (mirrors eyeX)
    x: { advancedKey: "mesha.eyeX" },
    y: { advancedKey: "mesha.tuftSize" },
  },
};
