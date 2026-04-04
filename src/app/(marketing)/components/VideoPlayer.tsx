"use client";

import { useState } from "react";

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

  return (
    <div className="vt-card-thumb">
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
