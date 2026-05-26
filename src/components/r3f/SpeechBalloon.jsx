import { Html } from "@react-three/drei";
import { useAppState } from "../../contexts/AppStateContext";
import sceneConfig from "../../config/sceneConfig.json";
import "./SpeechBalloon.css";

const SpeechBalloon = ({ anchorPosition = [0, 4, 0] }) => {
  const {
    balloonDurationBase,
    balloonDurationPerCharacter,
    balloonDurationDismiss,
  } = sceneConfig;

  const { balloonText, setBalloonText } = useAppState();

  if (!balloonText) return null;

  const durationMs =
    balloonDurationBase + balloonText.length * balloonDurationPerCharacter;

  return (
    <Html position={anchorPosition} occlude={false} zIndexRange={[100, 0]}>
      <div
        className="speech-balloon"
        style={{
          "--balloon-duration": `${durationMs}ms`,
          "--balloon-dismiss-duration": `${balloonDurationDismiss}ms`,
        }}
        onAnimationEnd={(e) => {
          if (e.animationName === "balloon-dismiss") setBalloonText("");
        }}
      >
        <div className="speech-balloon-bubble popover-bubble">
          <p>{balloonText}</p>
        </div>
        <div className="speech-balloon-tail" />
      </div>
    </Html>
  );
};

export default SpeechBalloon;
