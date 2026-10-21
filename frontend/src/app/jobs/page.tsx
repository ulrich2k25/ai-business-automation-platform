"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

const APPLYFLOW_URL =
  process.env.NEXT_PUBLIC_APPLYFLOW_URL || "http://localhost:3002";

type JobAnalysis = {
  companyName: string | null;
  companyWebsite: string | null;
  industry: string | null;
  companyCity: string | null;
  companyCountry: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  jobTitle: string | null;
  jobUrl: string | null;
  location: string | null;
  employmentType: string | null;
  workMode: string | null;
  source: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  deadline: string | null;
  summary: string | null;
  tasks: string[];
  requirements: string[];
  technologies: string[];
};

export default function JobsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const [importedApplicationId, setImportedApplicationId] =
    useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      window.location.href = "/";
      return;
    }

    setToken(savedToken);
  }, []);

  async function analyzeUrl() {
    if (!token || !url.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");
    setAnalysis(null);
    setImportedApplicationId(null);

    try {
      const response = await fetch(`${API_URL}/jobs/analyze-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 502 ||
          response.status === 401 ||
          String(data.message || "").includes("HTTP 401") ||
          String(data.message || "").includes("HTTP 403")
        ) {
          setShowFallback(true);
          setInfo(
            "Die Stellenanzeige konnte von der Website nicht direkt gelesen werden. Fügen Sie den Text der Anzeige unten ein.",
          );
          return;
        }

        throw new Error(data.message || "Analyse fehlgeschlagen.");
      }

      setAnalysis(data);
      setShowFallback(false);
    } catch (err: any) {
      setError(err.message || "Analyse fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeText() {
    if (!token || !url.trim() || jobText.trim().length < 100) {
      setError(
        "Bitte geben Sie die URL und mindestens 100 Zeichen der Stellenanzeige ein.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");
    setAnalysis(null);
    setImportedApplicationId(null);

    try {
      const response = await fetch(`${API_URL}/jobs/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          text: jobText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analyse fehlgeschlagen.");
      }

      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || "Analyse fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  async function importToApplyFlow() {
    if (!token || !analysis) {
      return;
    }

    setImporting(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch(
        `${API_URL}/jobs/import-to-applyflow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(analysis),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Import in ApplyFlow fehlgeschlagen.");
      }

      const applicationId = data?.application?.id;

      if (!applicationId) {
        throw new Error(
          "ApplyFlow hat keine Bewerbungs-ID zurückgegeben.",
        );
      }

      setImportedApplicationId(applicationId);

      setInfo(
        data.imported
          ? "Die Stelle wurde erfolgreich in ApplyFlow gespeichert."
          : "Diese Stelle existiert bereits in ApplyFlow.",
      );
    } catch (err: any) {
      setError(err.message || "Import in ApplyFlow fehlgeschlagen.");
    } finally {
      setImporting(false);
    }
  }

  function openApplyFlow() {
    if (!importedApplicationId) {
      return;
    }

    window.open(
      `${APPLYFLOW_URL}/applications/${importedApplicationId}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function reset() {
    setUrl("");
    setJobText("");
    setAnalysis(null);
    setError("");
    setInfo("");
    setShowFallback(false);
    setImportedApplicationId(null);
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <p className="text-cyan-300 text-sm font-semibold mb-2">
              AI BUSINESS AUTOMATION
            </p>

            <h1 className="text-4xl font-black">
              Stellenanzeige analysieren
            </h1>

            <p className="text-white/50 mt-3 max-w-2xl">
              Lassen Sie eine Stellenanzeige durch KI strukturieren,
              prüfen Sie die wichtigsten Informationen und übernehmen Sie
              die Stelle anschließend in ApplyFlow.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Zurück zum Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-cyan-100">
            {info}
          </div>
        )}

        <div className="grid lg:grid-cols-[420px_1fr] gap-8">
          <section className="bg-white/[0.06] border border-white/10 rounded-[30px] p-6 h-fit">
            <h2 className="text-xl font-bold mb-5">
              1. Stellenanzeige
            </h2>

            <label className="block text-sm text-white/60 mb-2">
              URL der Stellenanzeige
            </label>

            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-4 outline-none focus:border-cyan-400/50"
            />

            <button
              type="button"
              onClick={analyzeUrl}
              disabled={loading || !url.trim()}
              className="w-full mt-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-bold px-5 py-4 transition"
            >
              {loading ? "Analyse läuft..." : "URL analysieren"}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/30">ODER</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => setShowFallback(!showFallback)}
              className="w-full rounded-2xl border border-white/10 hover:bg-white/5 px-5 py-3 text-white/70 transition"
            >
              Text der Anzeige einfügen
            </button>

            {showFallback && (
              <div className="mt-5">
                <label className="block text-sm text-white/60 mb-2">
                  Inhalt der Stellenanzeige
                </label>

                <textarea
                  value={jobText}
                  onChange={(event) => setJobText(event.target.value)}
                  rows={12}
                  placeholder="Text der Stellenanzeige hier einfügen..."
                  className="w-full resize-y rounded-2xl bg-black/20 border border-white/10 px-4 py-4 outline-none focus:border-cyan-400/50"
                />

                <p className="text-xs text-white/30 mt-2">
                  Diese Option kann verwendet werden, wenn z. B. Indeed
                  oder eine andere Plattform den direkten Zugriff blockiert.
                </p>

                <button
                  type="button"
                  onClick={analyzeText}
                  disabled={
                    loading ||
                    !url.trim() ||
                    jobText.trim().length < 100
                  }
                  className="w-full mt-4 rounded-2xl bg-purple-400 hover:bg-purple-300 disabled:opacity-40 text-black font-bold px-5 py-4 transition"
                >
                  {loading ? "Analyse läuft..." : "Text analysieren"}
                </button>
              </div>
            )}
          </section>

          <section className="bg-white/[0.06] border border-white/10 rounded-[30px] p-6 md:p-8">
            {!analysis ? (
              <div className="min-h-[500px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-2xl mb-5">
                  AI
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  Noch keine Analyse
                </h2>

                <p className="text-white/40 max-w-md">
                  Geben Sie links eine Stellenanzeige ein. Die relevanten
                  Informationen werden hier strukturiert dargestellt.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between mb-8">
                  <div>
                    <p className="text-cyan-300 text-sm font-semibold mb-2">
                      {analysis.source || "Quelle unbekannt"}
                    </p>

                    <h2 className="text-3xl font-black">
                      {analysis.jobTitle || "Unbekannte Stelle"}
                    </h2>

                    <p className="text-white/60 mt-2">
                      {analysis.companyName || "Unbekanntes Unternehmen"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:bg-white/5"
                  >
                    Neue Analyse
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <InfoCard
                    label="Ort"
                    value={analysis.location}
                  />

                  <InfoCard
                    label="Beschäftigung"
                    value={formatEmploymentType(
                      analysis.employmentType,
                    )}
                  />

                  <InfoCard
                    label="Arbeitsmodell"
                    value={formatWorkMode(analysis.workMode)}
                  />

                  <InfoCard
                    label="Gehalt"
                    value={formatSalary(analysis)}
                  />
                </div>

                {analysis.summary && (
                  <AnalysisSection title="Zusammenfassung">
                    <p className="text-white/70 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </AnalysisSection>
                )}

                <div className="grid xl:grid-cols-2 gap-6 mt-6">
                  <AnalysisList
                    title="Aufgaben"
                    items={analysis.tasks}
                  />

                  <AnalysisList
                    title="Anforderungen"
                    items={analysis.requirements}
                  />
                </div>

                <div className="mt-6">
                  <AnalysisSection title="Technologien & Themen">
                    {analysis.technologies?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="px-3 py-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-200 text-sm"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40">
                        Keine Technologien erkannt.
                      </p>
                    )}
                  </AnalysisSection>
                </div>

                <div className="mt-8 border-t border-white/10 pt-8">
                  {!importedApplicationId ? (
                    <>
                      <p className="text-white/40 text-sm mb-4">
                        Prüfen Sie die Analyse. Erst mit Ihrer Bestätigung
                        wird die Stelle an ApplyFlow übertragen.
                      </p>

                      <button
                        type="button"
                        onClick={importToApplyFlow}
                        disabled={importing}
                        className="w-full md:w-auto px-8 py-4 rounded-2xl bg-green-400 hover:bg-green-300 disabled:opacity-50 text-black font-bold transition"
                      >
                        {importing
                          ? "Übertragung läuft..."
                          : "In ApplyFlow übernehmen"}
                      </button>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-6">
                      <p className="text-green-200 font-semibold mb-4">
                        Die Stelle ist jetzt in ApplyFlow verfügbar.
                      </p>

                      <button
                        type="button"
                        onClick={openApplyFlow}
                        className="px-8 py-4 rounded-2xl bg-green-400 hover:bg-green-300 text-black font-bold transition"
                      >
                        In ApplyFlow öffnen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p className="font-semibold">{value || "Nicht angegeben"}</p>
    </div>
  );
}

function AnalysisSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-black/20 border border-white/10 p-6">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function AnalysisList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <AnalysisSection title={title}>
      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex gap-3 text-white/70"
            >
              <span className="text-cyan-300">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/40">Keine Angaben erkannt.</p>
      )}
    </AnalysisSection>
  );
}

function formatEmploymentType(value: string | null) {
  const labels: Record<string, string> = {
    FULL_TIME: "Vollzeit",
    PART_TIME: "Teilzeit",
    INTERNSHIP: "Praktikum",
    WORKING_STUDENT: "Werkstudent",
    APPRENTICESHIP: "Ausbildung",
    FREELANCE: "Freelance",
    TEMPORARY: "Befristet",
    OTHER: "Andere",
  };

  return value ? labels[value] || value : null;
}

function formatWorkMode(value: string | null) {
  const labels: Record<string, string> = {
    ON_SITE: "Vor Ort",
    HYBRID: "Hybrid",
    REMOTE: "Remote",
  };

  return value ? labels[value] || value : null;
}

function formatSalary(analysis: JobAnalysis) {
  if (
    analysis.salaryMin == null &&
    analysis.salaryMax == null
  ) {
    return null;
  }

  const currency = analysis.currency || "";

  if (
    analysis.salaryMin != null &&
    analysis.salaryMax != null
  ) {
    return `${analysis.salaryMin} – ${analysis.salaryMax} ${currency}`.trim();
  }

  return `${analysis.salaryMin ?? analysis.salaryMax} ${currency}`.trim();
}
