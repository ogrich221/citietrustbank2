import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Zap,
  Compass,
  BadgeDollarSign,
  Wallet,
  PiggyBank,
  CreditCard,
  Car,
  Home,
  LineChart,
  Fingerprint,
  Radar,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Lock,
  Coffee,
  ShoppingBag,
  Briefcase,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Phone,
  Mail,
  MapPin,
  Quote,
  Sparkles,
  Building2,
  Award,
  Landmark,
  Scale,
  Users,
  Globe,
} from "lucide-react";
import heroAsset from "@/assets/hero-boardroom.jpg.asset.json";
import m1 from "@/assets/member-1.jpg";
import teamPhoto from "@/assets/team-documents.jpg.asset.json";
import m3 from "@/assets/member-3.jpg";
import { OpenAccountModal } from "@/components/open-account-modal";
import { MemberPortalModal } from "@/components/member-portal-modal";

const hero = heroAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "citiEtrust Bank — Traditional & Private Institutional Banking" },
      {
        name: "description",
        content:
          "Member-owned since 1952. Traditional checking, high-yield savings, domestic & international wire transfers, and honest dividends backed by the full faith and credit of the NCUA.",
      },
      { property: "og:title", content: "citiEtrust Bank — Traditional & Private Institutional Banking" },
      {
        name: "description",
        content:
          "Secure banking with Fedwire domestic and SWIFT international transfers, insured by the NCUA up to $250,000.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// Old School Heritage Styling Classes
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#D4AF37] bg-[#102A43] px-6 py-3 font-serif text-xs font-semibold uppercase tracking-[0.16em] text-[#FBF9F5] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#16385C] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]";
const btnGold =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#9E7D2B] bg-gradient-to-b from-[#E6C663] to-[#C5A059] px-6 py-3 font-serif text-xs font-bold uppercase tracking-[0.16em] text-[#102A43] shadow-md transition-all hover:-translate-y-0.5 hover:from-[#ECD076] hover:to-[#CEAA64] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43]";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#D5CEBF] bg-[#FFFDF9] px-6 py-3 font-serif text-xs font-semibold uppercase tracking-[0.16em] text-[#102A43] shadow-sm transition-all hover:border-[#102A43] hover:bg-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43]";
const eyebrow =
  "inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-[0.2em] text-[#9E7D2B]";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="citiEtrust Bank home">
      {/* Old School Engraved Seal Icon */}
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-[#102A43] shadow-inner">
        <Landmark className="h-6 w-6 text-[#E6C663]" />
        <span className="absolute -bottom-1 rounded bg-[#E6C663] px-1 text-[8px] font-serif font-bold text-[#102A43]">
          1952
        </span>
      </span>
      <span className={`leading-tight ${light ? "text-[#FBF9F5]" : "text-[#102A43]"}`}>
        <span className="block font-serif text-xl font-bold tracking-tight">citiEtrust BANK</span>
        <span
          className={`block text-[10px] font-serif uppercase tracking-[0.22em] ${
            light ? "text-[#E6C663]" : "text-[#9E7D2B]"
          }`}
        >
          Heritage Trust & Private Banking · Est. 1952
        </span>
      </span>
    </a>
  );
}

function HeritageTopTicker() {
  return (
    <aside
      aria-label="Institutional trust banner"
      className="border-b border-[#E3DCCE] bg-[#102A43] py-2 text-xs text-[#FBF9F5]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 text-[11px] sm:text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 font-serif font-semibold text-[#E6C663]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#E6C663]" /> citiEtrust BANK · CHARTERED 1952 · FEDERALLY INSURED
          </span>
          <span className="hidden text-slate-400 sm:inline">|</span>
          <span className="text-slate-300">NCUA COVERAGE TO $250,000</span>
          <span className="hidden text-slate-400 md:inline">|</span>
          <span className="hidden text-slate-300 md:inline">ROUTING # 071922841</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded bg-[#16385C] px-2 py-0.5 font-mono text-[11px] text-[#E6C663] border border-[#D4AF37]/30">
            6-MO CERTIFICATE: 5.15% APY
          </span>
          <span className="hidden sm:inline text-slate-300">
            MEMBER SAVINGS: 4.10% APY
          </span>
        </div>
      </div>
    </aside>
  );
}

function Nav({
  onOpenAccount,
  onOpenPortal,
}: {
  onOpenAccount: () => void;
  onOpenPortal: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E3DCCE] bg-[#FAF8F5]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-7 lg:flex">
          <li>
            <a
              href="#products"
              className="font-serif text-xs font-semibold uppercase tracking-wider text-[#102A43]/80 transition hover:text-[#102A43] hover:underline"
            >
              Accounts & Savings
            </a>
          </li>
          <li>
            <a
              href="#rates-board"
              className="font-serif text-xs font-semibold uppercase tracking-wider text-[#102A43]/80 transition hover:text-[#102A43] hover:underline"
            >
              Loan Rates
            </a>
          </li>
          <li>
            <a
              href="#cooperative"
              className="font-serif text-xs font-semibold uppercase tracking-wider text-[#102A43]/80 transition hover:text-[#102A43] hover:underline"
            >
              Principles
            </a>
          </li>
          <li>
            <a
              href="#support"
              className="font-serif text-xs font-semibold uppercase tracking-wider text-[#102A43]/80 transition hover:text-[#102A43] hover:underline"
            >
              Member Support
            </a>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPortal}
            className="rounded px-3.5 py-2 font-serif text-xs font-semibold text-[#102A43] hover:bg-[#F2ECE1] inline-flex items-center gap-1.5 border border-[#D5CEBF] transition shadow-xs"
          >
            <Lock className="h-3.5 w-3.5 text-[#9E7D2B]" /> Member Sign In
          </button>
          <button
            type="button"
            onClick={onOpenAccount}
            className={btnPrimary + " px-5 py-2.5"}
          >
            Open an Account
          </button>
        </div>
      </nav>
    </header>
  );
}

function AccountCard({ onOpenPortal }: { onOpenPortal?: () => void }) {
  const tx = [
    { icon: Briefcase, name: "Payroll Deposit · Bi-Weekly", date: "Today", amt: "+$2,840.00", pos: true },
    { icon: Award, name: "Quarterly Member Share Dividend", date: "Oct 12", amt: "+$142.50", pos: true },
    { icon: ShoppingBag, name: "Corner Market Groceries", date: "Oct 11", amt: "−$84.17" },
  ];
  return (
    <div
      className="w-full max-w-sm rounded-2xl border-2 border-[#D5CEBF] bg-[#FFFDF9] p-5 shadow-2xl"
      aria-label="Sample member passbook register"
    >
      {/* Passbook Register Header */}
      <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-3">
        <div>
          <p className="text-[10px] font-serif uppercase tracking-widest text-[#9E7D2B]">
            Official Member Passbook
          </p>
          <p className="font-serif text-xs font-bold text-[#102A43]">
            Member #4821-A · Eleanor Vance
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-[#2E7D32]/30 bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-serif font-bold text-[#2E7D32]">
          <ShieldCheck className="h-3 w-3" /> NCUA Insured
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#102A43]/20 bg-[#102A43] p-3.5 text-[#FBF9F5]">
          <p className="text-[10px] font-serif uppercase tracking-wider text-[#E6C663]">
            Checking Share
          </p>
          <p className="mt-1 font-serif text-xl font-bold">$4,218.36</p>
          <span className="text-[9px] text-slate-300">No Monthly Maintenance Fee</span>
        </div>
        <div className="rounded-xl border border-[#D4AF37]/50 bg-[#FBF7EE] p-3.5 text-[#102A43]">
          <p className="text-[10px] font-serif uppercase tracking-wider text-[#9E7D2B]">
            Member Savings · 4.10% APY
          </p>
          <p className="mt-1 font-serif text-xl font-bold text-[#102A43]">$12,940.02</p>
          <span className="text-[9px] text-[#2E7D32] font-semibold">Tier-1 Member Dividend</span>
        </div>
      </div>

      <div className="mt-4 border-t border-b border-[#E3DCCE] py-2.5">
        <div className="flex justify-between text-xs font-serif">
          <span className="font-bold text-[#102A43]">2026 Member Dividend Accrual</span>
          <span className="font-mono font-bold text-[#2E7D32]">+$489.20 YTD</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {tx.map((t) => (
          <li key={t.name} className="flex items-center gap-3 text-xs">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FAF8F5] border border-[#D5CEBF]">
              <t.icon className="h-3.5 w-3.5 text-[#102A43]" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-[#102A43]">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.date}</p>
            </div>
            <span
              className={`font-mono text-xs font-bold ${
                t.pos ? "text-[#2E7D32]" : "text-[#102A43]"
              }`}
            >
              {t.amt}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-[#FBF7EE] p-2.5">
        <Sparkles className="h-4 w-4 shrink-0 text-[#9E7D2B]" />
        <p className="text-[11px] leading-tight text-[#5D4037]">
          <strong>Cooperative Notice:</strong> Fall member dividend bonus of $75.00 scheduled for
          credit on November 1st.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenPortal}
        className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-md border border-[#102A43] bg-[#102A43] py-2 text-xs font-serif font-bold text-[#FBF9F5] hover:bg-[#16385C] transition shadow-xs"
      >
        <Lock className="h-3.5 w-3.5 text-[#E6C663]" /> Member Portal Sign In →
      </button>
    </div>
  );
}

function Hero({
  onOpenAccount,
  onOpenPortal,
}: {
  onOpenAccount: () => void;
  onOpenPortal: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#E3DCCE] bg-gradient-to-b from-[#FAF8F5] via-[#F5EFEB] to-[#EFE7DC]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className={eyebrow}>
            <Award className="h-4 w-4 text-[#9E7D2B]" /> A TRADITIONAL FINANCIAL COOPERATIVE · CHARTERED 1952
          </p>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.12] text-[#102A43] sm:text-5xl lg:text-6xl">
            Built for people. <br />
            <span className="italic text-[#9E7D2B]">Never for profit.</span>
          </h1>
          <p className="mt-6 max-w-xl font-serif text-base leading-relaxed text-[#334E68] sm:text-lg">
            For more than 70 years, citiEtrust Bank has stood on timeless banking virtues:
            sovereign member governance, honest dividend returns, zero predatory fees, domestic Fedwire
            and international SWIFT transfers, and counselors who know your family by name.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onOpenAccount}
              className={btnGold}
            >
              <ShieldCheck className="h-4 w-4 text-[#102A43]" /> Open an Account
            </button>
            <button
              type="button"
              onClick={onOpenPortal}
              className={btnGhost}
            >
              <Lock className="h-4 w-4 text-[#9E7D2B]" /> Member Sign In
            </button>
            <a href="#rates-board" className={btnGhost}>
              View Current Rates Board <ArrowRight className="h-4 w-4 text-[#9E7D2B]" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-serif text-[#334E68]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#2E7D32]" /> Federally Insured by NCUA to $250,000
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#9E7D2B]" /> 4-Step Secure Online Application
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#102A43]" /> Member-Owned & Community Governed
            </span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative h-[480px] w-full max-w-md overflow-hidden rounded-2xl border-4 border-[#FFFDF9] shadow-2xl md:h-[540px]">
            <img
              src={hero}
              alt="Trustora board of member trustees reviewing community accounts"
              className="h-full w-full object-cover sepia-[0.1]"
              width={735}
              height={1000}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-serif">
              <p className="font-bold">Trustora Advisory Board & Member Trustees</p>
              <p className="text-[11px] text-[#E6C663]">Guarding member deposits since 1952</p>
            </div>
          </div>
          <div className="absolute -bottom-8 left-0 w-[92%] sm:left-auto sm:right-[48%] sm:w-auto lg:right-[54%] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <AccountCard onOpenPortal={onOpenPortal} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RatesBoard({ onOpenAccount }: { onOpenAccount: () => void }) {
  const rates = [
    { product: "6-Month Share Certificate", term: "Fixed Term", yieldLabel: "5.15% APY*", note: "Minimum $500 balance" },
    { product: "12-Month Share Certificate", term: "Fixed Term", yieldLabel: "4.85% APY*", note: "Compounded monthly" },
    { product: "High-Yield Member Savings", term: "Liquid Share", yieldLabel: "4.10% APY*", note: "No monthly lockup" },
    { product: "Heritage Free Checking", term: "Everyday Share", yieldLabel: "$0 Monthly Fee", note: "Free contactless Visa debit" },
    { product: "New / Used Vehicle Loan", term: "Up to 60 Mos", yieldLabel: "Rates from 5.24% APR*", note: "0.25% discount with auto-pay" },
    { product: "30-Year Fixed Member Mortgage", term: "Conventional", yieldLabel: "Rates from 6.125% APR*", note: "Equal Housing Lender" },
  ];

  return (
    <section id="rates-board" className="border-b border-[#E3DCCE] bg-[#FFFDF9] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className={eyebrow}>
            <Landmark className="h-4 w-4" /> OFFICIAL POSTED DIVIDEND & LOAN SCHEDULE
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#102A43] md:text-4xl">
            The Traditional Teller Rates Board
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#486581]">
            As a member-owned cooperative, we return our net earnings directly back to our depositors
            in the form of superior savings dividends and fair lending rates.
          </p>
        </div>

        {/* Vintage Mahogany & Brass Rates Board */}
        <div className="mt-12 overflow-hidden rounded-2xl border-4 border-[#102A43] bg-[#102A43] p-4 sm:p-6 shadow-2xl">
          <div className="rounded-xl border border-[#D4AF37]/50 bg-[#16385C] p-4 text-[#FBF9F5]">
            <div className="flex flex-wrap items-center justify-between border-b border-[#D4AF37]/40 pb-3 text-xs font-serif">
              <span className="font-bold uppercase tracking-widest text-[#E6C663]">
                ★ TRUSTORA CREDIT UNION DIVIDENDS — OCTOBER 2026
              </span>
              <span className="text-slate-300">NCUA CHARTER # 89412</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rates.map((r) => (
                <div
                  key={r.product}
                  className="rounded-lg border border-[#D4AF37]/30 bg-[#0C1E30] p-4 transition hover:border-[#E6C663]"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>{r.term}</span>
                    <span className="text-[#E6C663]">Insured</span>
                  </div>
                  <h3 className="mt-2 font-serif text-base font-bold text-[#FBF9F5]">{r.product}</h3>
                  <div className="mt-3 rounded bg-[#102A43] px-3 py-1.5 text-center font-serif text-xl font-bold text-[#E6C663] border border-[#D4AF37]/20">
                    {r.yieldLabel}
                  </div>
                  <p className="mt-2 text-center text-[10px] text-slate-400">{r.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#D4AF37]/40 pt-4">
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                *APY = Annual Percentage Yield. APR = Annual Percentage Rate. Rates are determined by the
                Board of Trustees and are subject to change. Federally insured to $250,000 by NCUA.
              </p>
              <button
                type="button"
                onClick={onOpenAccount}
                className={btnGold + " shrink-0"}
              >
                Lock In Rates · Open Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CooperativePrinciples() {
  const principles = [
    {
      num: "01",
      title: "Member Sovereignty",
      desc: "Every member holds one equal share and one vote at our annual member assembly, regardless of account balance.",
      icon: Users,
    },
    {
      num: "02",
      title: "Return of Earnings",
      desc: "We have no Wall Street stockholders demanding quarterly profits. Excess capital is returned to you as higher dividends.",
      icon: BadgeDollarSign,
    },
    {
      num: "03",
      title: "Prudent Local Stewardship",
      desc: "Your deposits directly fund mortgages and small business equipment for families right here in your home community.",
      icon: Building2,
    },
    {
      num: "04",
      title: "Absolute Transparency",
      desc: "No fine-print gotchas, no punitive fees, and no automated phone trees when you need help from a real banker.",
      icon: Scale,
    },
  ];

  return (
    <section id="cooperative" className="border-b border-[#E3DCCE] bg-[#FAF8F5] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className={eyebrow}>
            <Scale className="h-4 w-4" /> THE COOPERATIVE CHARTER
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#102A43] md:text-4xl">
            Why Member-Owned Banking Matters
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#486581]">
            Commercial banks exist to maximize profits for distant stockholders. Trustora exists
            exclusively to guard and grow the financial well-being of our members.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <div
              key={p.num}
              className="rounded-xl border border-[#D5CEBF] bg-[#FFFDF9] p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-3">
                <span className="font-serif text-xs font-bold text-[#9E7D2B]">PRINCIPLE {p.num}</span>
                <p.icon className="h-5 w-5 text-[#102A43]" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-[#102A43]">{p.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#486581]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Products({ onOpenAccount }: { onOpenAccount: (accType?: string) => void }) {
  const p = [
    {
      icon: Wallet,
      t: "Heritage Free Checking",
      d: "Our flagship fee-free checking share account featuring contactless Visa debit and early direct deposit.",
      s: "$0 Monthly Maintenance Fee",
      accType: "heritage_checking",
    },
    {
      icon: PiggyBank,
      t: "High-Yield Member Savings",
      d: "A dedicated share account engineered to grow your emergency reserves with steady quarterly dividends.",
      s: "4.10% Annual Dividend Yield*",
      accType: "high_yield_savings",
    },
    {
      icon: LineChart,
      t: "Premier Share Certificates",
      d: "Guaranteed, federally insured fixed-term certificates with term maturities from 6 to 60 months.",
      s: "Up to 5.15% APY*",
      accType: "money_market",
    },
    {
      icon: CreditCard,
      t: "Member Rewards Visa",
      d: "Honest cash back credit card with no annual fees, transparent rates, and zero penalty APR tricks.",
      s: "1.5% Unlimited Cash Back",
      accType: "heritage_checking",
    },
    {
      icon: Car,
      t: "Vehicle & Equipment Loans",
      d: "Purchase new or used, or refinance an expensive commercial auto loan with our member lending desk.",
      s: "Fixed Rates from 5.24% APR*",
      accType: "heritage_checking",
    },
    {
      icon: Home,
      t: "Community Fixed Mortgages",
      d: "Local underwriting and servicing so your mortgage note stays with your hometown credit union.",
      s: "Down Payments from 3%",
      accType: "heritage_checking",
    },
  ];

  return (
    <section id="products" className="border-b border-[#E3DCCE] bg-[#F5EFEB] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={eyebrow}>TRADITIONAL ACCOUNTS & BORROWING</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#102A43] md:text-4xl">
              Member Shares Built for Every Goal
            </h2>
          </div>
          <p className="max-w-md font-serif text-sm text-[#486581]">
            Every account opened contributes to our collective capital reserve, directly strengthening
            our ability to serve our community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {p.map((x) => (
            <div
              key={x.t}
              className="flex flex-col rounded-xl border border-[#D5CEBF] bg-[#FFFDF9] p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-[#E3DCCE] pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#D4AF37]/50 bg-[#102A43] text-[#E6C663]">
                  <x.icon className="h-5 w-5" />
                </span>
                <span className="font-serif text-[11px] font-bold text-[#2E7D32]">
                  NCUA Insured
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-[#102A43]">{x.t}</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-[#486581]">{x.d}</p>
              <div className="mt-5 border-t border-[#E3DCCE] pt-4 flex items-center justify-between">
                <span className="font-serif text-xs font-bold text-[#9E7D2B]">{x.s}</span>
                <button
                  type="button"
                  onClick={() => onOpenAccount(x.accType)}
                  className="font-serif text-xs font-bold uppercase tracking-wider text-[#102A43] hover:text-[#9E7D2B] hover:underline"
                >
                  Apply Now &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stories() {
  const s = [
    {
      img: m1,
      q: "When our bakery needed a replacement oven back in '84, Trustora sat down with us and worked out an honest loan. Forty years later, our children still bank right here.",
      n: "Luis & Carmen R.",
      r: "Member-Owners Since 1984 · Local Bakery",
    },
    {
      img: teamPhoto.url,
      q: "No mystery service fees. When I call with a question about our family savings or mortgage, I speak directly to a human being at the branch on Main Street.",
      n: "Priya S.",
      r: "Member-Owner Since 2012 · High School Principal",
    },
    {
      img: m3,
      q: "We refinanced our home and moved our retirement share certificates to Trustora. Knowing our funds are safe under NCUA insurance gives us total peace of mind.",
      n: "Ann & Tom K.",
      r: "Member-Owners Since 1978 · Retired Educators",
    },
  ];

  return (
    <section id="stories" className="border-b border-[#E3DCCE] bg-[#FAF8F5] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className={eyebrow}>VOICES OF OUR MEMBERSHIP</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#102A43] md:text-4xl">
            Generations of Trust & Fellowship
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {s.map((x) => (
            <figure
              key={x.n}
              className="overflow-hidden rounded-xl border border-[#D5CEBF] bg-[#FFFDF9] shadow-sm"
            >
              <img
                src={x.img}
                alt={`Portrait of ${x.n}`}
                className="aspect-[4/3] w-full object-cover sepia-[0.1]"
                loading="lazy"
              />
              <div className="p-6">
                <Quote className="h-5 w-5 text-[#9E7D2B]" />
                <blockquote className="mt-3 font-serif text-sm leading-relaxed text-[#102A43] italic">
                  "{x.q}"
                </blockquote>
                <figcaption className="mt-5 border-t border-[#E3DCCE] pt-3 text-xs">
                  <span className="font-serif font-bold text-[#102A43]">{x.n}</span>
                  <span className="block text-[11px] text-muted-foreground">{x.r}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const f = [
    {
      icon: ShieldCheck,
      t: "NCUA Federal Insurance",
      d: "Your deposits are federally insured to at least $250,000 and backed by the full faith and credit of the United States Government.",
    },
    {
      icon: Lock,
      t: "256-Bit Cryptographic Vault",
      d: "All online transactions and membership records are guarded with military-grade transport layer security (TLS 1.3).",
    },
    {
      icon: Fingerprint,
      t: "Mandatory Multi-Factor Verification",
      d: "Two-factor SMS tokens or TOTP authenticator keys ensure only you can access your accounts.",
    },
  ];

  return (
    <section className="border-b border-[#E3DCCE] bg-[#F5EFEB] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 rounded-2xl border-2 border-[#D4AF37]/50 bg-[#102A43] p-8 text-[#FBF9F5] md:grid-cols-[1fr_2fr] md:p-12 shadow-xl">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37] bg-[#16385C]">
              <ShieldCheck className="h-7 w-7 text-[#E6C663]" />
            </span>
            <h2 className="mt-4 font-serif text-2xl font-bold sm:text-3xl text-[#FBF9F5]">
              Guarding Your Hard-Earned Capital.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              For over seven decades, no member of Trustora Credit Union has ever lost a single penny
              of insured deposits.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {f.map((x) => (
              <div key={x.t} className="rounded-lg border border-white/10 bg-[#0C1E30] p-4">
                <x.icon className="h-5 w-5 text-[#E6C663]" />
                <h3 className="mt-3 font-serif text-sm font-bold text-[#FBF9F5]">{x.t}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({
  onOpenAccount,
  onOpenPortal,
}: {
  onOpenAccount: () => void;
  onOpenPortal: () => void;
}) {
  const cols = {
    "Member Accounts": [
      "Heritage Free Checking",
      "High-Yield Savings",
      "Share Certificates",
      "Money Market Shares",
    ],
    "Lending Services": [
      "New & Used Auto Loans",
      "Fixed Rate Mortgages",
      "Home Equity Lines",
      "Member Personal Loans",
    ],
    "About Trustora": [
      "Cooperative History",
      "Board of Trustees",
      "Annual Financial Reports",
      "Community Outreach",
    ],
    "Member Service": [
      "Member Help Desk",
      "Find a Branch / ATM",
      "Routing & Transit #",
      "Security & Fraud Center",
    ],
  };

  return (
    <footer id="support" className="bg-[#102A43] text-[#FBF9F5]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-300">
              Trustora Credit Union is a member-owned, federally chartered financial cooperative
              founded in 1952. We operate for the mutual benefit of our member-owners.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-300 font-serif">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#E6C663]" /> Member Service: 1-800-555-0142
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#E6C663]" /> Electronic Desk: support@trustora.org
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#E6C663]" /> Routing & Transit # 071922841
              </li>
            </ul>

            <div className="mt-6">
              <button
                type="button"
                onClick={onOpenAccount}
                className={btnGold}
              >
                Open an Account Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(cols).map(([h, ls]) => (
              <div key={h}>
                <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#E6C663]">
                  {h}
                </p>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  {ls.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-white hover:underline">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Disclosures & NCUA Seal */}
        <div className="mt-14 border-t border-slate-700 pt-8 text-[11px] leading-relaxed text-slate-400">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-3xl">
              <p>
                <strong>Federally Insured by NCUA:</strong> Your savings are federally insured to at
                least $250,000 and backed by the full faith and credit of the United States
                Government. National Credit Union Administration, a U.S. Government Agency.
              </p>
              <p className="mt-2">
                <strong>Equal Housing Lender:</strong> We do business in accordance with the Federal
                Fair Housing Law and the Equal Credit Opportunity Act.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded border border-[#D4AF37]/40 bg-[#16385C] px-3 py-1.5 text-center font-serif text-[11px] font-bold text-[#E6C663]">
                NCUA CHARTER 89412
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400">
              <button
                type="button"
                onClick={onOpenPortal}
                className="text-[#E6C663] hover:underline font-semibold"
              >
                Member Online Banking
              </button>
              <Link to="/admin" className="text-slate-300 hover:text-white">
                Admin Console
              </Link>
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Truth-in-Savings Disclosures</a>
              <a href="#" className="hover:text-white">Fee Schedule</a>
              <a href="#" className="hover:text-white">Electronic Communications E-Sign</a>
              <a href="#" className="hover:text-white">Accessibility</a>
            </div>
            <span>© 1952–2026 citiEtrust Bank, N.A. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<string>("heritage_checking");

  const handleOpenAccount = (accType = "heritage_checking") => {
    setSelectedAccountType(accType);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#102A43]">
      <HeritageTopTicker />
      <Nav
        onOpenAccount={() => handleOpenAccount("heritage_checking")}
        onOpenPortal={() => setIsPortalOpen(true)}
      />
      <main>
        <Hero
          onOpenAccount={() => handleOpenAccount("heritage_checking")}
          onOpenPortal={() => setIsPortalOpen(true)}
        />
        <RatesBoard onOpenAccount={() => handleOpenAccount("high_yield_savings")} />
        <CooperativePrinciples />
        <Products onOpenAccount={handleOpenAccount} />
        <Stories />
        <SecuritySection />
      </main>
      <Footer
        onOpenAccount={() => handleOpenAccount("heritage_checking")}
        onOpenPortal={() => setIsPortalOpen(true)}
      />

      {/* Multi-step Secure Open Account Modal */}
      <OpenAccountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultAccountType={selectedAccountType}
        onSuccessOpenPortal={() => setIsPortalOpen(true)}
      />

      {/* Member Banking & Transfer Portal Modal */}
      <MemberPortalModal
        open={isPortalOpen}
        onOpenChange={setIsPortalOpen}
      />
    </div>
  );
}
