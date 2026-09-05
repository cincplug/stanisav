import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { useI18nContext } from "../../contexts/I18nContext";
import readme from "../../../README.md?raw";
import "../../index.css";
import "./Article.css";
import { ChevronIcon } from "../../components/Icons";
import MiniStanisav from "../../components/MiniStanisav";

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
      <Link to={`/${urlLocale}`} title="Back to main page">
        <ChevronIcon className="home-link" />
        <MiniStanisav languageCode={iso3Locale} position={[0, -3, 104]} />
      </Link>
      <div className="article-container">
        <Markdown>{readme}</Markdown>
      </div>
    </>
  );
};

export default Article;
