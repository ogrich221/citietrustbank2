import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Zap,
  Wallet,
  PiggyBank,
  CreditCard,
  Home,
  LineChart,
  Car,
  Fingerprint,
  Bell,
  Lock,
  ArrowRight,
  ArrowUpRight,
  Smartphone,
  Globe,
  Send,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import bankBuilding from "@/assets/bank-building.jpg";
import m1 from "@/assets/member-1.jpg";
import m2 from "@/assets/member-2.jpg";
import m3 from "@/assets/member-3.jpg";
import { OpenAccountModal } from "@/components/open-account-modal";
import { MemberPortalModal } from "@/components/member-portal-modal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "citiEtrust Bank — Modern Banking, Built on Trust" },
      {
        name: "description",
        content:
          "Fee-free checking, 4.10% APY savings, instant transfers and a top-rated mobile app. Federally insured up to $250,000.",
      },
      { property: "og:title", content: "citiEtrust Bank — Modern Banking, Built on Trust" },
      {
        property: "og:description",
        content: "Fee-free checking, high-yield savings and instant domestic & international transfers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const eyebrow =
  "inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="citiEtrust Bank home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-gradient shadow-soft">
        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
      </span>
      <span className={`font-display text-lg font-bold tracking-tight ${light ? "text-navy-foreground" : "text-foreground"}`}>
        citiEtrust <span className="text-gold">Bank</span>
      </span>
    </a>
  );
}

function Nav({ onOpenAccount, onOpenPortal }: { onOpenAccount: () => void; onOpenPortal: () => void }) {
  const links = [
    ["Accounts", "#products"],
    ["Rates", "#rates"],
    ["Why us", "#why"],
    ["Support", "#support"],
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map(([l, h]) => (
            <li key={l}>
              <a href={h} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenPortal} className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted sm:inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4" /> Sign in
          </button>
          <button type="button" onClick={onOpenAccount} className={btnPrimary + " px-5 py-2.5"}>
            Open account
          </button>
        </div>
      </nav>
    </header>
  );
}

function AppCard() {
  const tx = [
    { name: "Salary deposit", date: "Today", amt: "+$2,840.00", pos: true },
    { name: "Savings interest", date: "Oct 12", amt: "+$42.50", pos: true },
    { name: "Whole Foods", date: "Oct 11", amt: "−$84.17" },
  ];
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card/95 p-6 shadow-lift backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Total balance</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
          <TrendingUp className="h-3 w-3" /> +3.2%
        </span>
      </div>
      <p className="mt-1 font-display text-4xl font-bold tracking-tight">$17,158.38</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-navy-gradient p-4 text-navy-foreground">
          <p className="text-xs opacity-75">Checking</p>
          <p className="mt-1 text-lg font-bold">$4,218.36</p>
        </div>
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-xs text-muted-foreground">Savings · 4.10%</p>
          <p className="mt-1 text-lg font-bold">$12,940.02</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {tx.map((t) => (
          <li key={t.name} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.date}</p>
            </div>
            <span className={`font-semibold ${t.pos ? "text-gold" : "text-foreground"}`}>{t.amt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-medium">
        {[
          [Send, "Send"],
          [Wallet, "Pay"],
          [PiggyBank, "Save"],
        ].map(([I, l]) => {
          const Icon = I as typeof Send;
          return (
            <span key={l as string} className="flex flex-col items-center gap-1 rounded-xl bg-muted py-2.5">
              <Icon className="h-4 w-4 text-primary" />
              {l as string}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Hero({ onOpenAccount, onOpenPortal }: { onOpenAccount: () => void; onOpenPortal: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <img
        src={bankBuilding}
        alt=""
        aria-hidden="true"
        width={1600}
        height={912}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className={eyebrow}>
            <Zap className="h-3.5 w-3.5" /> New: 4.10% APY high-yield savings
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Banking that moves <span className="text-gold">as fast as you do.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            No monthly fees, instant transfers, and real people when you need them. Open an account in
            under five minutes — right from your phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={onOpenAccount} className={btnPrimary}>
              Open an account <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={onOpenPortal} className={btnGhost}>
              Sign in to online banking
            </button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" /> Insured to $250,000</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-gold" /> 4.9 app rating</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-gold" /> 0 hidden fees</span>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <AppCard />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const s = [
    ["1.2M+", "Customers"],
    ["$48B", "Assets protected"],
    ["4.9★", "App store rating"],
    ["24/7", "Human support"],
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
        {s.map(([v, l]) => (
          <div key={l} className="text-center">
            <p className="font-display text-3xl font-bold">{v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Products({ onOpenAccount }: { onOpenAccount: (t?: string) => void }) {
  const items = [
    { icon: Wallet, t: "Everyday Checking", d: "No monthly fees, early direct deposit, and 55,000 free ATMs.", k: "heritage_checking" },
    { icon: PiggyBank, t: "High-Yield Savings", d: "Earn 4.10% APY with no minimum balance to get started.", k: "high_yield_savings" },
    { icon: CreditCard, t: "Rewards Credit Card", d: "2% cash back on everything, no annual fee.", k: "heritage_checking" },
    { icon: Home, t: "Home Loans", d: "Fast pre-approval and rates from 6.24% APR.", k: "heritage_checking" },
    { icon: Car, t: "Auto Loans", d: "Rates from 5.49% APR with decisions in minutes.", k: "heritage_checking" },
    { icon: LineChart, t: "Investing", d: "Automated portfolios and certificates up to 5.15% APY.", k: "high_yield_savings" },
  ];
  return (
    <section id="products" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <span className={eyebrow}>Accounts & products</span>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">Everything your money needs, in one place.</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <button
            key={p.t}
            type="button"
            onClick={() => onOpenAccount(p.k)}
            className="group lift rounded-3xl border border-border bg-card p-7 text-left"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent">
              <p.icon className="h-6 w-6 text-accent-foreground" />
            </span>
            <h3 className="mt-5 text-xl font-semibold">{p.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Get started <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Rates({ onOpenAccount }: { onOpenAccount: () => void }) {
  const r = [
    ["High-Yield Savings", "4.10%", "APY"],
    ["12-Month Certificate", "5.15%", "APY"],
    ["30-Yr Fixed Mortgage", "6.24%", "APR"],
    ["New Auto Loan", "5.49%", "APR"],
  ];
  return (
    <section id="rates" className="bg-navy-gradient text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight">Rates that actually reward you.</h2>
          <p className="mt-4 text-navy-foreground/75">Updated daily. No teaser periods, no fine print surprises.</p>
          <button type="button" onClick={onOpenAccount} className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Start earning <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {r.map(([l, v, u]) => (
            <div key={l} className="rounded-3xl border border-navy-foreground/15 bg-navy-foreground/5 p-6">
              <p className="text-sm text-navy-foreground/70">{l}</p>
              <p className="mt-2 font-display text-4xl font-bold">
                {v} <span className="text-base font-medium text-navy-foreground/60">{u}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const f = [
    { icon: Fingerprint, t: "Biometric security", d: "Face ID, fingerprint and device-bound sign-in on every login." },
    { icon: Bell, t: "Real-time alerts", d: "Know the second money moves, and freeze your card in one tap." },
    { icon: Globe, t: "Global transfers", d: "Send to 180+ countries via SWIFT with transparent fees." },
    { icon: Smartphone, t: "Top-rated app", d: "Budgets, insights and bill pay — all built in." },
  ];
  return (
    <section id="why" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-3xl shadow-lift">
          <img src={bankBuilding} alt="citiEtrust Bank branch exterior" loading="lazy" width={1600} height={912} className="h-full w-full object-cover" />
        </div>
        <div>
          <span className={eyebrow}>Why citiEtrust</span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">Digital first. Still there in person.</h2>
          <p className="mt-4 text-muted-foreground">
            Bank from anywhere with our app, or visit one of our modern branches for face-to-face advice.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {f.map((x) => (
              <div key={x.t}>
                <x.icon className="h-6 w-6 text-gold" />
                <h3 className="mt-3 font-semibold">{x.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stories() {
  const s = [
    { img: m1, n: "Maya R.", r: "Designer", q: "I opened my account on my lunch break. The savings rate beats anything I've found." },
    { img: m2, n: "James T.", r: "Small business owner", q: "International transfers used to take days. Now my suppliers get paid the same afternoon." },
    { img: m3, n: "Linda K.", r: "Retired teacher", q: "The app is simple, and when I call, a real person picks up. That matters to me." },
  ];
  return (
    <section className="bg-muted/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-center font-display text-4xl font-bold tracking-tight">Loved by our customers</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {s.map((x) => (
            <figure key={x.n} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-foreground">“{x.q}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img src={x.img} alt={x.n} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{x.n}</p>
                  <p className="text-xs text-muted-foreground">{x.r}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onOpenAccount }: { onOpenAccount: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-gold-gradient px-8 py-16 text-center text-primary-foreground">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Open your account in 5 minutes.</h2>
        <p className="mx-auto mt-4 max-w-xl opacity-90">No paperwork, no branch visit, no minimum deposit.</p>
        <button type="button" onClick={onOpenAccount} className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-lift transition hover:-translate-y-0.5">
          Get started <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Record<string, string[]> = {
    Personal: ["Checking", "Savings", "Credit cards", "Loans"],
    Company: ["About us", "Careers", "Newsroom", "Locations"],
    Legal: ["Privacy", "Terms", "Fee schedule", "Accessibility"],
  };
  return (
    <footer id="support" className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <ul className="mt-6 space-y-2 text-sm text-navy-foreground/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1-800-555-0142</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@citietrust.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 200 Market St, San Francisco, CA</li>
          </ul>
        </div>
        {Object.entries(cols).map(([h, ls]) => (
          <div key={h}>
            <p className="text-sm font-semibold">{h}</p>
            <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
              {ls.map((l) => <li key={l}><a href="#" className="hover:text-navy-foreground">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-navy-foreground/10">
        <p className="mx-auto max-w-7xl px-6 py-6 text-xs text-navy-foreground/60">
          © 2026 citiEtrust Bank, N.A. Member FDIC. Equal Housing Lender.
        </p>
      </div>
    </footer>
  );
}

function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<string>("heritage_checking");
  const openAccount = (t = "heritage_checking") => {
    setSelectedAccountType(t);
    setIsModalOpen(true);
  };
  const openPortal = () => setIsPortalOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav onOpenAccount={() => openAccount()} onOpenPortal={openPortal} />
      <main>
        <Hero onOpenAccount={() => openAccount()} onOpenPortal={openPortal} />
        <Stats />
        <Products onOpenAccount={openAccount} />
        <Rates onOpenAccount={() => openAccount("high_yield_savings")} />
        <Why />
        <Stories />
        <CTA onOpenAccount={() => openAccount()} />
      </main>
      <Footer />
      <OpenAccountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultAccountType={selectedAccountType}
        onSuccessOpenPortal={openPortal}
      />
      <MemberPortalModal open={isPortalOpen} onOpenChange={setIsPortalOpen} />
    </div>
  );
}
