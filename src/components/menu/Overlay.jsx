import "./Overlay.css";

const LoadingOverlay = ({ variant = "loading" }) => {
  const isLoading = variant === "loading";
  const isEmptyFilter = variant === "emptyFilter";

  return (
    <div className="overlay">
      <div className="loading-content">
        {isLoading && (
          <svg className="loading-spinner" viewBox="0 0 50 50">
            <circle
              className="loading-circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            />
          </svg>
        )}
        <h1 className="loading-text">
          {isLoading && (
            <>
              Quot linguas calles
              <br />
              tot homines vales
            </>
          )}
          {isEmptyFilter && (
            <>
              No languages for that
              <br />
              filter combination
            </>
          )}
        </h1>
      </div>
    </div>
  );
};

export default LoadingOverlay;
