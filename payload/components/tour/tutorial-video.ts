/**
 * The tutorial video shown on the dashboard.
 *
 * Produced from video/storyboard.json with the demo-video pipeline (Remotion,
 * real screen captures of this admin, German narration) and uploaded to the
 * club's Vercel Blob store, the same store the CMS images live in. The file
 * name carries its date plus a random suffix (put with addRandomSuffix): the
 * store is public, and the recording shows the admin including the login
 * screen, so the URL should not be guessable from outside the admin. The CDN
 * caches for a year, so a re-render is uploaded under a new name and the URL
 * here is updated, never overwritten in place.
 * Chapter times are the scene start times from video/src/demovideo.content.ts.
 * An empty URL renders a "video follows" placeholder instead of a broken player.
 */
export const TUTORIAL_VIDEO = {
  url: "https://wifujncy146uydef.public.blob.vercel-storage.com/admin/tutorial-2026-08-18-mNRPpMRXk9bFl8Iqw2ESW8hOmxLmAE.mp4",
  poster:
    "https://wifujncy146uydef.public.blob.vercel-storage.com/admin/tutorial-2026-08-18-poster-rgrpy8uKkY5mNki2ufrh58n2AnC6mm.jpg",
  /**
   * WebVTT captions, generated from video/src/narration.json (the same word
   * timestamps the burnt-in karaoke uses), so someone who cannot hear the
   * narration gets it as selectable text. Empty means no track is rendered.
   */
  captions:
    "https://wifujncy146uydef.public.blob.vercel-storage.com/admin/tutorial-2026-08-18.de-WwLjBZhrFlUyWlEFEgf3YCxC16t9bu.vtt",
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
