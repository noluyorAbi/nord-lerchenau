/**
 * The tutorial video shown on the dashboard.
 *
 * Produced from video/storyboard.json with the demo-video pipeline (Remotion,
 * real screen captures of this admin, German narration) and uploaded to the
 * club's Vercel Blob store, the same store the CMS images live in. The file
 * name carries its date: the CDN caches for a year, so a re-render is uploaded
 * under a new name and the URL here is updated, never overwritten in place.
 * Chapter times are the scene start times from video/src/demovideo.content.ts.
 * An empty URL renders a "video follows" placeholder instead of a broken player.
 */
export const TUTORIAL_VIDEO = {
  url: "https://wifujncy146uydef.public.blob.vercel-storage.com/admin/tutorial-2026-08-18.mp4",
  poster:
    "https://wifujncy146uydef.public.blob.vercel-storage.com/admin/tutorial-2026-08-18-poster.jpg",
  /** Seconds into the video where each chapter starts. */
  chapters: [
    { at: 12, label: "Anmelden" },
    { at: 25, label: "Die Bereiche" },
    { at: 39, label: "Bild hochladen" },
    { at: 57, label: "Artikel schreiben" },
    { at: 70, label: "Titelbild wählen" },
    { at: 80, label: "Auf der Website" },
  ] as { at: number; label: string }[],
};
