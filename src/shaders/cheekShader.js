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

export const morphologyFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // ========== REFERENCE AREA DEFINITION ==========
    vec2 PATTERN_CENTER = vec2(0.8, 0.5);
    float PATTERN_WIDTH = 0.05;
    float PATTERN_HEIGHT = 0.4;
    float DEPTH_MIN = 0.0;
    float DEPTH_MAX = 0.5;
    // ================================================
    
    // Basic directional lighting
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.5;
    float lighting = ambient + diffuse * 0.5;
    
    // Temporary placeholder rectangle
    vec2 offset = abs(vUv - PATTERN_CENTER);
    float rectangleX = smoothstep(PATTERN_WIDTH + 0.01, PATTERN_WIDTH, offset.x);
    float rectangleY = smoothstep(PATTERN_HEIGHT + 0.01, PATTERN_HEIGHT, offset.y);
    float rectangle = rectangleX * rectangleY;
    
    float depthMask = smoothstep(DEPTH_MIN, DEPTH_MAX, vPosition.z);
    rectangle *= depthMask;
    
    vec3 color = mix(uBaseColor, uAccentColor, rectangle);
    color *= lighting;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const wordOrderFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // ========== REFERENCE AREA DEFINITION ==========
    vec2 PATTERN_CENTER = vec2(0.8, 0.5);
    float PATTERN_WIDTH = 0.05;
    float PATTERN_HEIGHT = 0.4;
    float DEPTH_MIN = 0.0;
    float DEPTH_MAX = 0.5;
    // ================================================
    
    // Basic directional lighting
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.5;
    float lighting = ambient + diffuse * 0.5;
    
    // Depth mask
    float depthMask = smoothstep(DEPTH_MIN, DEPTH_MAX, vPosition.z);
    
    // Divide work area into 3 sections along Y-axis (visual width)
    float sectionWidth = PATTERN_HEIGHT * 2.0 / 3.0;
    
    // Calculate position within the work area (normalized to pattern bounds)
    vec2 workAreaMin = PATTERN_CENTER - vec2(PATTERN_WIDTH, PATTERN_HEIGHT);
    vec2 workAreaMax = PATTERN_CENTER + vec2(PATTERN_WIDTH, PATTERN_HEIGHT);
    vec2 localUV = vUv - workAreaMin;
    
    float pattern = 0.0;
    
    // Section Y bounds (visual width)
    float section1End = sectionWidth;
    float section2End = sectionWidth * 2.0;
    float section3End = sectionWidth * 3.0;
    
    // SUBJECT (S) - Left section: Person shape (circle + semicircle)
    if (localUV.y < section1End) {
      vec2 sectionCenter = vec2(PATTERN_WIDTH, sectionWidth / 2.0);
      vec2 offsetRaw = localUV - sectionCenter;
      vec2 offset = vec2(-offsetRaw.y, offsetRaw.x); // 90° CCW rotation
      offset.y *= 3.0; // 3x vertical squash
      offset.x /= 3.0; // 3x horizontal widen
      offset /= 2.0; // 2x scale
      
      // Head (circle)
      float headRadius = 0.015;
      float headDist = length(offset - vec2(0.0, 0.01));
      float head = smoothstep(headRadius + 0.003, headRadius, headDist);
      
      // Body (semicircle below)
      float bodyRadius = 0.018;
      vec2 bodyOffset = offset - vec2(0.0, -0.012);
      float bodyDist = length(bodyOffset);
      float body = smoothstep(bodyRadius + 0.003, bodyRadius, bodyDist);
      body *= step(bodyOffset.y, 0.0); // Only bottom half
      
      pattern = max(head, body);
    }
    
    // VERB (V) - Middle section: Mouth eating (two curves)
    else if (localUV.y < section2End) {
      vec2 sectionCenter = vec2(PATTERN_WIDTH, section1End + sectionWidth / 2.0);
      vec2 offsetRaw = localUV - sectionCenter;
      vec2 offset = vec2(-offsetRaw.y, offsetRaw.x); // 90° CCW rotation
      offset.y *= 3.0; // 3x vertical squash
      offset.x /= 3.0; // 3x horizontal widen
      offset /= 2.0; // 2x scale
      
      // Two symmetrical curves forming a mouth
      float mouthWidth = 0.025;
      float mouthHeight = 0.015;
      float curveThickness = 0.004;
      
      // Upper curve
      float upperY = -mouthHeight * (1.0 - pow(abs(offset.x / mouthWidth), 2.0));
      float upperDist = abs(offset.y - upperY);
      float upperCurve = smoothstep(curveThickness + 0.002, curveThickness, upperDist);
      upperCurve *= step(abs(offset.x), mouthWidth);
      
      // Lower curve
      float lowerY = mouthHeight * (1.0 - pow(abs(offset.x / mouthWidth), 2.0));
      float lowerDist = abs(offset.y - lowerY);
      float lowerCurve = smoothstep(curveThickness + 0.002, curveThickness, lowerDist);
      lowerCurve *= step(abs(offset.x), mouthWidth);
      
      pattern = max(upperCurve, lowerCurve);
    }
    
    // OBJECT (O) - Right section: Apple (two overlapping ellipses)
    else if (localUV.y < section3End) {
      vec2 sectionCenter = vec2(PATTERN_WIDTH, section2End + sectionWidth / 2.0);
      vec2 offsetRaw = localUV - sectionCenter;
      vec2 offset = vec2(-offsetRaw.y, offsetRaw.x); // 90° CCW rotation
      offset.y *= 3.0; // 3x vertical squash
      offset.x /= 3.0; // 3x horizontal widen
      offset /= 2.0; // 2x scale
      
      // Left side of apple
      vec2 leftCenter = vec2(-0.005, 0.0);
      float leftA = 0.018;
      float leftB = 0.022;
      float leftDist = length(vec2((offset.x - leftCenter.x) / leftA, (offset.y - leftCenter.y) / leftB));
      float leftSide = smoothstep(1.0 + 0.1, 1.0, leftDist);
      
      // Right side of apple
      vec2 rightCenter = vec2(0.005, 0.0);
      float rightA = 0.018;
      float rightB = 0.022;
      float rightDist = length(vec2((offset.x - rightCenter.x) / rightA, (offset.y - rightCenter.y) / rightB));
      float rightSide = smoothstep(1.0 + 0.1, 1.0, rightDist);
      
      pattern = max(leftSide, rightSide);
    }
    
    pattern *= depthMask;
    
    vec3 color = mix(uBaseColor, uAccentColor, pattern);
    color *= lighting;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
