"use client";

import { useEffect, useMemo, useState } from "react";

type Invoice = {
  id: string;
  invoiceNumber: string | null;
  supplier: string | null;
  amount: number | null;
  currency: string | null;
  vatAmount: number | null;
  invoiceDate: string | null;
  status: string;
  createdAt: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    fetch("http://localhost:3002/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Erreur API");
        }

        return data;
      })
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Invoices fetch error:", error);
        setInvoices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const query = search.toLowerCase();

      const matchesSearch =
        invoice.invoiceNumber?.toLowerCase().includes(query) ||
        invoice.supplier?.toLowerCase().includes(query) ||
        invoice.status?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + (invoice.amount || 0),
    0,
  );

  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;
  const approvedCount = invoices.filter((i) => i.status === "APPROVED").length;

  function formatMoney(amount: number | null, currency: string | null) {
    return `${amount ?? 0} ${currency || "EUR"}`;
  }

  function statusClass(status: string) {
    if (status === "APPROVED")
      return "bg-green-500/20 text-green-300 border-green-400/30";
    if (status === "PENDING")
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
    if (status === "REJECTED")
      return "bg-red-500/20 text-red-300 border-red-400/30";
    return "bg-slate-500/20 text-slate-300 border-slate-400/30";
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white relative overflow-hidden">
      <div className="absolute top-[-180px] left-[-120px] w-[520px] h-[520px] bg-cyan-500/20 blur-[180px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-120px] w-[520px] h-[520px] bg-purple-500/20 blur-[180px] rounded-full" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <p className="text-cyan-300 text-sm font-semibold mb-2">
              ERP FINANCE MODULE
            </p>
            <h1 className="text-4xl font-black">AI Invoice Dashboard</h1>
            <p className="text-white/50 mt-2">
              Factures extraites automatiquement depuis vos documents IA.
            </p>
          </div>

          <a
            href="/"
            className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
          >
            Retour Dashboard
          </a>
        </div>

        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">Total factures</p>
            <h2 className="text-4xl font-black">{invoices.length}</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">Montant total</p>
            <h2 className="text-3xl font-black">
              {totalAmount.toLocaleString("de-DE")} EUR
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">En attente</p>
            <h2 className="text-4xl font-black text-yellow-300">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-white/50 text-sm mb-2">Validées</p>
            <h2 className="text-4xl font-black text-green-300">
              {approvedCount}
            </h2>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/10 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Factures ERP</h2>
              <p className="text-white/40 text-sm mt-1">
                Recherche, filtrage et suivi comptable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher facture, fournisseur..."
                className="px-4 py-3 rounded-2xl bg-black/20 border border-white/10 outline-none text-sm min-w-[260px]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-black/20 border border-white/10 outline-none text-sm"
              >
                <option value="ALL">Tous</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-white/50 py-10">Chargement des factures...</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-white/50 py-10">Aucune facture trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-white/40 text-sm">
                    <th className="px-4 py-2">Invoice #</th>
                    <th className="px-4 py-2">Fournisseur</th>
                    <th className="px-4 py-2">Montant</th>
                    <th className="px-4 py-2">TVA</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="bg-white/5 hover:bg-white/10 transition"
                    >
                      <td className="px-4 py-4 rounded-l-2xl font-semibold">
                        {invoice.invoiceNumber || "Sans numéro"}
                      </td>

                      <td className="px-4 py-4 text-white/70">
                        {invoice.supplier || "Fournisseur inconnu"}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {formatMoney(invoice.amount, invoice.currency)}
                      </td>

                      <td className="px-4 py-4 text-white/70">
                        {formatMoney(invoice.vatAmount, invoice.currency)}
                      </td>

                      <td className="px-4 py-4 text-white/60">
                        {invoice.invoiceDate
                          ? new Date(invoice.invoiceDate).toLocaleDateString(
                              "fr-FR",
                            )
                          : "Date inconnue"}
                      </td>

                      <td className="px-4 py-4 rounded-r-2xl">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusClass(
                            invoice.status,
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
