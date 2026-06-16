import { Html } from "@react-three/drei";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { config } from "../../modules/configStore";
import "../menu/ux/Popover.css";
import "./SpeechBalloon.css";

// anchorOffset: [x, y, z] in Mesha's local space — places the tail origin
// (e.g. [0, eyeY, eyeZ] to anchor near the eyes).
// CSS handles the final visual offset from that anchor point.
const SpeechBalloon = ({
  anchorOffset = config.speechBalloon.defaultAnchorOffset,
  position = config.speechBalloon.defaultPosition,
  balloonText,
}) => {
  const { durationBase, durationPerCharacter, durationDismiss } =
    config.speechBalloon;

  const { entranceBalloonText, setEntranceBalloonText } = useEntranceContext();

  const text = entranceBalloonText || balloonText;

  if (!text) return null;

  const duration = durationBase + text.length * durationPerCharacter;

  return (
    // position prop places the Html anchor in Mesha's local space,
    // so the balloon follows Mesha through orbit, spring, and salto
    <Html
      key={text}
      position={anchorOffset}
      transform={false}
      occlude={false}
      zIndexRange={[0, 0]}
    >
      <div
        className="speech-balloon"
        data-position={position}
        style={{
          "--balloon-duration": `${duration}ms`,
          "--balloon-dismiss-duration": `${durationDismiss}ms`,
        }}
        onAnimationEnd={(e) => {
          if (e.animationName === "balloon-dismiss" && entranceBalloonText)
            setEntranceBalloonText("");
        }}
      >
        <div className="speech-balloon-bubble popover-bubble">
          <p>{text}</p>
        </div>
        <div className="popover-tail" data-position={position} />
      </div>
    </Html>
  );
};

export default SpeechBalloon;
