import { CloseIcon } from "./MenuIcons";
import "./VideoEmbed.css";

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]+)(?:.*[?&]t=(\d+))?/
  );
  if (!match) return null;
  const [, videoId, start] = match;
  let embedUrl = `https://www.youtube.com/embed/${videoId}`;
  if (start) embedUrl += `?start=${start}`;
  return embedUrl;
}

function VideoEmbed({ url, onClose }) {
  const embedUrl = getYoutubeEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <div className="video-embed-popup">
      <button className="close-button" onClick={onClose}>
        <CloseIcon />
      </button>
      <iframe
        src={embedUrl}
        title="Sample Video"
        frameBorder="0"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default VideoEmbed;
