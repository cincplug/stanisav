import { getFamilyLabel } from "../../utils/i18nUtils";
import { getLanguageSelfieUrl } from "../../utils/languageSelfieUtils.js";
import { getLanguageLabel } from "../../utils/linguisticUtils";
import MiniStanisav from "../MiniStanisav.jsx";

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
  isMobile,
}) => {
  if (Array.isArray(languageCodes)) {
    return (
      <ul className="languages-in-group" role="list">
        {languageCodes.map((langCode) => {
          const label = getLanguageLabel(langCode, languages, labelContent);
          const isSelected = selectedLanguage === langCode;
          const colorProperty = isMobile ? "color" : "backgroundColor";

          const Selfie = () => {
            if (!isMobile) return null;
            if (isSelected)
              return (
                <MiniStanisav
                  className="language-selfie"
                  hasSelfieButton={false}
                  languageCode={langCode}
                  position={[0, 0, 100]}
                />
              );
            return (
              <img
                className="language-selfie"
                src={getLanguageSelfieUrl(langCode)}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            );
          };

          return (
            <li key={langCode}>
              <button
                ref={(el) => (buttonRefs.current[langCode] = el)}
                style={
                  isSelected
                    ? null
                    : {
                        [colorProperty]: languageColors[langCode],
                      }
                }
                className={`language-item-button ${
                  isSelected ? "selected" : ""
                } ${previewLanguageCode === langCode ? "previewed" : ""}`}
                onClick={() => onSelectLanguage(langCode)}
                onFocus={() => onFocusLanguage(langCode)}
                aria-current={isSelected ? "true" : undefined}
              >
                <Selfie />
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
          languageCodes={node.languages}
          languages={languages}
          labelContent={labelContent}
          selectedLanguage={selectedLanguage}
          previewLanguageCode={previewLanguageCode}
          buttonRefs={buttonRefs}
          onSelectLanguage={onSelectLanguage}
          onFocusLanguage={onFocusLanguage}
          languageColors={languageColors}
        />

        {Object.keys(node.children).length > 0 && (
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
