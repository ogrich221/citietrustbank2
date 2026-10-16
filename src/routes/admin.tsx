import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTransfers } from "@/hooks/use-transfers";
import {
  type BankTransfer,
  type TransferStatus,
  type TransferType,
  downloadTransferReceipt,
} from "@/lib/transfers-store";
import {
  ShieldCheck,
  Building2,
  Globe,
  Lock,
  Unlock,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  Eye,
  Download,
  Landmark,
  KeyRound,
  FileText,
  UserCheck,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Calendar,
  DollarSign,
  AlertOctagon
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Bank Administration & Wire Triage | citiEtrust Bank" },
      {
        name: "description",
        content:
          "Internal administrative console for reviewing, approving, rejecting, and compliance-screening domestic and international wire transfers.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { transfers, updateTransferStatus, resetTransfersToDefault } = useTransfers();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("citietrust_admin_auth") === "true";
  });
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState("");

  // Officer Profile
  const [officerName, setOfficerName] = useState<string>("Officer V. Montgomery (Compliance Lead)");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Selected Transfer for Action Drawer/Modal
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransfer | null>(null);

  // Modal Action Form States
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_info" | "flag" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.trim().toLowerCase();
    if (clean === "citietrust2026" || clean === "citi2026" || clean === "admin2026" || clean === "etrust2026") {
      setIsAuthenticated(true);
      setPasskeyError("");
      sessionStorage.setItem("citietrust_admin_auth", "true");
    } else {
      setPasskeyError("Invalid administrative security passkey. Access restricted.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasskeyInput("");
    setPasskeyError("");
    sessionStorage.removeItem("citietrust_admin_auth");
  };

  // Filtered List
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        t.referenceNumber.toLowerCase().includes(q) ||
        t.recipientFullName.toLowerCase().includes(q) ||
        t.recipientBankName.toLowerCase().includes(q) ||
        t.senderAccount.ownerName.toLowerCase().includes(q) ||
        t.amount.toString().includes(q);

      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesType = typeFilter === "All" || t.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transfers, searchTerm, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = transfers.length;
    const pendingTransfers = transfers.filter((t) => t.status === "Pending Review");
    const pendingCount = pendingTransfers.length;
    const pendingVolume = pendingTransfers.reduce((acc, t) => acc + t.totalDebitUSD, 0);

    const flaggedCount = transfers.filter((t) => t.status === "Flagged for AML/Compliance").length;
    const approvedTransfers = transfers.filter((t) => t.status === "Approved");
    const approvedVolume = approvedTransfers.reduce((acc, t) => acc + t.totalDebitUSD, 0);

    return { totalCount, pendingCount, pendingVolume, flaggedCount, approvedVolume };
  }, [transfers]);

  // Execute Officer Actions
  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer || !actionType) return;

    let targetStatus: TransferStatus;
    let options: {
      actorName: string;
      notes?: string;
      rejectionReason?: string;
      requestInfoReason?: string;
    } = {
      actorName: officerName,
      notes: actionNotes.trim() || undefined,
    };

    if (actionType === "approve") {
      targetStatus = "Approved";
      options.notes = actionNotes.trim() || "Compliance verification completed. Dispatched to settlement network.";
    } else if (actionType === "reject") {
      targetStatus = "Rejected";
      options.rejectionReason = actionNotes.trim() || "Transaction declined per institutional underwriting guidelines.";
    } else if (actionType === "request_info") {
      targetStatus = "Information Requested";
      options.requestInfoReason =
        actionNotes.trim() || "Additional supporting documentation requested (invoice / contract).";
    } else {
      targetStatus = "Flagged for AML/Compliance";
      options.notes = actionNotes.trim() || "Flagged for heightened FinCEN / BSA compliance scrutiny.";
    }

    const updated = updateTransferStatus(selectedTransfer.id, targetStatus, options);
    if (updated) {
      setSelectedTransfer(updated);
      setToastMessage(`Transfer ${updated.referenceNumber} updated to "${targetStatus}".`);
      setTimeout(() => setToastMessage(""), 5000);
    }
    setActionType(null);
    setActionNotes("");
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Reference Number",
      "Type",
      "Status",
      "Sender Name",
      "Sender Account",
      "Recipient Name",
      "Recipient Bank",
      "Amount",
      "Currency",
      "Fee (USD)",
      "Total Debit (USD)",
      "Created At",
      "Verified Via",
    ];

    const rows = transfers.map((t) => [
      t.referenceNumber,
      t.type,
      t.status,
      t.senderAccount.ownerName,
      t.senderAccount.accountNumberMasked,
      t.recipientFullName,
      t.recipientBankName,
      t.amount,
      t.currency,
      t.fee,
      t.totalDebitUSD,
      t.createdAt,
      t.verificationEmail,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `citiEtrust_Transfers_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOCKED STATE (LOGIN SCREEN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#102A43] font-sans flex flex-col justify-between">
        <header className="border-b border-[#E3DCCE] bg-[#FAF8F5] py-4 px-6">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-[#102A43] shadow-inner">
                <Landmark className="h-5 w-5 text-[#E6C663]" />
              </span>
              <span className="font-serif text-lg font-bold tracking-tight text-[#102A43]">
                citiEtrust BANK
              </span>
            </Link>
            <Link to="/" className="text-xs font-serif text-muted-foreground hover:underline">
              Return to Public Portal
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-2xl border border-[#E3DCCE] bg-white p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#102A43] text-[#E6C663] shadow-inner">
                <Lock className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-serif font-bold uppercase tracking-[0.2em] text-[#9E7D2B]">
                Restricted Operational Console
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#102A43]">
                Bank Administration Sign In
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your authorized compliance security passkey to access outbound transfer queues, audit trails, and wire approvals.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-semibold text-[#102A43] mb-1">
                  Administrative Passkey
                </label>
                <input
                  type="password"
                  required
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value);
                    setPasskeyError("");
                  }}
                  placeholder="Enter administrator passkey"
                  className="w-full rounded-lg border border-[#D5CEBF] bg-[#FFFDF9] px-3.5 py-2.5 text-sm text-[#102A43] focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                />
                {passkeyError && <p className="text-xs text-red-600 mt-1 font-medium">{passkeyError}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Accepted keys for staff testing: <code className="text-[#9E7D2B] font-bold">citietrust2026</code>,{" "}
                  <code className="text-[#9E7D2B] font-bold">citi2026</code>, or <code className="text-[#9E7D2B] font-bold">admin2026</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-[#D4AF37] bg-[#102A43] py-3 font-serif text-xs font-bold uppercase tracking-[0.16em] text-[#FBF9F5] shadow-md hover:bg-[#16385C] transition"
              >
                <Unlock className="h-4 w-4 text-[#E6C663]" /> Unlock Administration Console
              </button>
            </form>

            <div className="pt-2 border-t border-[#E3DCCE] text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Protected under FinCEN & BSA Compliance Standards</span>
            </div>
          </div>
        </main>

        <footer className="border-t border-[#E3DCCE] py-4 text-center text-xs text-muted-foreground">
          © 2026 citiEtrust Bank, N.A. Chartered 1952. All rights reserved.
        </footer>
      </div>
    );
  }

  // AUTHENTICATED ADMIN CONSOLE
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#102A43] font-sans antialiased flex flex-col">
      {/* Top Staff Ribbon */}
      <aside className="border-b border-[#E3DCCE] bg-[#102A43] py-2 text-xs text-[#FBF9F5]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-serif font-semibold text-[#E6C663]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#E6C663]" /> citiEtrust BANK · ADMINISTRATIVE & COMPLIANCE OPERATIONS
            </span>
            <span className="hidden text-slate-400 sm:inline">|</span>
            <span className="text-slate-300">AUTHORIZED OFFICER: {officerName}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/transfers" className="text-[#E6C663] hover:underline font-serif font-medium flex items-center gap-1">
              <ArrowRight className="h-3 w-3" /> User Transfer Portal
            </Link>
            <span className="text-slate-400">|</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-300 hover:text-red-200 transition flex items-center gap-1 font-serif"
            >
              <LogOut className="h-3 w-3" /> Lock Console
            </button>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-[#E3DCCE] bg-[#FAF8F5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-[#102A43] shadow-inner">
              <Landmark className="h-6 w-6 text-[#E6C663]" />
            </span>
            <div>
              <span className="block font-serif text-xl font-bold tracking-tight text-[#102A43]">
                citiEtrust BANK
              </span>
              <span className="block text-[10px] font-serif uppercase tracking-[0.22em] text-[#9E7D2B]">
                Underwriting & Wire Triage Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#D5CEBF] bg-white px-3.5 py-2 font-serif text-xs font-semibold text-[#102A43] hover:bg-[#FAF8F5] transition"
            >
              <Download className="h-3.5 w-3.5 text-[#9E7D2B]" /> Export CSV
            </button>

            <Link
              to="/transfers"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#D4AF37] bg-[#102A43] px-4 py-2 font-serif text-xs font-bold text-[#FBF9F5] hover:bg-[#16385C] transition shadow-xs"
            >
              + Initiate New Wire
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-8 px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage("")}
                className="text-emerald-700 hover:text-emerald-900 text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#E3DCCE] bg-white p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                Pending Officer Review
              </span>
              <p className="font-serif text-2xl font-bold text-amber-700">{stats.pendingCount}</p>
              <p className="text-xs text-muted-foreground">
                ${stats.pendingVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })} held for triage
              </p>
            </div>

            <div className="rounded-2xl border border-[#E3DCCE] bg-white p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                AML / Fraud Holds
              </span>
              <p className="font-serif text-2xl font-bold text-purple-700">{stats.flaggedCount}</p>
              <p className="text-xs text-muted-foreground">Requires BSA Officer clearance</p>
            </div>

            <div className="rounded-2xl border border-[#E3DCCE] bg-white p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                Settled / Approved Outflows
              </span>
              <p className="font-serif text-2xl font-bold text-emerald-700">
                ${stats.approvedVolume.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">Dispatched to Fedwire & SWIFT</p>
            </div>

            <div className="rounded-2xl border border-[#E3DCCE] bg-white p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                Total Transfers in Ledger
              </span>
              <p className="font-serif text-2xl font-bold text-[#102A43]">{stats.totalCount}</p>
              <p className="text-xs text-muted-foreground">Domestic & International</p>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="rounded-2xl border border-[#E3DCCE] bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference #, recipient name, bank, or sender..."
                className="w-full rounded-lg border border-[#D5CEBF] bg-[#FFFDF9] pl-9 pr-3.5 py-2 text-xs text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-serif font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[#D5CEBF] bg-[#FFFDF9] px-2.5 py-1.5 text-xs text-[#102A43] font-semibold"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Information Requested">Information Requested</option>
                  <option value="Flagged for AML/Compliance">Flagged for AML/Compliance</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-serif font-medium">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-[#D5CEBF] bg-[#FFFDF9] px-2.5 py-1.5 text-xs text-[#102A43] font-semibold"
                >
                  <option value="All">All Types</option>
                  <option value="domestic">Domestic (Fedwire/ACH)</option>
                  <option value="international">International (SWIFT)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={resetTransfersToDefault}
                title="Reset test data"
                className="text-xs text-muted-foreground hover:text-[#102A43] flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset Seeds
              </button>
            </div>
          </div>

          {/* Transfer Table */}
          <div className="rounded-2xl border border-[#E3DCCE] bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E3DCCE] bg-[#FAF8F5] text-[11px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Originating Sender</th>
                    <th className="py-3 px-4">Beneficiary</th>
                    <th className="py-3 px-4">Principal Amount</th>
                    <th className="py-3 px-4">Total Debit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCCE]">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-muted-foreground">
                        No transfer records match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((trf) => (
                      <tr key={trf.id} className="hover:bg-[#FAF8F5]/80 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[#102A43]">{trf.referenceNumber}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            {new Date(trf.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              trf.type === "domestic"
                                ? "bg-slate-100 text-slate-800"
                                : "bg-[#E6C663]/20 text-[#9E7D2B] border border-[#9E7D2B]/30"
                            }`}
                          >
                            {trf.type === "domestic" ? <Building2 className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {trf.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-[#102A43] block">{trf.senderAccount.ownerName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {trf.senderAccount.accountNumberMasked}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-[#102A43] block">{trf.recipientFullName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {trf.recipientBankName} ({trf.bankIdentifierCode})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium">
                          {trf.currency} {trf.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4 font-serif font-bold text-[#102A43]">
                          ${trf.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-serif font-bold border ${
                              trf.status === "Pending Review"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : trf.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : trf.status === "Flagged for AML/Compliance"
                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                : trf.status === "Information Requested"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {trf.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTransfer(trf);
                                setActionType(null);
                              }}
                              className="inline-flex items-center gap-1 rounded border border-[#D5CEBF] bg-white px-2.5 py-1 font-serif text-[11px] font-semibold text-[#102A43] hover:bg-slate-50 transition shadow-xs"
                            >
                              <Eye className="h-3 w-3 text-[#9E7D2B]" /> Triage
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadTransferReceipt(trf)}
                              title="Download Receipt"
                              className="p-1 rounded border border-[#D5CEBF] hover:bg-slate-50 text-slate-700"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* TRANSFER DETAIL & OFFICER ACTION MODAL */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-[#E3DCCE] bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E3DCCE] bg-[#FAF8F5] p-5">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                  Outbound Wire Compliance Dossier
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h3 className="font-mono text-xl font-bold text-[#102A43]">
                    {selectedTransfer.referenceNumber}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold border ${
                      selectedTransfer.status === "Pending Review"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : selectedTransfer.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : selectedTransfer.status === "Flagged for AML/Compliance"
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : selectedTransfer.status === "Information Requested"
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    }`}
                  >
                    {selectedTransfer.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTransfer(null);
                  setActionType(null);
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Compliance Badges */}
              {selectedTransfer.complianceFlags.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
                  <span className="font-serif font-bold text-amber-900 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-700" /> Automated Risk & Compliance Flags:
                  </span>
                  <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-0.5">
                    {selectedTransfer.complianceFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sender & Beneficiary Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E3DCCE] bg-[#FAF8F5] p-4 space-y-2">
                  <span className="font-serif font-bold uppercase text-[10px] text-[#9E7D2B]">
                    Originating Source
                  </span>
                  <p className="font-serif font-bold text-sm text-[#102A43]">
                    {selectedTransfer.senderAccount.ownerName}
                  </p>
                  <p className="text-muted-foreground">{selectedTransfer.senderAccount.name}</p>
                  <p className="font-mono text-muted-foreground">{selectedTransfer.senderAccount.accountNumberMasked}</p>
                  <div className="pt-2 border-t border-[#E3DCCE] text-[11px] text-muted-foreground">
                    <span>MFA Verified Target: </span>
                    <strong className="text-[#102A43]">{selectedTransfer.verificationEmail}</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E3DCCE] bg-[#FAF8F5] p-4 space-y-2">
                  <span className="font-serif font-bold uppercase text-[10px] text-[#9E7D2B]">
                    Beneficiary Destination
                  </span>
                  <p className="font-serif font-bold text-sm text-[#102A43]">
                    {selectedTransfer.recipientFullName}
                  </p>
                  <p className="text-muted-foreground">{selectedTransfer.recipientBankName}</p>
                  <p className="font-mono text-muted-foreground">
                    {selectedTransfer.bankIdentifierType.toUpperCase()}: {selectedTransfer.bankIdentifierCode}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    Account/IBAN: {selectedTransfer.accountNumberMasked}
                  </p>
                  {selectedTransfer.recipientAddress && (
                    <p className="text-[11px] text-muted-foreground pt-1 border-t border-[#E3DCCE]">
                      {selectedTransfer.recipientAddress.street}, {selectedTransfer.recipientAddress.city},{" "}
                      {selectedTransfer.recipientAddress.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Settlement Summary */}
              <div className="rounded-xl border border-[#9E7D2B]/30 bg-[#FFFDF9] p-4 space-y-2">
                <span className="font-serif font-bold uppercase text-[10px] text-[#9E7D2B]">
                  Financial Settlement
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Principal:</span>
                    <p className="font-serif font-bold text-[#102A43] text-sm">
                      {selectedTransfer.currency} {selectedTransfer.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fee:</span>
                    <p className="font-bold text-[#102A43]">${selectedTransfer.fee.toFixed(2)} USD</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Outflow:</span>
                    <p className="font-serif font-bold text-[#102A43] text-sm">
                      ${selectedTransfer.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery:</span>
                    <p className="font-medium text-emerald-700">{selectedTransfer.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E3DCCE]">
                  <span className="text-muted-foreground">Payment Purpose: </span>
                  <strong className="text-[#102A43]">{selectedTransfer.transferPurpose}</strong>
                </div>
              </div>

              {/* Existing Officer Notes */}
              {(selectedTransfer.adminNotes || selectedTransfer.rejectionReason || selectedTransfer.requestInfoReason) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <span className="font-serif font-bold text-[#102A43]">Prior Officer Action Notes:</span>
                  {selectedTransfer.adminNotes && (
                    <p className="text-slate-700"><strong>Notes:</strong> {selectedTransfer.adminNotes}</p>
                  )}
                  {selectedTransfer.rejectionReason && (
                    <p className="text-red-700"><strong>Rejection Cause:</strong> {selectedTransfer.rejectionReason}</p>
                  )}
                  {selectedTransfer.requestInfoReason && (
                    <p className="text-blue-700"><strong>Documentation Request:</strong> {selectedTransfer.requestInfoReason}</p>
                  )}
                  {selectedTransfer.adminActionBy && (
                    <p className="text-[10px] text-muted-foreground pt-1">
                      Actioned by {selectedTransfer.adminActionBy} on{" "}
                      {new Date(selectedTransfer.adminActionAt || "").toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Audit Log Timeline */}
              <div className="space-y-2">
                <span className="font-serif font-bold text-[#102A43]">Institutional Audit Trail</span>
                <div className="rounded-xl border border-[#E3DCCE] bg-white divide-y divide-[#E3DCCE]">
                  {selectedTransfer.auditLog.map((log, idx) => (
                    <div key={idx} className="p-3 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#102A43]">{log.action}</span>
                        <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">Actor: {log.actor}</p>
                      <p className="text-slate-700">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* OFFICER ACTION CONTROLS */}
              <div className="pt-4 border-t border-[#E3DCCE] space-y-4">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#9E7D2B]">
                  Authorized Officer Triage Decision
                </span>

                {!actionType ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActionType("approve")}
                      className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2.5 font-serif font-bold text-emerald-800 hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Approve Wire
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType("request_info")}
                      className="rounded-lg border border-blue-600 bg-blue-50 px-3 py-2.5 font-serif font-bold text-blue-800 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="h-4 w-4 text-blue-600" /> Request Info
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType("flag")}
                      className="rounded-lg border border-purple-600 bg-purple-50 px-3 py-2.5 font-serif font-bold text-purple-800 hover:bg-purple-100 transition flex items-center justify-center gap-1.5"
                    >
                      <AlertOctagon className="h-4 w-4 text-purple-600" /> Flag for AML
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType("reject")}
                      className="rounded-lg border border-red-600 bg-red-50 px-3 py-2.5 font-serif font-bold text-red-800 hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4 text-red-600" /> Reject Wire
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleExecuteAction} className="rounded-xl border border-[#9E7D2B]/30 bg-[#FFFDF9] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs uppercase text-[#102A43]">
                        {actionType === "approve"
                          ? "Authorize & Dispatch Outbound Wire"
                          : actionType === "reject"
                          ? "Enter Rejection Cause"
                          : actionType === "request_info"
                          ? "Request Customer Supporting Documentation"
                          : "Place BSA / AML Compliance Hold"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        {actionType === "approve"
                          ? "Compliance Sign-off Notes (Optional)"
                          : actionType === "reject"
                          ? "Rejection Reason (Required)"
                          : actionType === "request_info"
                          ? "Information or Documentation Required (Required)"
                          : "AML Screening Rationale (Required)"}
                      </label>
                      <textarea
                        required={actionType !== "approve"}
                        rows={3}
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder={
                          actionType === "approve"
                            ? "e.g. Beneficiary verified against OFAC SDN list. Approved for next Fedwire batch."
                            : actionType === "reject"
                            ? "e.g. Incompatible beneficiary details, suspected unverified third party."
                            : actionType === "request_info"
                            ? "e.g. Please provide commercial invoice and counterparty contract for verification."
                            : "e.g. High velocity transfer to newly incorporated offshore entity."
                        }
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white p-2.5 text-xs text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="rounded px-3 py-1.5 text-xs font-serif font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className={`rounded-md px-4 py-2 font-serif text-xs font-bold text-white shadow-xs ${
                          actionType === "approve"
                            ? "bg-emerald-700 hover:bg-emerald-800"
                            : actionType === "reject"
                            ? "bg-red-700 hover:bg-red-800"
                            : actionType === "request_info"
                            ? "bg-blue-700 hover:bg-blue-800"
                            : "bg-purple-700 hover:bg-purple-800"
                        }`}
                      >
                        Confirm Decision
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#E3DCCE] bg-[#FAF8F5] p-4 text-xs">
              <button
                type="button"
                onClick={() => downloadTransferReceipt(selectedTransfer)}
                className="inline-flex items-center gap-1.5 font-serif font-semibold text-[#102A43] hover:underline"
              >
                <Download className="h-3.5 w-3.5 text-[#9E7D2B]" /> Download Official Receipt Slip
              </button>

              <button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                className="rounded-md border border-[#D5CEBF] bg-white px-4 py-1.5 font-serif font-semibold text-[#102A43] hover:bg-slate-50 shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
