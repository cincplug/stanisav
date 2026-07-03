export const createAudioSurface = ({
  audioBand,
  size,
  bend,
  radius,
  maxDeformation,
  verticalVariation,
  twirl = 0,
  turns = 0,
}) => {
  const frequencyBands = 32;

  return (u, v, target) => {
    const z = (u - 0.5) * size;
    const taper = Math.sin(u * Math.PI);

    const angle = (v - 0.5) * Math.PI;

    const xFlat = (v - 0.5) * size * taper;
    const xCircle = Math.cos(angle) * radius * taper;
    let x = xFlat + (xCircle - xFlat) * bend;

    const yBaseCircle = Math.abs(Math.sin(angle)) * radius * taper;
    let y = yBaseCircle * bend;

    if (turns > 0) {
      const t = (u - 0.5) * 2;
      const theta = t * turns * Math.PI * 2;

      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const x0 = x;
      const y0 = y;

      x = x0 * cos - y0 * sin;
      y = x0 * sin + y0 * cos;

      const currentRadius = Math.sqrt(x * x + y * y);
      const radialDisplacement = twirl * t * currentRadius;
      const radialAngle = Math.atan2(y, x);
      x += Math.cos(radialAngle) * radialDisplacement;
      y += Math.sin(radialAngle) * radialDisplacement;
    }

    if (audioBand) {
      const uForBand = u > 0.5 ? 1 - u : u;
      const bandIndex = Math.floor(uForBand * (frequencyBands - 1));
      const amplitude = audioBand[bandIndex] || 0;
      y += amplitude * maxDeformation * size * taper;

      if (u > 0.5) {
        y *= 1 + Math.sin(v * Math.PI) * verticalVariation;
      }
    }

    target.set(x, y, z);
  };
};

export function createTuftShape(tuftSize, tuftCount) {
  return function (u, v, target) {
    const theta = u * Math.PI * 2;
    const t = v * 2 - 1;

    const maxRadius = tuftSize / tuftCount;

    const radius = maxRadius * t;

    const x = t * tuftSize;
    const y = Math.cos(theta) / 2;
    const z = Math.sin(theta) * radius;

    target.set(x, y, z);
  };
}
