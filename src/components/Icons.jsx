const iconColor = "var(--color-4)";
const iconSize = 24;
const viewBox = `0 0 ${iconSize} ${iconSize}`;
const strokeWidth = 2;

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
    <polygon points="16,5 8,12 16,19" fill={iconColor} />
    <polygon points="12,5 4,12 12,19" fill={iconColor} />
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
    <polygon points="8,5 16,12 8,19" fill={iconColor} />
    <polygon points="12,5 20,12 12,19" fill={iconColor} />
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

export const ChevronIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M5 10L12 17L19 10"
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
    <rect x="4" y="4" width="7" height="7" fill={iconColor} />
    <rect x="4" y="14" width="7" height="6" fill={iconColor} />
    <rect x="14" y="4" width="7" height="4" fill={iconColor} />
    <rect x="14" y="11" width="7" height="9" fill={iconColor} />
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
      y2="5"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon
      points="8,5 6,8 10,8"
      fill={iconColor}
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />

    {/* Down arrow on the right */}
    <line
      x1="16"
      y1="5"
      x2="16"
      y2="20"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon
      points="16,20 14,17 18,17"
      fill={iconColor}
      stroke={iconColor}
      strokeWidth={strokeWidth}
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
    <path d="M12 4a8 8 0 1 0 7.2 11.5l-1.9-.8A6 6 0 1 1 12 6v3l4-3.5L12 2v2Z" />
  </svg>
);

export const SelfieIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    {/* Camera body */}
    <rect
      x="4"
      y="7"
      width="16"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />

    {/* Viewfinder / shutter bump */}
    <rect x="8" y="5" width="4" height="2" rx="1" fill="currentColor" />

    {/* Lens */}
    <circle
      cx="12"
      cy="13"
      r="3.5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const EyeIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <path
      d="M2 12C4.5 7 8 5 12 5S19.5 7 22 12C19.5 17 16 19 12 19S4.5 17 2 12ZM12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7Z"
      fill={iconColor}
      fillRule="evenodd"
    />
  </svg>
);
