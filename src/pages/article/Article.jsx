import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Markdown from "react-markdown";
import { useAppStateContext } from "../../contexts/AppStateContext";
import { useI18nContext } from "../../contexts/I18nContext";
import { useSelfieCapture } from "../../hooks/useSelfieCapture";
import readme from "../../../README.md?raw";
import "../../index.css";
import "./Article.css";
import { ChevronIcon } from "../../components/Icons";
import MiniStanisav from "../../components/MiniStanisav";

const ArticleImage = ({ src, alt, ...props }) => (
  <img src={src?.replace(/^public\//, "/")} alt={alt} {...props} />
);

const Article = () => {
  // URL slug (e.g. "nl"), used only to build the back-to-main-page link
  const { locale: urlLocale } = useParams();
  // ISO 639-3 code (e.g. "nld"), used to pick Stanisav's facial features
  const { locale: iso3Locale } = useI18nContext();
  const { data } = useAppStateContext();
  const languages = Object.keys(data?.languages || {});

  const [stanisavLocale, setStanisavLocale] = useState(iso3Locale);

  const [searchParams] = useSearchParams();
  // With ?capture=1, scripts/capture-selfies.js drives this page headlessly.
  const isCaptureMode = searchParams.get("capture") === "1";

  useSelfieCapture({
    isEnabled: isCaptureMode,
    languageCode: stanisavLocale,
    languages,
    setLanguageCode: setStanisavLocale,
  });

  useEffect(() => {
    document.body.classList.add("article-body");
    return () => {
      document.body.classList.remove("article-body");
    };
  }, []);

  const getNextStanisav = () => {
    if (!languages || languages.length === 0) return;
    const currentIndex = languages.indexOf(stanisavLocale);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % languages.length;
    setStanisavLocale(languages[nextIndex]);
  };

  return (
    <>
      <div className="home-link-wrapper">
        <div onClick={getNextStanisav}>
          <MiniStanisav
            languageCode={stanisavLocale}
            position={[0, 0, 102]}
            customSpinSpeed={0}
            forcesHighQualityCapture={isCaptureMode}
          />
        </div>
        <Link
          to={`/${urlLocale}`}
          title="Back to main page"
          className="home-link"
        >
          <ChevronIcon className="home-link-icon" />
        </Link>
      </div>
      <div className="article-container">
        <Markdown components={{ img: ArticleImage }}>{readme}</Markdown>
      </div>
    </>
  );
};

export default Article;
