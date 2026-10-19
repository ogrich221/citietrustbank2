import { WireAddressFields } from "@/components/wire-address-fields";
import { BankBackButton } from "@/components/bank-back-button";
import { emptyWireAddress, validateWireAddresses, formatWireAddress } from "@/lib/wire-details";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useTransfers } from "@/hooks/use-transfers";
import {
  type TransferType,
  type BankTransfer,
  maskAccountNumber,
  maskEmail,
  downloadTransferReceipt,
} from "@/lib/transfers-store";
import {
  ShieldCheck,
  Building2,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Download,
  Copy,
  RefreshCw,
  Landmark,
  FileText,
  DollarSign,
  Calendar,
  User,
  Info,
  ExternalLink,
  ChevronRight,
  Mail,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";

export const Route = createFileRoute("/transfers")({
  head: () => ({
    meta: [
      { title: "Wire & Electronic Transfers | citiEtrust Bank" },
      { property: "og:title", content: "Wire Transfers | citiEtrust Bank" },
      { property: "og:description", content: "Prepare a domestic or international wire request with full recipient and bank details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content:
          "Secure domestic ACH/Fedwire and international SWIFT wire transfers with dual-factor authorization and institutional compliance screening.",
      },
    ],
  }),
  component: TransfersPage,
});

// Exchange rates relative to 1 USD
const FX_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.9245,
  GBP: 0.7892,
  CAD: 1.3650,
  CHF: 0.8840,
  JPY: 154.20,
  AUD: 1.5210,
};

function TransfersPage() {
  const { accounts, transfers, saveTransfer } = useTransfers();

  // Wizard Step: 1 = Details, 2 = Review, 3 = OTP Verification, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [transferType, setTransferType] = useState<TransferType>("domestic");
  const [senderAccountId, setSenderAccountId] = useState<string>("");
  const [recipientFullName, setRecipientFullName] = useState("");
  const [recipientBankName, setRecipientBankName] = useState("");
  const [accountNumberOrIBAN, setAccountNumberOrIBAN] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [bankIdentifierCode, setBankIdentifierCode] = useState(""); // Routing or SWIFT
  const [amount, setAmount] = useState<string>("5000");
  const [currency, setCurrency] = useState<string>("USD");
  const [transferPurpose, setTransferPurpose] = useState<string>("Family Living Support & Expenses");
  const [customMemo, setCustomMemo] = useState<string>("");
  const [transferDateType, setTransferDateType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState<string>("2026-10-25");

  const [recipientAddress, setRecipientAddress] = useState(emptyWireAddress);
  const [recipientBankAddress, setRecipientBankAddress] = useState(emptyWireAddress);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP State
  const [otpCode, setOtpCode] = useState<string>("");
  const [simulatedExpectedOtp, setSimulatedExpectedOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [otpCopied, setOtpCopied] = useState<boolean>(false);

  // Completed Transfer Object
  const [completedTransfer, setCompletedTransfer] = useState<BankTransfer | null>(null);

  // Select initial sender account
  useEffect(() => {
    if (accounts.length > 0 && !senderAccountId) {
      setSenderAccountId(accounts[0].id);
    }
  }, [accounts, senderAccountId]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === senderAccountId) || accounts[0];
  }, [accounts, senderAccountId]);

  // Fee Calculation
  const fee = transferType === "domestic" ? 0.0 : 35.0;
  const numAmount = parseFloat(amount) || 0;
  const exchangeRate = FX_RATES[currency] || 1.0;
  const convertedAmount = currency !== "USD" ? numAmount * exchangeRate : undefined;
  const totalDebitUSD = currency === "USD" ? numAmount + fee : numAmount / exchangeRate + fee;

  const estimatedDelivery =
    transferType === "domestic"
      ? transferDateType === "now"
        ? "Today by 5:00 PM EST (Fedwire Express)"
        : `Scheduled for ${scheduledDate} (Fedwire)`
      : transferDateType === "now"
      ? "1-2 Business Days (SWIFT GPI Priority)"
      : `Scheduled for ${scheduledDate} (SWIFT Wire)`;

  // Generate simulated OTP when reaching Step 3
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedExpectedOtp(code);
    setOtpCode(code); // Pre-filled for effortless evaluation, editable by user
    setOtpCountdown(60);
    setOtpError("");
  };

  useEffect(() => {
    if (currentStep === 3) {
      generateNewOtp();
    }
  }, [currentStep]);

  // Countdown timer for OTP
  useEffect(() => {
    if (currentStep !== 3 || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, otpCountdown]);

  // Validation for Step 1
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedAccount) {
      errs.senderAccount = "Please select a valid sender account.";
    }

    if (!recipientFullName.trim()) {
      errs.recipientFullName = "Beneficiary full legal name is required.";
    }

    if (!recipientBankName.trim()) {
      errs.recipientBankName = "Beneficiary bank institution name is required.";
    }

    if (!accountNumberOrIBAN.trim()) {
      errs.accountNumberOrIBAN =
        transferType === "domestic"
          ? "Beneficiary account number is required."
          : "International IBAN or account number is required.";
    }

    if (transferType === "domestic" && accountNumberOrIBAN.trim() !== confirmAccount.trim()) {
      errs.confirmAccount = "Account numbers do not match.";
    }

    if (!bankIdentifierCode.trim()) {
      errs.bankIdentifierCode =
        transferType === "domestic"
          ? "9-digit ABA Routing transit number is required."
          : "8 or 11-character SWIFT/BIC code is required.";
    } else if (transferType === "domestic" && !/^\d{9}$/.test(bankIdentifierCode.trim())) {
      errs.bankIdentifierCode = "ABA Routing Number must contain exactly 9 numeric digits.";
    } else if (
      transferType === "international" &&
      !/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(bankIdentifierCode.trim())
    ) {
      errs.bankIdentifierCode = "SWIFT/BIC must be 8 or 11 alphanumeric characters (e.g., BCGECHGGXXX).";
    }

    if (!amount || numAmount <= 0) {
      errs.amount = "Please specify a positive transfer amount.";
    } else if (selectedAccount && totalDebitUSD > selectedAccount.balance) {
      errs.amount = `Insufficient ledger funds. Available: $${selectedAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    Object.assign(errs, validateWireAddresses(recipientAddress, recipientBankAddress));

    if (transferDateType === "scheduled" && !scheduledDate) {
      errs.scheduledDate = "Please pick a future execution date.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedToVerification = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== simulatedExpectedOtp.trim()) {
      setOtpError("Invalid verification code. Please check the one-time passcode sent to your mail.");
      return;
    }

    if (!selectedAccount) return;

    // Build compliance flags
    const complianceFlags: string[] = [];
    if (numAmount >= 10000) complianceFlags.push("High-Value Wire (Exceeds $10,000 BSA Threshold)");
    if (transferType === "international") complianceFlags.push("Cross-Border SWIFT Electronic Outflow");
    if (transferPurpose.includes("Investment") || transferPurpose.includes("Escrow")) {
      complianceFlags.push("Fiduciary / Escrow Beneficiary Classification");
    }

    const newTransfer = saveTransfer({
      type: transferType,
      senderAccount: {
        id: selectedAccount.id,
        name: selectedAccount.name,
        accountNumberMasked: selectedAccount.accountNumberMasked,
        ownerName: selectedAccount.ownerName,
        ownerEmail: selectedAccount.ownerEmail,
        currency: selectedAccount.currency,
      },
      recipientFullName: recipientFullName.trim(),
      recipientBankName: recipientBankName.trim(),
      accountNumberOrIBAN: accountNumberOrIBAN.trim(),
      accountNumberMasked: maskAccountNumber(accountNumberOrIBAN),
      bankIdentifierType: transferType === "domestic" ? "routing" : "swift",
      bankIdentifierCode: bankIdentifierCode.trim().toUpperCase(),
      amount: numAmount,
      currency,
      transferPurpose: customMemo.trim() ? `${transferPurpose} — ${customMemo.trim()}` : transferPurpose,
      recipientAddress,
      recipientBankAddress,
      transferDateType,
      scheduledDate: transferDateType === "scheduled" ? scheduledDate : undefined,
      fee,
      exchangeRate: currency !== "USD" ? exchangeRate : undefined,
      convertedAmount,
      estimatedDelivery,
      totalDebitUSD,
      verificationMethod: "Email OTP",
      verificationEmail: maskEmail(selectedAccount.ownerEmail),
      verifiedAt: new Date().toISOString(),
      complianceFlags,
    });

    setCompletedTransfer(newTransfer);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartNewTransfer = () => {
    setCurrentStep(1);
    setRecipientFullName("");
    setRecipientBankName("");
    setAccountNumberOrIBAN("");
    setConfirmAccount("");
    setBankIdentifierCode("");
    setAmount("5000");
    setCustomMemo("");
    setRecipientAddress(emptyWireAddress());
    setRecipientBankAddress(emptyWireAddress());
    setErrors({});
    setCompletedTransfer(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col banking-workspace">
      {/* Top Heritage Trust Banner */}
      <aside className="border-b border-border bg-navy py-2 text-xs text-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-serif font-semibold text-gold">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" /> citiEtrust BANK · WIRE & FUNDS TRANSFER DIVISION
            </span>
            <span className="hidden text-foreground sm:inline">|</span>
            <span className="hidden text-foreground md:inline">ROUTING # 071922841 · FEDWIRE & SWIFT ENABLED</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gold hover:underline font-serif font-medium flex items-center gap-1">
              <Lock className="h-3 w-3" /> Bank Admin Portal
            </Link>
            <span className="text-foreground">|</span>
            <Link to="/" className="text-foreground hover:text-foreground transition">
              Return to Main Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 min-w-0"><BankBackButton onBack={currentStep > 1 ? () => { setCurrentStep(currentStep === 3 ? 2 : 1); window.scrollTo({ top: 0 }); } : undefined} />
          <Link to="/" className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/60 bg-navy shadow-inner">
              <Landmark className="h-6 w-6 text-gold" />
              <span className="absolute -bottom-1 rounded bg-gold px-1 text-[8px] font-serif font-bold text-foreground">
                1952
              </span>
            </span>
            <div className="leading-tight">
              <span className="block font-serif text-xl font-bold tracking-normal text-foreground">citiEtrust BANK</span>
              <span className="block text-[10px] font-serif uppercase tracking-[0.22em] text-gold">
                Heritage Trust & Institutional Treasury
              </span>
            </div>
          </Link></div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3.5 py-1.5 font-serif text-xs font-semibold text-foreground hover:bg-background transition"
            >
              <Lock className="h-3.5 w-3.5 text-gold" /> Admin Triage Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <section className="border-b border-border bg-gradient-to-b from-navy to-secondary py-8 px-6 text-foreground">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-[0.2em] text-gold">
                <KeyRound className="h-3.5 w-3.5" /> Secure Guided Transfer Service
              </span>
              <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-normal">
                Transfer & Wire Funds
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-foreground max-w-xl">
                Initiate authenticated Domestic (Fedwire / ACH) or International (SWIFT GPI) fund transfers with mandatory multi-factor email confirmation and officer compliance review.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-navy/80 p-3 text-xs">
              <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
              <div>
                <p className="font-serif font-bold text-gold">Dual-Control Security Policy</p>
                <p className="text-[11px] text-foreground">Transfers are submitted as Pending Review. No automated execution.</p>
              </div>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="mt-8 grid grid-cols-4 gap-2 text-xs font-serif">
            {[
              { num: 1, label: "Transfer Details" },
              { num: 2, label: "Review & Breakdown" },
              { num: 3, label: "Email Passkey (MFA)" },
              { num: 4, label: "Confirmation Receipt" },
            ].map((s) => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;
              return (
                <div
                  key={s.num}
                  className={`rounded-lg p-2.5 transition border ${
                    isActive
                      ? "border-gold bg-gold/15 text-gold font-bold"
                      : isPassed
                      ? "border-border/50 bg-muted/10 text-foreground"
                      : "border-border bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-gold text-foreground"
                          : isPassed
                          ? "bg-muted text-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {isPassed ? "✓" : s.num}
                    </span>
                    <span className="hidden sm:inline tracking-wider uppercase text-[11px]">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <p className="mx-auto max-w-5xl px-6 pt-4 text-sm text-gold">Demonstration only — no money is moved and no verification email is sent.</p>

      {/* Main Content Area */}
      <main className="flex-1 py-10 px-6">
        <div className="mx-auto max-w-5xl">
          {/* STEP 1: GUIDED TRANSFER FORM */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-8 animate-in fade-in duration-300">
              {/* Type Switcher */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                  1. Select Transfer Classification
                </span>
                <div className="mt-3 grid sm:grid-cols-2 gap-4">
                  <Button variant="ghost"
                    type="button"
                    onClick={() => {
                      setTransferType("domestic");
                      setCurrency("USD");
                    }}
                    className={`flex items-start gap-4 rounded-lg border p-4 text-left transition ${
                      transferType === "domestic"
                        ? "border-gold bg-background ring-2 ring-gold/30"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        transferType === "domestic" ? "bg-navy text-gold" : "bg-muted text-foreground"
                      }`}
                    >
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-sm text-foreground">Domestic Transfer</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Transfers within the United States via Federal Reserve Fedwire & ACH networks. Standard Fee: $0.00.
                      </p>
                    </div>
                  </Button>

                  <Button variant="ghost"
                    type="button"
                    onClick={() => setTransferType("international")}
                    className={`flex items-start gap-4 rounded-lg border p-4 text-left transition ${
                      transferType === "international"
                        ? "border-gold bg-background ring-2 ring-gold/30"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        transferType === "international"
                          ? "bg-navy text-gold"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-serif font-bold text-sm text-foreground">International Transfer</p>
                        <span className="rounded bg-gold/20 px-1.5 py-0.2 text-[9px] font-bold text-gold border border-gold/30">
                          SWIFT GPI
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cross-border multi-currency wire transfers with foreign exchange and international compliance clearance. Wire Fee: $35.00.
                      </p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Sender Account */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                  2. Originating Source Account
                </span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {accounts.map((acct) => (
                    <label
                      key={acct.id}
                      className={`flex flex-col justify-between rounded-lg border p-4 cursor-pointer transition ${
                        senderAccountId === acct.id
                          ? "border-navy bg-background ring-2 ring-navy/20"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs text-foreground">{acct.name}</span>
                        <input
                          type="radio"
                          name="senderAccount"
                          value={acct.id}
                          checked={senderAccountId === acct.id}
                          onChange={() => setSenderAccountId(acct.id)}
                          className="text-foreground focus:ring-gold"
                        />
                      </div>
                      <div className="mt-3 flex items-end justify-between text-xs">
                        <span className="text-muted-foreground font-mono">{acct.accountNumberMasked}</span>
                        <span className="font-serif font-bold text-foreground text-sm">
                          ${acct.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.senderAccount && <p className="text-xs text-foreground font-medium">{errors.senderAccount}</p>}
              </div>

              {/* Beneficiary Details */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                    3. Beneficiary & Financial Institution
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-foreground" /> Masked in receipt
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Recipient Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientFullName}
                      onChange={(e) => setRecipientFullName(e.target.value)}
                      placeholder="e.g. Jonathan Sterling or Horizon Wealth LLC"
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                    {errors.recipientFullName && (
                      <p className="text-xs text-foreground mt-1">{errors.recipientFullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Recipient Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientBankName}
                      onChange={(e) => setRecipientBankName(e.target.value)}
                      placeholder="e.g. JPMorgan Chase, Barclays, or UBS"
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                    {errors.recipientBankName && (
                      <p className="text-xs text-foreground mt-1">{errors.recipientBankName}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      {transferType === "domestic" ? "Recipient Account Number *" : "Recipient IBAN or Account Number *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumberOrIBAN}
                      onChange={(e) => setAccountNumberOrIBAN(e.target.value)}
                      placeholder={transferType === "domestic" ? "e.g. 8920194812" : "e.g. GB29NWBK60161331926819"}
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground font-mono focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                    {errors.accountNumberOrIBAN && (
                      <p className="text-xs text-foreground mt-1">{errors.accountNumberOrIBAN}</p>
                    )}
                  </div>

                  {transferType === "domestic" ? (
                    <div>
                      <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                        Confirm Recipient Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={confirmAccount}
                        onChange={(e) => setConfirmAccount(e.target.value)}
                        placeholder="Re-enter account number"
                        className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground font-mono focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                      />
                      {errors.confirmAccount && (
                        <p className="text-xs text-foreground mt-1">{errors.confirmAccount}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                        SWIFT / BIC Identifier Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankIdentifierCode}
                        onChange={(e) => setBankIdentifierCode(e.target.value.toUpperCase())}
                        placeholder="e.g. BARCGB22XXX or BCGECHGGXXX"
                        className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground font-mono uppercase focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                      />
                      {errors.bankIdentifierCode && (
                        <p className="text-xs text-foreground mt-1">{errors.bankIdentifierCode}</p>
                      )}
                    </div>
                  )}
                </div>

                {transferType === "domestic" && (
                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      ABA Routing Transit Number (9 Digits) *
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      required
                      value={bankIdentifierCode}
                      onChange={(e) => setBankIdentifierCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 021000021"
                      className="w-full sm:w-1/2 rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground font-mono focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                    {errors.bankIdentifierCode && (
                      <p className="text-xs text-foreground mt-1">{errors.bankIdentifierCode}</p>
                    )}
                  </div>
                )}

                  <WireAddressFields title="Recipient address" prefix="recipient" value={recipientAddress} onChange={setRecipientAddress} errors={errors} />
                  <WireAddressFields title="Recipient bank address" prefix="bank" value={recipientBankAddress} onChange={setRecipientBankAddress} errors={errors} />

              </div>

              {/* Amount & Settlement Purpose */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                  4. Amount & Purpose
                </span>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Transfer Principal Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-foreground font-bold text-base">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-input bg-card pl-8 pr-3.5 py-2.5 text-base font-serif font-bold text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                      />
                    </div>
                    {errors.amount && <p className="text-xs text-foreground mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Destination Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground font-semibold"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="CAD">CAD - Canadian Dollar ($)</option>
                      <option value="CHF">CHF - Swiss Franc (Fr)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="AUD">AUD - Australian Dollar ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Transfer Purpose / Classification *
                    </label>
                    <select
                      value={transferPurpose}
                      onChange={(e) => setTransferPurpose(e.target.value)}
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-xs text-foreground"
                    >
                      <option value="Family Living Support & Expenses">Family Living Support & Expenses</option>
                      <option value="Commercial Vendor / Supplier Invoice">Commercial Vendor / Supplier Invoice</option>
                      <option value="Property Investment & Escrow Deposit">Property Investment & Escrow Deposit</option>
                      <option value="Higher Education / Tuition Payment">Higher Education / Tuition Payment</option>
                      <option value="Securities & Custody Contribution">Securities & Custody Contribution</option>
                      <option value="Legal & Advisory Professional Fees">Legal & Advisory Professional Fees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Custom Reference Memo (Optional)
                    </label>
                    <input
                      type="text"
                      value={customMemo}
                      onChange={(e) => setCustomMemo(e.target.value)}
                      placeholder="e.g. Invoice #2026-981 or Fall Semester"
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-xs text-foreground"
                    />
                  </div>
                </div>

                {/* Transfer Timing */}
                <div className="pt-3 border-t border-border">
                  <label className="block text-xs font-serif font-semibold text-foreground mb-2">
                    Execution Schedule
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer text-xs ${
                        transferDateType === "now"
                          ? "border-navy bg-background font-semibold"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dateType"
                        checked={transferDateType === "now"}
                        onChange={() => setTransferDateType("now")}
                        className="text-foreground"
                      />
                      <span>Immediate Execution (Send Now)</span>
                    </label>

                    <label
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer text-xs ${
                        transferDateType === "scheduled"
                          ? "border-navy bg-background font-semibold"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dateType"
                        checked={transferDateType === "scheduled"}
                        onChange={() => setTransferDateType("scheduled")}
                        className="text-foreground"
                      />
                      <span>Schedule for Future Date</span>
                    </label>
                  </div>

                  {transferDateType === "scheduled" && (
                    <div className="mt-3">
                      <input
                        type="date"
                        min="2026-10-17"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="rounded-lg border border-input bg-card px-3.5 py-2 text-xs text-foreground"
                      />
                      {errors.scheduledDate && <p className="text-xs text-foreground mt-1">{errors.scheduledDate}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-serif text-foreground hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Account Home
                </Link>

                <Button variant="ghost"
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gold bg-navy px-7 py-3 font-serif text-xs font-bold uppercase tracking-[0.16em] text-foreground shadow-md transition-all hover:bg-secondary"
                >
                  Review Transfer Details <ArrowRight className="h-3.5 w-3.5 text-gold" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW & COST BREAKDOWN */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="rounded-lg border border-border bg-card p-8 shadow-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                    Institutional Wire Review
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-foreground mt-1">
                    Review & Verify Transfer Information
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please carefully inspect all originating and beneficiary details. Wire transfers cannot be recalled once dispatched.
                  </p>
                </div>

                {/* Summary Grid */}
                <div className="grid md:grid-cols-2 gap-6 text-xs">
                  {/* Originating Account */}
                  <div className="rounded-lg border border-border bg-background p-5 space-y-3">
                    <span className="font-serif font-bold uppercase tracking-wider text-gold text-[10px]">
                      Originating Account (Debited)
                    </span>
                    <div>
                      <p className="font-serif font-bold text-sm text-foreground">{selectedAccount?.name}</p>
                      <p className="text-muted-foreground font-mono mt-0.5">{selectedAccount?.accountNumberMasked}</p>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between">
                      <span className="text-muted-foreground">Account Holder:</span>
                      <span className="font-semibold text-foreground">{selectedAccount?.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Ledger Balance:</span>
                      <span className="font-semibold text-foreground">
                        ${selectedAccount?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Beneficiary Details */}
                  <div className="rounded-lg border border-border bg-background p-5 space-y-3">
                    <span className="font-serif font-bold uppercase tracking-wider text-gold text-[10px]">
                      Beneficiary (Credited)
                    </span>
                    <div>
                      <p className="font-serif font-bold text-sm text-foreground">{recipientFullName}</p>
                      <p className="text-muted-foreground mt-0.5">{recipientBankName}</p>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between">
                      <span className="text-muted-foreground">Account / IBAN:</span>
                      <span className="font-mono font-semibold text-foreground">{maskAccountNumber(accountNumberOrIBAN)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {transferType === "domestic" ? "Routing Number (ABA):" : "SWIFT/BIC Code:"}
                      </span>
                      <span className="font-mono font-semibold text-foreground">{bankIdentifierCode}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Recipient address: {formatWireAddress(recipientAddress)}</p>
                    <p className="text-xs text-muted-foreground">Bank address: {formatWireAddress(recipientBankAddress)}</p>
                  </div>
                </div>

                {/* Financial Ledger & Fees Breakdown */}
                <div className="rounded-lg border border-gold/30 bg-card p-6 space-y-3">
                  <span className="font-serif font-bold uppercase tracking-wider text-gold text-xs">
                    Settlement & Fee Breakdown
                  </span>
                  <div className="divide-y divide-border text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-muted-foreground">Transfer Principal Amount:</span>
                      <span className="font-serif font-bold text-foreground text-sm">
                        {currency} {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {convertedAmount && (
                      <div className="py-2.5 flex justify-between text-muted-foreground">
                        <span>Foreign Exchange Rate:</span>
                        <span className="font-mono font-semibold text-foreground">
                          1 USD = {exchangeRate} {currency}
                        </span>
                      </div>
                    )}

                    <div className="py-2.5 flex justify-between">
                      <span className="text-muted-foreground">Institutional Wire Network Fee:</span>
                      <span className="font-semibold text-foreground">
                        {fee === 0 ? "Waived (Member Benefit · $0.00)" : `$${fee.toFixed(2)} USD`}
                      </span>
                    </div>

                    <div className="py-2.5 flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery Window:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {estimatedDelivery}
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-sm font-serif font-bold text-foreground pt-3">
                      <span>Total Outflow / Debit from Account:</span>
                      <span className="text-lg text-foreground font-bold">
                        ${totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Institutional Compliance Notice */}
                <div className="rounded-lg border border-border bg-muted p-4 text-xs text-foreground flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Required Administrative & Compliance Screening</p>
                    <p className="text-[11px] leading-relaxed text-foreground">
                      Pursuant to Federal Reserve regulations and Bank Secrecy Act / FinCEN guidelines, all outbound electronic fund transfers undergo manual review by an authorized citiEtrust Bank compliance officer. <strong>Transfers are never executed automatically.</strong> Upon entering your one-time email authorization code, this transfer will be submitted as <strong>Pending Review</strong>.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button variant="ghost"
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-5 py-2.5 font-serif text-xs font-semibold text-foreground hover:bg-muted transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Edit Information
                  </Button>

                  <Button variant="ghost"
                    type="button"
                    onClick={handleProceedToVerification}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gold bg-navy px-7 py-3 font-serif text-xs font-bold uppercase tracking-[0.16em] text-foreground shadow-md hover:bg-secondary transition"
                  >
                    Proceed to Email Verification (MFA) <ArrowRight className="h-3.5 w-3.5 text-gold" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MULTI-FACTOR AUTHENTICATION (EMAIL OTP) */}
          {currentStep === 3 && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Security Simulation Notice Banner */}
              <div className="rounded-lg border border-gold/40 bg-navy p-5 text-foreground shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gold" />
                    <span className="font-serif font-bold text-xs uppercase tracking-wider text-gold">
                      Email Notification Delivery Simulation
                    </span>
                  </div>
                  <span className="text-[10px] bg-gold text-foreground font-bold px-2 py-0.5 rounded-full">
                    Live Test Sandbox
                  </span>
                </div>
                <p className="text-xs text-foreground">
                  A 6-digit confirmation code was dispatched to the account owner’s registered mail:{" "}
                  <strong className="text-foreground">{maskEmail(selectedAccount?.ownerEmail || "")}</strong>.
                </p>
                <div className="mt-2 flex items-center justify-between rounded-lg bg-background/40 p-2.5 border border-border/10 font-mono text-xs">
                  <span className="text-foreground">citiEtrust Code:</span>
                  <span className="font-bold text-lg tracking-widest text-gold">{simulatedExpectedOtp}</span>
                  <Button variant="ghost"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(simulatedExpectedOtp);
                      setOtpCopied(true);
                      setTimeout(() => setOtpCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" /> {otpCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* OTP Form Card */}
              <div className="rounded-lg border border-border bg-card p-8 shadow-sm space-y-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-navy text-gold shadow-inner">
                  <KeyRound className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Authorize Outbound Wire Transfer
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Please enter the 6-digit authorization passkey sent to{" "}
                    <strong>{maskEmail(selectedAccount?.ownerEmail || "")}</strong> to authorize this{" "}
                    <strong>${totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> transfer.
                  </p>
                </div>

                <form onSubmit={handleVerifyAndSubmit} className="space-y-5">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ""));
                        setOtpError("");
                      }}
                      placeholder="••••••"
                      className="w-48 mx-auto text-center rounded-lg border-2 border-navy bg-card py-3 text-2xl font-mono font-bold tracking-[0.4em] text-foreground focus:outline-none focus:ring-4 focus:ring-gold/30"
                    />
                    {otpError && <p className="text-xs text-foreground mt-2 font-medium">{otpError}</p>}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    {otpCountdown > 0 ? (
                      <span>Resend code in {otpCountdown}s</span>
                    ) : (
                      <Button variant="ghost"
                        type="button"
                        onClick={generateNewOtp}
                        className="text-foreground font-semibold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" /> Resend One-Time Passcode
                      </Button>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <Button variant="ghost"
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gold bg-navy py-3.5 font-serif text-xs font-bold uppercase tracking-[0.16em] text-foreground shadow-md hover:bg-secondary transition"
                    >
                      <ShieldCheck className="h-4 w-4 text-gold" /> Confirm & Submit Transfer Request
                    </Button>

                    <Button variant="ghost"
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-serif text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Cancel and Return to Review
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & RECEIPT */}
          {currentStep === 4 && completedTransfer && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="rounded-lg border border-border bg-card p-8 shadow-sm space-y-6">
                {/* Header Banner */}
                <div className="text-center space-y-2 border-b border-border pb-6">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted text-foreground">
                    <Clock className="h-8 w-8 text-foreground animate-pulse" />
                  </div>
                  <span className="inline-block rounded-full bg-muted px-3.5 py-1 text-xs font-serif font-bold text-foreground border border-border">
                    Status: PENDING REVIEW
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Transfer Request Submitted for Review
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your transfer has been authenticated and routed to the citiEtrust Bank underwriting team. As an institutional safety requirement, transfers are never completed automatically.
                  </p>
                </div>

                {/* Reference Card */}
                <div className="rounded-lg border border-gold/30 bg-background p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                      Official Wire Tracking Reference Number
                    </span>
                    <p className="font-mono text-xl font-bold text-foreground tracking-wide mt-0.5">
                      {completedTransfer.referenceNumber}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Submitted on {new Date(completedTransfer.createdAt).toLocaleString()} · MFA Verified via{" "}
                      {completedTransfer.verificationEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost"
                      type="button"
                      onClick={() => downloadTransferReceipt(completedTransfer)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-4 py-2 font-serif text-xs font-semibold text-foreground hover:bg-background shadow-xs transition"
                    >
                      <Download className="h-3.5 w-3.5 text-gold" /> Download Official Receipt (.txt)
                    </Button>
                  </div>
                </div>

                {/* Transaction Summary Grid */}
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-lg border border-border p-4 bg-card space-y-1">
                    <span className="text-muted-foreground">Debited Account</span>
                    <p className="font-serif font-bold text-foreground">{completedTransfer.senderAccount.name}</p>
                    <p className="font-mono text-muted-foreground">{completedTransfer.senderAccount.accountNumberMasked}</p>
                  </div>

                  <div className="rounded-lg border border-border p-4 bg-card space-y-1">
                    <span className="text-muted-foreground">Beneficiary Name</span>
                    <p className="font-serif font-bold text-foreground">{completedTransfer.recipientFullName}</p>
                    <p className="text-muted-foreground">{completedTransfer.recipientBankName}</p>
                    <p className="text-xs text-muted-foreground">{formatWireAddress(completedTransfer.recipientBankAddress)}</p>
                  </div>

                  <div className="rounded-lg border border-border p-4 bg-card space-y-1">
                    <span className="text-muted-foreground">Total Outflow & Type</span>
                    <p className="font-serif font-bold text-foreground text-sm">
                      ${completedTransfer.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </p>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      {completedTransfer.type} Wire · Fee: ${completedTransfer.fee.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Security and Next Steps Info */}
                <div className="rounded-lg border border-border bg-muted p-5 space-y-2 text-xs text-foreground">
                  <p className="font-serif font-bold text-foreground">What happens next?</p>
                  <ul className="space-y-1.5 text-foreground list-disc list-inside">
                    <li>An authorized compliance officer will inspect the beneficiary against OFAC and sanctions watchlists.</li>
                    <li>Estimated settlement: <strong>{completedTransfer.estimatedDelivery}</strong> upon officer release.</li>
                    <li>You can monitor live status changes or officer queries at any time.</li>
                  </ul>
                </div>

                {/* Bottom Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <Button variant="ghost"
                    type="button"
                    onClick={handleStartNewTransfer}
                    className="inline-flex items-center gap-1.5 font-serif text-xs font-semibold text-foreground hover:underline"
                  >
                    Initiate Another Transfer
                  </Button>

                  <div className="flex items-center gap-3">
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 rounded-md border border-gold bg-navy px-5 py-2.5 font-serif text-xs font-bold text-foreground hover:bg-secondary transition shadow-xs"
                    >
                      <Lock className="h-3.5 w-3.5 text-gold" /> View in Admin Queue →
                    </Link>

                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-5 py-2.5 font-serif text-xs font-semibold text-foreground hover:bg-background transition"
                    >
                      Return to Bank Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECENT TRANSFERS OVERVIEW */}
          <section className="mt-16 rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                  Live Ledger Activity
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground">Recent Outbound Transfer Requests</h3>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Showing {transfers.length} registered wire entries
              </span>
            </div>

            <div className="divide-y divide-border text-xs">
              {transfers.slice(0, 5).map((trf) => (
                <div key={trf.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{trf.referenceNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-serif font-bold border ${
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
                      <span className="uppercase text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {trf.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      To: <strong className="text-foreground">{trf.recipientFullName}</strong> ({trf.recipientBankName})
                      · From: {trf.senderAccount.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-serif font-bold text-foreground text-sm block">
                        ${trf.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(trf.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Button variant="ghost"
                      type="button"
                      onClick={() => downloadTransferReceipt(trf)}
                      title="Download receipt"
                      className="p-1.5 rounded-lg border border-input hover:bg-background text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-navy text-foreground/70 py-8 px-6 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 citiEtrust Bank, N.A. Chartered 1952. Federally Insured by NCUA.</p>
          <div className="flex items-center gap-4 text-gold">
            <Link to="/transfers" className="hover:underline">Transfers</Link>
            <span>·</span>
            <Link to="/admin" className="hover:underline">Staff Administration Portal</Link>
            <span>·</span>
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
