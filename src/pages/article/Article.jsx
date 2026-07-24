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
      <h1 className="article-title">Who's Mesha?</h1>
      <p>
        Mesha is an animated 3D character who physically visualizes the
        linguistic properties of languages.
      </p>
      <p>
        For example, this would be Vietnamese language. It's a tonal language,
        which is why it has stripes on the tongue, and it has isolating
        morphology, which is why it's cheeks are apart.
      </p>
      <MiniMesha languageCode="vie" />
      <p>
        On the other hand, Turkish language is agglutinative, which is why its
        cheeks are glued together, but it's not tonal so no stripes. Plus,
        Turkish has evidentiality, that's why it has big eyes.
      </p>
      <MiniMesha languageCode="tur" />
      When you select a language, Mesha's appearance dynamically changes to
      reflect that language's unique features: Her face shows tonality levels
      through visual patterns and colors Her features (ears, eyes, moustache,
      nose, teeth) respond to audio from speaker samples, reacting in real-time
      as you listen Her expression changes to represent different linguistic
      characteristics Different visual variants appear to show the range of
      possible values for each linguistic property (tonality systems, morphology
      types, word order patterns, etc.) In blackboard mode, Mesha demonstrates
      linguistic concepts by showing how a feature varies across different
      languages—effectively using her visual form as a teaching tool. The app
      uses Mesha as more than decoration: she's an interactive linguistic guide.
      Rather than just reading dry statistics about a language's phoneme
      inventory or grammar system, you watch how those features literally shape
      her appearance and behavior. This makes complex linguistic concepts
      intuitive and memorable—her visual transformation helps you understand
      what makes each language distinctive.
    </div>
  );
};

export default Article;
