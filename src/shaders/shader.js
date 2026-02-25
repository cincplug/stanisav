export const tonalityVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
export const tonalityFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform int uTonalityType;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Returns 0/1 checker cells.
  float getCheckerMask(vec2 uv) {
    float checkerX = step(0.5, fract(uv.x * 5.0));
    float checkerY = step(0.5, fract(uv.y * 5.0));
    return abs(checkerX - checkerY);
  }

  // Builds N vertical stripe bands across X.
  float getVerticalStripeMask(float coord, int count) {
    float stripeWidth = 1.0 / float(count) * 0.4;
    float stripeSpacing = 1.0 / float(count);
    float mask = 0.0;

    for (int i = 0; i < 12; i++) {
      if (i >= count) break;
      float xStart = float(i) * stripeSpacing + stripeSpacing * 0.3;
      float xEnd = xStart + stripeWidth;
      float stripe = step(xStart, coord) * step(coord, xEnd);
      mask = max(mask, stripe);
    }

    return mask; // 0 outside stripe, 1 inside stripe
  }

  // Tonality-specific stripe selection.
  float getStripeMask(vec2 uv, int type) {
    if (type == 1) {
      float stripe1 = step(0.2, uv.y) * step(uv.y, 0.3);
      float stripe2 = step(0.7, uv.y) * step(uv.y, 0.8);
      return max(stripe1, stripe2);
    } else if (type == 2) {
      return getVerticalStripeMask(uv.x, 4);
    } else if (type == 3) {
      return getVerticalStripeMask(uv.x, 12);
    }
    return 0.0; // type 0 => no extra stripe pattern
  }

  void main() {
    vec3 lightDir = normalize(vec3(5.0, -5.0, 5.0));
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
    float ambient = 0.7;
    float lighting = ambient + diffuse * 0.5;

    // Checker is always visible: base <-> slightly darker base.
    const float CHECKER_SHADE = 0.96;
    float checkerMask = getCheckerMask(vUv);
    vec3 darkerBase = uBaseColor * CHECKER_SHADE;
    vec3 checkerColor = mix(uBaseColor, darkerBase, checkerMask);

    // Stripes overlay checker and switch to accent where mask == 1.
    float stripeMask = getStripeMask(vUv, uTonalityType);
    vec3 color = mix(checkerColor, uAccentColor, stripeMask);

    color *= lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;
