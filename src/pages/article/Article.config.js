// Order controls both the order sections appear in and the order the
// scroll-observer walks through them.
export const articleLanguageCodes = [
  "vie",
  "que",
  "tur",
  "ita",
  "pol",
  "chr",
  "hun",
];

// threshold of 0 combined with a rootMargin that shrinks the viewport to a
// thin band around its vertical center turns IntersectionObserver into a
// simple scrollspy: whichever section crosses that center band becomes active.
export const intersectionThresholdAmount = 0;
export const intersectionRootMargin = "-45% 0px -45% 0px";

// prefix used to build a section's DOM id from its language code, so the
// id only ever needs to be constructed in one place
export const articleSectionIdPrefix = "section-";
