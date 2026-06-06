// Maps each Mesha component to drag axis bindings.
// Each axis maps to either controlKey (controls.json) or advancedKey (dot-notation into config.json).
// x axis: horizontal drag, y axis: vertical drag.

export const dragBindings = {
  eyes: {
    x: { controlKey: "eyeX" },
    y: { controlKey: "eyeY" },
  },
  ears: {
    // horizontal drag widens/narrows ear spread; no vertical binding yet
    x: { controlKey: "earSize" },
  },
  nose: {
    y: { controlKey: "noseSize" },
  },
  tongue: {
    x: { advancedKey: "meshaVisualization.tongueWidth" },
    y: { controlKey: "tongueSize" },
  },
  teeth: {
    y: { controlKey: "teethSize" },
  },
  moustache: {
    // horizontal drag on moustache adjusts its spread (mirrors eyeX)
    x: { controlKey: "eyeX" },
    y: { controlKey: "moustacheSize" },
  },
};
