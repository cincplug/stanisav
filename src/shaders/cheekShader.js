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
  uniform sampler2D uWordOrderTexture;
  uniform float uTextureStart; // 0.0-1.0, where to start showing the texture along the reference area
  
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
    
    // Rectangle mask for reference area
    vec2 offset = abs(vUv - PATTERN_CENTER);
    float rectangleX = smoothstep(PATTERN_WIDTH + 0.01, PATTERN_WIDTH, offset.x);
    float rectangleY = smoothstep(PATTERN_HEIGHT + 0.01, PATTERN_HEIGHT, offset.y);
    float rectangle = rectangleX * rectangleY;
    float depthMask = smoothstep(DEPTH_MIN, DEPTH_MAX, vPosition.z);
    rectangle *= depthMask;

    // Only show texture if inside reference area and after uTextureStart (along Y axis)
    float showTexture = step(uTextureStart, (vUv.y - (PATTERN_CENTER.y - PATTERN_HEIGHT)) / (2.0 * PATTERN_HEIGHT));
    showTexture *= rectangle;

    // Map vUv to [0,1] inside the reference area
    vec2 refMin = PATTERN_CENTER - vec2(PATTERN_WIDTH, PATTERN_HEIGHT);
    vec2 refMax = PATTERN_CENTER + vec2(PATTERN_WIDTH, PATTERN_HEIGHT);
    vec2 refUv = (vUv - refMin) / (refMax - refMin);



    // Simplified: (x, y) -> (y, x) achieves the same as previous flip+rotate
    vec2 finalUv = vec2(refUv.y, refUv.x);

    // Sample the texture only if inside the area
    vec4 texColor = texture2D(uWordOrderTexture, finalUv);

    // Compute grayscale value from texture (assume texture is grayscale)
    float texValue = texColor.r;

    // Invert base color
    vec3 invertedBase = vec3(1.0) - uBaseColor;

    // Blend: black (texValue=0) -> inverted, white (texValue=1) -> base, interpolate for gray
    vec3 blendColor = mix(invertedBase, uBaseColor, texValue);

    // Apply blend everywhere on the mesh
    vec3 color = blendColor;
    color *= lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const wordOrderFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform int uWordOrder[3];
  
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

    // Map section index to S/O/V using uWordOrder
    int section = 0;
    if (localUV.y < section1End) {
      section = 0;
    } else if (localUV.y < section2End) {
      section = 1;
    } else if (localUV.y < section3End) {
      section = 2;
    } else {
      section = -1;
    }

    if (section >= 0) {
      int symbol = uWordOrder[section];
      if (symbol == 0) {
        // SUBJECT (S) - Person shape (circle + semicircle)
        vec2 sectionCenter = vec2(PATTERN_WIDTH, (float(section) + 0.5) * sectionWidth);
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
      } else if (symbol == 2) {
        // VERB (V) - Mouth eating (two curves)
        vec2 sectionCenter = vec2(PATTERN_WIDTH, (float(section) + 0.5) * sectionWidth);
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
      } else if (symbol == 1) {
        // OBJECT (O) - Apple (two overlapping ellipses)
        vec2 sectionCenter = vec2(PATTERN_WIDTH, (float(section) + 0.5) * sectionWidth);
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
    }

    pattern *= depthMask;
    vec3 color = mix(uBaseColor, uAccentColor, pattern);
    color *= lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;
