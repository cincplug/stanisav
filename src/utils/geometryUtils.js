import visualConstants from "../config/visualConstants.json";

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees) {
  const halfCircle = 180;
  return degrees * (Math.PI / halfCircle);
}

/**
 * Get the default rotation for languages in radians
 * Converts from degrees defined in visual constants
 */
export function getNodeRotation() {
  const rotation = visualConstants.languageNode.languageRotationDegrees;
  return [
    degreesToRadians(rotation.x),
    degreesToRadians(rotation.y),
    degreesToRadians(rotation.z)
  ];
}

/**
 * Get the camera-facing tilt angle in radians
 * Converts from degrees defined in visual constants
 */
export function getCameraFacingTilt() {
  return degreesToRadians(visualConstants.languageNode.cameraFacingTiltDegrees);
}
