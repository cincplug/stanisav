import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MiniMesha from "../../components/MiniMesha";
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
    <div className="article-container">
      <Link className="home-link" to={`/${locale}`}>
        Back to main page
      </Link>
      <h1 className="article-title">Title</h1>
      <p>Description</p>
      <MiniMesha languageCode="tur" />
    </div>
  );
};

export default Article;
