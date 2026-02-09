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
  uniform int uTonalityType;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  float getVerticalStripes(float coord, int count) {
    float result = 1.0;
    float stripeWidth = 1.0 / float(count) * 0.4;
    float stripeSpacing = 1.0 / float(count);
    
    for (int i = 0; i < 10; i++) {
      if (i >= count) break;
      float xStart = float(i) * stripeSpacing + stripeSpacing * 0.3;
      float xEnd = xStart + stripeWidth;
      float stripe = step(xStart, coord) * step(coord, xEnd);
      result -= stripe * 0.2;
    }
    return result;
  }
  
  float getStripe(vec2 uv, int type) {
    // Base checkerboard pattern (type 0)

    float checkerX = step(0.5, fract(uv.x * 5.0));
    float checkerY = step(0.5, fract(uv.y * 5.0));
    float checker = abs(checkerX - checkerY);
    float basePattern = 1.0 - checker * 0.05;
    
    if (type == 0) {
      return basePattern;
    } else if (type == 1) {
      float stripe1 = step(0.2, uv.y) * step(uv.y, 0.3);
      float stripe2 = step(0.7, uv.y) * step(uv.y, 0.8);
      float additionalPattern = 1.0 - max(stripe1, stripe2) * 0.4;
      return basePattern * additionalPattern;
    } else if (type == 2) {
      float additionalPattern = getVerticalStripes(uv.x, 4);
      return basePattern * additionalPattern;
    } else if (type == 3) {
      float additionalPattern = getVerticalStripes(uv.x, 12);
      return basePattern * additionalPattern;
    }
    return 1.0;
  }
  void main() {
    vec3 lightDir = normalize(vec3(5.0, -5.0, 5.0));
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
    float ambient = 0.7;
    float lighting = ambient + diffuse * 0.5;
    float stripe = getStripe(vUv, uTonalityType);
    vec3 color = uBaseColor * stripe;
    color *= lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;