import React from "react";

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
    <polygon points="8,5 20,12 8,19" fill="currentColor" />
  </svg>
);

export const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" fill="currentColor" />
    <rect x="14" y="5" width="4" height="14" fill="currentColor" />
  </svg>
);

export const BeginIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="7,12 17,5 17,19" fill="currentColor" />
    <rect x="3" y="5" width="3" height="14" fill="currentColor" />
  </svg>
);

export const PrevIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18,5 10,12 18,19" fill="currentColor" />
    <polygon points="14,5 6,12 14,19" fill="currentColor" opacity="0.7" />
  </svg>
);

export const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="6,5 14,12 6,19" fill="currentColor" />
    <polygon points="10,5 18,12 10,19" fill="currentColor" opacity="0.7" />
  </svg>
);

export const LoopIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 7C7 5.89543 7.89543 5 9 5H15M17 7L15 5L17 3"
      stroke={active ? "#ee4422" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 17C17 18.1046 16.1046 19 15 19H9M7 17L9 19L7 21"
      stroke={active ? "#ee4422" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
