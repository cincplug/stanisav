export const StopIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <rect
      x="6"
      y="6"
      width="12"
      height="12"
      fill={iconColor}
      stroke={iconColor}
      strokeWidth={strokeWidth}
    />
  </svg>
);
const iconColor = "#fff";
const iconSize = 24;
const viewBox = `0 0 ${iconSize} ${iconSize}`;
const strokeWidth = 1.5;

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
    <polygon points="8,5 20,12 8,19" fill={iconColor} />
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
      d="M4 11L12 18L20 11"
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
      d="M12 4C9 7 9 17 12 20C15 17 15 7 12 4Z"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      fill="none"
    />
    <path
      d="M12 4C14.5 7 14.5 17 12 20C9.5 17 9.5 7 12 4Z"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      fill="none"
    />
  </svg>
);

export const SegmentationIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
  >
    <rect x="4" y="5" width="7" height="6" stroke={iconColor} />
    <rect x="13" y="4" width="7" height="10" stroke={iconColor} />
    <rect x="6" y="14" width="12" height="6" stroke={iconColor} />
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
      y1="17"
      x2="8"
      y2="7"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="8,4 5,8 11,8" fill={iconColor} />

    {/* Down arrow on the right */}
    <line
      x1="16"
      y1="7"
      x2="16"
      y2="17"
      stroke={iconColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <polygon points="16,20 13,16 19,16" fill={iconColor} />
  </svg>
);
