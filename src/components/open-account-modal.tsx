import React, { useState, useId } from "react";
import {
  ShieldCheck,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface OpenAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAccountType?: string;
  onSuccessOpenPortal?: () => void;
}

export type StepNumber = 1 | 2 | 3 | 4;

export interface ApplicationFormData {
  // Step 1: Personal details
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  citizenship: string;
  accountType: string;

  // Step 2: Identity verification
  idType: string;
  idNumber: string;
  idState: string;
  ssnLast4: string;
  employmentStatus: string;
  employer: string;
  annualIncome: string;

  // Step 3: Security setup
  username: string;
  password: string;
  confirmPassword: string;
  mfaPreference: "sms" | "authenticator";
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;
  securityQuestion3: string;
  securityAnswer3: string;

  // Step 4: Disclosures & consent
  consentElectronic: boolean;
  consentMembership: boolean;
  consentCreditCheck: boolean;
  consentW9: boolean;
}

export interface FormErrors {
  firstName?: string | undefined;
  lastName?: string | undefined;
  dob?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  street?: string | undefined;
  apt?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  zip?: string | undefined;
  citizenship?: string | undefined;
  accountType?: string | undefined;
  idType?: string | undefined;
  idNumber?: string | undefined;
  idState?: string | undefined;
  ssnLast4?: string | undefined;
  employmentStatus?: string | undefined;
  employer?: string | undefined;
  annualIncome?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
  confirmPassword?: string | undefined;
  mfaPreference?: string | undefined;
  securityQuestion1?: string | undefined;
  securityAnswer1?: string | undefined;
  securityQuestion2?: string | undefined;
  securityAnswer2?: string | undefined;
  securityQuestion3?: string | undefined;
  securityAnswer3?: string | undefined;
  consentElectronic?: string | undefined;
  consentMembership?: string | undefined;
  consentCreditCheck?: string | undefined;
  consentW9?: string | undefined;
}

const INITIAL_FORM_DATA: ApplicationFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  email: "",
  phone: "",
  street: "",
  apt: "",
  city: "",
  state: "",
  zip: "",
  citizenship: "us_citizen",
  accountType: "heritage_checking",

  idType: "drivers_license",
  idNumber: "",
  idState: "NC",
  ssnLast4: "",
  employmentStatus: "employed_full_time",
  employer: "",
  annualIncome: "50k_75k",

  username: "",
  password: "",
  confirmPassword: "",
  mfaPreference: "sms",
  securityQuestion1: "What was the name of your first school?",
  securityAnswer1: "",
  securityQuestion2: "What is the name of a childhood friend?",
  securityAnswer2: "",
  securityQuestion3: "What city were you born in?",
  securityAnswer3: "",

  consentElectronic: false,
  consentMembership: false,
  consentCreditCheck: false,
  consentW9: false,
};

const SECURITY_QUESTIONS_POOL_1 = [
  "What was the name of your first school?",
  "What was your childhood nickname?",
  "In what city did your parents meet?",
  "What was the name of the street where you first lived?",
  "What was your first childhood pet's name?",
];

const SECURITY_QUESTIONS_POOL_2 = [
  "What is the name of a childhood friend?",
  "What was the make and model of your first car?",
  "What was the name of your first employer or manager?",
  "What was your favorite subject in high school?",
  "What was the name of the hospital where you were born?",
];

const SECURITY_QUESTIONS_POOL_3 = [
  "What city were you born in?",
  "What is your maternal grandmother's maiden name?",
  "In what town or city was your first full-time job?",
  "What is the middle name of your oldest sibling?",
  "What was the mascot of your high school or college?",
];

export function OpenAccountModal({
  open,
  onOpenChange,
  defaultAccountType,
  onSuccessOpenPortal,
}: OpenAccountModalProps) {
  const [step, setStep] = useState<StepNumber>(1);
  const [formData, setFormData] = useState<ApplicationFormData>(() => ({
    ...INITIAL_FORM_DATA,
    accountType: defaultAccountType || "heritage_checking",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const formId = useId();

  const handleInputChange = <K extends keyof ApplicationFormData>(
    field: K,
    value: ApplicationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.dob) {
      errs.dob = "Date of birth is required";
    } else {
      const birth = new Date(formData.dob);
      const now = new Date();
      const ageDiff = now.getFullYear() - birth.getFullYear();
      if (isNaN(birth.getTime()) || ageDiff < 18) {
        errs.dob = "Applicant must be at least 18 years old to open an account";
      }
    }
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Mobile phone number is required";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      errs.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.street.trim()) errs.street = "Street address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state.trim()) errs.state = "State is required";
    if (!formData.zip.trim()) {
      errs.zip = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      errs.zip = "Please enter a valid 5-digit ZIP code";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.idNumber.trim()) errs.idNumber = "Government ID number is required";
    if (!formData.ssnLast4.trim()) {
      errs.ssnLast4 = "Last 4 digits of SSN/ITIN are required";
    } else if (!/^\d{4}$/.test(formData.ssnLast4.trim())) {
      errs.ssnLast4 = "Please enter exactly 4 digits";
    }
    if (
      (formData.employmentStatus === "employed_full_time" ||
        formData.employmentStatus === "employed_part_time") &&
      !formData.employer.trim()
    ) {
      errs.employer = "Employer or organization name is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const calculatePasswordStrength = (pass: string): number => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const validateStep3 = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.username.trim() || formData.username.length < 6) {
      errs.username = "Username must be at least 6 alphanumeric characters";
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      errs.username = "Username can only contain letters, numbers, dots, or underscores";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      errs.password = "Password must contain uppercase, lowercase, and a number";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (!formData.securityAnswer1.trim()) {
      errs.securityAnswer1 = "Please provide an answer for Question 1";
    }
    if (!formData.securityAnswer2.trim()) {
      errs.securityAnswer2 = "Please provide an answer for Question 2";
    }
    if (!formData.securityAnswer3.trim()) {
      errs.securityAnswer3 = "Please provide an answer for Question 3";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.consentElectronic) {
      errs.consentElectronic = "Electronic communications consent is required";
    }
    if (!formData.consentMembership) {
      errs.consentMembership = "You must agree to the Membership Agreement";
    }
    if (!formData.consentCreditCheck) {
      errs.consentCreditCheck = "Authorization for credit report & identity verification is required";
    }
    if (!formData.consentW9) {
      errs.consentW9 = "Taxpayer certification is required by federal law";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    if (step > 1) {
      setErrors({});
      setStep((s) => (s - 1) as StepNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setIsSubmitting(true);
    // Simulate secure transmission to credit union underwriting ledger
    setTimeout(() => {
      const generatedRef = `CET-1952-${Math.floor(10000 + Math.random() * 90000)}`;
      setReferenceNumber(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Save user account and registered email for transfer OTP verification
      try {
        const newAccount = {
          id: `acc_${Date.now()}`,
          accountNumber: `0719${Math.floor(10000000 + Math.random() * 90000000)}`,
          name: `${formData.firstName} ${formData.lastName} (${formData.accountType === "high_yield_savings" ? "Savings" : "Checking"})`,
          type: formData.accountType === "high_yield_savings" ? "savings" : "checking",
          currency: "USD",
          balance: 8500.00,
          availableBalance: 8500.00,
          routingNumber: "071922841",
          email: formData.email,
          status: "active",
        };

        const existingRaw = localStorage.getItem("citietrust_accounts_v1");
        const list = existingRaw ? JSON.parse(existingRaw) : [];
        list.unshift(newAccount);
        localStorage.setItem("citietrust_accounts_v1", JSON.stringify(list));

        // Save active session for the user
        localStorage.setItem(
          "citietrust_active_member",
          JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            username: formData.username,
            accountNumber: newAccount.accountNumber,
          })
        );

        window.dispatchEvent(new CustomEvent("citietrust_transfers_updated"));
      } catch (err) {
        console.error("Failed to register account for online transfers:", err);
      }
    }, 1500);
  };

  const handleResetAndClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setIsSubmitted(false);
      setReferenceNumber("");
      setFormData({
        ...INITIAL_FORM_DATA,
        accountType: defaultAccountType || "heritage_checking",
      });
      setErrors({});
    }, 300);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getAccountLabel = (val: string): string => {
    switch (val) {
      case "heritage_checking":
        return "Heritage Free Checking ($0 Monthly Fee · Free Debit Card)";
      case "high_yield_savings":
        return "High-Yield Member Savings (4.10% APY · Insured to $250k)";
      case "money_market":
        return "Premier Money Market Share Account (Tiered Dividends)";
      case "checking_savings_bundle":
        return "Member Relationship Bundle (Checking + High-Yield Savings)";
      default:
        return "Member Checking & Share Account";
    }
  };

  const getIdLabel = (val: string): string => {
    switch (val) {
      case "drivers_license":
        return "State Driver's License";
      case "state_id":
        return "State-Issued Photo ID Card";
      case "passport":
        return "U.S. Passport / Passport Card";
      case "military_id":
        return "U.S. Military Identification";
      default:
        return "Government Photo ID";
    }
  };

  const getCitizenshipLabel = (val: string): string => {
    switch (val) {
      case "us_citizen":
        return "U.S. Citizen";
      case "permanent_resident":
        return "Permanent Resident (Green Card)";
      case "non_resident":
        return "Eligible Non-Resident Alien";
      default:
        return "U.S. Citizen";
    }
  };

  const getEmploymentLabel = (val: string): string => {
    switch (val) {
      case "employed_full_time":
        return "Employed Full-Time";
      case "employed_part_time":
        return "Employed Part-Time";
      case "self_employed":
        return "Self-Employed / Business Owner";
      case "retired":
        return "Retired";
      case "student":
        return "Student";
      case "not_employed":
        return "Not Employed";
      default:
        return "Employed";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl overflow-y-auto border-2 border-border/80 bg-[#FAF8F5] p-0 text-foreground shadow-2xl sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Open an Account - Trustora Credit Union</DialogTitle>
          <DialogDescription>
            Secure, 4-step membership application flow protected with bank-grade encryption.
          </DialogDescription>
        </DialogHeader>

        {/* Top Heritage Header Band */}
        <div className="relative border-b border-[#E3DCCE] bg-[#102A43] px-6 py-5 text-white sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#16385C] shadow-inner">
                <Building2 className="h-5 w-5 text-[#E6C663]" />
              </span>
              <div>
                <p className="font-serif text-lg font-semibold tracking-wide text-[#FBF9F5]">
                  Trustora Credit Union
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C5A059]">
                  Member Application Portal · Est. 1952
                </p>
              </div>
            </div>

            <div className="hidden text-right text-xs text-slate-300 sm:block">
              <span className="flex items-center gap-1.5 font-medium text-[#E6C663]">
                <ShieldCheck className="h-4 w-4" /> 256-Bit Bank-Grade SSL
              </span>
              <span className="text-[11px] text-slate-400">NCUA Insured to $250,000</span>
            </div>
          </div>

          {/* Progress Tracker (hidden once submitted) */}
          {!isSubmitted && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="text-[#E6C663] font-serif">
                  Step {step} of 4:{" "}
                  {step === 1 && "Personal Details"}
                  {step === 2 && "Identity Verification"}
                  {step === 3 && "Security Setup"}
                  {step === 4 && "Review & Submit"}
                </span>
                <span className="text-slate-400">{step * 25}% Complete</span>
              </div>

              {/* Multi-step progress bar */}
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s <= step ? "bg-[#D4AF37]" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* SUCCESS SCREEN */}
          {isSubmitted ? (
            <div className="py-6 text-center animate-in fade-in zoom-in-95 duration-400">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#E8F5E9] text-[#1E4D2B] shadow-sm">
                <Check className="h-9 w-9 text-[#2E7D32]" />
              </div>

              <span className="mt-4 inline-block rounded-full border border-[#D4AF37]/50 bg-[#F4ECD8] px-3.5 py-1 text-xs font-serif font-bold uppercase tracking-wider text-[#795548]">
                Application Verified & Received
              </span>

              <h3 className="mt-3 font-serif text-2xl font-bold text-[#102A43] sm:text-3xl">
                Welcome to Trustora Credit Union!
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Your membership application has been securely transmitted to our member underwriting
                desk. An official confirmation package has been sent to{" "}
                <strong className="text-foreground">{formData.email}</strong>.
              </p>

              {/* Reference Card (Safe: No sensitive credentials displayed) */}
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#D4AF37]/40 bg-[#FFFDF9] p-5 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Application Reference ID
                    </p>
                    <p className="font-mono text-base font-bold text-[#102A43]">{referenceNumber}</p>
                  </div>
                  <span className="rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                    Pending Underwriting
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Primary Applicant</span>
                    <p className="font-medium text-foreground">
                      {formData.firstName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Requested</span>
                    <p className="font-medium text-foreground">
                      {formData.accountType === "heritage_checking"
                        ? "Heritage Checking"
                        : formData.accountType === "high_yield_savings"
                          ? "High-Yield Savings"
                          : "Member Account"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Username</span>
                    <p className="font-medium text-foreground">{formData.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MFA Delivery</span>
                    <p className="font-medium text-foreground">
                      {formData.mfaPreference === "sms" ? "SMS Text Message" : "Authenticator App"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-[#F5F2EB] p-3 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-[#2E7D32]" /> Privacy & Security Guarantee
                  </p>
                  <p className="mt-1">
                    For your confidentiality, passwords, tax identification numbers, and security question
                    answers are securely encrypted and are never displayed on confirmation documents.
                  </p>
                </div>
              </div>

              {/* What happens next */}
              <div className="mx-auto mt-6 max-w-md text-left text-xs">
                <p className="font-serif font-bold uppercase tracking-wider text-[#102A43]">
                  What Happens Next?
                </p>
                <ol className="mt-2 space-y-2 text-muted-foreground list-decimal list-inside leading-relaxed">
                  <li>
                    Our Member Services team will review your identity verification within 1 business day.
                  </li>
                  <li>
                    You will receive a welcome email with instructions to fund your opening $5 member
                    share deposit.
                  </li>
                  <li>
                    Your contactless Trustora Visa Debit Card will be dispatched to your home address via
                    secure postal mail.
                  </li>
                </ol>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onSuccessOpenPortal && (
                  <Button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      onSuccessOpenPortal();
                    }}
                    className="rounded-md border border-[#9E7D2B] bg-gradient-to-b from-[#E6C663] to-[#C5A059] px-6 py-2.5 font-serif text-sm font-bold text-[#102A43] shadow-md hover:from-[#ECD076] hover:to-[#CEAA64]"
                  >
                    Access Online Banking & Transfers →
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  className="rounded-md border-[#D5CEBF] bg-[#FFFDF9] px-6 py-2.5 font-serif text-sm font-semibold text-[#102A43] shadow-xs hover:bg-[#FAF8F5]"
                >
                  Return to Homepage
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: PERSONAL DETAILS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-[#E3DCCE] pb-3">
                    <h3 className="font-serif text-xl font-bold text-[#102A43]">
                      Step 1: Personal Details
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please enter your legal name and contact information exactly as it appears on your
                      government-issued identification.
                    </p>
                  </div>

                  {/* Privacy reassurance callout */}
                  <div className="flex items-start gap-3 rounded-lg border border-[#D4AF37]/50 bg-[#FBF7EE] p-3.5 text-xs text-[#5D4037]">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#8D6E63] mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#3E2723]">Bank-Grade Privacy & Encryption</p>
                      <p className="mt-0.5 text-[#5D4037] leading-relaxed">
                        “Your information is protected with bank-grade encryption (256-bit SSL) and never
                        sold.” Trustora Credit Union adheres strictly to federal privacy standards under NCUA
                        oversight.
                      </p>
                    </div>
                  </div>

                  {/* Preferred Account Type */}
                  <div>
                    <label
                      htmlFor={`${formId}-accountType`}
                      className="block text-xs font-bold uppercase tracking-wider text-[#102A43]"
                    >
                      Preferred Account Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      id={`${formId}-accountType`}
                      value={formData.accountType}
                      onChange={(e) => handleInputChange("accountType", e.target.value)}
                      className="mt-1.5 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                    >
                      <option value="heritage_checking">
                        Heritage Free Checking — $0 monthly maintenance fee, free contactless debit
                      </option>
                      <option value="high_yield_savings">
                        High-Yield Member Savings — 4.10% APY, federally insured by NCUA
                      </option>
                      <option value="money_market">
                        Premier Money Market Share — Tiered yields with check-writing privileges
                      </option>
                      <option value="checking_savings_bundle">
                        Member Relationship Bundle — Heritage Checking + High-Yield Savings
                      </option>
                    </select>
                  </div>

                  {/* Name Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${formId}-firstName`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Legal First Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-firstName`}
                        type="text"
                        autoComplete="given-name"
                        placeholder="e.g. Eleanor"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.firstName
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-lastName`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Legal Last Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-lastName`}
                        type="text"
                        autoComplete="family-name"
                        placeholder="e.g. Roosevelt"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.lastName
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DOB and Citizenship */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${formId}-dob`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Date of Birth <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-dob`}
                        type="date"
                        value={formData.dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.dob
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.dob ? (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.dob}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Must be at least 18 years of age.
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-citizenship`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Citizenship / Residency Status <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`${formId}-citizenship`}
                        value={formData.citizenship}
                        onChange={(e) => handleInputChange("citizenship", e.target.value)}
                        className="mt-1.5 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                      >
                        <option value="us_citizen">U.S. Citizen</option>
                        <option value="permanent_resident">Permanent Resident (Green Card holder)</option>
                        <option value="non_resident">Eligible Non-Resident Alien</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Info: Email & Phone */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${formId}-email`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-email`}
                        type="email"
                        autoComplete="email"
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.email
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-phone`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Mobile Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-phone`}
                        type="tel"
                        autoComplete="tel"
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.phone
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.phone ? (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.phone}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Used for one-time security codes & account alerts.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-3 pt-2">
                    <p className="font-serif text-sm font-semibold text-[#102A43]">Residential Address</p>

                    <div>
                      <label
                        htmlFor={`${formId}-street`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Street Address (No P.O. Boxes) <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-street`}
                        type="text"
                        autoComplete="street-address"
                        placeholder="124 Heritage Way"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.street
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.street && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor={`${formId}-apt`}
                          className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                        >
                          Apt / Suite
                        </label>
                        <input
                          id={`${formId}-apt`}
                          type="text"
                          placeholder="Apt 4B"
                          value={formData.apt}
                          onChange={(e) => handleInputChange("apt", e.target.value)}
                          className="mt-1.5 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor={`${formId}-city`}
                          className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                        >
                          City <span className="text-red-600">*</span>
                        </label>
                        <input
                          id={`${formId}-city`}
                          type="text"
                          autoComplete="address-level2"
                          placeholder="Charlotte"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                            errors.city
                              ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                              : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                          }`}
                        />
                        {errors.city && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`${formId}-state`}
                          className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                        >
                          State <span className="text-red-600">*</span>
                        </label>
                        <input
                          id={`${formId}-state`}
                          type="text"
                          autoComplete="address-level1"
                          placeholder="NC"
                          maxLength={2}
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value.toUpperCase())
                          }
                          className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                            errors.state
                              ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                              : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                          }`}
                        />
                        {errors.state && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`${formId}-zip`}
                          className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                        >
                          ZIP Code <span className="text-red-600">*</span>
                        </label>
                        <input
                          id={`${formId}-zip`}
                          type="text"
                          autoComplete="postal-code"
                          placeholder="28202"
                          maxLength={5}
                          value={formData.zip}
                          onChange={(e) => handleInputChange("zip", e.target.value)}
                          className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                            errors.zip
                              ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                              : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                          }`}
                        />
                        {errors.zip && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.zip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: IDENTITY VERIFICATION */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-[#E3DCCE] pb-3">
                    <h3 className="font-serif text-xl font-bold text-[#102A43]">
                      Step 2: Identity Verification
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Verify your identity to ensure regulatory compliance and safeguard member deposits.
                    </p>
                  </div>

                  {/* Regulatory Explanation Callout (USA PATRIOT Act / CIP) */}
                  <div className="rounded-lg border border-[#B0BEC5] bg-[#ECEFF1] p-4 text-xs text-[#263238]">
                    <div className="flex items-center gap-2 font-serif font-bold text-[#102A43]">
                      <FileText className="h-4 w-4 text-[#102A43]" />
                      <span>Important Notice Regarding Identity Verification</span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-[#37474F]">
                      <strong>USA PATRIOT Act (Section 326) Notice:</strong> To help the government fight
                      the funding of terrorism and money laundering activities, Federal law requires all
                      financial institutions to obtain, verify, and record information that identifies each
                      person who opens an account. What this means for you: When you open an account, we will
                      ask for your legal name, physical address, date of birth, and government-issued
                      identification number.
                    </p>
                  </div>

                  {/* ID Type and Number */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor={`${formId}-idType`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        ID Document Type <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`${formId}-idType`}
                        value={formData.idType}
                        onChange={(e) => handleInputChange("idType", e.target.value)}
                        className="mt-1.5 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                      >
                        <option value="drivers_license">State Driver's License</option>
                        <option value="state_id">State-Issued Photo ID</option>
                        <option value="passport">U.S. Passport / Passport Card</option>
                        <option value="military_id">U.S. Military Identification</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-idNumber`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        ID Document Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-idNumber`}
                        type="text"
                        placeholder="e.g. D12345678"
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange("idNumber", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.idNumber
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.idNumber && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          {errors.idNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-idState`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Issuing State / Jurisdiction
                      </label>
                      <input
                        id={`${formId}-idState`}
                        type="text"
                        placeholder="NC or USA"
                        value={formData.idState}
                        onChange={(e) => handleInputChange("idState", e.target.value.toUpperCase())}
                        className="mt-1.5 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                      />
                    </div>
                  </div>

                  {/* SSN / Tax ID last 4 */}
                  <div className="rounded-lg border border-[#D5CEBF] bg-white p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <label
                          htmlFor={`${formId}-ssnLast4`}
                          className="block text-xs font-bold uppercase tracking-wider text-[#102A43]"
                        >
                          Last 4 Digits of SSN or Tax ID (ITIN) <span className="text-red-600">*</span>
                        </label>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Used exclusively to verify membership eligibility with ChexSystems / Equifax.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base tracking-widest text-muted-foreground">
                          ••• - •• -
                        </span>
                        <input
                          id={`${formId}-ssnLast4`}
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="1234"
                          value={formData.ssnLast4}
                          onChange={(e) =>
                            handleInputChange("ssnLast4", e.target.value.replace(/\D/g, ""))
                          }
                          className={`w-24 rounded-md border px-3 py-1.5 text-center font-mono text-base font-bold tracking-widest shadow-sm focus:outline-none focus:ring-1 ${
                            errors.ssnLast4
                              ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                              : "border-[#D5CEBF] bg-[#FAF8F5] focus:border-[#102A43] focus:ring-[#102A43]"
                          }`}
                        />
                      </div>
                    </div>
                    {errors.ssnLast4 && (
                      <p className="mt-2 text-xs text-red-600 font-medium">
                        {errors.ssnLast4}
                      </p>
                    )}
                  </div>

                  {/* Employment Details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${formId}-employmentStatus`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Employment Status <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`${formId}-employmentStatus`}
                        value={formData.employmentStatus}
                        onChange={(e) => handleInputChange("employmentStatus", e.target.value)}
                        className="mt-1.5 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#102A43]"
                      >
                        <option value="employed_full_time">Employed Full-Time</option>
                        <option value="employed_part_time">Employed Part-Time</option>
                        <option value="self_employed">Self-Employed / Business Owner</option>
                        <option value="retired">Retired</option>
                        <option value="student">Student</option>
                        <option value="not_employed">Not Employed</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-employer`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Employer Name or Occupation
                      </label>
                      <input
                        id={`${formId}-employer`}
                        type="text"
                        placeholder="e.g. Piedmont Health or Teacher"
                        value={formData.employer}
                        onChange={(e) => handleInputChange("employer", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.employer
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.employer && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.employer}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SECURITY SETUP */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-[#E3DCCE] pb-3">
                    <h3 className="font-serif text-xl font-bold text-[#102A43]">
                      Step 3: Security Setup
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Create your digital banking credentials, select your multi-factor authentication (MFA)
                      preference, and establish recovery security questions.
                    </p>
                  </div>

                  {/* Username & Password */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${formId}-username`}
                        className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                      >
                        Digital Banking Username <span className="text-red-600">*</span>
                      </label>
                      <input
                        id={`${formId}-username`}
                        type="text"
                        autoComplete="username"
                        placeholder="e.g. eleanor_r52"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                          errors.username
                            ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                        }`}
                      />
                      {errors.username ? (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.username}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Minimum 6 characters. Letters and numbers only.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`${formId}-password`}
                          className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                        >
                          Password <span className="text-red-600">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-medium text-[#102A43] hover:underline"
                        >
                          {showPassword ? "Hide password" : "Show password"}
                        </button>
                      </div>
                      <div className="relative mt-1.5">
                        <input
                          id={`${formId}-password`}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                            errors.password
                              ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                              : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                          }`}
                        />
                      </div>
                      {/* Password strength indicator */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Strength:</span>
                          <span
                            className={`font-semibold ${
                              passwordStrength <= 2
                                ? "text-amber-600"
                                : passwordStrength <= 4
                                  ? "text-blue-600"
                                  : "text-emerald-700"
                            }`}
                          >
                            {passwordStrength <= 2 && "Fair (Add symbols/length)"}
                            {passwordStrength === 3 && "Good"}
                            {passwordStrength === 4 && "Strong"}
                            {passwordStrength >= 5 && "Excellent (Bank-Grade)"}
                          </span>
                        </div>
                        <div className="mt-1 flex h-1.5 gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-full flex-1 rounded-full ${
                                lvl <= passwordStrength
                                  ? passwordStrength <= 2
                                    ? "bg-amber-500"
                                    : passwordStrength <= 4
                                      ? "bg-blue-600"
                                      : "bg-emerald-600"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="max-w-md">
                    <label
                      htmlFor={`${formId}-confirmPassword`}
                      className="block text-xs font-semibold uppercase tracking-wider text-[#102A43]"
                    >
                      Confirm Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`${formId}-confirmPassword`}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`mt-1.5 block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                          : "border-[#D5CEBF] bg-white focus:border-[#102A43] focus:ring-[#102A43]"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Multi-Factor Authentication (MFA) Preferences */}
                  <div className="rounded-lg border border-[#D5CEBF] bg-white p-4">
                    <p className="font-serif text-sm font-semibold text-[#102A43]">
                      Multi-Factor Authentication (MFA) Preference <span className="text-red-600">*</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Required for all Trustora online banking access to protect your funds against
                      unauthorized logins.
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-xs transition-all ${
                          formData.mfaPreference === "sms"
                            ? "border-[#102A43] bg-[#F4F6F9] ring-1 ring-[#102A43]"
                            : "border-border hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mfaPreference"
                          value="sms"
                          checked={formData.mfaPreference === "sms"}
                          onChange={() => handleInputChange("mfaPreference", "sms")}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-semibold text-[#102A43]">Text Message (SMS)</p>
                          <p className="mt-0.5 text-muted-foreground">
                            Receive a secure 6-digit numeric pass-code sent instantly to your registered
                            mobile device ({formData.phone || "your mobile"}).
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-xs transition-all ${
                          formData.mfaPreference === "authenticator"
                            ? "border-[#102A43] bg-[#F4F6F9] ring-1 ring-[#102A43]"
                            : "border-border hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mfaPreference"
                          value="authenticator"
                          checked={formData.mfaPreference === "authenticator"}
                          onChange={() => handleInputChange("mfaPreference", "authenticator")}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-semibold text-[#102A43]">Authenticator App (TOTP)</p>
                          <p className="mt-0.5 text-muted-foreground">
                            Generate time-based security tokens via Google Authenticator, Microsoft
                            Authenticator, or 1Password.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 3 Customizable Security Questions */}
                  <div className="space-y-4 rounded-lg border border-[#D5CEBF] bg-[#FAF8F5] p-4">
                    <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-2">
                      <div>
                        <p className="font-serif text-sm font-semibold text-[#102A43]">
                          Recovery Security Questions
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Used to verify your identity if you ever forget your credentials or call our
                          telephone teller desk.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="text-xs font-medium text-[#102A43] hover:underline"
                      >
                        {showAnswers ? "Mask Answers" : "Reveal Answers"}
                      </button>
                    </div>

                    {/* Question 1 */}
                    <div>
                      <label
                        htmlFor={`${formId}-q1`}
                        className="block text-xs font-semibold text-[#102A43]"
                      >
                        Security Question 1 <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`${formId}-q1`}
                        value={formData.securityQuestion1}
                        onChange={(e) => handleInputChange("securityQuestion1", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-1.5 text-xs shadow-sm focus:border-[#102A43] focus:outline-none"
                      >
                        {SECURITY_QUESTIONS_POOL_1.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      <input
                        type={showAnswers ? "text" : "password"}
                        placeholder="Your answer..."
                        value={formData.securityAnswer1}
                        onChange={(e) => handleInputChange("securityAnswer1", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-1.5 text-xs shadow-sm focus:outline-none ${
                          errors.securityAnswer1
                            ? "border-red-500 bg-red-50/50"
                            : "border-[#D5CEBF] bg-white"
                        }`}
                      />
                      {errors.securityAnswer1 && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.securityAnswer1}</p>
                      )}
                    </div>

                    {/* Question 2 */}
                    <div>
                      <label
                        htmlFor={`${formId}-q2`}
                        className="block text-xs font-semibold text-[#102A43]"
                      >
                        Security Question 2 <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`${formId}-q2`}
                        value={formData.securityQuestion2}
                        onChange={(e) => handleInputChange("securityQuestion2", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-1.5 text-xs shadow-sm focus:border-[#102A43] focus:outline-none"
                      >
                        {SECURITY_QUESTIONS_POOL_2.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      <input
                        type={showAnswers ? "text" : "password"}
                        placeholder="Your answer..."
                        value={formData.securityAnswer2}
                        onChange={(e) => handleInputChange("securityAnswer2", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-1.5 text-xs shadow-sm focus:outline-none ${
                          errors.securityAnswer2
                            ? "border-red-500 bg-red-50/50"
                            : "border-[#D5CEBF] bg-white"
                        }`}
                      />
                      {errors.securityAnswer2 && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.securityAnswer2}</p>
                      )}
                    </div>

                    {/* Question 3 */}
                    <div>
                      <label
                        htmlFor={`${formId}-q3`}
                        className="block text-xs font-semibold text-[#102A43]"
                      >
                        Security Question 3 <span className="text-red-600">*</span>
                      </label>
                      <select
                        id={`${formId}-q3`}
                        value={formData.securityQuestion3}
                        onChange={(e) => handleInputChange("securityQuestion3", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#D5CEBF] bg-white px-3 py-1.5 text-xs shadow-sm focus:border-[#102A43] focus:outline-none"
                      >
                        {SECURITY_QUESTIONS_POOL_3.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      <input
                        type={showAnswers ? "text" : "password"}
                        placeholder="Your answer..."
                        value={formData.securityAnswer3}
                        onChange={(e) => handleInputChange("securityAnswer3", e.target.value)}
                        className={`mt-1.5 block w-full rounded-md border px-3 py-1.5 text-xs shadow-sm focus:outline-none ${
                          errors.securityAnswer3
                            ? "border-red-500 bg-red-50/50"
                            : "border-[#D5CEBF] bg-white"
                        }`}
                      />
                      {errors.securityAnswer3 && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.securityAnswer3}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW AND SUBMIT */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-[#E3DCCE] pb-3">
                    <h3 className="font-serif text-xl font-bold text-[#102A43]">
                      Step 4: Review and Submit
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please inspect the details below, review federal membership disclosures, and submit
                      your application.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Card 1: Personal Profile */}
                    <div className="rounded-xl border border-[#D5CEBF] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-2">
                        <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#102A43]">
                          1. Personal Details
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs font-medium text-[#102A43] underline hover:text-[#D4AF37]"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs">
                        <p>
                          <span className="text-muted-foreground">Full Name:</span>{" "}
                          <strong>
                            {formData.firstName} {formData.lastName}
                          </strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Date of Birth:</span>{" "}
                          <strong>{formData.dob}</strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Citizenship:</span>{" "}
                          <strong>{getCitizenshipLabel(formData.citizenship)}</strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Account Requested:</span>{" "}
                          <strong className="block text-[#102A43]">
                            {getAccountLabel(formData.accountType)}
                          </strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Contact:</span>{" "}
                          {formData.email} · {formData.phone}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Address:</span>{" "}
                          {formData.street} {formData.apt && `(${formData.apt})`}, {formData.city},{" "}
                          {formData.state} {formData.zip}
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Identity & Security */}
                    <div className="rounded-xl border border-[#D5CEBF] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-2">
                        <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#102A43]">
                          2. Identity & Security Setup
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-xs font-medium text-[#102A43] underline hover:text-[#D4AF37]"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs">
                        <p>
                          <span className="text-muted-foreground">ID Type:</span>{" "}
                          <strong>{getIdLabel(formData.idType)}</strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">ID Number:</span>{" "}
                          <span className="font-mono">
                            •••{formData.idNumber.slice(-4) || "XXXX"}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">SSN / Tax ID:</span>{" "}
                          <span className="font-mono font-bold text-[#102A43]">
                            •••-••-{formData.ssnLast4 || "••••"}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Employment:</span>{" "}
                          {getEmploymentLabel(formData.employmentStatus)}
                          {formData.employer && ` at ${formData.employer}`}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Username:</span>{" "}
                          <strong>{formData.username}</strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">MFA Preference:</span>{" "}
                          <strong>
                            {formData.mfaPreference === "sms"
                              ? "SMS Text Codes"
                              : "TOTP Authenticator App"}
                          </strong>
                        </p>
                        <p className="text-[11px] text-muted-foreground italic">
                          Password and security answers are stored in an encrypted vault and hidden
                          for your protection.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Required Disclosures & Consent Checkboxes */}
                  <div className="space-y-3 rounded-lg border border-[#D5CEBF] bg-[#F5F2EB] p-4 text-xs">
                    <p className="font-serif font-bold text-[#102A43]">
                      Required Disclosures & Member Agreements
                    </p>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentElectronic}
                        onChange={(e) => handleInputChange("consentElectronic", e.target.checked)}
                        className="mt-0.5 rounded border-[#D5CEBF] text-[#102A43] focus:ring-[#102A43]"
                      />
                      <span className="text-muted-foreground leading-snug">
                        <strong className="text-foreground">
                          Electronic Communications & E-Sign Disclosure:
                        </strong>{" "}
                        I agree to receive account agreements, tax forms, member notices, and periodic
                        statements electronically.
                      </span>
                    </label>
                    {errors.consentElectronic && (
                      <p className="ml-6 text-xs text-red-600 font-medium">{errors.consentElectronic}</p>
                    )}

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentMembership}
                        onChange={(e) => handleInputChange("consentMembership", e.target.checked)}
                        className="mt-0.5 rounded border-[#D5CEBF] text-[#102A43] focus:ring-[#102A43]"
                      />
                      <span className="text-muted-foreground leading-snug">
                        <strong className="text-foreground">
                          Trustora Membership Agreement & Truth-in-Savings:
                        </strong>{" "}
                        I agree to the bylaws of Trustora Credit Union, the Fee Schedule, and purchase of a
                        $5 par value membership share upon approval.
                      </span>
                    </label>
                    {errors.consentMembership && (
                      <p className="ml-6 text-xs text-red-600 font-medium">{errors.consentMembership}</p>
                    )}

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentCreditCheck}
                        onChange={(e) => handleInputChange("consentCreditCheck", e.target.checked)}
                        className="mt-0.5 rounded border-[#D5CEBF] text-[#102A43] focus:ring-[#102A43]"
                      />
                      <span className="text-muted-foreground leading-snug">
                        <strong className="text-foreground">
                          Consumer Report & Identity Authorization:
                        </strong>{" "}
                        I authorize Trustora Credit Union to obtain credit and identity reports from
                        reporting agencies to verify eligibility (does not impact credit score for deposit
                        accounts).
                      </span>
                    </label>
                    {errors.consentCreditCheck && (
                      <p className="ml-6 text-xs text-red-600 font-medium">{errors.consentCreditCheck}</p>
                    )}

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentW9}
                        onChange={(e) => handleInputChange("consentW9", e.target.checked)}
                        className="mt-0.5 rounded border-[#D5CEBF] text-[#102A43] focus:ring-[#102A43]"
                      />
                      <span className="text-muted-foreground leading-snug">
                        <strong className="text-foreground">
                          Substitute Form W-9 Tax Certification:
                        </strong>{" "}
                        Under penalties of perjury, I certify that the Taxpayer Identification Number
                        provided is correct, and I am not subject to backup withholding.
                      </span>
                    </label>
                    {errors.consentW9 && (
                      <p className="ml-6 text-xs text-red-600 font-medium">{errors.consentW9}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons & Visible Support Option */}
              <div className="mt-8 flex flex-col gap-4 border-t border-[#E3DCCE] pt-5 sm:flex-row sm:items-center sm:justify-between">
                {/* Visible Support Option */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-4 w-4 text-[#C5A059]" />
                  <span>
                    Need help? Call Member Desk:{" "}
                    <a
                      href="tel:18005550142"
                      className="font-semibold text-[#102A43] hover:underline"
                    >
                      1-800-555-0142
                    </a>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="border-[#D5CEBF] bg-white px-4 py-2 font-serif text-xs font-semibold uppercase tracking-wider text-[#102A43] hover:bg-slate-50"
                    >
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>
                  )}

                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="rounded-md bg-[#102A43] px-6 py-2.5 font-serif text-xs font-semibold uppercase tracking-[0.16em] text-[#FBF9F5] shadow-sm hover:bg-[#16385C]"
                    >
                      Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#E6C663]" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md border border-[#D4AF37] bg-[#102A43] px-7 py-3 font-serif text-xs font-bold uppercase tracking-[0.16em] text-[#FBF9F5] shadow-md hover:bg-[#16385C] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Transmitting Encrypted Application...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-[#E6C663]" /> Submit Application
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
