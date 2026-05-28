import { Html } from "@react-three/drei";
import { useAppState } from "../../contexts/AppStateContext";
import { config } from "../../config/../modules/configStore";
import "./SpeechBalloon.css";

const SpeechBalloon = ({ anchorPosition = [0, 4, 0] }) => {
  const { durationBase, durationPerCharacter, durationDismiss } =
    config.speechBalloon;

  const { balloonText, setBalloonText } = useAppState();

  if (!balloonText) return null;

  const durationMs = durationBase + balloonText.length * durationPerCharacter;

  return (
    <Html position={anchorPosition} occlude={false} zIndexRange={[0, 0]}>
      <div
        className="speech-balloon"
        style={{
          "--balloon-duration": `${durationMs}ms`,
          "--balloon-dismiss-duration": `${durationDismiss}ms`,
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
