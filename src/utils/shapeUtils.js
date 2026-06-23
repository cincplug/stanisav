export const createAudioSurface = ({
  audioBand,
  size,
  bend,
  radius,
  maxDeformation,
  verticalVariation,
}) => {
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
      const uForBand = u > 0.5 ? 1 - u : u;
      const bandIndex = Math.floor(uForBand * (frequencyBands - 1));
      const amplitude = audioBand[bandIndex] || 0;
      y = yBase + amplitude * maxDeformation * size;
      if (u > 0.5) {
        y *= 1 + Math.sin(v * Math.PI) * verticalVariation;
      }
    }

    target.set(x, y, z);
  };
};

export function createTuftShape(tuftSize, tuftCount, tuftTipRadius) {
  return function (u, v, target) {
    const theta = u * Math.PI * 2;
    const t = v * 2 - 1;

    const halfHeight = tuftSize;
    const maxRadius = tuftSize / tuftCount;
    const tipRadius = tuftSize * tuftTipRadius;

    const waist = 1 - Math.abs(t);
    const radius = tipRadius + (maxRadius - tipRadius) * waist;

    const x = t * halfHeight;
    const y = Math.cos(theta);
    const z = Math.sin(theta) * radius;

    target.set(x, y, z);
  };
}
