"use client";

import Link from "next/link";
import React from "react";
import { LuCircleHelp, LuCirclePlay } from "react-icons/lu";

import { startTourFromAnywhere } from "./tour";
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
      <button
        type="button"
        className="svnord-help__btn svnord-help__btn--primary"
        onClick={startTourFromAnywhere}
      >
        <LuCircleHelp aria-hidden />
        <span>Rundgang starten</span>
      </button>
      <Link className="svnord-help__btn" href="/admin#video" prefetch={false}>
        <LuCirclePlay aria-hidden />
        <span>Video ansehen</span>
      </Link>
    </div>
  );
}
