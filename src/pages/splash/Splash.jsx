import { useState } from "react";
import { useAppState } from "../../contexts/AppStateContext";
import LocaleLinks from "../../components/menu/LocaleLinks";
import { useI18n } from "../../contexts/I18nContext";
import moodsConfig from "../../config/moodsConfig.json";
import "./Splash.css";

const Splash = () => {
  const { handleMoodSelect } = useAppState();
  const { t } = useI18n();
  const [rememberChoice, setRememberChoice] = useState(false);

  const moods = moodsConfig.moods.map((mood) => ({
    id: mood.id,
    title: t(mood.titleKey),
    description: t(mood.descriptionKey),
  }));

  const handleSelect = (moodId) => {
    handleMoodSelect(moodId, rememberChoice);
  };

  return (
    <div className="splash screenreader-only">
      <main className="splash-content" role="main">
        <p className="splash-description">{t("splash.description")}</p>

        <section className="splash-moods">
          <div className="splash-cards">
            {moods.map((mood) => (
              <article key={mood.id} className="splash-card">
                <button
                  className="splash-card-cta"
                  onClick={() => handleSelect(mood.id)}
                >
                  {mood.title}
                </button>
                <p className="splash-card-description">{mood.description}</p>
              </article>
            ))}
          </div>

          <div className="splash-remember">
            <label>
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
              />
              {t("splash.rememberChoice")}
            </label>
          </div>
          <div className="locale-wrap">
            <LocaleLinks />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Splash;
