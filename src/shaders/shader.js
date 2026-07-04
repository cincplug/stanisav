// ─── Shared vertex shader ─────────────────────────────────────────────────────
// Used by both tonality and highlight materials.

export const meshVertexShader = /* glsl */ `
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

// ─── Tonality / skin fragment shader ─────────────────────────────────────────

export const tonalityFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform int uStripesType;
  uniform float uAccentOpacity;
  uniform float uOpacity;
  uniform float uAmbient;
  uniform float uLightingMin;
  uniform float uLightingMax;
  uniform float uLightingDiffuse;
  uniform float uShadeChecker;
  uniform float uShadeStripe;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  float getVerticalStripeMask(float coord, int count) {
    float stripeWidth = 0.8 / float(count) * 0.4;
    float stripeSpacing = 1.2 / float(count);
    float mask = 0.0;
    for (int i = 0; i < 12; i++) {
      if (i >= count) break;
      float xStart = float(i) * stripeSpacing + stripeSpacing * 0.3;
      float xEnd = xStart + stripeWidth;
      float stripe = step(xStart, coord) * step(coord, xEnd);
      mask = max(mask, stripe);
    }
    return mask;
  }

  float getStripeMask(vec2 uv, int type) {
    if (type == 1) {
      float stripe1 = step(0.2, uv.y) * step(uv.y, 0.3);
      float stripe2 = step(0.7, uv.y) * step(uv.y, 0.8);
      return max(stripe1, stripe2);
    } else if (type == 2) {
      return getVerticalStripeMask(uv.x, 5);
    } else if (type == 3) {
      return getVerticalStripeMask(uv.x, 10);
    }
    return 0.0;
  }

  void main() {
    vec3 normal = normalize(vNormal);

    vec3 light1 = normalize(vec3(-1.0, 0.0, 1.0));
    vec3 light2 = normalize(vec3(1.0, 0.0, 1.0));
    vec3 light3 = normalize(vec3(0.0, 1.0, 1.0));

    float diffuse1 = max(dot(normal, light1), 0.0);
    float diffuse2 = max(dot(normal, light2), 0.0);
    float diffuse3 = max(dot(normal, light3), 0.0);

    float lighting = uAmbient + (diffuse1 + diffuse2 + diffuse3) * uLightingDiffuse;
    lighting = clamp(lighting, uLightingMin, uLightingMax);

    // Radial gradient: uBaseColor at center, darker shade at edges
    float distFromCenter = length(vUv - 0.5) * 2.0;
    vec3 edgeColor = uBaseColor * uShadeChecker;
    vec3 gradientColor = mix(uBaseColor, edgeColor, distFromCenter);

    vec3 litColor = gradientColor * lighting;
    vec3 litLighterColor = litColor * uShadeStripe;

    float stripeMask = getStripeMask(vUv, uStripesType);
    vec3 color = mix(litColor, litLighterColor, stripeMask);

    gl_FragColor = vec4(color, uOpacity);
  }
`;
