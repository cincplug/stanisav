import "./Tooltip.css";

const Tooltip = ({ id, children, label }) => {
  const anchorName = `--anchor-${id}`;

  return (
    <>
      <style>{`
        #trigger-${id} { anchor-name: ${anchorName}; }
        #${id} { position-anchor: ${anchorName}; }
      `}</style>
      <button
        id={`trigger-${id}`}
        type="button"
        className="info-link filter-group-info"
        popovertarget={id}
        aria-label={label}
      >
        ⓘ
      </button>
      <div id={id} popover="auto" className="tooltip-popover">
        {children}
      </div>
    </>
  );
};

export default Tooltip;
