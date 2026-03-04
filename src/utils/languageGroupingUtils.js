export function buildLanguageTree(languageCodes, languageData, lineagesConfig) {
  const tree = {};

  languageCodes.forEach((langCode) => {
    const lineageKey = languageData?.[langCode]?.lineageKey;
    if (!lineageKey) return;

    const lineagePath = lineagesConfig?.[lineageKey]
      ? [...lineagesConfig[lineageKey], lineageKey]
      : [lineageKey];

    let node = tree;
    lineagePath.forEach((level, idx) => {
      if (!node[level]) {
        node[level] = { children: {}, languages: [] };
      }

      if (idx === lineagePath.length - 1) {
        node[level].languages.push(langCode);
      }

      node = node[level].children;
    });
  });

  return tree;
}
