// utils/deviceUtils.js

const ua = navigator.userAgent;

// True for phones and small tablets — drives layout decisions
export const isMobileUA = /Mobi|Android|iPhone/i.test(ua);

// True for devices likely to struggle with the WebGL scene
export const isLowEnd = isMobileUA && (navigator.hardwareConcurrency ?? 4) <= 6;
