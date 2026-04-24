import "./Tooltip.css";

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
      <div
        id={id}
        popover="auto"
        className="tooltip-popover"
        data-position={position}
        style={{ "--tooltip-anchor-name": anchorName }}
      >
        {children}
      </div>
    </>
  );
};

export default Tooltip;
