import { Color } from "three";

export function shiftHue(hex, degree) {
  let c = new Color(hex);
  let { h, s, l } = c.getHSL({});
  h = (h * 360 + degree) % 360;
  if (h < 0) h += 360;
  c.setHSL(h / 360, s, l);
  return `#${c.getHexString()}`;
}
