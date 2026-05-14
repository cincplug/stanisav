import { getLanguageLabel } from "../../utils/languageDisplayUtils";
import { getFamilyLabel } from "../../utils/i18nUtils";
import MiniMesha from "../r3f/MiniMesha.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

const LanguageTree = ({
  tree,
  languages,
  languageData,
  labelContent,
  selectedLanguage,
  buttonRefs,
  onSelectLanguage,
  languageColors,
  depth = 0,
  parentKey = "root",
}) => {
  const isMobile = useMediaQuery();

  const selectedLinguisticProperties = languageData?.[selectedLanguage];
  const selectedColor = languageColors[selectedLanguage];

  if (Array.isArray(languages)) {
    return (
      <ul className="languages-in-group" role="list">
        {languages.map((langCode) => {
          const label = getLanguageLabel(langCode, languageData, labelContent);

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
                } ${!languageData[langCode]?.sr ? "todo-item" : ""}`}
                onClick={() => onSelectLanguage(langCode)}
              >
                {isMobile && selectedLanguage === langCode && (
                  <MiniMesha
                    languageCode={langCode}
                    linguisticProperties={selectedLinguisticProperties}
                    color={selectedColor}
                  />
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
          languages={node.languages || []}
          languageData={languageData}
          labelContent={labelContent}
          selectedLanguage={selectedLanguage}
          buttonRefs={buttonRefs}
          onSelectLanguage={onSelectLanguage}
          languageColors={languageColors}
        />

        {Object.keys(node.children || {}).length > 0 && (
          <div className="lineage-children">
            <LanguageTree
              tree={node.children}
              languageData={languageData}
              labelContent={labelContent}
              selectedLanguage={selectedLanguage}
              buttonRefs={buttonRefs}
              onSelectLanguage={onSelectLanguage}
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
