import { Html } from "@react-three/drei";
import { useAppStateContext } from "../../contexts/AppStateContext";
import { config } from "../../modules/configStore";
import "../menu/ux/Popover.css";
import "./SpeechBalloon.css";

const SpeechBalloon = ({
  anchorPosition = [0, 4, 0],
  position = config.speechBalloon.defaultPosition,
}) => {
  const { durationBase, durationPerCharacter, durationDismiss } =
    config.speechBalloon;

  const { balloonText, setBalloonText } = useAppStateContext();

  if (!balloonText) return null;

  const durationMs = durationBase + balloonText.length * durationPerCharacter;

  return (
    <Html
      key={balloonText}
      position={anchorPosition}
      occlude={false}
      zIndexRange={[0, 0]}
    >
      <div
        className="speech-balloon"
        data-position={position}
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
        <div className="popover-tail" data-position={position} />
      </div>
    </Html>
  );
};

export default SpeechBalloon;
