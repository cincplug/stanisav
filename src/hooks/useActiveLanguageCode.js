import { useEffect, useState } from "react";
import { articleSectionIdPrefix } from "../pages/Article/Article.config.js";

// Tracks which language code's section is currently closest to the
// viewport center and returns that code, updating as the user scrolls.
export const useActiveLanguageCode = (
  languageCodes,
  intersectionThresholdAmount,
  intersectionRootMargin,
) => {
  const [activeLanguageCode, setActiveLanguageCode] = useState(
    languageCodes[0],
  );

  useEffect(() => {
    const sectionElements = languageCodes
      .map((languageCode) =>
        document.getElementById(`${articleSectionIdPrefix}${languageCode}`),
      )
      .filter(Boolean);

    const handleIntersect = (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length === 0) return;

      // if more than one section intersects the center band at once,
      // prefer the one closest to the top of the viewport
      const topmostEntry = visibleEntries.reduce((closest, entry) =>
        entry.boundingClientRect.top < closest.boundingClientRect.top
          ? entry
          : closest,
      );

      setActiveLanguageCode(
        topmostEntry.target.id.replace(articleSectionIdPrefix, ""),
      );
    };

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: intersectionThresholdAmount,
      rootMargin: intersectionRootMargin,
    });

    sectionElements.forEach((sectionElement) =>
      observer.observe(sectionElement),
    );

    return () => observer.disconnect();
  }, [languageCodes, intersectionThresholdAmount, intersectionRootMargin]);

  return activeLanguageCode;
};
