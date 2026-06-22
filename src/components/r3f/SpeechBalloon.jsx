import { Html } from "@react-three/drei";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import "../menu/ux/Popover.css";
import "./SpeechBalloon.css";

const SpeechBalloon = ({ anchorOffset, position }) => {
  const { config } = useConfigContext();
  const { durationBase, durationPerLetter, durationDismiss, defaultPosition } =
    config.speechBalloon;

  const { entranceBalloonText, setEntranceBalloonText } = useEntranceContext();
  const { balloonText } = useLanguageSelectionContext();

  const text = entranceBalloonText || balloonText;

  if (!text) return null;

  const duration = durationBase + text.length * durationPerLetter;

  return (
    <Html
      key={text}
      position={anchorOffset || [0, 0, 0]}
      transform={false}
      occlude={false}
      zIndexRange={[0, 0]}
    >
      <div
        className="speech-balloon"
        data-position={position || defaultPosition}
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
        <div
          className="popover-tail"
          data-position={position || defaultPosition}
        />
      </div>
    </Html>
  );
};

export default SpeechBalloon;
