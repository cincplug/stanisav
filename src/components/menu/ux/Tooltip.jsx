import Popover from "./Popover";
import "./Tooltip.css";

/**
 * Tooltip – ⓘ trigger button + anchored popover bubble.
 *
 * @param {string}    id          - Unique ID. Convention: "namespace-descriptor" e.g. "idcard-tonality".
 * @param {ReactNode} children    - Content inside the bubble.
 * @param {string}    label       - Accessible label for the trigger button (aria-label).
 * @param {string}    [position]  - "top" | "bottom" | "left" | "right". Defaults to "top".
 * @param {string}    [className] - Extra class on the trigger button, e.g. "info-link".
 * @param {function}  [triggerRef] - Callback ref for the trigger button for programmatic .click().
 */
const Tooltip = ({
  id,
  children,
  label,
  position = "top",
  className,
  triggerRef,
}) => {
  const anchorName = `--anchor-${id}`;

  return (
    <>
      <button
        type="button"
        className={`tooltip-trigger${className ? ` ${className}` : ""}`}
        popovertarget={id}
        aria-label={label}
        style={{ "--tooltip-anchor-name": anchorName }}
        ref={triggerRef}
      >
        ⓘ
      </button>
      <Popover id={id} position={position}>
        {children}
      </Popover>
    </>
  );
};

export default Tooltip;
