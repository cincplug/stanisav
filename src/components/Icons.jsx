const iconColor = "var(--color-4)";
const iconSize = 24;
const viewBox = `0 0 ${iconSize} ${iconSize}`;
const strokeWidth = "var(--border-width-thin)";

export const HomeIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M2 12 L12 2 L22 12 M20 12 L20 20 L14 20 L14 16 L10 16 L10 20 L4 20 L4 12"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const BurgerIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M3 12H21M3 6H21M3 18H21"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const CloseIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const PlayIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <polygon points="7,3 21,12 7,21" fill={iconColor} />
  </svg>
);

export const PauseIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <rect x="6" y="5" width="4" height="14" fill={iconColor} />
    <rect x="14" y="5" width="4" height="14" fill={iconColor} />
  </svg>
);

export const BeginIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <polygon points="7,12 17,5 17,19" fill={iconColor} />
    <rect x="3" y="5" width={strokeWidth} height="14" fill={iconColor} />
  </svg>
);

export const PrevIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <polygon points="18,5 10,12 18,19" fill={iconColor} />
    <polygon points="14,5 6,12 14,19" fill={iconColor} />
  </svg>
);

export const NextIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <polygon points="6,5 14,12 6,19" fill={iconColor} />
    <polygon points="10,5 18,12 10,19" fill={iconColor} />
  </svg>
);

export function LoopIcon({ selected, ...props }) {
  return (
    <svg
      {...props}
      className={selected ? "loop-icon selected" : "loop-icon"}
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      fill="none"
    >
      {/* Top semicircle arrow (clockwise) */}
      <path
        d="M18 9C18 6.5 16 4 12 4C8 4 6 6 6 8"
        stroke={iconColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {/* Equilateral triangle pointing down-left at end of top arc */}
      <polygon points="9,8 3,8 6,11.5" fill={iconColor} />

      {/* Bottom semicircle arrow (clockwise) */}
      <path
        d="M6 15C6 17.5 8 20 12 20C16 20 18 18 18 16"
        stroke={iconColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {/* Equilateral triangle pointing up-right at end of bottom arc */}
      <polygon points="15,16 21,16 18,12.5" fill={iconColor} />
    </svg>
  );
}

export const ExpandIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M5 10L12 16L19 10"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GlobeIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Outer circle */}
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />

    {/* Equator */}
    <line
      x1="4"
      y1="12"
      x2="20"
      y2="12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />

    {/* Meridians */}
    <path
      d="M12 4C16 7 16 17 12 20 C8 17 8 7 12 4Z"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      fill="none"
    />
  </svg>
);
export const CircleIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <circle cx="12" cy="12" r="8" fill={iconColor} stroke="none" />
  </svg>
);

export const BlackboardIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <rect x="4" y="4" width="7" height="7" stroke={iconColor} />
    <rect x="4" y="14" width="7" height="6" stroke={iconColor} />
    <rect x="14" y="4" width="7" height="4" stroke={iconColor} />
    <rect x="14" y="11" width="7" height="9" stroke={iconColor} />
  </svg>
);

export const DirectionIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Up arrow */}
    <path d="M12 6L8 10H16L12 6Z" fill={iconColor} />

    {/* Down arrow */}
    <path d="M12 18L16 14H8L12 18Z" fill={iconColor} />
  </svg>
);

export const SortIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Up arrow on the left */}
    <line
      x1="8"
      y1="20"
      x2="8"
      y2="4"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon
      points="8,4 5,8 11,8"
      fill={iconColor}
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />

    {/* Down arrow on the right */}
    <line
      x1="16"
      y1="4"
      x2="16"
      y2="20"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon
      points="16,20 13,16 19,16"
      fill={iconColor}
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const spiralRatioIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M2 12 Q6 4 10 12 Q14 20 18 12 Q20 8 22 12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const LightIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Center circle */}
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
    {/* 8 rays */}
    <line
      x1="12"
      y1="2"
      x2="12"
      y2="5"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="19"
      x2="12"
      y2="22"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="2"
      y1="12"
      x2="5"
      y2="12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="19"
      y1="12"
      x2="22"
      y2="12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="4.9"
      y1="4.9"
      x2="7.1"
      y2="7.1"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="16.9"
      y1="16.9"
      x2="19.1"
      y2="19.1"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="19.1"
      y1="4.9"
      x2="16.9"
      y2="7.1"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="7.1"
      y1="16.9"
      x2="4.9"
      y2="19.1"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const SpinIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Single arc ~300°: starts bottom-left, sweeps clockwise to top-right */}
    <path
      d="M6 19 A9 9 0 1 1 19 7"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
    {/* Arrowhead tangent to arc end, pointing up-right */}
    <polygon points="21,6 16,8 20,11" fill={iconColor} />
  </svg>
);

export const RefreshIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Thick ring with a triangular notch forming the arrowhead */}
    <path d="M12 1.5 a10.5 10.5 0 1 0 9.5 6 h-2.48 A8.25 8.25 0 1 1 12 3.75 V0 l4.5 4 -4.5 3 V2 A9 9 0 0 1 12 1.5Z" />
  </svg>
);

export const HueIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <g transform="translate(12,12)">
      <path d="M0,0 L0,-9 A9,9,0,0,1,4.5,-7.8Z" fill="#FF0000" />
      <path d="M0,0 L4.5,-7.8 A9,9,0,0,1,7.8,-4.5Z" fill="#FF6600" />
      <path d="M0,0 L7.8,-4.5 A9,9,0,0,1,9,0Z" fill="#FFCC00" />
      <path d="M0,0 L9,0 A9,9,0,0,1,7.8,4.5Z" fill="#AADD00" />
      <path d="M0,0 L7.8,4.5 A9,9,0,0,1,4.5,7.8Z" fill="#00CC00" />
      <path d="M0,0 L4.5,7.8 A9,9,0,0,1,0,9Z" fill="#00CCAA" />
      <path d="M0,0 L0,9 A9,9,0,0,1,-4.5,7.8Z" fill="#0099FF" />
      <path d="M0,0 L-4.5,7.8 A9,9,0,0,1,-7.8,4.5Z" fill="#0055FF" />
      <path d="M0,0 L-7.8,4.5 A9,9,0,0,1,-9,0Z" fill="#6600FF" />
      <path d="M0,0 L-9,0 A9,9,0,0,1,-7.8,-4.5Z" fill="#AA00FF" />
      <path d="M0,0 L-7.8,-4.5 A9,9,0,0,1,-4.5,-7.8Z" fill="#FF00AA" />
      <path d="M0,0 L-4.5,-7.8 A9,9,0,0,1,0,-9Z" fill="#FF0055" />
      {/* Center cutout to make a donut */}
      <circle cx="0" cy="0" r="3.5" fill="black" />
    </g>
  </svg>
);

export const LightnessIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* White (light) left half */}
    <path d="M12 3 A9 9 0 0 0 12 21 Z" fill={iconColor} />
    {/* Full circle outline */}
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
    {/* Dividing line */}
    <line
      x1="12"
      y1="3"
      x2="12"
      y2="21"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const SaturationIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* 5 vertical bars of increasing height, baseline-aligned at y=20 */}
    <rect x="2" y="17" width="2.5" height="3" fill={iconColor} opacity="0.25" />
    <rect x="6" y="14" width="2.5" height="6" fill={iconColor} opacity="0.45" />
    <rect
      x="10"
      y="10"
      width="2.5"
      height="10"
      fill={iconColor}
      opacity="0.65"
    />
    <rect
      x="14"
      y="6"
      width="2.5"
      height="14"
      fill={iconColor}
      opacity="0.82"
    />
    <rect x="18" y="3" width="2.5" height="17" fill={iconColor} />
  </svg>
);

export const SwitchDurationIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Left frame */}
    <rect
      x="1"
      y="5"
      width="8"
      height="14"
      rx="1"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
    <rect
      x="3"
      y="7"
      width="4"
      height="3"
      rx="0.5"
      stroke={iconColor}
      strokeWidth={1}
      opacity="0.5"
    />
    <line
      x1="3"
      y1="12"
      x2="7"
      y2="12"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.5"
    />
    <line
      x1="3"
      y1="14"
      x2="6"
      y2="14"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Right frame */}
    <rect
      x="15"
      y="5"
      width="8"
      height="14"
      rx="1"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
    <rect
      x="17"
      y="7"
      width="4"
      height="3"
      rx="0.5"
      stroke={iconColor}
      strokeWidth={1}
      opacity="0.5"
    />
    <line
      x1="17"
      y1="12"
      x2="21"
      y2="12"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.5"
    />
    <line
      x1="17"
      y1="14"
      x2="20"
      y2="14"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Arrow between frames */}
    <line
      x1="10"
      y1="12"
      x2="13.5"
      y2="12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="15,12 12,10.5 12,13.5" fill={iconColor} />
  </svg>
);

export const ZoomDistanceIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Outer circle */}
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
    {/* Inner circle */}
    <circle
      cx="12"
      cy="12"
      r="3.5"
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
    {/* 4 corner arrows pointing inward toward center */}
    <line
      x1="5.5"
      y1="5.5"
      x2="9"
      y2="9"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="9,9 7,6.5 11.5,7" fill={iconColor} />
    <line
      x1="18.5"
      y1="5.5"
      x2="15"
      y2="9"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="15,9 12.5,7 17,6.5" fill={iconColor} />
    <line
      x1="5.5"
      y1="18.5"
      x2="9"
      y2="15"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="9,15 7,17.5 11.5,17" fill={iconColor} />
    <line
      x1="18.5"
      y1="18.5"
      x2="15"
      y2="15"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="15,15 12.5,17 17,17.5" fill={iconColor} />
  </svg>
);

export const TensionIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Left anchor line */}
    <line
      x1="1"
      y1="12"
      x2="3.5"
      y2="12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Zigzag spring */}
    <polyline
      points="3.5,12 5.5,7 8,17 10.5,7 13,17 15.5,7 18,17 20,12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right anchor line */}
    <line
      x1="20"
      y1="12"
      x2="23"
      y2="12"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const FrictionIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Two horizontal parallel lines */}
    <line
      x1="2"
      y1="9"
      x2="22"
      y2="9"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="2"
      y1="15"
      x2="22"
      y2="15"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Diagonal hatching between the lines */}
    <line
      x1="5"
      y1="9"
      x2="2"
      y2="15"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="9"
      y1="9"
      x2="6"
      y2="15"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="13"
      y1="9"
      x2="10"
      y2="15"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="17"
      y1="9"
      x2="14"
      y2="15"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="21"
      y1="9"
      x2="18"
      y2="15"
      stroke={iconColor}
      strokeWidth={1}
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);
