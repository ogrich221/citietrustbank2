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
  const [activeAccount, setActiveAccount] = useState<BankAccount | null>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("citietrust_active_member");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {}
      }
    }
    return accounts[0] || null;
  });

  useEffect(() => {
    if (!activeAccount && accounts.length > 0) {
      setActiveAccount(accounts[0]);
    }
  }, [accounts, activeAccount]);

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

  // International Address
  const [recipientStreet, setRecipientStreet] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientPostalCode, setRecipientPostalCode] = useState("");
  const [recipientCountry, setRecipientCountry] = useState("United Kingdom");

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
    return accounts.find((a) => a.id === selectedSenderId) || activeAccount || accounts[0];
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

    if (transferType === "international") {
      if (!recipientStreet.trim()) errs.recipientStreet = "Recipient physical street address is required for international SWIFT wires.";
      if (!recipientCity.trim()) errs.recipientCity = "Recipient city is required.";
      if (!recipientPostalCode.trim()) errs.recipientPostalCode = "Postal / ZIP code is required.";
      if (!recipientCountry.trim()) errs.recipientCountry = "Destination country is required.";
    }

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
      recipientAddress:
        transferType === "international"
          ? {
              street: recipientStreet.trim(),
              city: recipientCity.trim(),
              postalCode: recipientPostalCode.trim(),
              country: recipientCountry.trim(),
            }
          : undefined,
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
    setRecipientStreet("");
    setRecipientCity("");
    setRecipientPostalCode("");
    setErrors({});
    setCompletedTransfer(null);
  };

  const handleSelectMember = (acct: BankAccount) => {
    setActiveAccount(acct);
    setSelectedSenderId(acct.id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("citietrust_active_member", JSON.stringify(acct));
    }
    setShowSwitchUser(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-[#FAF8F5] border-[#E3DCCE] p-0 text-[#102A43]">
        {/* Header Bar */}
        <div className="bg-[#102A43] text-[#FBF9F5] p-6 border-b border-[#D4AF37]/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-[#16385C] shadow-inner">
                <Landmark className="h-5 w-5 text-[#E6C663]" />
              </span>
              <div>
                <DialogTitle className="font-serif text-xl font-bold tracking-tight text-[#FBF9F5]">
                  citiEtrust BANK · Member Banking Portal
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  Federally Insured by NCUA · Active Member:{" "}
                  <strong className="text-[#E6C663]">{activeAccount?.ownerName}</strong> ({activeAccount?.ownerEmail})
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSwitchUser(!showSwitchUser)}
                className="rounded-md border border-[#D4AF37]/40 bg-[#16385C] px-3 py-1.5 font-serif text-[11px] font-semibold text-[#E6C663] hover:bg-[#1a4470] transition"
              >
                Switch Account Profile
              </button>
            </div>
          </div>

          {/* Account Profile Switcher Drawer */}
          {showSwitchUser && (
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-[#D4AF37]/30 space-y-2 animate-in fade-in">
              <p className="text-xs font-serif font-bold text-[#E6C663]">Select Registered Member Account:</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {accounts.map((acct) => (
                  <button
                    key={acct.id}
                    type="button"
                    onClick={() => handleSelectMember(acct)}
                    className={`flex items-start justify-between p-2.5 rounded-lg border text-left transition ${
                      activeAccount?.id === acct.id
                        ? "border-[#E6C663] bg-[#E6C663]/10 text-white"
                        : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{acct.ownerName}</p>
                      <p className="text-[10px] text-slate-400">{acct.name} ({acct.accountNumberMasked})</p>
                      <p className="text-[10px] text-[#E6C663]">Auth Email: {acct.ownerEmail}</p>
                    </div>
                    <span className="font-mono font-bold">${acct.balance.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6 flex border-b border-[#D4AF37]/20 text-xs font-serif">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "border-[#E6C663] text-[#E6C663]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" /> Accounts & Balances
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("transfer");
                setTransferStep(1);
              }}
              className={`pb-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "transfer"
                  ? "border-[#E6C663] text-[#E6C663]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Send className="h-3.5 w-3.5" /> Send Money (Domestic & International)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`pb-2.5 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "border-[#E6C663] text-[#E6C663]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="h-3.5 w-3.5" /> Outbound Transfer History
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: ACCOUNTS OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                  Depository Accounts Ledger
                </span>
                <h3 className="font-serif text-xl font-bold text-[#102A43]">
                  Member Balance Overview
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {accounts
                  .filter((a) => a.ownerEmail === activeAccount?.ownerEmail || accounts.length <= 4)
                  .map((acct) => (
                    <div
                      key={acct.id}
                      className="rounded-2xl border border-[#E3DCCE] bg-white p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-[#102A43]">{acct.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{acct.accountNumberMasked}</span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-serif">Available Balance</p>
                          <p className="font-serif text-2xl font-bold text-[#102A43] mt-0.5">
                            ${acct.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSenderId(acct.id);
                            setActiveTab("transfer");
                            setTransferStep(1);
                          }}
                          className="rounded-md border border-[#9E7D2B] bg-[#102A43] px-3 py-1.5 font-serif text-[11px] font-bold text-[#FBF9F5] hover:bg-[#16385C] transition flex items-center gap-1 shadow-xs"
                        >
                          <Send className="h-3 w-3 text-[#E6C663]" /> Transfer
                        </button>
                      </div>

                      <div className="pt-2 border-t border-[#E3DCCE] flex justify-between text-[11px] text-muted-foreground">
                        <span>ABA Routing: 071922841</span>
                        <span>Owner: {acct.ownerName}</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Quick Actions & Security Notice */}
              <div className="rounded-xl border border-[#9E7D2B]/30 bg-[#FFFDF9] p-4 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-serif font-bold text-[#102A43]">Transfers Guarded by Email Multi-Factor Authorization</p>
                    <p className="text-muted-foreground">
                      Outbound funds transfers require one-time passkey confirmation to your registered email ({maskEmail(activeAccount?.ownerEmail || "")}) and undergo compliance review before release.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("transfer");
                    setTransferStep(1);
                  }}
                  className="rounded-md bg-[#102A43] px-4 py-2 font-serif text-xs font-bold text-[#FBF9F5] hover:bg-[#16385C] shrink-0"
                >
                  Send Wire Now
                </button>
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
                        ? "border-[#102A43] bg-[#102A43] text-[#E6C663] font-bold"
                        : transferStep > s.num
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold"
                        : "border-[#E3DCCE] bg-white text-muted-foreground"
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
                    <button
                      type="button"
                      onClick={() => {
                        setTransferType("domestic");
                        setCurrency("USD");
                      }}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        transferType === "domestic"
                          ? "border-[#102A43] bg-white ring-2 ring-[#102A43]/20"
                          : "border-[#E3DCCE] bg-[#FFFDF9]"
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-[#102A43] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-serif font-bold text-xs text-[#102A43]">Domestic Transfer (Fedwire / ACH)</p>
                        <p className="text-[11px] text-muted-foreground">Free member wire ($0.00). Same-day execution.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransferType("international")}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        transferType === "international"
                          ? "border-[#102A43] bg-white ring-2 ring-[#102A43]/20"
                          : "border-[#E3DCCE] bg-[#FFFDF9]"
                      }`}
                    >
                      <Globe className="h-5 w-5 text-[#9E7D2B] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-serif font-bold text-xs text-[#102A43]">International Transfer (SWIFT GPI)</p>
                        <p className="text-[11px] text-muted-foreground">Cross-border multi-currency wire ($35.00 fee).</p>
                      </div>
                    </button>
                  </div>

                  {/* Sender Account */}
                  <div>
                    <label className="block text-xs font-serif font-semibold text-[#102A43] mb-1">
                      Originating Account *
                    </label>
                    <select
                      value={selectedSenderId}
                      onChange={(e) => setSelectedSenderId(e.target.value)}
                      className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 text-xs text-[#102A43] font-semibold"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.accountNumberMasked}) — Available: ${a.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Beneficiary Details */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">
                        Beneficiary Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientFullName}
                        onChange={(e) => setRecipientFullName(e.target.value)}
                        placeholder="e.g. Jonathan Sterling"
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                      />
                      {errors.recipientFullName && (
                        <p className="text-xs text-red-600 mt-1">{errors.recipientFullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">
                        Beneficiary Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientBankName}
                        onChange={(e) => setRecipientBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase or Barclays"
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                      />
                      {errors.recipientBankName && (
                        <p className="text-xs text-red-600 mt-1">{errors.recipientBankName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">
                        {transferType === "domestic" ? "Recipient Account Number *" : "Recipient IBAN or Account # *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={accountNumberOrIBAN}
                        onChange={(e) => setAccountNumberOrIBAN(e.target.value)}
                        placeholder={transferType === "domestic" ? "e.g. 8920194812" : "e.g. GB29NWBK60161331926819"}
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 font-mono"
                      />
                      {errors.accountNumberOrIBAN && (
                        <p className="text-xs text-red-600 mt-1">{errors.accountNumberOrIBAN}</p>
                      )}
                    </div>

                    {transferType === "domestic" ? (
                      <div>
                        <label className="block font-serif font-semibold text-[#102A43] mb-1">
                          Confirm Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={confirmAccount}
                          onChange={(e) => setConfirmAccount(e.target.value)}
                          placeholder="Re-enter account number"
                          className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 font-mono"
                        />
                        {errors.confirmAccount && (
                          <p className="text-xs text-red-600 mt-1">{errors.confirmAccount}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block font-serif font-semibold text-[#102A43] mb-1">
                          SWIFT / BIC Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={bankIdentifierCode}
                          onChange={(e) => setBankIdentifierCode(e.target.value.toUpperCase())}
                          placeholder="e.g. BARCGB22XXX"
                          className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 font-mono uppercase"
                        />
                        {errors.bankIdentifierCode && (
                          <p className="text-xs text-red-600 mt-1">{errors.bankIdentifierCode}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {transferType === "domestic" && (
                    <div className="text-xs">
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">
                        9-Digit ABA Routing Transit Number *
                      </label>
                      <input
                        type="text"
                        maxLength={9}
                        required
                        value={bankIdentifierCode}
                        onChange={(e) => setBankIdentifierCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 021000021"
                        className="w-full sm:w-1/2 rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 font-mono"
                      />
                      {errors.bankIdentifierCode && (
                        <p className="text-xs text-red-600 mt-1">{errors.bankIdentifierCode}</p>
                      )}
                    </div>
                  )}

                  {/* International Address Fields */}
                  {transferType === "international" && (
                    <div className="pt-3 border-t border-[#E3DCCE] space-y-3 text-xs">
                      <span className="font-serif font-bold text-[#102A43]">
                        Beneficiary Physical Address (Required for International SWIFT)
                      </span>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">Street Address *</label>
                          <input
                            type="text"
                            required
                            value={recipientStreet}
                            onChange={(e) => setRecipientStreet(e.target.value)}
                            placeholder="e.g. 17 Quai de l'Île"
                            className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                          />
                          {errors.recipientStreet && <p className="text-xs text-red-600 mt-1">{errors.recipientStreet}</p>}
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={recipientCity}
                            onChange={(e) => setRecipientCity(e.target.value)}
                            placeholder="e.g. Geneva, London"
                            className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                          />
                          {errors.recipientCity && <p className="text-xs text-red-600 mt-1">{errors.recipientCity}</p>}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">Postal / ZIP Code *</label>
                          <input
                            type="text"
                            required
                            value={recipientPostalCode}
                            onChange={(e) => setRecipientPostalCode(e.target.value)}
                            placeholder="e.g. 1204"
                            className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                          />
                          {errors.recipientPostalCode && <p className="text-xs text-red-600 mt-1">{errors.recipientPostalCode}</p>}
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">Country *</label>
                          <select
                            value={recipientCountry}
                            onChange={(e) => setRecipientCountry(e.target.value)}
                            className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                          >
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Germany">Germany</option>
                            <option value="Canada">Canada</option>
                            <option value="Japan">Japan</option>
                            <option value="Other">Other Non-Sanctioned Jurisdiction</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amount & Purpose */}
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">
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
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 font-serif font-bold text-sm"
                      />
                      {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2 font-semibold"
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
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">Purpose *</label>
                      <select
                        value={transferPurpose}
                        onChange={(e) => setTransferPurpose(e.target.value)}
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                      >
                        <option value="Family Living Support & Expenses">Family Living Support & Expenses</option>
                        <option value="Commercial Vendor / Supplier Invoice">Commercial Vendor / Supplier Invoice</option>
                        <option value="Property Investment & Escrow Deposit">Property Investment & Escrow Deposit</option>
                        <option value="Education / Tuition Payment">Education / Tuition Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-serif font-semibold text-[#102A43] mb-1">Custom Memo</label>
                      <input
                        type="text"
                        value={customMemo}
                        onChange={(e) => setCustomMemo(e.target.value)}
                        placeholder="e.g. Invoice #8412"
                        className="w-full rounded-lg border border-[#D5CEBF] bg-white px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="rounded-md border border-[#D4AF37] bg-[#102A43] px-6 py-2.5 font-serif text-xs font-bold text-[#FBF9F5] hover:bg-[#16385C] shadow-md transition flex items-center gap-1.5"
                    >
                      Review Transfer <ArrowRight className="h-3.5 w-3.5 text-[#E6C663]" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: REVIEW SCREEN */}
              {transferStep === 2 && (
                <div className="space-y-5 text-xs">
                  <div className="rounded-xl border border-[#E3DCCE] bg-white p-5 space-y-4">
                    <h4 className="font-serif font-bold text-base text-[#102A43]">
                      Confirm Wire Transfer Details
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-[#FAF8F5] p-3 space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-serif">Originating Account</span>
                        <p className="font-bold text-[#102A43]">{senderAccount?.name}</p>
                        <p className="font-mono text-muted-foreground">{senderAccount?.accountNumberMasked}</p>
                        <p className="text-[11px] text-muted-foreground">Auth Email: {senderAccount?.ownerEmail}</p>
                      </div>

                      <div className="rounded-lg bg-[#FAF8F5] p-3 space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-serif">Beneficiary Account</span>
                        <p className="font-bold text-[#102A43]">{recipientFullName}</p>
                        <p className="text-muted-foreground">{recipientBankName}</p>
                        <p className="font-mono text-muted-foreground">{maskAccountNumber(accountNumberOrIBAN)}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {transferType === "domestic" ? "ABA Routing: " : "SWIFT: "}
                          {bankIdentifierCode}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#9E7D2B]/30 bg-[#FFFDF9] p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal:</span>
                        <span className="font-serif font-bold text-[#102A43]">
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
                        <span className="font-semibold text-[#102A43]">
                          {fee === 0 ? "Waived ($0.00)" : `$${fee.toFixed(2)} USD`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Window:</span>
                        <span className="font-medium text-emerald-700">{estimatedDelivery}</span>
                      </div>
                      <div className="pt-2 border-t border-[#E3DCCE] flex justify-between font-serif font-bold text-[#102A43] text-sm">
                        <span>Total Debit Amount:</span>
                        <span>${totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Administrative Sign-Off Policy:</strong> In compliance with federal regulations, all outbound transfers are submitted as <strong>Pending Review</strong> and must be approved by an authorized compliance officer. Transfers are never executed automatically.
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setTransferStep(1)}
                        className="rounded border border-[#D5CEBF] bg-white px-4 py-2 font-serif font-semibold text-[#102A43]"
                      >
                        Edit Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransferStep(3)}
                        className="rounded-md border border-[#D4AF37] bg-[#102A43] px-6 py-2 font-serif font-bold text-[#FBF9F5] hover:bg-[#16385C] shadow-md transition"
                      >
                        Proceed to Email OTP Verification →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: OTP VERIFICATION */}
              {transferStep === 3 && (
                <div className="space-y-4 max-w-md mx-auto text-center text-xs">
                  {/* Sandbox Email Simulation Banner */}
                  <div className="rounded-xl border border-[#9E7D2B]/40 bg-[#102A43] p-4 text-[#FBF9F5] space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[11px] text-[#E6C663] flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Mail OTP Simulator
                      </span>
                      <span className="text-[9px] bg-[#E6C663] text-[#102A43] font-bold px-1.5 py-0.5 rounded">
                        Account Mail
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Dispatched to account registration mail:{" "}
                      <strong className="text-white">{maskEmail(senderAccount?.ownerEmail || "")}</strong>
                    </p>
                    <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/10 font-mono text-xs">
                      <span className="text-slate-400">Passkey:</span>
                      <span className="font-bold text-base text-[#E6C663] tracking-widest">{simulatedExpectedOtp}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(simulatedExpectedOtp);
                          setOtpCopied(true);
                          setTimeout(() => setOtpCopied(false), 2000);
                        }}
                        className="text-[10px] text-slate-300 hover:text-white"
                      >
                        {otpCopied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E3DCCE] bg-white p-6 space-y-4">
                    <KeyRound className="h-10 w-10 text-[#102A43] mx-auto" />
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#102A43]">Enter Authorization Passkey</h4>
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
                        className="w-40 mx-auto text-center rounded-lg border-2 border-[#102A43] bg-[#FFFDF9] py-2.5 text-xl font-mono font-bold tracking-[0.3em] text-[#102A43]"
                      />
                      {otpError && <p className="text-xs text-red-600 font-medium">{otpError}</p>}

                      <div className="flex justify-center text-[11px] text-muted-foreground">
                        {otpCountdown > 0 ? (
                          <span>Resend available in {otpCountdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={generateNewOtp}
                            className="text-[#102A43] font-semibold hover:underline"
                          >
                            Resend One-Time Passcode
                          </button>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="submit"
                          className="w-full rounded-md border border-[#D4AF37] bg-[#102A43] py-2.5 font-serif text-xs font-bold text-[#FBF9F5] hover:bg-[#16385C] shadow-md transition"
                        >
                          Verify & Submit for Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransferStep(2)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Back to Review
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIRMATION RECEIPT */}
              {transferStep === 4 && completedTransfer && (
                <div className="rounded-xl border border-[#E3DCCE] bg-white p-6 space-y-5 text-xs text-center animate-in fade-in">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-800">
                    <Clock className="h-6 w-6 text-amber-700 animate-pulse" />
                  </div>

                  <div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-serif font-bold text-amber-800 border border-amber-300">
                      Status: PENDING REVIEW
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-[#102A43] mt-2">
                      Transfer Enqueued for Administrator Approval
                    </h4>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                      Reference: <strong className="font-mono text-[#102A43]">{completedTransfer.referenceNumber}</strong>
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#FAF8F5] border border-[#E3DCCE] p-4 text-left space-y-1.5">
                    <p><strong>Beneficiary:</strong> {completedTransfer.recipientFullName} ({completedTransfer.recipientBankName})</p>
                    <p><strong>Account:</strong> {completedTransfer.accountNumberMasked} · {completedTransfer.bankIdentifierType.toUpperCase()}: {completedTransfer.bankIdentifierCode}</p>
                    <p><strong>Total Debit:</strong> ${completedTransfer.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</p>
                    <p><strong>Estimated Settlement:</strong> {completedTransfer.estimatedDelivery}</p>
                    <p className="text-muted-foreground text-[11px] pt-1 border-t border-[#E3DCCE]">
                      MFA Verified to {completedTransfer.verificationEmail}. Never completed automatically; awaiting officer clearance.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => downloadTransferReceipt(completedTransfer)}
                      className="rounded-md border border-[#D5CEBF] bg-white px-4 py-2 font-serif font-semibold text-[#102A43] hover:bg-[#FAF8F5] flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5 text-[#9E7D2B]" /> Download Receipt Slip (.txt)
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("history")}
                      className="rounded-md bg-[#102A43] px-4 py-2 font-serif font-bold text-[#FBF9F5] hover:bg-[#16385C]"
                    >
                      View in Transfer History →
                    </button>

                    <button
                      type="button"
                      onClick={handleResetTransfer}
                      className="rounded-md border border-[#D5CEBF] px-3 py-2 text-muted-foreground hover:text-[#102A43]"
                    >
                      New Transfer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER HISTORY & LIVE STATUS */}
          {activeTab === "history" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-3">
                <div>
                  <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#9E7D2B]">
                    Audit Log
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#102A43]">
                    Your Outbound Transfers Ledger
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("transfer");
                    setTransferStep(1);
                  }}
                  className="rounded-md bg-[#102A43] px-3 py-1.5 font-serif text-[11px] font-bold text-[#FBF9F5] hover:bg-[#16385C]"
                >
                  + New Wire Transfer
                </button>
              </div>

              <div className="divide-y divide-[#E3DCCE]">
                {transfers.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No transfer records found.</p>
                ) : (
                  transfers.map((trf) => (
                    <div key={trf.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#102A43]">{trf.referenceNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-serif font-bold border ${
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
                          <span className="uppercase text-[9px] font-bold text-muted-foreground bg-slate-100 px-1 py-0.5 rounded">
                            {trf.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          To: <strong className="text-[#102A43]">{trf.recipientFullName}</strong> ({trf.recipientBankName}) · From: {trf.senderAccount.name}
                        </p>
                        {trf.adminNotes && (
                          <p className="text-[11px] text-slate-700 bg-[#FAF8F5] p-1.5 rounded border border-[#E3DCCE]">
                            <strong>Officer Note:</strong> {trf.adminNotes}
                          </p>
                        )}
                        {trf.requestInfoReason && (
                          <p className="text-[11px] text-blue-800 bg-blue-50 p-1.5 rounded border border-blue-200">
                            <strong>Action Required:</strong> {trf.requestInfoReason}
                          </p>
                        )}
                        {trf.rejectionReason && (
                          <p className="text-[11px] text-red-800 bg-red-50 p-1.5 rounded border border-red-200">
                            <strong>Declined:</strong> {trf.rejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-[#102A43] block">
                            ${trf.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(trf.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => downloadTransferReceipt(trf)}
                          title="Download receipt"
                          className="p-1.5 rounded border border-[#D5CEBF] hover:bg-[#FAF8F5]"
                        >
                          <Download className="h-3.5 w-3.5 text-slate-700" />
                        </button>
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
