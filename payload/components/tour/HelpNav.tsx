"use client";

import Link from "next/link";
import { LuCircleHelp, LuCirclePlay } from "react-icons/lu";

import { startTour, TOUR_RESUME_HREF } from "./tour";
import { TOUR_TARGET } from "./tour-targets";
import "./help-nav.css";

/**
 * Sits at the bottom of the admin sidebar on every page (admin.components
 * .afterNavLinks). Two things a first-time editor needs within reach: the
 * guided tour, and the video. Both live on the dashboard, so both routes go
 * there; the tour resumes itself after the navigation.
 */
export default function HelpNav() {
  return (
    <div className="svnord-help" data-tour={TOUR_TARGET.help}>
      <div className="svnord-help__label">Hilfe</div>
      <Link
        className="svnord-help__btn svnord-help__btn--primary"
        href={TOUR_RESUME_HREF}
        prefetch={false}
        onClick={(event) => {
          // Already on the dashboard: start in place instead of reloading it.
          if (window.location.pathname.replace(/\/$/, "") === "/admin") {
            event.preventDefault();
            startTour();
          }
        }}
      >
        <LuCircleHelp aria-hidden />
        <span>Rundgang starten</span>
      </Link>
      <Link className="svnord-help__btn" href="/admin#video" prefetch={false}>
        <LuCirclePlay aria-hidden />
        <span>Video ansehen</span>
      </Link>
    </div>
  );
}
