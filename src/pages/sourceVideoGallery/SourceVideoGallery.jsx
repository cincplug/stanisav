import { useEffect } from "react";
import languages from "../../config/languages.json";
import SourceVideoCard from "./SourceVideoCard";
import "../../index.css";
import "./SourceVideoGallery.css";

const SourceVideoGallery = () => {
  useEffect(() => {
    document.body.classList.add("svgallery-body");
    return () => {
      document.body.classList.remove("svgallery-body");
    };
  }, []);

  return (
    <div className="svgallery-container">
      <a className="home-link" href="/">
        Back to main page
      </a>
      <h1 className="svgallery-title">Source Video's Gallery</h1>
      <div className="svgallery-grid">
        {Object.entries(languages).map(([code, lang]) => (
          <SourceVideoCard key={code} language={{ code, ...lang }} />
        ))}
      </div>
    </div>
  );
};

export default SourceVideoGallery;
