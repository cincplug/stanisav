import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import StickyStanisav from "../../components/StickyStanisav";
import readme from "../../../README.md?raw";
import "../../index.css";
import "./Article.css";

const Article = () => {
  const { locale } = useParams();

  useEffect(() => {
    document.body.classList.add("article-body");
    return () => {
      document.body.classList.remove("article-body");
    };
  }, []);

  return (
    <>
      <Link to={`/${locale}`} title="Back to main page">
        <StickyStanisav languageCode="nld" />
      </Link>
      <div className="article-container">
        <Markdown>{readme}</Markdown>
      </div>
    </>
  );
};

export default Article;
