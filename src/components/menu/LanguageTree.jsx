import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { getFamilyLabel } from "../../utils/i18nUtils";
import { getLanguageLabel } from "../../utils/linguisticUtils";
import MiniMesha from "../MiniMesha.jsx";

const LanguageTree = ({
  tree,
  languageCodes,
  languages,
  labelContent,
  selectedLanguage,
  previewLanguageCode,
  buttonRefs,
  onSelectLanguage,
  onFocusLanguage,
  languageColors,
  depth = 0,
  parentKey = "root",
}) => {
  const isMobile = useMediaQuery();

  if (Array.isArray(languageCodes)) {
    return (
      <ul className="languages-in-group" role="list">
        {languageCodes.map((langCode) => {
          const label = getLanguageLabel(langCode, languages, labelContent);

          return (
            <li key={langCode}>
              <button
                ref={(el) => (buttonRefs.current[langCode] = el)}
                style={{
                  background: languageColors[langCode],
                  borderColor: languageColors[langCode],
                }}
                className={`language-item-button ${
                  selectedLanguage === langCode ? "selected" : ""
                } ${
                  previewLanguageCode === langCode ? "previewed" : ""
                } ${!languages[langCode]?.sr ? "todo-item" : ""}`}
                onClick={() => onSelectLanguage(langCode)}
                onFocus={() => onFocusLanguage(langCode)}
              >
                {isMobile && selectedLanguage === langCode && (
                  <MiniMesha languageCode={langCode} />
                )}
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  // Tree mode (old LanguageTree behavior)
  if (!tree) return null;

  return Object.entries(tree).map(([lineage, node]) => {
    const groupKey = `${parentKey}-${lineage}`;

    return (
      <section
        key={groupKey}
        className={`language-group-container lineage-group ${
          depth > 0 ? "nested" : ""
        }`}
      >
        <h3 className="group-header">{getFamilyLabel(lineage)}</h3>

        <LanguageTree
          languageCodes={node.languages || []}
          languages={languages}
          labelContent={labelContent}
          selectedLanguage={selectedLanguage}
          previewLanguageCode={previewLanguageCode}
          buttonRefs={buttonRefs}
          onSelectLanguage={onSelectLanguage}
          onFocusLanguage={onFocusLanguage}
          languageColors={languageColors}
        />

        {Object.keys(node.children || {}).length > 0 && (
          <div className="lineage-children">
            <LanguageTree
              tree={node.children}
              languages={languages}
              labelContent={labelContent}
              selectedLanguage={selectedLanguage}
              previewLanguageCode={previewLanguageCode}
              buttonRefs={buttonRefs}
              onSelectLanguage={onSelectLanguage}
              onFocusLanguage={onFocusLanguage}
              languageColors={languageColors}
              depth={depth + 1}
              parentKey={groupKey}
            />
          </div>
        )}
      </section>
    );
  });
};

export default LanguageTree;
