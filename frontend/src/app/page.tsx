"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:3002";

const translations = {
  fr: {
    platform: "AI Business Automation ERP",
    subtitle: "Automatisez vos workflows PDF grâce à l’analyse intelligente.",
    upload: "Importer PDF",
    sync: "Synchroniser",
    logout: "Déconnexion",
    history: "Historique des documents",
    noDocuments: "Aucun document analysé.",
    result: "Analyse IA",
    summary: "Résumé IA",
    extracted: "Données structurées",
    hide: "Masquer JSON",
    show: "Afficher JSON",
    active: "Actif",
    documents: "Documents",
    analyzed: "Analysés IA",
    secure: "Workspace sécurisé",
    loginSubtitle: "Connectez-vous pour accéder à votre espace IA.",
    email: "Email",
    password: "Mot de passe",
    signin: "Connexion",
    connecting: "Connexion...",
  },
  en: {
    platform: "AI Business Automation ERP",
    subtitle: "Automate your PDF workflows with AI-powered extraction.",
    upload: "Upload PDF",
    sync: "Synchronize",
    logout: "Logout",
    history: "Documents History",
    noDocuments: "No analyzed documents yet.",
    result: "AI Analysis",
    summary: "AI Summary",
    extracted: "Structured Data",
    hide: "Hide JSON",
    show: "Show JSON",
    active: "Active",
    documents: "Documents",
    analyzed: "AI Processed",
    secure: "Secure Workspace",
    loginSubtitle: "Sign in to access your AI workspace.",
    email: "Email",
    password: "Password",
    signin: "Sign In",
    connecting: "Connecting...",
  },
  de: {
    platform: "AI Business Automation ERP",
    subtitle: "Automatisieren Sie Ihre PDF-Workflows mit KI.",
    upload: "PDF hochladen",
    sync: "Synchronisieren",
    logout: "Abmelden",
    history: "Dokumentenverlauf",
    noDocuments: "Keine analysierten Dokumente.",
    result: "KI Analyse",
    summary: "KI Zusammenfassung",
    extracted: "Strukturierte Daten",
    hide: "JSON ausblenden",
    show: "JSON anzeigen",
    active: "Aktiv",
    documents: "Dokumente",
    analyzed: "KI verarbeitet",
    secure: "Sicherer Workspace",
    loginSubtitle: "Melden Sie sich an, um auf Ihren KI-Workspace zuzugreifen.",
    email: "E-Mail",
    password: "Passwort",
    signin: "Anmelden",
    connecting: "Verbindung...",
  },
};

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("password123");
  const [showJson, setShowJson] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en" | "de">("fr");

  const t = translations[language];

  useEffect(() => {
    const savedLanguage = localStorage.getItem("lang");

    if (
      savedLanguage === "fr" ||
      savedLanguage === "en" ||
      savedLanguage === "de"
    ) {
      setLanguage(savedLanguage);
    }

    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      loadDocuments(savedToken);
    }
  }, []);

  function changeLanguage(lang: "fr" | "en" | "de") {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);

      setTimeout(() => {
        loadDocuments(data.access_token);
      }, 100);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments(jwt?: string | null) {
    const currentToken = jwt || localStorage.getItem("token");

    if (!currentToken) {
      setDocuments([]);
      setSelectedDocument(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load documents");
      }

      const list = Array.isArray(data) ? data : [];

      setDocuments(list);
      setSelectedDocument(list.length > 0 ? list[0] : null);
      setError("");
    } catch (err: any) {
      console.error("Documents fetch error:", err);

      if (err.message === "Token invalide" || err.message === "Unauthorized") {
        localStorage.removeItem("token");
        setToken(null);
      }

      setError(err.message || "Failed to load documents");
      setDocuments([]);
      setSelectedDocument(null);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const currentToken = token || localStorage.getItem("token");

    if (!file || !currentToken) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      await loadDocuments(currentToken);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setDocuments([]);
    setSelectedDocument(null);
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#050816] flex items-center justify-center text-white px-6 relative overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-cyan-500/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-purple-500/20 blur-[140px] rounded-full" />

        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => changeLanguage("fr")}
              className="text-sm opacity-70 hover:opacity-100"
            >
              FR
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className="text-sm opacity-70 hover:opacity-100"
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("de")}
              className="text-sm opacity-70 hover:opacity-100"
            >
              DE
            </button>
          </div>

          <h1 className="text-4xl font-black mb-3">{t.platform}</h1>
          <p className="text-white/60 mb-8 leading-relaxed">
            {t.loginSubtitle}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 outline-none"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 outline-none"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black font-bold"
            >
              {loading ? t.connecting : t.signin}
            </button>
          </form>

          {error && <p className="text-red-300 text-sm mt-4">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white relative overflow-hidden">
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/20 blur-[180px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-500/20 blur-[180px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black">{t.platform}</h1>
            <p className="text-white/50 mt-2">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage("fr")}
                className="text-sm opacity-70 hover:opacity-100"
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className="text-sm opacity-70 hover:opacity-100"
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("de")}
                className="text-sm opacity-70 hover:opacity-100"
              >
                DE
              </button>
            </div>

            <button
              onClick={logout}
              className="px-5 py-2 rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 transition"
            >
              {t.logout}
            </button>
          </div>
        </div>

        {error && <p className="mb-6 text-red-300">{error}</p>}

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">{t.documents}</p>
            <h2 className="text-4xl font-black">{documents.length}</h2>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">{t.analyzed}</p>
            <h2 className="text-4xl font-black">
              {documents.filter((d) => d.status === "AI_PROCESSED").length}
            </h2>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">{t.secure}</p>
            <h2 className="text-2xl font-bold text-cyan-300">JWT + AI</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="flex gap-4 mb-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black font-bold"
              >
                {loading ? "..." : t.upload}
              </button>

              <button
                onClick={() => loadDocuments()}
                className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition"
              >
                {t.sync}
              </button>
            </div>

            <h3 className="text-2xl font-bold mb-5">{t.history}</h3>

            {documents.length === 0 ? (
              <p className="text-white/50">{t.noDocuments}</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    className={`w-full text-left p-5 rounded-3xl border transition backdrop-blur-xl ${
                      selectedDocument?.id === doc.id
                        ? "bg-cyan-500/10 border-cyan-400/40"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-lg truncate">
                          {doc.fileName}
                        </p>
                        <p className="text-sm text-white/40 mt-2">
                          {doc.extractedData?.document_type || "Unknown"}
                        </p>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                        {doc.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/10 border border-white/10 rounded-[32px] p-8 backdrop-blur-2xl">
            {!selectedDocument ? (
              <p className="text-white/50">Select a document</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t.result}</h2>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                    {t.active}
                  </div>
                </div>

                <div className="space-y-3 text-white/70 mb-6">
                  <p>
                    <span className="text-white font-semibold">File:</span>{" "}
                    {selectedDocument.fileName}
                  </p>
                  <p>
                    <span className="text-white font-semibold">Status:</span>{" "}
                    {selectedDocument.status}
                  </p>
                  <p>
                    <span className="text-white font-semibold">Type:</span>{" "}
                    <span className="text-cyan-300">
                      {selectedDocument.extractedData?.document_type ||
                        "Unknown"}
                    </span>
                  </p>
                </div>

                {selectedDocument.extractedData?.summary && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-3">{t.summary}</h3>
                    <div className="bg-black/20 rounded-2xl p-5 leading-relaxed text-white/80">
                      {selectedDocument.extractedData.summary}
                    </div>
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t.extracted}</h3>
                  <button
                    onClick={() => setShowJson(!showJson)}
                    className="text-cyan-300 text-sm"
                  >
                    {showJson ? t.hide : t.show}
                  </button>
                </div>

                {showJson && (
                  <pre className="max-h-[500px] overflow-auto rounded-2xl bg-black/30 p-5 text-xs border border-white/10 text-cyan-100">
                    {JSON.stringify(selectedDocument.extractedData, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
