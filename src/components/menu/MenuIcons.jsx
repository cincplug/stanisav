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

export const LoopIcon = (props) => (
  <svg
    width={iconSize}
    height={iconSize}
    viewBox={viewBox}
    fill="none"
    {...props}
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
