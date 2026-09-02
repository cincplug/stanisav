import { Canvas } from "@react-three/fiber";
import { useAppStateContext } from "../contexts/AppStateContext.jsx";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useI18nContext } from "../contexts/I18nContext.jsx";
import Stanisav from "./scene/stanisav/Stanisav.jsx";

const StickyStanisav = ({ languageCode, describedById }) => {
  const { config } = useConfigContext();
  const { data } = useAppStateContext();
  const { t } = useI18nContext();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor, stanisavSpin } =
    config;

  // t() gives the localized name when a translation exists for this code;
  // languages.json's plain-English "name" is the fallback otherwise
  const languageName = t(languageCode) ?? data?.languages?.[languageCode]?.name;

  return (
    <div
      className="sticky-stanisav"
      role="img"
      aria-label={`3D visualization of ${languageName}'s linguistic properties`}
      aria-describedby={describedById}
    >
      <Canvas
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov,
          near,
          far,
        }}
        gl={{ antialias: true, clearColor: bgColor, alpha: true }}
      >
        <Stanisav
          languageCode={languageCode}
          position={[0, -3, 102]}
          isMyStanisav={false}
          spin={stanisavSpin}
        />
      </Canvas>
    </div>
  );
};

export default StickyStanisav;
