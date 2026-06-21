// Maps each Mesha component to drag axis bindings.
// Each axis maps to either advancedKey (controls.json) or advancedKey (dot-notation into config.json).
// x axis: horizontal drag, y axis: vertical drag.

export const dragBindings = {
  eyes: {
    x: { advancedKey: "meshaVisualization.eyeX" },
    y: { advancedKey: "meshaVisualization.eyeY" },
  },
  ears: {
    // horizontal drag widens/narrows ear spread; no vertical binding yet
    x: { advancedKey: "meshaVisualization.earSize" },
  },
  nose: {
    y: { advancedKey: "meshaVisualization.noseSize" },
  },
  tongue: {
    x: { advancedKey: "meshaVisualization.tongueWidth" },
    y: { advancedKey: "meshaVisualization.tongueSize" },
  },
  teeth: {
    y: { advancedKey: "meshaVisualization.teethSize" },
  },
  moustache: {
    // horizontal drag on moustache adjusts its spread (mirrors eyeX)
    x: { advancedKey: "meshaVisualization.eyeX" },
    y: { advancedKey: "meshaVisualization.moustacheSize" },
  },
};
