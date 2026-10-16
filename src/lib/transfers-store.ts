export interface BankAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "commercial" | "foreign_currency";
  accountNumberMasked: string;
  fullAccountNumber: string;
  routingNumber: string;
  balance: number;
  currency: string;
  ownerName: string;
  ownerEmail: string;
}

export interface RecipientAddress {
  street: string;
  city: string;
  stateOrProvince?: string;
  postalCode: string;
  country: string;
}

export type TransferType = "domestic" | "international";

export type TransferStatus =
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Information Requested"
  | "Flagged for AML/Compliance";

export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface BankTransfer {
  id: string;
  referenceNumber: string;
  type: TransferType;
  senderAccount: {
    id: string;
    name: string;
    accountNumberMasked: string;
    ownerName: string;
    ownerEmail: string;
    currency: string;
  };
  recipientFullName: string;
  recipientBankName: string;
  accountNumberOrIBAN: string;
  accountNumberMasked: string;
  bankIdentifierType: "routing" | "swift" | "sort_code";
  bankIdentifierCode: string;
  amount: number;
  currency: string;
  transferPurpose: string;
  recipientAddress?: RecipientAddress;
  transferDateType: "now" | "scheduled";
  scheduledDate?: string;
  fee: number;
  exchangeRate?: number;
  convertedAmount?: number;
  estimatedDelivery: string;
  totalDebitUSD: number;
  status: TransferStatus;
  verificationMethod: "Email OTP";
  verificationEmail: string;
  verifiedAt: string;
  createdAt: string;
  complianceFlags: string[];
  adminNotes?: string;
  adminActionBy?: string;
  adminActionAt?: string;
  rejectionReason?: string;
  requestInfoReason?: string;
  auditLog: AuditLogEntry[];
}

export const SEED_ACCOUNTS: BankAccount[] = [
  {
    id: "acct-heritage-checking",
    name: "Classic Heritage Premier Checking",
    type: "checking",
    accountNumberMasked: "•••• 4819",
    fullAccountNumber: "710294819",
    routingNumber: "071922841",
    balance: 48250.00,
    currency: "USD",
    ownerName: "Eleanor Vance",
    ownerEmail: "eleanor.vance@citietrust.com",
  },
  {
    id: "acct-reserve-savings",
    name: "Trust High-Yield Reserve Savings",
    type: "savings",
    accountNumberMasked: "•••• 7102",
    fullAccountNumber: "710297102",
    routingNumber: "071922841",
    balance: 124800.50,
    currency: "USD",
    ownerName: "Eleanor Vance",
    ownerEmail: "eleanor.vance@citietrust.com",
  },
  {
    id: "acct-commercial-operating",
    name: "Commercial Treasury Operating Account",
    type: "commercial",
    accountNumberMasked: "•••• 9341",
    fullAccountNumber: "710299341",
    routingNumber: "071922841",
    balance: 312450.00,
    currency: "USD",
    ownerName: "Vance Holdings Corp",
    ownerEmail: "treasury@vanceholdings.com",
  },
  {
    id: "acct-global-vault",
    name: "Global Foreign Multi-Currency Vault",
    type: "foreign_currency",
    accountNumberMasked: "•••• 6028",
    fullAccountNumber: "710296028",
    routingNumber: "071922841",
    balance: 85000.00,
    currency: "EUR",
    ownerName: "Eleanor Vance",
    ownerEmail: "eleanor.vance@citietrust.com",
  },
];

export const SEED_TRANSFERS: BankTransfer[] = [
  {
    id: "trf-101",
    referenceNumber: "CET-TRF-2026-84912",
    type: "domestic",
    senderAccount: {
      id: "acct-heritage-checking",
      name: "Classic Heritage Premier Checking",
      accountNumberMasked: "•••• 4819",
      ownerName: "Eleanor Vance",
      ownerEmail: "eleanor.vance@citietrust.com",
      currency: "USD",
    },
    recipientFullName: "Jonathan Sterling Esq.",
    recipientBankName: "JPMorgan Chase Bank, N.A.",
    accountNumberOrIBAN: "8920194812",
    accountNumberMasked: "•••• 4812",
    bankIdentifierType: "routing",
    bankIdentifierCode: "021000021",
    amount: 14500.00,
    currency: "USD",
    transferPurpose: "Commercial Property Escrow Deposit",
    transferDateType: "now",
    fee: 0.00,
    estimatedDelivery: "Today by 5:00 PM EST (Fedwire)",
    totalDebitUSD: 14500.00,
    status: "Pending Review",
    verificationMethod: "Email OTP",
    verificationEmail: "e****e@citietrust.com",
    verifiedAt: "2026-10-16T08:14:22.000Z",
    createdAt: "2026-10-16T08:14:22.000Z",
    complianceFlags: [
      "High-Value Transaction (Threshold > $10,000)",
      "Standard Title Escrow Beneficiary",
    ],
    auditLog: [
      {
        timestamp: "2026-10-16T08:12:00.000Z",
        actor: "Eleanor Vance (User)",
        action: "Transfer Initiated",
        details: "Initiated domestic wire of $14,500.00 to JPMorgan Chase.",
      },
      {
        timestamp: "2026-10-16T08:14:22.000Z",
        actor: "Security Gateway",
        action: "MFA Passkey Verified",
        details: "One-Time Password verified via eleanor.vance@citietrust.com.",
      },
      {
        timestamp: "2026-10-16T08:14:23.000Z",
        actor: "System Ledger",
        action: "Placed in Pending Review",
        details: "Held for required administrative sign-off before transmission.",
      },
    ],
  },
  {
    id: "trf-102",
    referenceNumber: "CET-TRF-2026-91304",
    type: "international",
    senderAccount: {
      id: "acct-reserve-savings",
      name: "Trust High-Yield Reserve Savings",
      accountNumberMasked: "•••• 7102",
      ownerName: "Eleanor Vance",
      ownerEmail: "eleanor.vance@citietrust.com",
      currency: "USD",
    },
    recipientFullName: "Geneva Horizon Wealth Management SA",
    recipientBankName: "Banque Cantonale de Genève",
    accountNumberOrIBAN: "CH9300762011623852957",
    accountNumberMasked: "CH93 •••• •••• •••• 2957",
    bankIdentifierType: "swift",
    bankIdentifierCode: "BCGECHGGXXX",
    amount: 32000.00,
    currency: "EUR",
    transferPurpose: "International Custody Investment Contribution",
    recipientAddress: {
      street: "17 Quai de l'Île",
      city: "Geneva",
      postalCode: "1204",
      country: "Switzerland",
    },
    transferDateType: "now",
    fee: 35.00,
    exchangeRate: 0.9245,
    convertedAmount: 29584.00,
    estimatedDelivery: "1-2 Business Days via SWIFT GPI Priority",
    totalDebitUSD: 34650.00,
    status: "Pending Review",
    verificationMethod: "Email OTP",
    verificationEmail: "e****e@citietrust.com",
    verifiedAt: "2026-10-16T08:45:10.000Z",
    createdAt: "2026-10-16T08:45:10.000Z",
    complianceFlags: [
      "Cross-Border SWIFT Wire (International Jurisdiction)",
      "High-Value Outflow (> $25,000.00)",
      "OFAC / FinCEN Automated Screening Passed",
    ],
    auditLog: [
      {
        timestamp: "2026-10-16T08:41:00.000Z",
        actor: "Eleanor Vance (User)",
        action: "Transfer Initiated",
        details: "Initiated international SWIFT transfer of €29,584.00 to Switzerland.",
      },
      {
        timestamp: "2026-10-16T08:45:10.000Z",
        actor: "Security Gateway",
        action: "MFA Passkey Verified",
        details: "One-Time Password confirmed via registered mail.",
      },
      {
        timestamp: "2026-10-16T08:45:11.000Z",
        actor: "System Ledger",
        action: "Enqueued for Compliance Officer Review",
        details: "Held for required dual administrative review and validation.",
      },
    ],
  },
  {
    id: "trf-103",
    referenceNumber: "CET-TRF-2026-72819",
    type: "domestic",
    senderAccount: {
      id: "acct-heritage-checking",
      name: "Classic Heritage Premier Checking",
      accountNumberMasked: "•••• 4819",
      ownerName: "Eleanor Vance",
      ownerEmail: "eleanor.vance@citietrust.com",
      currency: "USD",
    },
    recipientFullName: "Clara Vance-Moreau",
    recipientBankName: "Bank of America, N.A.",
    accountNumberOrIBAN: "4820194821",
    accountNumberMasked: "•••• 4821",
    bankIdentifierType: "routing",
    bankIdentifierCode: "121000358",
    amount: 3200.00,
    currency: "USD",
    transferPurpose: "Family Living Allowance & Living Expenses",
    transferDateType: "now",
    fee: 0.00,
    estimatedDelivery: "Next Business Day ACH",
    totalDebitUSD: 3200.00,
    status: "Approved",
    verificationMethod: "Email OTP",
    verificationEmail: "e****e@citietrust.com",
    verifiedAt: "2026-10-15T14:20:00.000Z",
    createdAt: "2026-10-15T14:20:00.000Z",
    complianceFlags: ["Known Immediate Family Beneficiary"],
    adminNotes: "Verified familial beneficiary match; authorized ACH release.",
    adminActionBy: "Officer H. Montgomery (Treasury Operations)",
    adminActionAt: "2026-10-15T14:45:00.000Z",
    auditLog: [
      {
        timestamp: "2026-10-15T14:20:00.000Z",
        actor: "Eleanor Vance (User)",
        action: "Transfer Initiated",
        details: "Initiated ACH transfer of $3,200.00.",
      },
      {
        timestamp: "2026-10-15T14:45:00.000Z",
        actor: "Officer H. Montgomery",
        action: "Transfer Approved",
        details: "Compliance clear. Batch released to Federal Reserve clearinghouse.",
      },
    ],
  },
  {
    id: "trf-104",
    referenceNumber: "CET-TRF-2026-55190",
    type: "international",
    senderAccount: {
      id: "acct-commercial-operating",
      name: "Commercial Treasury Operating Account",
      accountNumberMasked: "•••• 9341",
      ownerName: "Vance Holdings Corp",
      ownerEmail: "treasury@vanceholdings.com",
      currency: "USD",
    },
    recipientFullName: "Kyoto Precision Technologies Ltd",
    recipientBankName: "Sumitomo Mitsui Banking Corporation",
    accountNumberOrIBAN: "SMBC-JP-84912093",
    accountNumberMasked: "•••• 2093",
    bankIdentifierType: "swift",
    bankIdentifierCode: "SMBCJPJTXXX",
    amount: 48500.00,
    currency: "USD",
    transferPurpose: "Industrial Equipment Component Import Payment",
    recipientAddress: {
      street: "1-1-2 Marunouchi, Chiyoda-ku",
      city: "Tokyo",
      postalCode: "100-0005",
      country: "Japan",
    },
    transferDateType: "now",
    fee: 35.00,
    estimatedDelivery: "2 Business Days via SWIFT",
    totalDebitUSD: 48535.00,
    status: "Information Requested",
    verificationMethod: "Email OTP",
    verificationEmail: "t****y@vanceholdings.com",
    verifiedAt: "2026-10-15T11:00:00.000Z",
    createdAt: "2026-10-15T11:00:00.000Z",
    complianceFlags: ["Commercial Import Invoice Exceeds $25,000 threshold"],
    requestInfoReason: "Please upload Commercial Pro-Forma Invoice and Customs Bill of Lading documentation for Japanese import clearance.",
    adminNotes: "Invoice verification requested under Export-Import compliance policy.",
    adminActionBy: "Officer K. Thorne (Trade Compliance)",
    adminActionAt: "2026-10-15T11:35:00.000Z",
    auditLog: [
      {
        timestamp: "2026-10-15T11:00:00.000Z",
        actor: "Corporate Treasury (User)",
        action: "Transfer Initiated",
        details: "Initiated $48,500.00 wire to Japan.",
      },
      {
        timestamp: "2026-10-15T11:35:00.000Z",
        actor: "Officer K. Thorne",
        action: "Information Requested",
        details: "Awaiting pro-forma invoice documentation.",
      },
    ],
  },
];

const TRANSFERS_STORAGE_KEY = "citietrust_transfers_v1";
const ACCOUNTS_STORAGE_KEY = "citietrust_accounts_v1";
const EVENT_NAME = "citietrust_transfers_updated";

export function maskAccountNumber(acct: string): string {
  if (!acct) return "••••";
  const clean = acct.replace(/\s+/g, "");
  if (clean.length <= 4) return `•••• ${clean}`;
  return `•••• ${clean.slice(-4)}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "u****@citietrust.com";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${"*".repeat(Math.max(user.length - 2, 3))}${user[user.length - 1]}@${domain}`;
}

export function getStoredAccounts(): BankAccount[] {
  if (typeof window === "undefined") return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ACCOUNTS;
  } catch {
    return SEED_ACCOUNTS;
  }
}

export function getStoredTransfers(): BankTransfer[] {
  if (typeof window === "undefined") return SEED_TRANSFERS;
  try {
    const raw = localStorage.getItem(TRANSFERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(SEED_TRANSFERS));
      return SEED_TRANSFERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_TRANSFERS;
  } catch {
    return SEED_TRANSFERS;
  }
}

export function saveTransfer(
  transferData: Omit<BankTransfer, "id" | "referenceNumber" | "status" | "createdAt" | "auditLog">
): BankTransfer {
  const current = getStoredTransfers();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceNumber = `CET-TRF-2026-${randomSuffix}`;
  const now = new Date().toISOString();

  const newTransfer: BankTransfer = {
    ...transferData,
    id: `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    referenceNumber,
    // REQUIRED: All transfers start as "Pending Review", NEVER completed automatically
    status: "Pending Review",
    createdAt: now,
    auditLog: [
      {
        timestamp: now,
        actor: `${transferData.senderAccount.ownerName} (Account Holder)`,
        action: "Transfer Request Initiated",
        details: `Submitted ${transferData.type.toUpperCase()} transfer of ${transferData.currency} ${transferData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${transferData.recipientFullName} at ${transferData.recipientBankName}.`,
      },
      {
        timestamp: now,
        actor: "citiEtrust Security Verification",
        action: "MFA Passkey Authorized",
        details: `One-Time Passcode authenticated via ${transferData.verificationEmail}.`,
      },
      {
        timestamp: now,
        actor: "Automated Gateway",
        action: "Routed to Bank Administrator",
        details: "Status set to 'Pending Review'. Awaiting authorized officer compliance and release review.",
      },
    ],
  };

  const updated = [newTransfer, ...current];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_NAME));
      window.dispatchEvent(new StorageEvent("storage", { key: TRANSFERS_STORAGE_KEY }));
    } catch (e) {
      console.error("Failed to store transfer:", e);
    }
  }

  return newTransfer;
}

export function updateTransferStatus(
  id: string,
  newStatus: TransferStatus,
  options: {
    actorName?: string;
    notes?: string;
    rejectionReason?: string;
    requestInfoReason?: string;
  } = {}
): BankTransfer | null {
  const current = getStoredTransfers();
  let updatedTransfer: BankTransfer | null = null;
  const now = new Date().toISOString();
  const actor = options.actorName || "Compliance Administrator";

  const next = current.map((trf) => {
    if (trf.id !== id) return trf;

    const actionText =
      newStatus === "Approved"
        ? "Transfer Approved & Dispatched"
        : newStatus === "Rejected"
        ? "Transfer Rejected"
        : newStatus === "Information Requested"
        ? "Documentation Requested"
        : newStatus === "Flagged for AML/Compliance"
        ? "Flagged for Compliance / AML Review"
        : `Status Changed to ${newStatus}`;

    const detailText =
      options.notes ||
      options.rejectionReason ||
      options.requestInfoReason ||
      `Officer updated transfer status to ${newStatus}.`;

    const newAuditEntry: AuditLogEntry = {
      timestamp: now,
      actor,
      action: actionText,
      details: detailText,
    };

    updatedTransfer = {
      ...trf,
      status: newStatus,
      adminNotes: options.notes ?? trf.adminNotes,
      adminActionBy: actor,
      adminActionAt: now,
      rejectionReason: options.rejectionReason ?? trf.rejectionReason,
      requestInfoReason: options.requestInfoReason ?? trf.requestInfoReason,
      auditLog: [newAuditEntry, ...trf.auditLog],
    };

    return updatedTransfer;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT_NAME));
      window.dispatchEvent(new StorageEvent("storage", { key: TRANSFERS_STORAGE_KEY }));
    } catch (e) {
      console.error("Failed to update transfer:", e);
    }
  }

  return updatedTransfer;
}

export function resetTransfersToDefault(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(SEED_TRANSFERS));
    window.dispatchEvent(new Event(EVENT_NAME));
    window.dispatchEvent(new StorageEvent("storage", { key: TRANSFERS_STORAGE_KEY }));
  }
}

// Generate printable / downloadable text receipt
export function downloadTransferReceipt(trf: BankTransfer): void {
  if (typeof window === "undefined") return;

  const content = `
========================================================================
                      citiEtrust BANK
       OFFICIAL TRANSACTION AUTHORIZATION & TRANSFER RECEIPT
========================================================================

TRANSACTION REFERENCE : ${trf.referenceNumber}
STATUS                : ${trf.status.toUpperCase()}
SUBMISSION DATE       : ${new Date(trf.createdAt).toLocaleString("en-US", { timeZoneName: "short" })}
TRANSFER CLASSIFICATION: ${trf.type.toUpperCase()} WIRE TRANSFER
DELIVERY ESTIMATE     : ${trf.estimatedDelivery}

------------------------------------------------------------------------
1. SENDER INFORMATION
------------------------------------------------------------------------
Account Holder        : ${trf.senderAccount.ownerName}
Originating Account   : ${trf.senderAccount.name} (${trf.senderAccount.accountNumberMasked})
Institution           : citiEtrust Bank, N.A.
Routing Number (ABA)  : 071922841

------------------------------------------------------------------------
2. BENEFICIARY / RECIPIENT INFORMATION
------------------------------------------------------------------------
Beneficiary Name      : ${trf.recipientFullName}
Beneficiary Bank      : ${trf.recipientBankName}
Account / IBAN        : ${trf.accountNumberMasked}
Bank Identifier       : ${trf.bankIdentifierType.toUpperCase()} ${trf.bankIdentifierCode}
${trf.recipientAddress ? `Beneficiary Address   : ${trf.recipientAddress.street}, ${trf.recipientAddress.city}, ${trf.recipientAddress.country} ${trf.recipientAddress.postalCode}\n` : ""}Purpose / Memo        : ${trf.transferPurpose}

------------------------------------------------------------------------
3. FINANCIAL SETTLEMENT SUMMARY
------------------------------------------------------------------------
Transfer Principal    : ${trf.currency} ${trf.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Institutional Wire Fee: USD $${trf.fee.toFixed(2)}
${trf.exchangeRate ? `Exchange Rate Applied : 1 USD = ${trf.exchangeRate} ${trf.currency}\n` : ""}${trf.convertedAmount ? `Recipient Credit (Est): ${trf.currency} ${trf.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` : ""}Total Outflow / Debit : USD $${trf.totalDebitUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}

------------------------------------------------------------------------
4. SECURITY & VERIFICATION AUDIT
------------------------------------------------------------------------
Verification Protocol : One-Time Passcode (Email MFA)
Verification Target   : ${trf.verificationEmail}
Verification Stamp    : ${trf.verifiedAt}
Administrative Gate   : Pending Authorized Officer Review & Compliance Clearance
Settlement Policy     : No automated execution. Underwriting review required.

------------------------------------------------------------------------
CUSTOMER SERVICE & FRAUD HELPLINE
------------------------------------------------------------------------
citiEtrust Wire Transfer Division: 1-800-555-0142 / +1 800 VHC ltd
Fraud & Compliance Hotline: support@citietrust.com
Federally Insured by NCUA to $250,000 · Chartered 1952
========================================================================
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `citiEtrust_Transfer_${trf.referenceNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
