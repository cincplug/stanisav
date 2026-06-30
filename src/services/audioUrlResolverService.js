const audioUrlCache = new Map();

// Returns the ordered list of audio URLs to play for a language, based on soundSource.
// soundSource values: "o-l" (original then luka), "l-o" (luka then original),
// "l" (luka only), "o" (original only).
export async function getLanguageAudioUrls(languageCode, soundSource) {
  const suffixesBySoundSource = {
    "o-l": ["", "-luka"],
    "l-o": ["-luka", ""],
    l: ["-luka"],
    o: [""],
  };

  const suffixes = suffixesBySoundSource[soundSource] ?? [""];

  const audioUrls = await Promise.all(
    suffixes.map((suffix) => resolveAudioUrl(languageCode, suffix)),
  );

  return audioUrls.filter((audioUrl) => audioUrl !== null);
}

async function resolveAudioUrl(languageCode, suffix) {
  const cacheKey = `${languageCode}${suffix}`;

  if (audioUrlCache.has(cacheKey)) {
    return audioUrlCache.get(cacheKey);
  }

  const audioUrl = `/audio/samples/${languageCode}${suffix}.mp3`;

  try {
    const response = await fetch(audioUrl, { method: "HEAD" });
    if (response.ok) {
      audioUrlCache.set(cacheKey, audioUrl);
      return audioUrl;
    } else {
      audioUrlCache.set(cacheKey, null);
      return null;
    }
  } catch {
    audioUrlCache.set(cacheKey, null);
    return null;
  }
}
