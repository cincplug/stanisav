import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import languages from "../../config/languages.json";
import SourceVideoCard from "./SourceVideoCard";
import "../../index.css";
import "./SourceVideoGallery.css";

const SourceVideoGallery = () => {
  const { locale } = useParams();

  useEffect(() => {
    document.body.classList.add("svgallery-body");
    return () => {
      document.body.classList.remove("svgallery-body");
    };
  }, []);

  return (
    <div className="svgallery-container">
      <Link className="home-link" to={`/${locale}`}>
        Back to main page
      </Link>
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
