"use client";

import { useState, useCallback } from "react";

export default function DfyVideoPlayer({
  thumbnailSrc,
  thumbnailAlt,
  vimeoId,
}: {
  thumbnailSrc: string;
  thumbnailAlt: string;
  vimeoId: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [preloaded, setPreloaded] = useState(false);

  const preload = useCallback(() => {
    if (!preloaded) {
      setPreloaded(true);
    }
  }, [preloaded]);

  return (
    <div className="video-embed" onMouseEnter={preload}>
      {preloaded && !playing && (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          allow="fullscreen"
          allowFullScreen
          style={{ opacity: 0, pointerEvents: "none" }}
        />
      )}
      {playing ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          allow="autoplay;fullscreen"
          allowFullScreen
        />
      ) : (
        <div
          className="video-placeholder"
          onClick={() => setPlaying(true)}
          style={{ cursor: "pointer" }}
        >
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div className="play-btn" />
        </div>
      )}
    </div>
  );
}
