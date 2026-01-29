import { Color } from "three";

export function shiftHue(hex, degree) {
  const c = new Color(hex);
  const hsl = c.getHSL({});
  let h = (hsl.h * 360 + degree) % 360;
  if (h < 0) h += 360;
  c.setHSL(h / 360, hsl.s, hsl.l);
  return `#${c.getHexString()}`;
}