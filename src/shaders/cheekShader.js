export const cheekVertexShader = /* glsl */ `
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

export const cheekFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // ========== REFERENCE AREA DEFINITION ==========
    // This defines the area where all shader effects will be applied
    // Position in UV space where the pattern is centered (behind eyes)
    vec2 PATTERN_CENTER = vec2(0.8, 0.5);
    
    // Pattern area dimensions (elliptical to compensate for surface stretch)
    float PATTERN_WIDTH = 0.05;   // X-axis radius (visual height on mesh)
    float PATTERN_HEIGHT = 0.4;   // Y-axis radius (visual width on mesh)
    
    // Depth mask range - only show pattern on back part of surface
    float DEPTH_MIN = 0.0;
    float DEPTH_MAX = 0.5;
    // ================================================
    
    // Basic directional lighting
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.5;
    float lighting = ambient + diffuse * 0.5;
    
    // Calculate if current fragment is within the pattern area (rectangle)
    vec2 offset = abs(vUv - PATTERN_CENTER);
    
    // Create rectangular pattern within the reference area
    float rectangleX = smoothstep(PATTERN_WIDTH + 0.01, PATTERN_WIDTH, offset.x);
    float rectangleY = smoothstep(PATTERN_HEIGHT + 0.01, PATTERN_HEIGHT, offset.y);
    float rectangle = rectangleX * rectangleY;
    
    // Apply depth mask to only show on back part of surface
    float depthMask = smoothstep(DEPTH_MIN, DEPTH_MAX, vPosition.z);
    rectangle *= depthMask;
    
    vec3 color = mix(uBaseColor, uAccentColor, rectangle);
    color *= lighting;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
