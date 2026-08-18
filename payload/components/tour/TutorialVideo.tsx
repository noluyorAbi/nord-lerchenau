"use client";

import React, { useRef } from "react";
import { LuClapperboard } from "react-icons/lu";

import { TUTORIAL_VIDEO } from "./tutorial-video";
import "./dashboard-tour.css";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The player plus chapter chips. A chip seeks and plays, so someone who only
 * wants to see "how do I upload a photo" gets there in one click instead of
 * scrubbing.
 */
export default function TutorialVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  const jump = (at: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = at;
    void v.play();
    v.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <div className="svnord-video" id="video">
      <div className="svnord-video__frame">
        {TUTORIAL_VIDEO.url ? (
          <video
            ref={ref}
            controls
            playsInline
            preload="metadata"
            poster={TUTORIAL_VIDEO.poster || undefined}
            src={TUTORIAL_VIDEO.url}
          >
            Dein Browser kann dieses Video nicht abspielen.
          </video>
        ) : (
          <div className="svnord-video__pending">
            <LuClapperboard aria-hidden style={{ width: 28, height: 28 }} />
            <strong>Das Video folgt in Kürze.</strong>
            <span>Bis dahin: der Rundgang oben zeigt dir alles Wichtige.</span>
          </div>
        )}
      </div>
      {TUTORIAL_VIDEO.url && TUTORIAL_VIDEO.chapters.length > 0 ? (
        <div
          className="svnord-video__chapters"
          role="group"
          aria-label="Kapitel"
        >
          {TUTORIAL_VIDEO.chapters.map((c) => (
            <button
              key={c.at}
              type="button"
              className="svnord-video__chapter"
              onClick={() => jump(c.at)}
            >
              <time dateTime={`PT${c.at}S`}>{formatTime(c.at)}</time>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
