"use client";

import { useState, type FormEvent } from "react";

import { Field, RadioGroup } from "@/components/ContactForm";
import {
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
  | { state: "done"; simplified: boolean; kind: AntragKind }
  | { state: "error"; message: string };

function download(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function SpielerpassForm() {
  const [kind, setKind] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [change, setChange] = useState<string>("");
  const [status, setStatus] = useState<string>("amateur");
  const [nationality, setNationality] = useState("");
  const [passError, setPassError] = useState<string>();
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
    try {
      // Erst jetzt laden: pdf-lib ist gross und wird nur hier gebraucht.
      const { fillAntragPdf } = await import("@/lib/spielerpass-pdf");
      const { bytes, fields } = await fillAntragPdf(data);
      download(bytes, antragFileName(data));
      setResult({
        state: "done",
        simplified: fields.simplified,
        kind: data.kind,
      });
    } catch (err) {
      console.error("[spielerpass] PDF konnte nicht erzeugt werden:", err);
      setResult({
        state: "error",
        message:
          "Das Formular konnte nicht erstellt werden. Bitte versuche es noch einmal oder lade das leere Formular unten herunter.",
      });
    }
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
            {working ? "Wird erstellt…" : "Antrag als PDF erstellen →"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

function Next({ result }: { result: Extract<Status, { state: "done" }> }) {
  return (
    <div className="form-reveal rounded-lg border border-nord-navy-2/30 bg-white px-4 py-4 text-sm leading-relaxed text-nord-ink">
      <div className="font-semibold">Dein Antrag wurde heruntergeladen.</div>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-nord-muted">
        <li>PDF ausdrucken.</li>
        <li>
          Unterschreiben:{" "}
          {result.kind === "junioren"
            ? "Spielerin oder Spieler und ein Erziehungsberechtigter (bei E-, F- und G-Junioren genügt der Erziehungsberechtigte)."
            : "die Spielerin oder der Spieler."}{" "}
          Das Original muss mit echter Unterschrift vorliegen.
        </li>
        <li>An deinen Trainer oder den Verein weitergeben.</li>
      </ol>
      {result.simplified ? (
        <p className="mt-3 rounded-md bg-nord-paper-2 px-3 py-2 text-nord-ink">
          Einzelne Sonderzeichen (z. B. ş, ğ) kann das Formular nicht darstellen
          und hat sie vereinfacht. Bitte kontrolliere die Schreibweise von Namen
          und Orten und korrigiere sie bei Bedarf per Hand.
        </p>
      ) : null}
    </div>
  );
}
