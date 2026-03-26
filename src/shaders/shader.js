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
  uniform int uStripesType;
  uniform float uAccentOpacity;
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

  // Tonality-specific stripe selection.
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
    
    float ambient = 0.7;
    vec3 light1 = normalize(vec3(-1.0, 0.0, 1.0));
    vec3 light2 = normalize(vec3(1.0, 0.0, 1.0));
    vec3 light3 = normalize(vec3(0.0, 1.0, 1.0));
    
    float diffuse1 = max(dot(normal, light1), 0.0);
    float diffuse2 = max(dot(normal, light2), 0.0);
    float diffuse3 = max(dot(normal, light3), 0.0);
    
    float lighting = ambient + (diffuse1 + diffuse2 + diffuse3) * 0.5;
    lighting = clamp(lighting, 0.7, 1.8);

    vec3 litBaseColor = uBaseColor * lighting;
    
    vec3 litLighterColor = litBaseColor * 1.5;

    // Checker pattern
    const float CHECKER_SHADE = 0.96;
    float checkerMask = getCheckerMask(vUv);
    vec3 darkerBase = litBaseColor * CHECKER_SHADE;
    vec3 checkerColor = mix(litBaseColor, darkerBase, checkerMask);

    // Stripes use lighter version
    float stripeMask = getStripeMask(vUv, uStripesType);
    vec3 color = mix(checkerColor, litLighterColor, stripeMask);

    gl_FragColor = vec4(color, 1.0);
  }
`;
