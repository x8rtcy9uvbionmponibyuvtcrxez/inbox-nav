"use client";

import { useState, useCallback } from "react";

export default function VideoPlayer({
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
    <div className="vt-card-thumb" onMouseEnter={preload}>
      {preloaded && !playing && (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          frameBorder="0"
          allow="fullscreen"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      )}
      {playing ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          frameBorder="0"
          allow="autoplay;fullscreen"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <>
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div className="play-icon"></div>
          <div className="vt-play" onClick={() => setPlaying(true)}></div>
        </>
      )}
    </div>
  );
}
