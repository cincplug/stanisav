import { useEffect, useRef } from "react";
import "./Popover.css";

/**
 * Popover – styled bubble with tail, shown/hidden imperatively via popoverRef.
 *
 * @param {string}            id          - Unique ID for the popover element.
 * @param {string}            [position]  - "top" | "bottom" | "left" | "right". Only relevant
 *                                          when not using followMouse; controls tail direction.
 * @param {string}            [className]
 * @param {ref|function}      popoverRef  - Ref object or callback ref for imperative show/hide.
 * @param {boolean}           [followMouse] - If true, popover tracks mouse position instead of
 *                                            anchoring to a trigger element.
 * @param {ReactNode}         children
 */
const Popover = ({
  id,
  position,
  className,
  popoverRef,
  followMouse,
  children,
}) => {
  const internalRef = useRef(null);

  const setRef = (el) => {
    internalRef.current = el;
    if (typeof popoverRef === "function") popoverRef(el);
    else if (popoverRef) popoverRef.current = el;
  };

  useEffect(() => {
    if (!followMouse) return;
    const popover = internalRef.current;
    if (!popover) return;

    const onMove = (e) => {
      if (!popover.matches(":popover-open")) return;
      popover.style.position = "fixed";
      popover.style.margin = "0";
      popover.style.left = `${e.clientX}px`;
      popover.style.top = `${e.clientY - popover.offsetHeight - 12}px`;
      popover.style.translate = "-50% 0";
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [followMouse]);

  return (
    <div
      id={id}
      ref={setRef}
      popover="auto"
      className={`tooltip-popover popover-bubble ${className ? ` ${className}` : ""}`}
      data-position={position}
    >
      {children}
    </div>
  );
};

export default Popover;
