import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import StickyStanisav from "../../components/StickyStanisav";
import { useActiveLanguageCode } from "../../hooks/useActiveLanguageCode.js";
import {
  articleLanguageCodes,
  articleSectionIdPrefix,
  intersectionThresholdAmount,
  intersectionRootMargin,
} from "./Article.config.js";
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

  const activeLanguageCode = useActiveLanguageCode(
    articleLanguageCodes,
    intersectionThresholdAmount,
    intersectionRootMargin,
  );

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
        linguistic properties of languages. As you read on, Stanisav will keep
        transforming to match whichever language you're currently reading about.
      </p>

      <StickyStanisav
        languageCode={activeLanguageCode}
        describedById={`${articleSectionIdPrefix}${activeLanguageCode}`}
      />

      <section id={`${articleSectionIdPrefix}vie`}>
        <p>
          For example, this would be Vietnamese language. It's a tonal language,
          which is why it has stripes on the tongue, and it has isolating
          morphology, which is why its cheeks are apart.
        </p>
      </section>

      <section id={`${articleSectionIdPrefix}tur`}>
        <p>
          Then for example we have Turkish, whose cheeks are glued together
          because it's not isolating but agglutinative. That kind of languages
          glues its phonemes together. But furthermore, Turkish has 6 cases,
          reflected in its moustache, and a pitch accent, reflected in different
          kind of stripes.
        </p>
      </section>

      <section id={`${articleSectionIdPrefix}ita`}>
        <p>
          Then there's Italian and almost all other European languages, which
          are neither isolating nor agglutinative but fusional, which is why
          they look a bit like butterflies.
        </p>
      </section>

      <section id={`${articleSectionIdPrefix}pol`}>
        <p>
          Polish belongs to that same fusional family, but its rich case system
          fills out its moustache far more than Italian's, showing how much
          variation still fits inside one morphological type.
        </p>
      </section>

      <section id={`${articleSectionIdPrefix}chr`}>
        <p>
          If you push morphological complexity even further, you get
          polysynthetic languages like Cherokee, they can express big things in
          a single word and that's why they are really big butterflies.
        </p>
      </section>

      <section id={`${articleSectionIdPrefix}hun`}>
        <p>
          Hungarian closes things out as another agglutinative language, but one
          from Europe rather than Asia, showing that morphological type and
          geography don't always line up.
        </p>
      </section>
    </div>
  );
};

export default Article;
