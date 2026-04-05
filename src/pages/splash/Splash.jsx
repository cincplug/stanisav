import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";
import { useAppState } from "../../contexts/AppStateContext";
import Mesha from "../../components/r3f/Mesha";
import LocaleLinks from "../../components/menu/LocaleLinks";
import { useI18n } from "../../contexts/I18nContext";
import moodsConfig from "../../config/moodsConfig.json";
import "./Splash.css";

const baseLinguisticProperties = {
  tonality: "tonal",
  morphology: "fusional",
  wordOrderFlexibility: "flexible",
  wordOrder: "SOV",
  verbAspect: "complex",
  evidentiality: "direct-indirect",
  caseCount: 6,
  phonemeCount: 40,
  maxClusterSize: 3,
  nounClassCount: 3,
};

const Splash = () => {
  const { controls } = useControls();
  const { handleMoodSelect } = useAppState();
  const { t } = useI18n();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = controls;
  const [rememberChoice, setRememberChoice] = useState(false);

  const moods = moodsConfig.moods.map((mood) => ({
    id: mood.id,
    title: t(mood.titleKey),
    description: t(mood.descriptionKey),
    cta: t(mood.ctaKey),
  }));

  const handleSelect = (moodId) => {
    handleMoodSelect(moodId, rememberChoice);
  };

  return (
    <div className="splash">
      <main className="splash-content" role="main">
        <div className="splash-hero">
          <div className="splash-mesha" aria-hidden="true">
            <Canvas
              camera={{
                position: [cameraX, cameraY, cameraZ],
                fov,
                near,
                far,
              }}
              gl={{ antialias: true, clearColor: bgColor }}
            >
              <color attach="background" args={[bgColor]} />
              <Mesha
                linguisticProperties={baseLinguisticProperties}
                color="#0057b7"
                position={[0, -5, 100]}
                isMyMesha={false}
                looksAround
                stripesType={2}
              />
            </Canvas>
          </div>

          <h1 className="splash-title">Mesha</h1>
          <p className="splash-description">{t("splash.description")}</p>
        </div>

        <section className="splash-moods" aria-label={t("splash.moods.label")}>
          <h2 className="sr-only">{t("splash.moods.heading")}</h2>
          <div className="splash-cards">
            {moods.map((mood) => (
              <article key={mood.id} className="splash-card">
                <h3 className="splash-card-title">{mood.title}</h3>
                <p className="splash-card-description">{mood.description}</p>
                <button
                  className="splash-card-cta"
                  onClick={() => handleSelect(mood.id)}
                  aria-label={`${mood.title}: ${mood.cta}`}
                >
                  {mood.cta}
                </button>
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
        </section>

        <footer className="splash-footer">
          <LocaleLinks />
        </footer>
      </main>
    </div>
  );
};

export default Splash;
