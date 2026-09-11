import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { useI18nContext } from "../../contexts/I18nContext";
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

  useEffect(() => {
    document.body.classList.add("article-body");
    return () => {
      document.body.classList.remove("article-body");
    };
  }, []);

  return (
    <>
      <div className="home-link-wrapper">
        <MiniStanisav languageCode={iso3Locale} position={[0, -2, 108]} />
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
