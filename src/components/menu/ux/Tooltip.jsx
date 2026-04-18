import "./Tooltip.css";

const Tooltip = ({ id, children, label, position = "top" }) => {
  const anchorName = `--anchor-${id}`;

  return (
    <>
      <button
        type="button"
        className="info-link filter-group-info"
        popovertarget={id}
        aria-label={label}
        style={{ "--tooltip-anchor-name": anchorName }}
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
