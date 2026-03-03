import React, { useRef, useState, useEffect } from "react";

const formatSpeakerNumber = (num) => {
  if (!num) return "N/A";
  return `${Math.round(num)}M`;
};

function getYoutubeEmbedUrl(url) {
  if (!url) return url;
  // youtu.be short links
  const ytShort = url.match(/^https?:\/\/(?:www\.)?youtu\.be\/([\w-]+)/);
  if (ytShort) {
    return `https://www.youtube.com/embed/${ytShort[1]}`;
  }
  // youtube.com/watch?v= links
  const ytWatch = url.match(
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/,
  );
  if (ytWatch) {
    return `https://www.youtube.com/embed/${ytWatch[1]}`;
  }
  // Already embed or other URLs
  return url;
}

function trimByInterpunction(str) {
  if (!str) return "";
  // First, limit to 4-10 words
  const words = str.trim().split(/\s+/);
  if (words.length < 4) return "";
  const limited = words.slice(0, 10).join(" ");
  // Then trim by first interpunction, but only if at least 4 words remain
  const match = limited.match(/^((?:\S+\s+){3,}\S+?)[.,;:!?].*$/);
  if (match) {
    return match[1].trim();
  }
  return limited;
}

const SourceVideoCard = ({ language }) => {
  const { name, code, nativeName, speakers, sampleUrl, sr, ...rest } = language;
  const embedUrl = getYoutubeEmbedUrl(sampleUrl);
  const videoRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="svgallery-card" ref={videoRef}>
      <div className="svgallery-video">
        {isVisible && embedUrl ? (
          <iframe
            src={embedUrl}
            title={name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        ) : (
          <div className="svgallery-novideo">No video available</div>
        )}
      </div>
      <h2>{name}</h2>
      <dl className="svgallery-attributes">
        <dt>iso code</dt>
        <dd>{code}</dd>
        <dt>native name</dt>
        <dd>{nativeName}</dd>
        <dt>native speakers</dt>
        <dd>{formatSpeakerNumber(speakers)}</dd>
        {Object.entries(rest).map(([key, value]) => {
          const label = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
          return (
            <React.Fragment key={key}>
              <dt>{label}</dt>
              <dd>{String(value)}</dd>
            </React.Fragment>
          );
        })}
      </dl>
      <small>{trimByInterpunction(sr)}</small>
    </div>
  );
};

export default SourceVideoCard;
