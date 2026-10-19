import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BankBackButton } from "@/components/bank-back-button";
import { formatWireAddress } from "@/lib/wire-details";
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
      { property: "og:title", content: "Administration Preview | citiEtrust Bank" },
      { property: "og:description", content: "Account setup directory and demonstration wire review workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const { accounts, transfers, updateTransferStatus, resetTransfersToDefault } = useTransfers();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"queue" | "setup">("queue");
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
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    setSelectedTransfer(null);
    setIsAuthenticated(false);
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
      options.notes = actionNotes.trim() || "Demo review completed. No funds transmitted.";
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
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between banking-workspace">
        <header className="border-b border-border bg-background py-4 px-6">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3"><BankBackButton />
            <Link to="/" className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/60 bg-navy shadow-inner">
                <Landmark className="h-5 w-5 text-gold" />
              </span>
              <span className="font-serif text-lg font-bold tracking-normal text-foreground">
                citiEtrust BANK
              </span>
            </Link>
            <Link to="/" className="text-xs font-serif text-muted-foreground hover:underline">
              Return to Public Portal
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-navy text-gold shadow-inner">
                <Lock className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-serif font-bold uppercase tracking-[0.2em] text-gold">
                Demonstration Workspace
              </span>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Administration Preview
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review sample wires and account setup.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-muted-foreground">Sample accounts and transfer requests only. No real funds, staff authentication, or payment-network connection.</p>

              <Button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gold bg-navy py-3 font-serif text-xs font-bold uppercase tracking-[0.16em] text-foreground shadow-md hover:bg-secondary transition"
              >
                <Unlock className="h-4 w-4 text-gold" /> Open Demo Dashboard
              </Button>
            </form>

            <div className="pt-2 border-t border-border text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
              <span>Demonstration only — not a secure staff portal</span>
            </div>
          </div>
        </main>

        <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © 2026 citiEtrust Bank, N.A. Chartered 1952. All rights reserved.
        </footer>
      </div>
    );
  }

  // AUTHENTICATED ADMIN CONSOLE
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col banking-workspace">
      {/* Top Staff Ribbon */}
      <aside className="border-b border-border bg-navy py-2 text-xs text-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-serif font-semibold text-gold">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" /> citiEtrust BANK · ADMINISTRATIVE & COMPLIANCE OPERATIONS
            </span>
            <span className="hidden text-foreground sm:inline">|</span>
            <span className="text-foreground">AUTHORIZED OFFICER: {officerName}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/transfers" className="text-gold hover:underline font-serif font-medium flex items-center gap-1">
              <ArrowRight className="h-3 w-3" /> User Transfer Portal
            </Link>
            <span className="text-foreground">|</span>
            <Button
              type="button"
              onClick={handleLogout}
              className="text-foreground hover:text-foreground transition flex items-center gap-1 font-serif"
            >
              <LogOut className="h-3 w-3" /> Exit Preview
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4"><BankBackButton onBack={selectedTransfer ? () => setSelectedTransfer(null) : dashboardTab === "setup" ? () => setDashboardTab("queue") : undefined} />
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/60 bg-navy shadow-inner">
              <Landmark className="h-6 w-6 text-gold" />
            </span>
            <div>
              <span className="block font-serif text-xl font-bold tracking-normal text-foreground">
                citiEtrust BANK
              </span>
              <span className="block text-[10px] font-serif uppercase tracking-[0.22em] text-gold">
                Underwriting & Wire Triage Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3.5 py-2 font-serif text-xs font-semibold text-foreground hover:bg-background transition"
            >
              <Download className="h-3.5 w-3.5 text-gold" /> Export CSV
            </Button>

            <Link
              to="/transfers"
              className="inline-flex items-center gap-1.5 rounded-md border border-gold bg-navy px-4 py-2 font-serif text-xs font-bold text-foreground hover:bg-secondary transition shadow-xs"
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
            <div className="rounded-lg border border-border bg-muted p-4 text-xs font-medium text-foreground flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-foreground" />
                <span>{toastMessage}</span>
              </div>
              <Button
                type="button"
                onClick={() => setToastMessage("")}
                className="text-foreground hover:text-foreground text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}

          <section className="space-y-4 border-b border-border pb-6">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs text-gold">DEMONSTRATION WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold text-foreground">Administration</h1></div>
            <div role="tablist" aria-label="Admin views" className="flex gap-2"><Button role="tab" aria-selected={dashboardTab === "queue"} variant={dashboardTab === "queue" ? "default" : "outline"} onClick={() => setDashboardTab("queue")}><FileText className="h-4 w-4" />Wire queue</Button><Button role="tab" aria-selected={dashboardTab === "setup"} variant={dashboardTab === "setup" ? "default" : "outline"} onClick={() => setDashboardTab("setup")}><UserCheck className="h-4 w-4" />Account setup</Button></div></div>
          </section>
          {dashboardTab === "setup" && <section className="space-y-6 border-b border-border pb-6">
            <div className="max-w-md"><label htmlFor="reviewer-name" className="mb-2 block text-sm font-medium">Demo reviewer name</label><Input id="reviewer-name" value={officerName} onChange={event => setOfficerName(event.target.value)} /></div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground"><span>Accounts: <strong className="text-foreground">{accounts.length}</strong></span><span>Profiles: <strong className="text-foreground">{new Set(accounts.map(a => a.ownerEmail)).size}</strong></span><span>Live banking connection: <strong className="text-gold">Not connected</strong></span></div>
            <h2 className="text-xl font-semibold">Account directory</h2>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="py-3 pr-4">Account holder</th><th className="pr-4">Account</th><th className="pr-4">Currency</th><th className="text-right">Sample balance</th></tr></thead><tbody>{accounts.map(account => <tr key={account.id} className="border-b border-border"><td className="py-4 pr-4">{account.ownerName}</td><td className="pr-4">{account.name}<p className="text-xs text-muted-foreground">{account.accountNumberMasked}</p></td><td>{account.currency}</td><td className="text-right">{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>)}</tbody></table></div>
            <p className="text-sm text-muted-foreground">Live staff roles, identity verification, and bank-network access have not been configured.</p>
          </section>}
          {dashboardTab === "queue" && <>
          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                Pending Officer Review
              </span>
              <p className="font-serif text-2xl font-bold text-foreground">{stats.pendingCount}</p>
              <p className="text-xs text-muted-foreground">
                ${stats.pendingVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })} held for triage
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                AML / Fraud Holds
              </span>
              <p className="font-serif text-2xl font-bold text-foreground">{stats.flaggedCount}</p>
              <p className="text-xs text-muted-foreground">Requires BSA Officer clearance</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                Approved Requests
              </span>
              <p className="font-serif text-2xl font-bold text-foreground">
                ${stats.approvedVolume.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">Sample requests; no funds transmitted</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-1">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                Total Transfers in Ledger
              </span>
              <p className="font-serif text-2xl font-bold text-foreground">{stats.totalCount}</p>
              <p className="text-xs text-muted-foreground">Domestic & International</p>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference #, recipient name, bank, or sender..."
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-serif font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold"
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
                  className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold"
                >
                  <option value="All">All Types</option>
                  <option value="domestic">Domestic (Fedwire/ACH)</option>
                  <option value="international">International (SWIFT)</option>
                </select>
              </div>

              <Button
                type="button"
                onClick={resetTransfersToDefault}
                title="Reset test data"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset Seeds
              </Button>
            </div>
          </div>

          {/* Transfer Table */}
          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-background text-[11px] font-serif font-bold uppercase tracking-wider text-gold">
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
                <tbody className="divide-y divide-border">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-muted-foreground">
                        No transfer records match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((trf) => (
                      <tr key={trf.id} className="hover:bg-background/80 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-foreground">{trf.referenceNumber}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            {new Date(trf.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              trf.type === "domestic"
                                ? "bg-muted text-foreground"
                                : "bg-gold/20 text-gold border border-gold/30"
                            }`}
                          >
                            {trf.type === "domestic" ? <Building2 className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {trf.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-foreground block">{trf.senderAccount.ownerName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {trf.senderAccount.accountNumberMasked}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-foreground block">{trf.recipientFullName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {trf.recipientBankName} ({trf.bankIdentifierCode})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium">
                          {trf.currency} {trf.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4 font-serif font-bold text-foreground">
                          ${trf.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-serif font-bold border ${
                              trf.status === "Pending Review"
                                ? "bg-muted text-foreground border-border"
                                : trf.status === "Approved"
                                ? "bg-muted text-foreground border-border"
                                : trf.status === "Flagged for AML/Compliance"
                                ? "bg-muted text-foreground border-border"
                                : trf.status === "Information Requested"
                                ? "bg-muted text-foreground border-border"
                                : "bg-muted text-foreground border-border"
                            }`}
                          >
                            {trf.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              onClick={() => {
                                setSelectedTransfer(trf);
                                setActionType(null);
                              }}
                              className="inline-flex items-center gap-1 rounded border border-input bg-card px-2.5 py-1 font-serif text-[11px] font-semibold text-foreground hover:bg-muted transition shadow-xs"
                            >
                              <Eye className="h-3 w-3 text-gold" /> Triage
                            </Button>

                            <Button
                              type="button"
                              onClick={() => downloadTransferReceipt(trf)}
                              title="Download Receipt"
                              className="p-1 rounded border border-input hover:bg-muted text-foreground"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>}
        </div>
      </main>

      {/* TRANSFER DETAIL & OFFICER ACTION MODAL */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-lg border border-border bg-card shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-background p-5">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                  Outbound Wire Compliance Dossier
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h3 className="font-mono text-xl font-bold text-foreground">
                    {selectedTransfer.referenceNumber}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold border ${
                      selectedTransfer.status === "Pending Review"
                        ? "bg-muted text-foreground border-border"
                        : selectedTransfer.status === "Approved"
                        ? "bg-muted text-foreground border-border"
                        : selectedTransfer.status === "Flagged for AML/Compliance"
                        ? "bg-muted text-foreground border-border"
                        : selectedTransfer.status === "Information Requested"
                        ? "bg-muted text-foreground border-border"
                        : "bg-muted text-foreground border-border"
                    }`}
                  >
                    {selectedTransfer.status}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setSelectedTransfer(null);
                  setActionType(null);
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted text-sm"
              >
                ✕
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Compliance Badges */}
              {selectedTransfer.complianceFlags.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/70 p-3.5 space-y-1">
                  <span className="font-serif font-bold text-foreground text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-foreground" /> Automated Risk & Compliance Flags:
                  </span>
                  <ul className="list-disc list-inside text-foreground text-[11px] space-y-0.5">
                    {selectedTransfer.complianceFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sender & Beneficiary Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                  <span className="font-serif font-bold uppercase text-[10px] text-gold">
                    Originating Source
                  </span>
                  <p className="font-serif font-bold text-sm text-foreground">
                    {selectedTransfer.senderAccount.ownerName}
                  </p>
                  <p className="text-muted-foreground">{selectedTransfer.senderAccount.name}</p>
                  <p className="font-mono text-muted-foreground">{selectedTransfer.senderAccount.accountNumberMasked}</p>
                  <div className="pt-2 border-t border-border text-[11px] text-muted-foreground">
                    <span>MFA Verified Target: </span>
                    <strong className="text-foreground">{selectedTransfer.verificationEmail}</strong>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                  <span className="font-serif font-bold uppercase text-[10px] text-gold">
                    Beneficiary Destination
                  </span>
                  <p className="font-serif font-bold text-sm text-foreground">
                    {selectedTransfer.recipientFullName}
                  </p>
                  <p className="text-muted-foreground">{selectedTransfer.recipientBankName}</p>
                  <p className="font-mono text-muted-foreground">
                    {selectedTransfer.bankIdentifierType.toUpperCase()}: {selectedTransfer.bankIdentifierCode}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    Account/IBAN: {selectedTransfer.accountNumberMasked}
                  </p>
                  <p className="text-xs text-muted-foreground">Bank address: {formatWireAddress(selectedTransfer.recipientBankAddress)}</p>
                  {selectedTransfer.recipientAddress && (
                    <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                      {selectedTransfer.recipientAddress.street}, {selectedTransfer.recipientAddress.city},{" "}
                      {selectedTransfer.recipientAddress.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Settlement Summary */}
              <div className="rounded-lg border border-gold/30 bg-card p-4 space-y-2">
                <span className="font-serif font-bold uppercase text-[10px] text-gold">
                  Financial Settlement
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Principal:</span>
                    <p className="font-serif font-bold text-foreground text-sm">
                      {selectedTransfer.currency} {selectedTransfer.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fee:</span>
                    <p className="font-bold text-foreground">${selectedTransfer.fee.toFixed(2)} USD</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Outflow:</span>
                    <p className="font-serif font-bold text-foreground text-sm">
                      ${selectedTransfer.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery:</span>
                    <p className="font-medium text-foreground">{selectedTransfer.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground">Payment Purpose: </span>
                  <strong className="text-foreground">{selectedTransfer.transferPurpose}</strong>
                </div>
              </div>

              {/* Existing Officer Notes */}
              {(selectedTransfer.adminNotes || selectedTransfer.rejectionReason || selectedTransfer.requestInfoReason) && (
                <div className="rounded-lg border border-border bg-muted p-4 space-y-1.5">
                  <span className="font-serif font-bold text-foreground">Prior Officer Action Notes:</span>
                  {selectedTransfer.adminNotes && (
                    <p className="text-foreground"><strong>Notes:</strong> {selectedTransfer.adminNotes}</p>
                  )}
                  {selectedTransfer.rejectionReason && (
                    <p className="text-foreground"><strong>Rejection Cause:</strong> {selectedTransfer.rejectionReason}</p>
                  )}
                  {selectedTransfer.requestInfoReason && (
                    <p className="text-foreground"><strong>Documentation Request:</strong> {selectedTransfer.requestInfoReason}</p>
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
                <span className="font-serif font-bold text-foreground">Institutional Audit Trail</span>
                <div className="rounded-lg border border-border bg-card divide-y divide-border">
                  {selectedTransfer.auditLog.map((log, idx) => (
                    <div key={idx} className="p-3 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">Actor: {log.actor}</p>
                      <p className="text-foreground">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* OFFICER ACTION CONTROLS */}
              <div className="pt-4 border-t border-border space-y-4">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-gold">
                  Authorized Officer Triage Decision
                </span>

                {!actionType ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <Button
                      type="button"
                      onClick={() => setActionType("approve")}
                      className="rounded-lg border border-border bg-muted px-3 py-2.5 font-serif font-bold text-foreground hover:bg-muted transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-foreground" /> Approve Wire
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActionType("request_info")}
                      className="rounded-lg border border-border bg-muted px-3 py-2.5 font-serif font-bold text-foreground hover:bg-muted transition flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="h-4 w-4 text-foreground" /> Request Info
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActionType("flag")}
                      className="rounded-lg border border-border bg-muted px-3 py-2.5 font-serif font-bold text-foreground hover:bg-muted transition flex items-center justify-center gap-1.5"
                    >
                      <AlertOctagon className="h-4 w-4 text-foreground" /> Flag for AML
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActionType("reject")}
                      className="rounded-lg border border-border bg-muted px-3 py-2.5 font-serif font-bold text-foreground hover:bg-muted transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4 text-foreground" /> Reject Wire
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleExecuteAction} className="rounded-lg border border-gold/30 bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs uppercase text-foreground">
                        {actionType === "approve"
                          ? "Approve Demonstration Request"
                          : actionType === "reject"
                          ? "Enter Rejection Cause"
                          : actionType === "request_info"
                          ? "Request Customer Supporting Documentation"
                          : "Place BSA / AML Compliance Hold"}
                      </span>
                      <Button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Cancel
                      </Button>
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
                        className="w-full rounded-lg border border-input bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="rounded px-3 py-1.5 text-xs font-serif font-medium text-foreground hover:bg-muted"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className={`rounded-md px-4 py-2 font-serif text-xs font-bold text-foreground shadow-xs ${
                          actionType === "approve"
                            ? "bg-muted hover:bg-muted"
                            : actionType === "reject"
                            ? "bg-muted hover:bg-muted"
                            : actionType === "request_info"
                            ? "bg-muted hover:bg-muted"
                            : "bg-muted hover:bg-muted"
                        }`}
                      >
                        Confirm Decision
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border bg-background p-4 text-xs">
              <Button
                type="button"
                onClick={() => downloadTransferReceipt(selectedTransfer)}
                className="inline-flex items-center gap-1.5 font-serif font-semibold text-foreground hover:underline"
              >
                <Download className="h-3.5 w-3.5 text-gold" /> Download Official Receipt Slip
              </Button>

              <Button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                className="rounded-md border border-input bg-card px-4 py-1.5 font-serif font-semibold text-foreground hover:bg-muted shadow-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
