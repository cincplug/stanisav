const iconColor = "#fff";

export const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12H21M3 6H21M3 18H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="8,5 20,12 8,19" fill={iconColor} />
  </svg>
);

export const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" fill={iconColor} />
    <rect x="14" y="5" width="4" height="14" fill={iconColor} />
  </svg>
);

export const BeginIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="7,12 17,5 17,19" fill={iconColor} />
    <rect x="3" y="5" width="3" height="14" fill={iconColor} />
  </svg>
);

export const PrevIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18,5 10,12 18,19" fill={iconColor} />
    <polygon points="14,5 6,12 14,19" fill={iconColor} />
  </svg>
);

export const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="6,5 14,12 6,19" fill={iconColor} />
    <polygon points="10,5 18,12 10,19" fill={iconColor} />
  </svg>
);

export const LoopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Top semicircle arrow (clockwise) */}
    <path
      d="M19 9C19 6.5 17 4 13 4C9 4 7 6 7 8"
      stroke={iconColor}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <polygon points="19,9 17,6 21,7" fill={iconColor} />

    {/* Bottom semicircle arrow (clockwise) */}
    <path
      d="M5 15C5 17.5 7 20 11 20C15 20 17 18 17 16"
      stroke={iconColor}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <polygon points="5,15 7,18 3,17" fill={iconColor} />
  </svg>
);
