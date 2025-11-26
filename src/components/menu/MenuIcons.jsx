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
    <polygon points="8,5 20,12 8,19" fill="#fff" />
  </svg>
);

export const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" fill="#fff" />
    <rect x="14" y="5" width="4" height="14" fill="#fff" />
  </svg>
);

export const BeginIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="7,12 17,5 17,19" fill="#fff" />
    <rect x="3" y="5" width="3" height="14" fill="#fff" />
  </svg>
);

export const PrevIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18,5 10,12 18,19" fill="#fff" />
    <polygon points="14,5 6,12 14,19" fill="#fff" />
  </svg>
);

export const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="6,5 14,12 6,19" fill="#fff" />
    <polygon points="10,5 18,12 10,19" fill="#fff" />
  </svg>
);

export const LoopIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 17A5 5 0 1 1 12 7h4"
      stroke={active ? "#ee44aa" : "#fff"}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polygon points="18,7 16,5 16,9" fill={active ? "#ee44aa" : "#fff"} />
    <path
      d="M17 7A5 5 0 1 1 12 17h-4"
      stroke={active ? "#ee44aa" : "#fff"}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polygon points="6,17 8,19 8,15" fill={active ? "#ee44aa" : "#fff"} />
  </svg>
);
