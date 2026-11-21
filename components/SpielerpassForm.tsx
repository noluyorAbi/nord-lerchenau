"use client";

import { useRef, useState, type FormEvent } from "react";

import { Field, RadioGroup } from "@/components/ContactForm";
import { SignaturePad } from "@/components/SignaturePad";
import {
  CHANGE_OPTIONS,
  WAIT_REASONS,
  isTransfer,
} from "@/lib/spielerpass-options";
import {
  ANTRAG_RECIPIENT,
  CLUB_NAME,
  antragFileName,
  isGermanNationality,
  normalizePassNumber,
  signatureNeeds,
  type AntragChange,
  type AntragData,
  type AntragGender,
  type AntragKind,
  type AntragStatus,
  type SignatureNeeds,
} from "@/lib/spielerpass";

const KINDS = [
  { value: "junioren", label: "Junioren / Juniorinnen" },
  { value: "erwachsene", label: "Herren / Senioren / Frauen" },
] as const;

const GENDERS = [
  { value: "maennlich", label: "männlich" },
  { value: "weiblich", label: "weiblich" },
] as const;

const YES_NO = [
  { value: "nein", label: "Nein" },
  { value: "ja", label: "Ja" },
] as const;

const CONSENT = [
  {
    value: "ja",
    label: "Ja, ich erteile die Einverständniserklärung (Seite 3)",
  },
  {
    value: "nein",
    label: "Nein, die Abmeldung beim bisherigen Verein erledige ich selbst",
  },
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

const STEPS = ["Antrag", "Angaben", "Unterschrift"] as const;

export function SpielerpassForm() {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [change, setChange] = useState<string>("");
  const [status, setStatus] = useState<string>("amateur");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("");
  const [previousClub, setPreviousClub] = useState("");
  const [sanction, setSanction] = useState("");
  const [waitReasons, setWaitReasons] = useState<string[]>([]);
  const [consent, setConsent] = useState("");
  const [passError, setPassError] = useState<string>();
  const [playerSig, setPlayerSig] = useState<Uint8Array | null>(null);
  const [guardianSig, setGuardianSig] = useState<Uint8Array | null>(null);
  const [sigError, setSigError] = useState<string>();
  const [result, setResult] = useState<Status>({ state: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const abroad = nationality.trim() !== "" && !isGermanNationality(nationality);
  const adult = kind === "erwachsene";
  const changeOptions = kind ? CHANGE_OPTIONS[kind as AntragKind] : [];
  const transfer = change !== "" && isTransfer(change as AntragChange);
  const vereinswechsel = change === "vereinswechsel";
  const reasons = kind ? WAIT_REASONS[kind as AntragKind] : [];

  // Wer unterschreiben muss, folgt aus dem Geburtsdatum (siehe signatureNeeds).
  const needs: SignatureNeeds | null = adult
    ? { player: true, guardian: false }
    : signatureNeeds(birthDate);

  function pickKind(value: string) {
    setKind(value);
    setChange("");
    setWaitReasons([]);
  }

  /** Prüft die Felder des aktuellen Schritts und zeigt die erste Meldung. */
  function stepIsValid(n: number): boolean {
    const box = formRef.current?.querySelector(`[data-step="${n}"]`);
    if (!box) return true;
    const fields = box.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    for (const el of fields) {
      if (!el.checkValidity()) {
        // Im zugeklappten Bereich muss er zuerst aufgehen, sonst gibt es keine Meldung.
        el.closest("details")?.setAttribute("open", "");
        el.reportValidity();
        return false;
      }
    }
    if (n === 2) {
      const pass = String(
        new FormData(formRef.current!).get("passNumber") ?? "",
      ).trim();
      setPassError(undefined);
      if (transfer && pass && !normalizePassNumber(pass)) {
        setPassError("Die Passnummer hat 8 Stellen, z. B. 1234-5678.");
        return false;
      }
    }
    return true;
  }

  function goTo(n: number) {
    setStep(n);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function next() {
    if (stepIsValid(step)) goTo(Math.min(step + 1, STEPS.length));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length) {
      next();
      return;
    }
    if (!stepIsValid(1) || !stepIsValid(2) || !stepIsValid(3)) {
      // Fehler in einem früheren Schritt: dorthin springen.
      for (const n of [1, 2, 3]) {
        if (!stepIsValid(n)) {
          goTo(n);
          return;
        }
      }
      return;
    }
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const pass = get("passNumber");

    setSigError(undefined);
    if (!needs) {
      setSigError("Bitte gib zuerst das Geburtsdatum an.");
      return;
    }
    if ((needs.player && !playerSig) || (needs.guardian && !guardianSig)) {
      setSigError(
        needs.player && needs.guardian
          ? "Bitte unterschreibt beide: Spielerin oder Spieler und Erziehungsberechtigte."
          : needs.guardian
            ? "Bitte unterschreibe als Erziehungsberechtigte/r."
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
      previousClub: transfer ? previousClub.trim() : undefined,
      passNumber: transfer ? pass : undefined,
      status: transfer && adult ? (status as AntragStatus) : undefined,
      abroadResidence: abroad ? get("abroadResidence") : undefined,
      abroadClub: abroad ? get("abroadClub") : undefined,
      sanction: sanction === "ja",
      sanctionFrom: sanction === "ja" ? get("sanctionFrom") : undefined,
      sanctionTo: sanction === "ja" ? get("sanctionTo") : undefined,
      waitReasons: vereinswechsel ? waitReasons : undefined,
      otherText: change === "sonstiges" ? get("otherText") : undefined,
      stammverein: change === "stammverein" ? get("stammverein") : undefined,
      consent: transfer ? consent === "ja" : undefined,
    };

    setResult({ state: "working" });
    let built: { bytes: Uint8Array; simplified: boolean };
    try {
      // Erst jetzt laden: pdf-lib ist gross und wird nur hier gebraucht.
      const { fillAntragPdf } = await import("@/lib/spielerpass-pdf");
      const { bytes, fields } = await fillAntragPdf(data, {
        player: needs.player ? (playerSig ?? undefined) : undefined,
        guardian: needs.guardian ? (guardianSig ?? undefined) : undefined,
      });
      built = { bytes, simplified: fields.simplified };
    } catch (err) {
      console.error("[spielerpass] PDF konnte nicht erzeugt werden:", err);
      setResult({
        state: "error",
        message:
          "Das Formular konnte nicht erstellt werden. Bitte versuche es noch einmal.",
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
  const done = result.state === "done";
  const navButton =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition disabled:opacity-60";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="scroll-mt-28 space-y-6"
      noValidate={false}
    >
      <nav aria-label="Fortschritt" className="space-y-2">
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map((label, i) => (
            <li key={label}>
              <div
                className={`h-1.5 rounded-full ${
                  i + 1 <= step ? "bg-nord-navy" : "bg-nord-line"
                }`}
              />
              <div
                className={`mt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                  i + 1 === step ? "text-nord-ink" : "text-nord-muted"
                }`}
                aria-current={i + 1 === step ? "step" : undefined}
              >
                {i + 1}. {label}
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Schritt 1: Was wird beantragt? */}
      <div data-step="1" hidden={step !== 1} className="space-y-5">
        <RadioGroup
          name="kind"
          legend="Für wen ist der Antrag?"
          options={KINDS}
          value={kind}
          onChange={pickKind}
          required
        />
        {kind ? (
          <RadioGroup
            name="change"
            legend="Worum geht es?"
            options={changeOptions}
            value={change}
            onChange={setChange}
            required
          />
        ) : null}
        {change === "sonstiges" ? (
          <div className="form-reveal">
            <Field
              name="otherText"
              label="Worum geht es genau?"
              maxLength={200}
              required
            />
          </div>
        ) : null}
        {change === "stammverein" ? (
          <div className="form-reveal">
            <Field
              name="stammverein"
              label="Neuer Stammverein (Vereinsnummer und Name)"
              maxLength={150}
            />
          </div>
        ) : null}
      </div>

      {/* Schritt 2: Angaben zur Person */}
      <div data-step="2" hidden={step !== 2} className="space-y-5">
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
            value={birthDate}
            onChange={setBirthDate}
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
            <Field name="abroadResidence" label="Letzter Wohnort im Ausland" />
            <Field name="abroadClub" label="Letzter Verein im Ausland" />
          </div>
        ) : null}

        {transfer ? (
          <div className="form-reveal space-y-4 rounded-lg border border-nord-line bg-nord-paper-2 p-4 sm:p-5">
            <Field
              name="previousClub"
              label="Bisheriger Verein"
              value={previousClub}
              onChange={setPreviousClub}
              required
            />
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

        {vereinswechsel ? (
          <details className="form-reveal group rounded-lg border border-nord-line bg-nord-paper-2 p-4 sm:p-5">
            <summary className="cursor-pointer text-sm font-semibold text-nord-ink">
              Trifft einer der Sonderfälle zu, bei denen die Wartezeit entfällt?
              <span className="ml-2 font-normal text-nord-muted">
                {waitReasons.length > 0
                  ? `(${waitReasons.length} gewählt)`
                  : "(meist nicht)"}
              </span>
            </summary>
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-relaxed text-nord-muted">
                Nur ankreuzen, wenn einer dieser Fälle zutrifft (Seite 2 des
                Formulars). Die nötigen Nachweise (zum Beispiel Meldebestätigung
                oder Bestätigung des bisherigen Vereins) bitte per E-Mail an{" "}
                {ANTRAG_RECIPIENT} nachreichen.
              </p>
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-nord-line bg-white px-3 py-2.5 text-sm leading-relaxed text-nord-ink has-[:checked]:border-nord-navy-2 has-[:checked]:bg-nord-sky/10"
                >
                  <input
                    type="checkbox"
                    checked={waitReasons.includes(r.id)}
                    onChange={(e) =>
                      setWaitReasons((prev) =>
                        e.target.checked
                          ? [...prev, r.id]
                          : prev.filter((id) => id !== r.id),
                      )
                    }
                    className="mt-1 h-4 w-4 shrink-0 accent-nord-navy"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </details>
        ) : null}

        <div className="space-y-4">
          <RadioGroup
            name="sanction"
            legend="Läuft ein Sportgerichtsverfahren oder wurde die Spielerin / der Spieler gesperrt?"
            options={YES_NO}
            value={sanction}
            onChange={setSanction}
            required
          />
          {sanction === "ja" ? (
            <div className="form-reveal grid gap-4 sm:grid-cols-2">
              <Field name="sanctionFrom" type="date" label="Sperre von" />
              <Field name="sanctionTo" type="date" label="Sperre bis" />
            </div>
          ) : null}
        </div>

        {transfer ? (
          <div className="form-reveal space-y-3 rounded-lg border border-nord-gold/60 bg-nord-paper-2 p-4 sm:p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-nord-gold-ink">
              Seite 3 des Formulars
            </div>
            <h3 className="font-display text-lg font-black text-nord-ink">
              Einverständniserklärung zur Online-Abmeldung
            </h3>
            <p className="rounded-lg border border-nord-line bg-white px-4 py-3 text-sm leading-relaxed text-nord-ink">
              Hiermit wird meinem neuen Verein <strong>{CLUB_NAME}</strong> die
              Erlaubnis erteilt, die stellvertretende Online-Abmeldung im Rahmen
              der Beantragung eines Vereinswechsels online beim bisherigen
              Verein{" "}
              <strong>{previousClub.trim() || "(bitte oben angeben)"}</strong>{" "}
              vorzunehmen.
            </p>
            <p className="text-sm leading-relaxed text-nord-muted">
              Bitte lies den Text und prüfe, dass der bisherige Verein stimmt.
              Mit „Ja“ wird Seite 3 des Formulars mit deiner Unterschrift
              versehen. Die Abmeldung ersetzt nicht die Kündigung der
              Mitgliedschaft im bisherigen Verein.
            </p>
            <RadioGroup
              name="consent"
              legend="Einverständnis"
              options={CONSENT}
              value={consent}
              onChange={setConsent}
              required
            />
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
      </div>

      {/* Schritt 3: Unterschrift */}
      <div data-step="3" hidden={step !== 3} className="space-y-5">
        <h3 className="font-display text-lg font-black text-nord-ink">
          Unterschrift
        </h3>
        {needs === null ? (
          <p className="text-sm text-nord-muted">
            Bitte gib im vorigen Schritt zuerst das Geburtsdatum an.
          </p>
        ) : (
          <>
            {needs.guardian ? (
              <SignaturePad
                legend="Erziehungsberechtigte/r"
                hint={
                  needs.player
                    ? undefined
                    : "Bei E-, F- und G-Junioren unterschreiben nur die Erziehungsberechtigten."
                }
                onChange={setGuardianSig}
              />
            ) : null}
            {needs.player ? (
              <SignaturePad
                legend="Spielerin / Spieler"
                onChange={setPlayerSig}
              />
            ) : null}
          </>
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
            Ich bestätige, dass meine Angaben stimmen und die Unterschrift von
            mir stammt.
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

      {!done ? (
        <div className="flex flex-wrap gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={working}
              className={`${navButton} border border-nord-ink text-nord-ink hover:bg-nord-paper-2`}
            >
              ← Zurück
            </button>
          ) : null}
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className={`${navButton} bg-nord-ink text-white hover:opacity-90`}
            >
              Weiter →
            </button>
          ) : (
            <button
              type="submit"
              disabled={working}
              className={`${navButton} bg-nord-ink text-white hover:opacity-90`}
            >
              {working ? "Wird gesendet…" : "Antrag absenden →"}
            </button>
          )}
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
      {result.sent ? (
        <p className="mt-3 rounded-md bg-nord-paper-2 px-3 py-2 text-nord-ink">
          Bitte kontrolliere im PDF noch einmal die Angaben, bei einem Wechsel
          auch <strong>Seite 2</strong> (Wartezeit) und <strong>Seite 3</strong>{" "}
          (Einverständniserklärung zur Online-Abmeldung).
        </p>
      ) : null}
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
