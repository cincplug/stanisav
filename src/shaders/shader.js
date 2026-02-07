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

  float getStripe(vec2 uv, int type) {
    if (type == 0) {
      return 1.0;
    } else if (type == 1) {
      float stripe1 = step(0.2, uv.y) * step(uv.y, 0.3);
      float stripe2 = step(0.7, uv.y) * step(uv.y, 0.8);
      return 1.0 - max(stripe1, stripe2) * 0.3;
    } else if (type == 2) {
      float stripe1 = step(0.1, uv.x) * step(uv.x, 0.2);
      float stripe2 = step(0.4, uv.x) * step(uv.x, 0.8);
      return 1.0 - max(stripe1, stripe2) * 0.4;
    } else if (type == 3) {
      float result = 1.0;
      for (int i = 0; i < 10; i++) {
        float xStart = 0.05 + float(i) * 0.1;
        float xEnd = xStart + 0.04;
        float stripe = step(xStart, uv.x) * step(uv.x, xEnd);
        result -= stripe * 0.4;
      }
      return result;
    }
    return 1.0;
  }

  void main() {
    vec3 lightDir = normalize(vec3(5.0, -5.0, 5.0));
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
    float ambient = 0.7;
    float lighting = ambient + diffuse * 0.5;

    float stripe = getStripe(vUv, uTonalityType);
    vec3 color = mix(uBaseColor, vec3(1.0), 1.0 - stripe);
    color *= lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;
