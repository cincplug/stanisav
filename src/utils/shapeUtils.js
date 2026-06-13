import { config } from "../modules/configStore";

export const createAudioSurface = ({ audioBand, size, bend, radius }) => {
  const { maxDeformation, verticalVariationMultiplier } =
    config.meshaVisualization;

  const frequencyBands = 32;

  return (u, v, target) => {
    const z = (u - 0.5) * size;

    const angle = (v - 0.5) * Math.PI * 1.5;

    const xFlat = (v - 0.5) * size;
    const xCircle = Math.cos(angle) * radius;
    const x = xFlat + (xCircle - xFlat) * bend;

    const yBaseFlat = 0;
    const yBaseCircle = Math.sin(angle) * radius;
    const yBase = yBaseFlat + (yBaseCircle - yBaseFlat) * bend;

    let y = yBase;

    if (audioBand) {
      const verticalVariation =
        Math.sin(v * Math.PI) * verticalVariationMultiplier;

      const uForBand = u > 0.5 ? 1 - u : u;
      const bandIndex = Math.floor(uForBand * (frequencyBands - 1));
      const amplitude = audioBand[bandIndex] || 0;
      y = yBase + amplitude * maxDeformation * size;
      if (u > 0.5) {
        y *= 1 + verticalVariation;
      }
    }

    target.set(x, y, z);
  };
};

export function createTuftShape(moustacheSize, tuftCount) {
  const { moustacheTipRadius } = config.meshaVisualization;

  return function (u, v, target) {
    const theta = u * Math.PI * 2;
    const t = v * 2 - 1;

    const halfHeight = moustacheSize;
    const maxRadius = moustacheSize / tuftCount;
    const tipRadius = moustacheSize * moustacheTipRadius;

    const waist = 1 - Math.abs(t);
    const radius = tipRadius + (maxRadius - tipRadius) * Math.pow(waist, 2);

    const x = t * halfHeight;
    const y = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    target.set(x, y, z);
  };
}
