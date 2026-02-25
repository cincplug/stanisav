import audioVisualizationConfig from "../config/audioVisualizationConfig.json";

export const createAudioReactiveSurface = ({
  audioData,
  size,
  bend,
  radius,
}) => {
  const {
    maxDeformation,
    fundamentalAmplifier,
    harmonicsAmplifier,
    verticalVariationMultiplier,
  } = audioVisualizationConfig.meshDeformation;

  const frequencyBands = 32;

  return (u, v, target) => {
    const z = (u - 0.5) * size;

    const angle = (v - 0.5) * Math.PI * 1.5;

    const x_flat = (v - 0.5) * size;
    const x_circle = Math.cos(angle) * radius;
    const x = x_flat + (x_circle - x_flat) * bend;

    const y_base_flat = 2;
    const y_base_circle = Math.sin(angle) * radius;
    const y_base = y_base_flat + (y_base_circle - y_base_flat) * bend;

    let y = y_base;

    if (audioData.isActive) {
      const { fundamentalData, harmonicsData } = audioData;
      const verticalVariation =
        Math.sin(v * Math.PI * 3) * verticalVariationMultiplier;

      const uForBand = u > 0.5 ? 1 - u : u;
      const bandIndex = Math.floor(uForBand * (frequencyBands - 1));

      const fundamentalAmplitude = fundamentalData[bandIndex] || 0;
      const harmonicsAmplitude = harmonicsData[bandIndex] || 0;

      const balancedFundamental = fundamentalAmplitude * fundamentalAmplifier;
      const balancedHarmonics = harmonicsAmplitude * harmonicsAmplifier;
      const totalAmplitude = balancedFundamental + balancedHarmonics;

      y = y_base + totalAmplitude * maxDeformation * size;

      if (u > 0.5) {
        y *= 1 + verticalVariation;
      }
    }

    target.set(x, y, z);
  };
};

export const createToothShape = (u, v, target) => {
  const angle = u * Math.PI * 2;
  const baseRadius = 0.3;
  const topRadius = 0.4;
  const r = baseRadius + (topRadius - baseRadius) * v;

  const shapeTop = 0.1;
  const shapeBottom = 0.8;
  const shapeFactor = shapeTop + (shapeBottom - shapeTop) * v;

  const roundTop = 1 - Math.pow(1 - v, 2);
  const blendFactor = shapeFactor * roundTop + shapeTop * (1 - roundTop);

  const x =
    Math.sign(Math.cos(angle)) *
    Math.pow(Math.abs(Math.cos(angle)), blendFactor) *
    r;
  const z =
    Math.sign(Math.sin(angle)) *
    Math.pow(Math.abs(Math.sin(angle)), blendFactor) *
    r;
  const y = (0.5 - v) * 0.8;

  target.set(x, y, z);
};
