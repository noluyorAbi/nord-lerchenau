"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  return (
    <div className="svnord-help" data-tour={TOUR_TARGET.help}>
      <div className="svnord-help__label">Hilfe</div>
      <button
        type="button"
        className="svnord-help__btn svnord-help__btn--primary"
        onClick={() => startTourFromAnywhere((href) => router.push(href))}
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
