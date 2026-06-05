import { Html } from "@react-three/drei";
import { useAppState } from "../../contexts/AppStateContext";
import { config } from "../../modules/configStore";
import "../menu/ux/Popover.css";
import "./SpeechBalloon.css";

const SpeechBalloon = ({ anchorPosition = [0, 4, 0], position }) => {
  const {
    durationBase,
    durationPerCharacter,
    durationDismiss,
    defaultPosition,
  } = config.speechBalloon;

  const { balloonText, setBalloonText } = useAppState();

  if (!balloonText) return null;

  const resolvedPosition = position ?? defaultPosition;
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
        data-position={resolvedPosition}
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
        <div className="popover-tail" data-position={resolvedPosition} />
      </div>
    </Html>
  );
};

export default SpeechBalloon;
