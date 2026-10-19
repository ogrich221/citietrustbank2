import { WireAddressFields } from "@/components/wire-address-fields";
import { BankBackButton } from "@/components/bank-back-button";
import { emptyWireAddress, validateWireAddresses, formatWireAddress } from "@/lib/wire-details";
import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransfers } from "@/hooks/use-transfers";
import {
  type BankAccount,
  type BankTransfer,
  type TransferType,
  maskAccountNumber,
  maskEmail,
  downloadTransferReceipt,
} from "@/lib/transfers-store";
import {
  ShieldCheck,
  Building2,
  Globe,
  Lock,
  LogOut,
  Clock,
  Download,
  Copy,
  RefreshCw,
  Landmark,
  FileText,
  DollarSign,
  Calendar,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  History,
  CreditCard,
  Send,
  Eye,
  Check
} from "lucide-react";

export interface MemberPortalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "overview" | "transfer" | "history";
}

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

export function MemberPortalModal({
  open,
  onOpenChange,
  initialTab = "overview",
}: MemberPortalModalProps) {
  const { accounts, transfers, saveTransfer } = useTransfers();

  // Active Authenticated User Session
  const [activeAccount, setActiveAccount] = useState<BankAccount | null>(null);
  useEffect(() => {
    if (!open) return;
    const stored = sessionStorage.getItem("citietrust_active_member") || localStorage.getItem("citietrust_active_member");
    let selected: BankAccount | undefined;
    try {
      const previous = stored ? JSON.parse(stored) : null;
      selected = accounts.find(account => account.id === previous?.id);
    } catch { /* Fall back to the first demonstration profile. */ }
    setActiveAccount(selected || accounts[0] || null);
    setActiveTab(initialTab);
  }, [open, initialTab, accounts]);
  const memberAccounts = accounts.filter(account => account.ownerEmail === activeAccount?.ownerEmail);
  const memberTransfers = transfers.filter(transfer => transfer.senderAccount.ownerEmail === activeAccount?.ownerEmail);

  const [activeTab, setActiveTab] = useState<"overview" | "transfer" | "history">(initialTab);

  // Transfer Stepper: 1 = Form, 2 = Review, 3 = Email OTP, 4 = Confirmation
  const [transferStep, setTransferStep] = useState<1 | 2 | 3 | 4>(1);

  // Transfer Form State
  const [transferType, setTransferType] = useState<TransferType>("domestic");
  const [selectedSenderId, setSelectedSenderId] = useState<string>("");
  const [recipientFullName, setRecipientFullName] = useState("");
  const [recipientBankName, setRecipientBankName] = useState("");
  const [accountNumberOrIBAN, setAccountNumberOrIBAN] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [bankIdentifierCode, setBankIdentifierCode] = useState("");
  const [amount, setAmount] = useState<string>("2500");
  const [currency, setCurrency] = useState<string>("USD");
  const [transferPurpose, setTransferPurpose] = useState<string>("Family Living Support & Expenses");
  const [customMemo, setCustomMemo] = useState<string>("");
  const [transferDateType, setTransferDateType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState<string>("2026-10-25");

  const [recipientAddress, setRecipientAddress] = useState(emptyWireAddress);
  const [recipientBankAddress, setRecipientBankAddress] = useState(emptyWireAddress);

  // Errors & OTP
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpCode, setOtpCode] = useState<string>("");
  const [simulatedExpectedOtp, setSimulatedExpectedOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [otpCopied, setOtpCopied] = useState<boolean>(false);
  const [completedTransfer, setCompletedTransfer] = useState<BankTransfer | null>(null);

  // Sign In / Switch Account Form State
  const [showSwitchUser, setShowSwitchUser] = useState(false);

  // Current Sender Account
  const senderAccount = useMemo(() => {
    return memberAccounts.find((a) => a.id === selectedSenderId) || activeAccount;
  }, [accounts, selectedSenderId, activeAccount]);

  useEffect(() => {
    if (activeAccount && !selectedSenderId) {
      setSelectedSenderId(activeAccount.id);
    }
  }, [activeAccount, selectedSenderId]);

  // Fee & FX
  const fee = transferType === "domestic" ? 0.0 : 35.0;
  const numAmount = parseFloat(amount) || 0;
  const exchangeRate = FX_RATES[currency] || 1.0;
  const convertedAmount = currency !== "USD" ? numAmount * exchangeRate : undefined;
  const totalDebitUSD = currency === "USD" ? numAmount + fee : numAmount / exchangeRate + fee;

  const estimatedDelivery =
    transferType === "domestic"
      ? transferDateType === "now"
        ? "Today by 5:00 PM EST (Fedwire)"
        : `Scheduled for ${scheduledDate} (Fedwire)`
      : transferDateType === "now"
      ? "1-2 Business Days (SWIFT GPI Priority)"
      : `Scheduled for ${scheduledDate} (SWIFT Wire)`;

  // Generate OTP when entering Step 3
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedExpectedOtp(code);
    setOtpCode(code);
    setOtpCountdown(60);
    setOtpError("");
  };

  useEffect(() => {
    if (transferStep === 3) {
      generateNewOtp();
    }
  }, [transferStep]);

  useEffect(() => {
    if (transferStep !== 3 || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [transferStep, otpCountdown]);

  // Validation
  const validateTransferStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!senderAccount) {
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
      errs.bankIdentifierCode = "SWIFT/BIC must be 8 or 11 alphanumeric characters.";
    }

    if (!amount || numAmount <= 0) {
      errs.amount = "Please specify a positive transfer amount.";
    } else if (senderAccount && totalDebitUSD > senderAccount.balance) {
      errs.amount = `Insufficient available balance ($${senderAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}).`;
    }

    Object.assign(errs, validateWireAddresses(recipientAddress, recipientBankAddress));

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateTransferStep1()) {
      setTransferStep(2);
    }
  };

  const handleVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== simulatedExpectedOtp.trim()) {
      setOtpError("Invalid verification code. Please check the one-time passcode sent to your mail.");
      return;
    }

    if (!senderAccount) return;

    const complianceFlags: string[] = [];
    if (numAmount >= 10000) complianceFlags.push("High-Value Wire (Exceeds $10,000 BSA Threshold)");
    if (transferType === "international") complianceFlags.push("Cross-Border SWIFT Wire Transfer");

    // The user's account creation email is the approved verification target
    const targetEmail = senderAccount.ownerEmail;

    const newTransfer = saveTransfer({
      type: transferType,
      senderAccount: {
        id: senderAccount.id,
        name: senderAccount.name,
        accountNumberMasked: senderAccount.accountNumberMasked,
        ownerName: senderAccount.ownerName,
        ownerEmail: targetEmail,
        currency: senderAccount.currency,
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
      verificationEmail: maskEmail(targetEmail),
      verifiedAt: new Date().toISOString(),
      complianceFlags,
    });

    setCompletedTransfer(newTransfer);
    setTransferStep(4);
  };

  const handleResetTransfer = () => {
    setTransferStep(1);
    setRecipientFullName("");
    setRecipientBankName("");
    setAccountNumberOrIBAN("");
    setConfirmAccount("");
    setBankIdentifierCode("");
    setAmount("2500");
    setCustomMemo("");
    setRecipientAddress(emptyWireAddress());
    setRecipientBankAddress(emptyWireAddress());
    setErrors({});
    setCompletedTransfer(null);
  };

  const handleSelectMember = (acct: BankAccount) => {
    setActiveAccount(acct);
    setSelectedSenderId(acct.id);
    setTransferStep(1);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("citietrust_active_member", JSON.stringify(acct));
    }
    setShowSwitchUser(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-background border-border p-0 text-foreground banking-workspace">
        {/* Header Bar */}
        <div className="bg-navy text-foreground p-6 border-b border-gold/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <BankBackButton onBack={() => {
                if (activeTab === "transfer" && transferStep > 1 && transferStep < 4) setTransferStep(transferStep === 3 ? 2 : 1);
                else if (activeTab !== "overview") setActiveTab("overview");
                else onOpenChange(false);
              }} />
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/60 bg-secondary shadow-inner">
                <Landmark className="h-5 w-5 text-gold" />
              </span>
              <div>
                <DialogTitle className="font-serif text-xl font-bold tracking-normal text-foreground">
                  citiEtrust BANK · Member Banking Portal
                </DialogTitle>
                <DialogDescription className="text-xs text-foreground">
                  Demonstration account · Profile:{" "}
                  <strong className="text-gold">{activeAccount?.ownerName}</strong> ({activeAccount?.ownerEmail})
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setShowSwitchUser(!showSwitchUser)}
                className="rounded-md border border-gold/40 bg-secondary px-3 py-1.5 font-serif text-[11px] font-semibold text-gold hover:bg-secondary transition"
              >
                Switch Account Profile
              </Button>
            </div>
          </div>

          {/* Account Profile Switcher Drawer */}
          {showSwitchUser && (
            <div className="mt-4 p-4 rounded-lg bg-background/40 border border-gold/30 space-y-2 animate-in fade-in">
              <p className="text-xs font-serif font-bold text-gold">Select Registered Member Account:</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {accounts.map((acct) => (
                  <Button
                    key={acct.id}
                    type="button"
                    onClick={() => handleSelectMember(acct)}
                    className={`flex items-start justify-between p-2.5 rounded-lg border text-left transition ${
                      activeAccount?.id === acct.id
                        ? "border-gold bg-gold/10 text-foreground"
                        : "border-border bg-muted/60 text-foreground hover:bg-muted"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{acct.ownerName}</p>
                      <p className="text-[10px] text-foreground">{acct.name} ({acct.accountNumberMasked})</p>
                      <p className="text-[10px] text-gold">Auth Email: {acct.ownerEmail}</p>
                    </div>
                    <span className="font-mono font-bold">${acct.balance.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6 flex border-b border-gold/20 text-xs font-serif">
            <Button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "border-gold text-gold"
                  : "border-transparent text-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" /> Accounts & Balances
            </Button>
            <Button
              type="button"
              onClick={() => {
                setActiveTab("transfer");
                setTransferStep(1);
              }}
              className={`pb-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "transfer"
                  ? "border-gold text-gold"
                  : "border-transparent text-foreground hover:text-foreground"
              }`}
            >
              <Send className="h-3.5 w-3.5" /> Send Money (Domestic & International)
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`pb-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "border-gold text-gold"
                  : "border-transparent text-foreground hover:text-foreground"
              }`}
            >
              <History className="h-3.5 w-3.5" /> Outbound Transfer History
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: ACCOUNTS OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                  Depository Accounts Ledger
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Member Balance Overview
                </h3>
              </div>

              <section className="grid grid-cols-2 gap-3 border-y border-border py-4">
                <div><p className="text-xs text-muted-foreground">USD account balances</p><p className="text-2xl font-semibold text-foreground">${memberAccounts.filter(a => a.currency === "USD").reduce((total, a) => total + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-xs text-muted-foreground">Wires awaiting review</p><p className="text-2xl font-semibold text-gold">{memberTransfers.filter(t => t.status === "Pending Review").length}</p></div>
                <Button onClick={() => { setActiveTab("transfer"); setTransferStep(1); }}><Send className="h-4 w-4" /> Wire transfer</Button>
                <Button variant="outline" onClick={() => setActiveTab("history")}><History className="h-4 w-4" /> Activity</Button>
              </section>
              <div className="grid sm:grid-cols-2 gap-4">
                {accounts
                  .filter((a) => a.ownerEmail === activeAccount?.ownerEmail)
                  .map((acct) => (
                    <div
                      key={acct.id}
                      className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-foreground">{acct.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{acct.accountNumberMasked}</span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-serif">Available Balance</p>
                          <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
                            ${acct.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedSenderId(acct.id);
                            setActiveTab("transfer");
                            setTransferStep(1);
                          }}
                          className="rounded-md border border-gold bg-navy px-3 py-1.5 font-serif text-[11px] font-bold text-foreground hover:bg-secondary transition flex items-center gap-1 shadow-xs"
                        >
                          <Send className="h-3 w-3 text-gold" /> Transfer
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-border flex justify-between text-[11px] text-muted-foreground">
                        <span>ABA Routing: 071922841</span>
                        <span>Owner: {acct.ownerName}</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Quick Actions & Security Notice */}
              <div className="rounded-lg border border-gold/30 bg-card p-4 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-foreground shrink-0" />
                  <div>
                    <p className="font-serif font-bold text-foreground">Transfers Guarded by Email Multi-Factor Authorization</p>
                    <p className="text-muted-foreground">
                      Outbound funds transfers require one-time passkey confirmation to your registered email ({maskEmail(activeAccount?.ownerEmail || "")}) and undergo compliance review before release.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setActiveTab("transfer");
                    setTransferStep(1);
                  }}
                  className="rounded-md bg-navy px-4 py-2 font-serif text-xs font-bold text-foreground hover:bg-secondary shrink-0"
                >
                  Send Wire Now
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: GUIDED USER TRANSFER FLOW */}
          {activeTab === "transfer" && (
            <div className="space-y-6">
              {/* Stepper Progress */}
              <div className="grid grid-cols-4 gap-2 text-xs font-serif">
                {[
                  { num: 1, label: "1. Details" },
                  { num: 2, label: "2. Review" },
                  { num: 3, label: "3. Email OTP" },
                  { num: 4, label: "4. Receipt" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`rounded-lg p-2 text-center border ${
                      transferStep === s.num
                        ? "border-navy bg-navy text-gold font-bold"
                        : transferStep > s.num
                        ? "border-border bg-muted text-foreground font-semibold"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: FORM */}
              {transferStep === 1 && (
                <form onSubmit={handleProceedToReview} className="space-y-5">
                  {/* Transfer Classification */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        setTransferType("domestic");
                        setCurrency("USD");
                      }}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                        transferType === "domestic"
                          ? "border-navy bg-card ring-2 ring-navy/20"
                          : "border-border bg-card"
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-serif font-bold text-xs text-foreground">Domestic Transfer (Fedwire / ACH)</p>
                        <p className="text-[11px] text-muted-foreground">Free member wire ($0.00). Same-day execution.</p>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setTransferType("international")}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                        transferType === "international"
                          ? "border-navy bg-card ring-2 ring-navy/20"
                          : "border-border bg-card"
                      }`}
                    >
                      <Globe className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-serif font-bold text-xs text-foreground">International Transfer (SWIFT GPI)</p>
                        <p className="text-[11px] text-muted-foreground">Cross-border multi-currency wire ($35.00 fee).</p>
                      </div>
                    </Button>
                  </div>

                  {/* Sender Account */}
                  <div>
                    <label className="block text-xs font-serif font-semibold text-foreground mb-1">
                      Originating Account *
                    </label>
                    <select
                      value={selectedSenderId}
                      onChange={(e) => setSelectedSenderId(e.target.value)}
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs text-foreground font-semibold"
                    >
                      {memberAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.accountNumberMasked}) — Available: ${a.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Beneficiary Details */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-serif font-semibold text-foreground mb-1">
                        Beneficiary Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientFullName}
                        onChange={(e) => setRecipientFullName(e.target.value)}
                        placeholder="e.g. Jonathan Sterling"
                        className="w-full rounded-lg border border-input bg-card px-3 py-2"
                      />
                      {errors.recipientFullName && (
                        <p className="text-xs text-foreground mt-1">{errors.recipientFullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-serif font-semibold text-foreground mb-1">
                        Beneficiary Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientBankName}
                        onChange={(e) => setRecipientBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase or Barclays"
                        className="w-full rounded-lg border border-input bg-card px-3 py-2"
                      />
                      {errors.recipientBankName && (
                        <p className="text-xs text-foreground mt-1">{errors.recipientBankName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-serif font-semibold text-foreground mb-1">
                        {transferType === "domestic" ? "Recipient Account Number *" : "Recipient IBAN or Account # *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={accountNumberOrIBAN}
                        onChange={(e) => setAccountNumberOrIBAN(e.target.value)}
                        placeholder={transferType === "domestic" ? "e.g. 8920194812" : "e.g. GB29NWBK60161331926819"}
                        className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono"
                      />
                      {errors.accountNumberOrIBAN && (
                        <p className="text-xs text-foreground mt-1">{errors.accountNumberOrIBAN}</p>
                      )}
                    </div>

                    {transferType === "domestic" ? (
                      <div>
                        <label className="block font-serif font-semibold text-foreground mb-1">
                          Confirm Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={confirmAccount}
                          onChange={(e) => setConfirmAccount(e.target.value)}
                          placeholder="Re-enter account number"
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono"
                        />
                        {errors.confirmAccount && (
                          <p className="text-xs text-foreground mt-1">{errors.confirmAccount}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block font-serif font-semibold text-foreground mb-1">
                          SWIFT / BIC Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={bankIdentifierCode}
                          onChange={(e) => setBankIdentifierCode(e.target.value.toUpperCase())}
                          placeholder="e.g. BARCGB22XXX"
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono uppercase"
                        />
                        {errors.bankIdentifierCode && (
                          <p className="text-xs text-foreground mt-1">{errors.bankIdentifierCode}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {transferType === "domestic" && (
                    <div className="text-xs">
                      <label className="block font-serif font-semibold text-foreground mb-1">
                        9-Digit ABA Routing Transit Number *
                      </label>
                      <input
                        type="text"
                        maxLength={9}
                        required
                        value={bankIdentifierCode}
                        onChange={(e) => setBankIdentifierCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 021000021"
                        className="w-full sm:w-1/2 rounded-lg border border-input bg-card px-3 py-2 font-mono"
                      />
                      {errors.bankIdentifierCode && (
                        <p className="text-xs text-foreground mt-1">{errors.bankIdentifierCode}</p>
                      )}
                    </div>
                  )}

                  <WireAddressFields title="Recipient address" prefix="recipient" value={recipientAddress} onChange={setRecipientAddress} errors={errors} />
                  <WireAddressFields title="Recipient bank address" prefix="bank" value={recipientBankAddress} onChange={setRecipientBankAddress} errors={errors} />

                  {/* Amount & Purpose */}
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-serif font-semibold text-foreground mb-1">
                        Transfer Amount *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-input bg-card px-3 py-2 font-serif font-bold text-sm"
                      />
                      {errors.amount && <p className="text-xs text-foreground mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                      <label className="block font-serif font-semibold text-foreground mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-2 font-semibold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="CHF">CHF (Fr)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-serif font-semibold text-foreground mb-1">Purpose *</label>
                      <select
                        value={transferPurpose}
                        onChange={(e) => setTransferPurpose(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-2"
                      >
                        <option value="Family Living Support & Expenses">Family Living Support & Expenses</option>
                        <option value="Commercial Vendor / Supplier Invoice">Commercial Vendor / Supplier Invoice</option>
                        <option value="Property Investment & Escrow Deposit">Property Investment & Escrow Deposit</option>
                        <option value="Education / Tuition Payment">Education / Tuition Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-serif font-semibold text-foreground mb-1">Custom Memo</label>
                      <input
                        type="text"
                        value={customMemo}
                        onChange={(e) => setCustomMemo(e.target.value)}
                        placeholder="e.g. Invoice #8412"
                        className="w-full rounded-lg border border-input bg-card px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="rounded-md border border-gold bg-navy px-6 py-2.5 font-serif text-xs font-bold text-foreground hover:bg-secondary shadow-md transition flex items-center gap-1.5"
                    >
                      Review Transfer <ArrowRight className="h-3.5 w-3.5 text-gold" />
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: REVIEW SCREEN */}
              {transferStep === 2 && (
                <div className="space-y-5 text-xs">
                  <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                    <h4 className="font-serif font-bold text-base text-foreground">
                      Confirm Wire Transfer Details
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-background p-3 space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-serif">Originating Account</span>
                        <p className="font-bold text-foreground">{senderAccount?.name}</p>
                        <p className="font-mono text-muted-foreground">{senderAccount?.accountNumberMasked}</p>
                        <p className="text-[11px] text-muted-foreground">Auth Email: {senderAccount?.ownerEmail}</p>
                      </div>

                      <div className="rounded-lg bg-background p-3 space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-serif">Beneficiary Account</span>
                        <p className="font-bold text-foreground">{recipientFullName}</p>
                        <p className="text-muted-foreground">{recipientBankName}</p>
                        <p className="text-xs text-muted-foreground">Bank address: {formatWireAddress(recipientBankAddress)}</p>
                        <p className="text-xs text-muted-foreground">Recipient address: {formatWireAddress(recipientAddress)}</p>
                        <p className="font-mono text-muted-foreground">{maskAccountNumber(accountNumberOrIBAN)}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {transferType === "domestic" ? "ABA Routing: " : "SWIFT: "}
                          {bankIdentifierCode}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gold/30 bg-card p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal:</span>
                        <span className="font-serif font-bold text-foreground">
                          {currency} {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {convertedAmount && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Exchange Rate:</span>
                          <span className="font-mono">1 USD = {exchangeRate} {currency}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institutional Wire Fee:</span>
                        <span className="font-semibold text-foreground">
                          {fee === 0 ? "Waived ($0.00)" : `$${fee.toFixed(2)} USD`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Window:</span>
                        <span className="font-medium text-foreground">{estimatedDelivery}</span>
                      </div>
                      <div className="pt-2 border-t border-border flex justify-between font-serif font-bold text-foreground text-sm">
                        <span>Total Debit Amount:</span>
                        <span>${totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted p-3 text-[11px] text-foreground flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                      <div>
                        <strong>Administrative Sign-Off Policy:</strong> In compliance with federal regulations, all outbound transfers are submitted as <strong>Pending Review</strong> and must be approved by an authorized compliance officer. Transfers are never executed automatically.
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        type="button"
                        onClick={() => setTransferStep(1)}
                        className="rounded border border-input bg-card px-4 py-2 font-serif font-semibold text-foreground"
                      >
                        Edit Details
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setTransferStep(3)}
                        className="rounded-md border border-gold bg-navy px-6 py-2 font-serif font-bold text-foreground hover:bg-secondary shadow-md transition"
                      >
                        Proceed to Email OTP Verification →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: OTP VERIFICATION */}
              {transferStep === 3 && (
                <div className="space-y-4 max-w-md mx-auto text-center text-xs">
                  {/* Sandbox Email Simulation Banner */}
                  <div className="rounded-lg border border-gold/40 bg-navy p-4 text-foreground space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[11px] text-gold flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Mail OTP Simulator
                      </span>
                      <span className="text-[9px] bg-gold text-foreground font-bold px-1.5 py-0.5 rounded">
                        Account Mail
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground">
                      Dispatched to account registration mail:{" "}
                      <strong className="text-foreground">{maskEmail(senderAccount?.ownerEmail || "")}</strong>
                    </p>
                    <div className="flex items-center justify-between bg-background/40 p-2 rounded border border-border/10 font-mono text-xs">
                      <span className="text-foreground">Passkey:</span>
                      <span className="font-bold text-base text-gold tracking-widest">{simulatedExpectedOtp}</span>
                      <Button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(simulatedExpectedOtp);
                          setOtpCopied(true);
                          setTimeout(() => setOtpCopied(false), 2000);
                        }}
                        className="text-[10px] text-foreground hover:text-foreground"
                      >
                        {otpCopied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <KeyRound className="h-10 w-10 text-foreground mx-auto" />
                    <div>
                      <h4 className="font-serif font-bold text-lg text-foreground">Enter Authorization Passkey</h4>
                      <p className="text-muted-foreground mt-0.5">
                        Enter the 6-digit code sent to {maskEmail(senderAccount?.ownerEmail || "")} to submit this transfer for officer review.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
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
                        className="w-40 mx-auto text-center rounded-lg border-2 border-navy bg-card py-2.5 text-xl font-mono font-bold tracking-[0.3em] text-foreground"
                      />
                      {otpError && <p className="text-xs text-foreground font-medium">{otpError}</p>}

                      <div className="flex justify-center text-[11px] text-muted-foreground">
                        {otpCountdown > 0 ? (
                          <span>Resend available in {otpCountdown}s</span>
                        ) : (
                          <Button
                            type="button"
                            onClick={generateNewOtp}
                            className="text-foreground font-semibold hover:underline"
                          >
                            Resend One-Time Passcode
                          </Button>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        <Button
                          type="submit"
                          className="w-full rounded-md border border-gold bg-navy py-2.5 font-serif text-xs font-bold text-foreground hover:bg-secondary shadow-md transition"
                        >
                          Verify & Submit for Review
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setTransferStep(2)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Back to Review
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIRMATION RECEIPT */}
              {transferStep === 4 && completedTransfer && (
                <div className="rounded-lg border border-border bg-card p-6 space-y-5 text-xs text-center animate-in fade-in">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-foreground">
                    <Clock className="h-6 w-6 text-foreground animate-pulse" />
                  </div>

                  <div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-serif font-bold text-foreground border border-border">
                      Status: PENDING REVIEW
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-foreground mt-2">
                      Transfer Enqueued for Administrator Approval
                    </h4>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                      Reference: <strong className="font-mono text-foreground">{completedTransfer.referenceNumber}</strong>
                    </p>
                  </div>

                  <div className="rounded-lg bg-background border border-border p-4 text-left space-y-1.5">
                    <p><strong>Beneficiary:</strong> {completedTransfer.recipientFullName} ({completedTransfer.recipientBankName})</p>
                    <p><strong>Bank address:</strong> {formatWireAddress(completedTransfer.recipientBankAddress)}</p>
                    <p><strong>Account:</strong> {completedTransfer.accountNumberMasked} · {completedTransfer.bankIdentifierType.toUpperCase()}: {completedTransfer.bankIdentifierCode}</p>
                    <p><strong>Total Debit:</strong> ${completedTransfer.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</p>
                    <p><strong>Estimated Settlement:</strong> {completedTransfer.estimatedDelivery}</p>
                    <p className="text-muted-foreground text-[11px] pt-1 border-t border-border">
                      MFA Verified to {completedTransfer.verificationEmail}. Never completed automatically; awaiting officer clearance.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => downloadTransferReceipt(completedTransfer)}
                      className="rounded-md border border-input bg-card px-4 py-2 font-serif font-semibold text-foreground hover:bg-background flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5 text-gold" /> Download Receipt Slip (.txt)
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setActiveTab("history")}
                      className="rounded-md bg-navy px-4 py-2 font-serif font-bold text-foreground hover:bg-secondary"
                    >
                      View in Transfer History →
                    </Button>

                    <Button
                      type="button"
                      onClick={handleResetTransfer}
                      className="rounded-md border border-input px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      New Transfer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER HISTORY & LIVE STATUS */}
          {activeTab === "history" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-gold">
                    Audit Log
                  </span>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Your Outbound Transfers Ledger
                  </h3>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setActiveTab("transfer");
                    setTransferStep(1);
                  }}
                  className="rounded-md bg-navy px-3 py-1.5 font-serif text-[11px] font-bold text-foreground hover:bg-secondary"
                >
                  + New Wire Transfer
                </Button>
              </div>

              <div className="divide-y divide-border">
                {memberTransfers.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No transfer records found.</p>
                ) : (
                  memberTransfers.map((trf) => (
                    <div key={trf.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
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
                          <span className="uppercase text-[9px] font-bold text-muted-foreground bg-muted px-1 py-0.5 rounded">
                            {trf.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          To: <strong className="text-foreground">{trf.recipientFullName}</strong> ({trf.recipientBankName}) · From: {trf.senderAccount.name}
                        </p>
                        {trf.adminNotes && (
                          <p className="text-[11px] text-foreground bg-background p-1.5 rounded border border-border">
                            <strong>Officer Note:</strong> {trf.adminNotes}
                          </p>
                        )}
                        {trf.requestInfoReason && (
                          <p className="text-[11px] text-foreground bg-muted p-1.5 rounded border border-border">
                            <strong>Action Required:</strong> {trf.requestInfoReason}
                          </p>
                        )}
                        {trf.rejectionReason && (
                          <p className="text-[11px] text-foreground bg-muted p-1.5 rounded border border-border">
                            <strong>Declined:</strong> {trf.rejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-foreground block">
                            ${trf.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(trf.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Button
                          type="button"
                          onClick={() => downloadTransferReceipt(trf)}
                          title="Download receipt"
                          className="p-1.5 rounded border border-input hover:bg-background"
                        >
                          <Download className="h-3.5 w-3.5 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
