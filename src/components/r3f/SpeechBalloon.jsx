import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";
import { config } from "../../modules/configStore";
import "../menu/ux/Popover.css";
import "./SpeechBalloon.css";

const SpeechBalloon = ({
  anchorPosition,
  position = config.speechBalloon.defaultPosition,
  balloonText,
}) => {
  const { durationBase, durationPerCharacter, durationDismiss } =
    config.speechBalloon;

  const { entranceBalloonText, setEntranceBalloonText } = useEntranceContext();

  const text = entranceBalloonText || balloonText;

  const { camera, size } = useThree();
  const rootRef = useRef();
  const vec = new Vector3();

  useThrottledFrame(() => {
    if (!rootRef.current || !text) return;

    vec.copy(anchorPosition).project(camera);

    const x = (vec.x * 0.5 + 0.5) * size.width;
    const y = (vec.y * -0.5 + 0.5) * size.height;

    rootRef.current.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });

  if (!text) return null;

  const duration = durationBase + text.length * durationPerCharacter;

  return (
    <Html key={text} transform={false} occlude={false} zIndexRange={[0, 0]}>
      <div ref={rootRef} className="speech-balloon-root">
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
      </div>
    </Html>
  );
};

export default SpeechBalloon;
