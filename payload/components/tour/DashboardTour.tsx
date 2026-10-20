"use client";

import { useEffect, useState } from "react";
import { LuCircleHelp, LuCirclePlay } from "react-icons/lu";

import {
  clearResumeRequest,
  hasResumeRequest,
  startTour,
  tourRunning,
  tourSeen,
} from "./tour";
import "./dashboard-tour.css";

/**
 * The interactive part of the dashboard's welcome card: the button that starts
 * the tour, and the rule for starting it on its own.
 *
 * Auto-start happens exactly twice in a user's life: on the very first visit,
 * and whenever the sidebar "Rundgang starten" was pressed on another page and
 * sent us here. Everything else is a deliberate click, so the tour never turns
 * into a nag.
 */
export default function DashboardTour() {
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    if (tourRunning()) return;
    // Someone who followed "Video ansehen" wants the video, not a tour on top
    // of it. The explicit resume request still wins, since that was a click on
    // "Rundgang starten".
    const wantsVideo = window.location.hash === "#video";
    const shouldStart = hasResumeRequest() || (!wantsVideo && !tourSeen());
    if (!shouldStart) return;
    // Let the dashboard settle (fonts, sidebar hydration) before pointing at
    // things, otherwise the first highlight lands on a moving target. The
    // resume request is cleared here, inside the timer, so a StrictMode double
    // mount (which clears the timer in between) cannot eat it.
    const t = window.setTimeout(() => {
      clearResumeRequest();
      startTour();
      setAutoStarted(true);
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="svnord-dash-actions">
      <button
        type="button"
        className="svnord-dash-btn svnord-dash-btn--primary"
        onClick={() => startTour()}
      >
        <LuCircleHelp aria-hidden />
        <span>{autoStarted ? "Rundgang wiederholen" : "Rundgang starten"}</span>
      </button>
      <a className="svnord-dash-btn" href="#video">
        <LuCirclePlay aria-hidden />
        <span>Video ansehen (2 Min.)</span>
      </a>
    </div>
  );
}
