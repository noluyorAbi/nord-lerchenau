"use client";

import { useState, type FormEvent } from "react";

import { Field, RadioGroup } from "@/components/ContactForm";
import { SignaturePad } from "@/components/SignaturePad";
import {
  ANTRAG_RECIPIENT,
  antragFileName,
  isGermanNationality,
  normalizePassNumber,
  type AntragChange,
  type AntragData,
  type AntragGender,
  type AntragKind,
  type AntragStatus,
} from "@/lib/spielerpass";

const KINDS = [
  { value: "junioren", label: "Junioren / Juniorinnen" },
  { value: "erwachsene", label: "Herren / Senioren / Frauen" },
] as const;

const GENDERS = [
  { value: "maennlich", label: "männlich" },
  { value: "weiblich", label: "weiblich" },
] as const;

const CHANGES = [
  { value: "erstausstellung", label: "Erster Spielerpass" },
  { value: "vereinswechsel", label: "Wechsel von einem anderen Verein" },
] as const;

const STATUS = [
  { value: "amateur", label: "Amateur" },
  { value: "vertragsspieler", label: "Vertragsspieler" },
  { value: "lizenzspieler", label: "Lizenzspieler" },
] as const;

type Status =
  | { state: "idle" }
  | { state: "working" }
  | {
      state: "done";
      /** Ist die Mail beim Verein angekommen? Sonst bleibt nur die Datei. */
      sent: boolean;
      simplified: boolean;
      copy: { url: string; fileName: string };
    }
  | { state: "error"; message: string };

/** Base64 ohne Umweg über riesige Strings in einem Aufruf. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function SpielerpassForm() {
  const [kind, setKind] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [change, setChange] = useState<string>("");
  const [status, setStatus] = useState<string>("amateur");
  const [nationality, setNationality] = useState("");
  const [passError, setPassError] = useState<string>();
  const [playerSig, setPlayerSig] = useState<Uint8Array | null>(null);
  const [guardianSig, setGuardianSig] = useState<Uint8Array | null>(null);
  const [sigError, setSigError] = useState<string>();
  const [result, setResult] = useState<Status>({ state: "idle" });

  const abroad = nationality.trim() !== "" && !isGermanNationality(nationality);
  const adult = kind === "erwachsene";
  const wechsel = change === "vereinswechsel";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    setPassError(undefined);
    const pass = get("passNumber");
    if (wechsel && pass && !normalizePassNumber(pass)) {
      setPassError("Die Passnummer hat 8 Stellen, z. B. 1234-5678.");
      return;
    }

    setSigError(undefined);
    if (!playerSig && !(guardianSig && kind === "junioren")) {
      setSigError(
        kind === "junioren"
          ? "Bitte unterschreibe: Spielerin oder Spieler und/oder Erziehungsberechtigte."
          : "Bitte unterschreibe das Formular.",
      );
      return;
    }

    const data: AntragData = {
      kind: kind as AntragKind,
      gender: gender as AntragGender,
      lastName: get("lastName"),
      firstName: get("firstName"),
      birthDate: get("birthDate"),
      street: get("street"),
      postalCode: get("postalCode"),
      city: get("city"),
      nationality: get("nationality"),
      birthPlace: get("birthPlace"),
      change: change as AntragChange,
      previousClub: wechsel ? get("previousClub") : undefined,
      passNumber: wechsel ? pass : undefined,
      status: wechsel && adult ? (status as AntragStatus) : undefined,
      abroadResidence: abroad ? get("abroadResidence") : undefined,
      abroadClub: abroad ? get("abroadClub") : undefined,
    };

    setResult({ state: "working" });
    let built: { bytes: Uint8Array; simplified: boolean };
    try {
      // Erst jetzt laden: pdf-lib ist gross und wird nur hier gebraucht.
      const { fillAntragPdf } = await import("@/lib/spielerpass-pdf");
      const { bytes, fields } = await fillAntragPdf(data, {
        player: playerSig ?? undefined,
        guardian: kind === "junioren" ? (guardianSig ?? undefined) : undefined,
      });
      built = { bytes, simplified: fields.simplified };
    } catch (err) {
      console.error("[spielerpass] PDF konnte nicht erzeugt werden:", err);
      setResult({
        state: "error",
        message:
          "Das Formular konnte nicht erstellt werden. Bitte versuche es noch einmal oder lade das leere Formular unten herunter.",
      });
      return;
    }

    const fileName = antragFileName(data);
    const copy = {
      url: URL.createObjectURL(
        new Blob([built.bytes as BlobPart], { type: "application/pdf" }),
      ),
      fileName,
    };

    let sent = false;
    try {
      const res = await fetch("/api/spielerpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          email: get("email"),
          website: get("website"),
          pdf: toBase64(built.bytes),
        }),
      });
      sent = res.ok;
    } catch {
      sent = false;
    }
    setResult({
      state: "done",
      sent,
      simplified: built.simplified,
      copy,
    });
  }

  const working = result.state === "working";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <RadioGroup
        name="kind"
        legend="Für wen ist der Antrag?"
        options={KINDS}
        value={kind}
        onChange={setKind}
        required
      />

      {kind ? (
        <div className="form-reveal space-y-5">
          <RadioGroup
            name="change"
            legend="Worum geht es?"
            options={CHANGES}
            value={change}
            onChange={setChange}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="lastName"
              label="Familienname"
              autoComplete="family-name"
              required
            />
            <Field
              name="firstName"
              label="Vorname"
              autoComplete="given-name"
              required
            />
          </div>

          <RadioGroup
            name="gender"
            legend="Geschlecht"
            options={GENDERS}
            value={gender}
            onChange={setGender}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="birthDate"
              type="date"
              label="Geburtsdatum"
              autoComplete="bday"
              required
            />
            <Field name="birthPlace" label="Geburtsort" required />
          </div>

          <Field
            name="street"
            label="Straße, Hausnummer"
            autoComplete="street-address"
            required
          />
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Field
              name="postalCode"
              label="PLZ"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              autoComplete="postal-code"
              required
            />
            <Field
              name="city"
              label="Wohnort"
              autoComplete="address-level2"
              required
            />
          </div>

          <Field
            name="nationality"
            label="Staatsangehörigkeit"
            placeholder="z. B. deutsch"
            value={nationality}
            onChange={setNationality}
            required
          />

          {abroad ? (
            <div className="form-reveal space-y-4 rounded-lg border border-nord-line bg-nord-paper-2 p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-nord-muted">
                Nur wenn die Spielerin oder der Spieler aus dem Ausland kommt.
                Sonst bleibt beides leer. Eine Kopie von Reisepass oder
                Personalausweis muss dem Antrag beiliegen.
              </p>
              <Field
                name="abroadResidence"
                label="Letzter Wohnort im Ausland"
              />
              <Field name="abroadClub" label="Letzter Verein im Ausland" />
            </div>
          ) : null}

          {wechsel ? (
            <div className="form-reveal space-y-4 rounded-lg border border-nord-line bg-nord-paper-2 p-4 sm:p-5">
              <Field name="previousClub" label="Bisheriger Verein" required />
              <Field
                name="passNumber"
                label="Passnummer des bisherigen Vereins"
                placeholder="8 Stellen, z. B. 1234-5678"
                maxLength={12}
                error={passError}
              />
              <p className="text-xs leading-relaxed text-nord-muted">
                Die Passnummer steht auf dem alten Spielerpass bzw. in der
                Spielberechtigungsliste. Wenn du sie nicht kennst, lass das Feld
                leer.
              </p>
              {adult ? (
                <RadioGroup
                  name="status"
                  legend="Letzter Status beim bisherigen Verein"
                  options={STATUS}
                  value={status}
                  onChange={setStatus}
                />
              ) : null}
            </div>
          ) : null}

          <Field
            name="email"
            type="email"
            label="Deine E-Mail-Adresse (für Rückfragen des Vereins)"
            autoComplete="email"
            required
          />
          {/* Honeypot: für Menschen unsichtbar, Bots füllen es aus. */}
          <div
            aria-hidden
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          >
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="space-y-5 border-t border-nord-line pt-5">
            <h3 className="font-display text-lg font-black text-nord-ink">
              Unterschrift
            </h3>
            {kind === "junioren" ? (
              <>
                <SignaturePad
                  legend="Erziehungsberechtigte/r"
                  hint="Bei E-, F- und G-Junioren genügt diese Unterschrift."
                  onChange={setGuardianSig}
                />
                <SignaturePad
                  legend="Spielerin / Spieler"
                  hint="Nicht nötig bei E-, F- und G-Junioren."
                  onChange={setPlayerSig}
                />
              </>
            ) : (
              <SignaturePad
                legend="Spielerin / Spieler"
                onChange={setPlayerSig}
              />
            )}
            {sigError ? (
              <p role="alert" className="text-sm text-red-600">
                {sigError}
              </p>
            ) : null}
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-nord-ink">
              <input
                type="checkbox"
                name="confirm"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-nord-navy"
              />
              <span>
                Ich bestätige, dass meine Angaben stimmen und die Unterschrift
                von mir stammt.
              </span>
            </label>
          </div>

          <div aria-live="polite">
            {result.state === "error" ? (
              <p role="alert" className="text-sm text-red-600">
                {result.message}
              </p>
            ) : null}
            {result.state === "done" ? <Next result={result} /> : null}
          </div>

          <button
            type="submit"
            disabled={working}
            className="inline-flex w-full items-center justify-center rounded-lg bg-nord-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {working ? "Wird gesendet…" : "Antrag absenden →"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

function Next({ result }: { result: Extract<Status, { state: "done" }> }) {
  return (
    <div className="form-reveal rounded-lg border border-nord-navy-2/30 bg-white px-4 py-4 text-sm leading-relaxed text-nord-ink">
      {result.sent ? (
        <>
          <div className="font-semibold">
            Dein Antrag ist beim Verein angekommen.
          </div>
          <p className="mt-2 text-nord-muted">
            Wir haben ihn an den Verein geschickt und melden uns bei Rückfragen.
            Hier ist deine Kopie als PDF zum Aufbewahren.
          </p>
        </>
      ) : (
        <>
          <div className="font-semibold text-red-700">
            Der Antrag konnte nicht gesendet werden.
          </div>
          <p className="mt-2 text-nord-muted">
            Speichere die PDF-Datei und schicke sie als Anhang per E-Mail an{" "}
            <a href={`mailto:${ANTRAG_RECIPIENT}`} className="underline">
              {ANTRAG_RECIPIENT}
            </a>
            .
          </p>
        </>
      )}
      <a
        href={result.copy.url}
        download={result.copy.fileName}
        className="mt-3 inline-flex rounded-lg border border-nord-ink px-4 py-2 text-sm font-semibold text-nord-ink transition hover:bg-nord-paper-2"
      >
        PDF speichern
      </a>
      {result.simplified ? (
        <p className="mt-3 rounded-md bg-nord-paper-2 px-3 py-2 text-nord-ink">
          Einzelne Zeichen konnte das Formular nicht darstellen und hat sie
          vereinfacht. Bitte kontrolliere die Schreibweise von Namen und Orten
          im PDF.
        </p>
      ) : null}
    </div>
  );
}
