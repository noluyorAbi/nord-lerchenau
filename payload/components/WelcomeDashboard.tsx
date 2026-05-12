import React from "react";
import { LuCalendarPlus, LuFileText, LuImage, LuInbox } from "react-icons/lu";
import { LuCompass, LuHandshake, LuHouse, LuPhoneCall } from "react-icons/lu";

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: 8,
  padding: 20,
  background: "var(--theme-elevation-0)",
};

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 16px",
  borderRadius: 8,
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
  textDecoration: "none",
  color: "inherit",
  transition: "background 0.15s",
};

const linkIcon: React.CSSProperties = {
  width: 28,
  height: 28,
  flexShrink: 0,
  color: "var(--theme-success-500, #d4a017)",
};

const linkTextWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
};

const linkTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
};

const linkHint: React.CSSProperties = {
  fontSize: 12,
  color: "var(--theme-elevation-500)",
};

const stepNumber: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: 11,
  background: "var(--theme-success-500, #d4a017)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  marginRight: 8,
  flexShrink: 0,
};

type QuickLink = {
  href: string;
  title: string;
  hint: string;
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
};

const dailyTasks: QuickLink[] = [
  {
    href: "/admin/collections/posts/create",
    title: "News-Artikel schreiben",
    hint: "Spielbericht, Ankündigung, Vereinsnews",
    Icon: LuFileText,
  },
  {
    href: "/admin/collections/events/create",
    title: "Termin anlegen",
    hint: "Vereinsfest, Versammlung, Turnier",
    Icon: LuCalendarPlus,
  },
  {
    href: "/admin/collections/submissions",
    title: "Kontaktanfragen",
    hint: "Posteingang vom Kontaktformular",
    Icon: LuInbox,
  },
  {
    href: "/admin/collections/media",
    title: "Bilder hochladen",
    hint: "Fotos und Logos für die Webseite",
    Icon: LuImage,
  },
];

const settingsLinks: QuickLink[] = [
  {
    href: "/admin/globals/home-page",
    title: "Startseite",
    hint: "Hero, Schnellzugriff, Highlights",
    Icon: LuHouse,
  },
  {
    href: "/admin/globals/contact-info",
    title: "Kontaktdaten",
    hint: "Adressen, Bankverbindung, Footer",
    Icon: LuPhoneCall,
  },
  {
    href: "/admin/globals/navigation",
    title: "Menüleiste",
    hint: "Header- und Footer-Links",
    Icon: LuCompass,
  },
  {
    href: "/admin/collections/sponsors",
    title: "Sponsoren",
    hint: "Logos, Tiers und Links pflegen",
    Icon: LuHandshake,
  },
];

export default function WelcomeDashboard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          ...cardStyle,
          background:
            "linear-gradient(135deg, var(--theme-elevation-50) 0%, var(--theme-elevation-100) 100%)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--theme-success-500, #d4a017)",
            marginBottom: 8,
          }}
        >
          Willkommen im SV-Nord-Admin
        </div>
        <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.25 }}>
          Hier pflegst du die Inhalte der Vereins-Website.
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            color: "var(--theme-elevation-600)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Alles ist in Bereiche aufgeteilt: <strong>1. Inhalte</strong> (News,
          Termine), <strong>2. Sport</strong> (Mannschaften, Spieler),{" "}
          <strong>3. Verein</strong> (Sponsoren, Kontaktanfragen),{" "}
          <strong>4. Seiten</strong> (Startseite, Chronik),{" "}
          <strong>5. Einstellungen</strong> (Navigation, Kontaktdaten),{" "}
          <strong>9. System</strong> (Bilder, Logins). Links in der Seitenleiste
          findest du alles wieder.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <div style={cardStyle}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--theme-elevation-700)",
            }}
          >
            Häufige Aufgaben
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {dailyTasks.map((l) => (
              <a key={l.href} href={l.href} style={linkStyle}>
                <l.Icon style={linkIcon} />
                <span style={linkTextWrap}>
                  <span style={linkTitle}>{l.title}</span>
                  <span style={linkHint}>{l.hint}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--theme-elevation-700)",
            }}
          >
            Seiten & Einstellungen
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {settingsLinks.map((l) => (
              <a key={l.href} href={l.href} style={linkStyle}>
                <l.Icon style={linkIcon} />
                <span style={linkTextWrap}>
                  <span style={linkTitle}>{l.title}</span>
                  <span style={linkHint}>{l.hint}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--theme-elevation-700)",
          }}
        >
          So pflegst du Inhalte (Schritt für Schritt)
        </h3>
        <ol
          style={{ margin: 0, padding: 0, listStyle: "none", lineHeight: 1.6 }}
        >
          <li style={{ display: "flex", marginBottom: 8 }}>
            <span style={stepNumber}>1</span>
            <span>
              Bereich in der linken Seitenleiste auswählen (z.B.{" "}
              <strong>1. Inhalte → News-Artikel</strong>).
            </span>
          </li>
          <li style={{ display: "flex", marginBottom: 8 }}>
            <span style={stepNumber}>2</span>
            <span>
              Oben rechts auf <strong>„Neu erstellen“</strong> klicken — oder
              einen bestehenden Eintrag in der Liste anklicken zum Bearbeiten.
            </span>
          </li>
          <li style={{ display: "flex", marginBottom: 8 }}>
            <span style={stepNumber}>3</span>
            <span>
              Felder ausfüllen. Pflichtfelder sind mit{" "}
              <strong style={{ color: "#dc2626" }}>*</strong> markiert. Unter
              jedem Feld steht ein Hinweistext.
            </span>
          </li>
          <li style={{ display: "flex", marginBottom: 8 }}>
            <span style={stepNumber}>4</span>
            <span>
              Bilder ziehst du per Drag-&-Drop in das Upload-Feld — oder klickst
              auf <em>„Upload“</em>. Vergiss den <strong>Alt-Text</strong> nicht
              (kurze Beschreibung).
            </span>
          </li>
          <li style={{ display: "flex", marginBottom: 8 }}>
            <span style={stepNumber}>5</span>
            <span>
              Unten auf <strong>„Speichern“</strong> klicken. Die Webseite
              aktualisiert sich automatisch nach wenigen Sekunden.
            </span>
          </li>
          <li style={{ display: "flex" }}>
            <span style={stepNumber}>?</span>
            <span style={{ color: "var(--theme-elevation-600)" }}>
              Etwas unklar? Frag den Admin oder schau in der Live-Vorschau
              (rechts oben bei News-Artikeln) was passieren würde.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
