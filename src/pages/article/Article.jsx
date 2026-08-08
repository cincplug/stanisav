import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MiniStanisav from "../../components/MiniStanisav";
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
      <header>
        <Link className="home-link" to={`/${locale}`}>
          Back to main page
        </Link>
      </header>
      <h1 className="article-title">Who's Stanisav?</h1>
      <p>
        Stanisav is an animated 3D character who physically visualizes the
        linguistic properties of languages.
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="vie" />
      </div>
      <p>
        For example, this would be Vietnamese language. It's a tonal language,
        which is why it has stripes on the tongue, and it has isolating
        morphology, which is why it's cheeks are apart.
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="que" />
      </div>
      <p>
        On the other hand, Quechua language is agglutinative, which is why its
        cheeks are glued together, and it also has big eyes because it has
        evidentiality.
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="tur" />
      </div>
      <p>
        Then for example we have Turkish, also agglutinative but furthermore it
        has 6 cases, reflected in its moustache, and a pitch accent, reflected
        in different kind of stripes.
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="ita" />
        <MiniStanisav languageCode="pol" />
      </div>
      <p>
        Then there's Italian and almost all other European languages, which are
        neither isolating nor agglutinative but fusional, which is why they look
        a bit like butterflies.
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="chr" />
      </div>
      <p>
        If you push morphological complexity even further, you get polysynthetic
        languages like Cherokee, they can express big things in a single word
        and that's why they are really big butterflies.
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="heb" />
        <MiniStanisav languageCode="apc" />
      </div>
      <p>
        Then there are intro-flexive languages, kind of halfway between
        agglutinative and fusional, there you will find Hebrew and Arabic
        languages. Yes, they are same morphological group, plus they both write
        right to left, which is why their Stanisav spins counter-clockwise.
      </p>
      <p>
        And then we also have some languages that are unique in some property.
        For example, Fula has enormous number of genders, reflected in eyebrows,
        while Hungarian and Finnish have a whole lot of declension, reflected in
        moustache
      </p>
      <div className="stanisav-group">
        <MiniStanisav languageCode="hun" />
      </div>
    </div>
  );
};

export default Article;
