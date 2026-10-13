import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck, Zap, Compass, BadgeDollarSign, Wallet, PiggyBank, CreditCard, Car, Home, LineChart,
  Fingerprint, Radar, Clock, ArrowRight, ArrowUpRight, Lock, Coffee, ShoppingBag, Briefcase,
  Facebook, Instagram, Linkedin, Twitter, Phone, Mail, MapPin, Quote, Sparkles,
} from "lucide-react";
import heroAsset from "@/assets/hero-boardroom.jpg.asset.json";
import m1 from "@/assets/member-1.jpg";
import teamPhoto from "@/assets/team-documents.jpg.asset.json";
import m3 from "@/assets/member-3.jpg";
const hero = heroAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trustora Credit Union — Banking built around your life" },
      { name: "description", content: "Simple, secure checking, savings, loans and guidance from a member-owned credit union. No monthly fees, early direct deposit." },
      { property: "og:title", content: "Trustora Credit Union — Banking built around your life" },
      { property: "og:description", content: "Simple, secure tools for everyday money management. Federally insured by NCUA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const btnGhost = "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition hover:border-emerald hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.18em] text-emerald";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="Trustora Credit Union home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-gradient">
        <span className="h-3.5 w-3.5 rounded-full bg-emerald-gradient" />
      </span>
      <span className={`leading-tight ${light ? "text-navy-foreground" : "text-foreground"}`}>
        <span className="block font-display text-lg font-semibold">Trustora</span>
        <span className={`block text-[10px] uppercase tracking-[0.2em] ${light ? "text-navy-foreground/60" : "text-muted-foreground"}`}>Credit Union</span>
      </span>
    </a>
  );
}

function Nav() {
  const links = ["Checking & Savings", "Credit Cards", "Loans", "Investments", "Support"];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l}><a href="#products" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href="#" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary sm:inline-flex"><Lock className="mr-1.5 h-4 w-4" />Sign In</a>
          <a href="#" className={btnPrimary + " px-5 py-2.5"}>Open an Account</a>
        </div>
      </nav>
    </header>
  );
}

function AccountCard() {
  const tx = [
    { icon: Briefcase, name: "Payroll · Direct deposit", date: "Today", amt: "+$2,840.00", pos: true },
    { icon: Coffee, name: "Corner Roasters", date: "Yesterday", amt: "−$6.25" },
    { icon: ShoppingBag, name: "Fresh Market", date: "Oct 11", amt: "−$84.17" },
  ];
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card/95 p-5 shadow-lift backdrop-blur" aria-label="Sample account preview">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Good afternoon, Maya</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-accent-foreground"><ShieldCheck className="h-3 w-3" />Secured</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-navy-gradient p-4 text-navy-foreground">
          <p className="text-[11px] opacity-70">Checking ··4821</p>
          <p className="mt-1 font-display text-xl">$4,218.36</p>
        </div>
        <div className="rounded-2xl bg-emerald-soft p-4">
          <p className="text-[11px] text-accent-foreground/80">Savings · 4.10% APY</p>
          <p className="mt-1 font-display text-xl text-foreground">$12,940.02</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs"><span className="font-semibold">October spending</span><span className="text-muted-foreground">$1,240 of $2,000</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full w-[62%] rounded-full bg-emerald-gradient" /></div>
      </div>
      <ul className="mt-5 space-y-3">
        {tx.map((t) => (
          <li key={t.name} className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><t.icon className="h-4 w-4 text-primary" /></span>
            <div className="flex-1"><p className="text-xs font-semibold">{t.name}</p><p className="text-[11px] text-muted-foreground">{t.date}</p></div>
            <span className={`text-xs font-semibold ${t.pos ? "text-emerald" : "text-foreground"}`}>{t.amt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2.5 rounded-2xl border border-border bg-muted p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
        <p className="text-[11px] leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Healthy month.</span> You're on pace to save $310 more than September.</p>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className={eyebrow}>Member-owned since 1952</p>
          <h1 className="mt-5 text-5xl font-medium leading-[1.05] text-foreground md:text-6xl lg:text-7xl">
            Banking built around <em className="text-emerald">your life.</em>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Simple, secure tools for everyday money — from your first paycheck to your first home. No surprise fees, just people who answer when you call.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className={btnPrimary}>Open an Account <ArrowRight className="h-4 w-4" /></a>
            <a href="#products" className={btnGhost}>Explore Products</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald" />Federally insured by NCUA</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald" />Open in about 5 minutes</span>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative h-[520px] w-full max-w-md overflow-hidden rounded-xl border border-border shadow-lift md:h-[600px]">
            <img src={hero} alt="Trustora team members talking around the boardroom table" className="h-full w-full object-cover" width={735} height={1000} />
          </div>
          <div className="absolute -bottom-10 left-0 w-[88%] sm:left-auto sm:right-[52%] sm:w-auto lg:right-[58%] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <AccountCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: BadgeDollarSign, t: "No monthly maintenance fees", d: "Keep more of what you earn. No minimum balance games." },
    { icon: Zap, t: "Early direct deposit", d: "Get paid up to two days early, automatically." },
    { icon: Compass, t: "Personalized financial guidance", d: "Free sessions with certified counselors, anytime you need them." },
    { icon: ShieldCheck, t: "Bank-grade security", d: "256-bit encryption and real-time alerts on every account." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b) => (
          <div key={b.t} className="lift rounded-3xl border border-border bg-card p-7 shadow-soft">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-soft"><b.icon className="h-5 w-5 text-accent-foreground" /></span>
            <h3 className="mt-6 font-sans text-base font-bold tracking-normal">{b.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Products() {
  const p = [
    { icon: Wallet, t: "Checking", d: "Fee-free everyday account with a contactless debit card.", s: "$0 monthly fee" },
    { icon: PiggyBank, t: "High-yield savings", d: "Grow your cushion with a rate that rewards patience.", s: "4.10% APY*" },
    { icon: CreditCard, t: "Credit cards", d: "Simple cash back with no annual fee and fair rates.", s: "1.5% back everywhere" },
    { icon: Car, t: "Auto loans", d: "New, used or refinance — decisions in minutes.", s: "Rates from 5.24% APR*" },
    { icon: Home, t: "Mortgages", d: "Local lenders who walk you through every step home.", s: "Down payments from 3%" },
    { icon: LineChart, t: "Investment planning", d: "Retirement and goal-based plans with a real advisor.", s: "Free first consultation" },
  ];
  return (
    <section id="products" className="bg-muted/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={eyebrow}>Products</p>
            <h2 className="mt-3 text-4xl font-medium md:text-5xl">Tools for every goal</h2>
          </div>
          <p className="max-w-md text-muted-foreground">Everything works together in one app, so you can see your whole financial picture at a glance.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p.map((x) => (
            <a key={x.t} href="#" className="group lift flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-gradient"><x.icon className="h-5 w-5 text-navy-foreground" /></span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald" />
              </div>
              <h3 className="mt-6 text-2xl font-medium">{x.t}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
              <p className="mt-6 border-t border-border pt-4 text-sm font-semibold text-accent-foreground">{x.s}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Wellness() {
  const bars = [42, 55, 48, 63, 58, 72, 81];
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
      <div>
        <p className={eyebrow}>Financial wellness</p>
        <h2 className="mt-3 text-4xl font-medium md:text-5xl">Small steps, steady progress.</h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">Gentle insights help you notice patterns, set realistic budgets, and celebrate the wins along the way — without judgment.</p>
        <a href="#" className={btnPrimary + " mt-8"}>Explore budgeting tools <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Savings growth</p>
            <p className="mt-1 font-display text-3xl">$12,940</p>
          </div>
          <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-accent-foreground">+18% since April</span>
        </div>
        <div className="mt-8 flex h-44 items-end gap-3" role="img" aria-label="Savings increased steadily from April to October">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className={`w-full rounded-t-xl transition-all duration-500 hover:opacity-80 ${i === bars.length - 1 ? "bg-emerald-gradient" : "bg-secondary"}`} style={{ height: `${h}%` }} />
              <span className="text-[11px] text-muted-foreground">{months[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 rounded-2xl bg-muted p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
          <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">You're 72% of the way</span> to your emergency fund goal. At this pace, you'll reach it by February.</p>
        </div>
      </div>
    </section>
  );
}

function Stories() {
  const s = [
    { img: m1, q: "When the bakery needed a new oven, Trustora actually sat down with me and figured it out.", n: "Luis R.", r: "Small business member, 9 years" },
    { img: teamPhoto.url, q: "Early direct deposit sounds small until you work night shifts. It genuinely takes the stress off.", n: "Priya S.", r: "Member since 2021" },
    { img: m3, q: "They helped us refinance and plan for retirement. It feels like banking with neighbors.", n: "Ann & Tom K.", r: "Members, 24 years" },
  ];
  return (
    <section className="bg-muted/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className={eyebrow}>Member stories</p>
        <h2 className="mt-3 max-w-xl text-4xl font-medium md:text-5xl">Real people. Real progress.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {s.map((x) => (
            <figure key={x.n} className="lift overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <img src={x.img} alt={`Portrait of ${x.n}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="p-7">
                <Quote className="h-5 w-5 text-emerald" />
                <blockquote className="mt-3 font-display text-lg leading-snug">"{x.q}"</blockquote>
                <figcaption className="mt-5 text-sm"><span className="font-semibold">{x.n}</span><span className="block text-muted-foreground">{x.r}</span></figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreBadge({ top, label }: { top: string; label: string }) {
  return (
    <a href="#" className="inline-flex items-center gap-3 rounded-xl border border-navy-foreground/20 bg-navy-foreground/10 px-4 py-2.5 text-navy-foreground transition hover:bg-navy-foreground/20">
      <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">{top}</span><span className="block text-sm font-semibold">{label}</span></span>
    </a>
  );
}

function AppStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-navy-gradient px-8 py-14 md:grid-cols-2 md:px-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald">Trustora mobile</p>
          <h2 className="mt-3 text-4xl font-medium text-navy-foreground md:text-5xl">Your money, wherever you are.</h2>
          <p className="mt-4 max-w-md text-navy-foreground/70">Deposit checks, send money to friends, freeze a card, and chat with a real person — all from your pocket.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <StoreBadge top="Download on the" label="App Store" />
            <StoreBadge top="Get it on" label="Google Play" />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-60 rounded-[2.5rem] border-[6px] border-navy-foreground/15 bg-background p-4 shadow-lift">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-secondary" />
            <p className="text-[11px] text-muted-foreground">Total balance</p>
            <p className="font-display text-2xl">$17,158.38</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
              {["Send", "Deposit", "Pay"].map((a) => <span key={a} className="rounded-xl bg-emerald-soft py-2 text-accent-foreground">{a}</span>)}
            </div>
            <div className="mt-4 space-y-2">
              {["Rent · Oct", "Spotify", "Transfer to savings"].map((t, i) => (
                <div key={t} className="flex justify-between rounded-xl bg-muted px-3 py-2 text-[11px]"><span>{t}</span><span className="font-semibold">{["−$1,450", "−$11.99", "+$200"][i]}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Security() {
  const f = [
    { icon: Radar, t: "Fraud monitoring", d: "AI-assisted monitoring flags unusual activity in real time." },
    { icon: Fingerprint, t: "Biometric sign-in", d: "Face and fingerprint login keeps your account yours." },
    { icon: Clock, t: "24/7 account protection", d: "Lock your card instantly and reach our team any hour." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="grid gap-8 rounded-[2rem] border border-border bg-emerald-soft p-10 md:grid-cols-[1fr_2fr] md:p-14">
        <div>
          <ShieldCheck className="h-10 w-10 text-emerald" />
          <h2 className="mt-4 text-3xl font-medium">Protection you don't have to think about.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {f.map((x) => (
            <div key={x.t}>
              <x.icon className="h-6 w-6 text-accent-foreground" />
              <h3 className="mt-3 font-sans text-base font-bold tracking-normal">{x.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = {
    Banking: ["Checking", "Savings", "Credit cards", "Certificates"],
    Borrowing: ["Auto loans", "Mortgages", "Personal loans", "Home equity"],
    Company: ["About us", "Careers", "Newsroom", "Community"],
    Help: ["Support center", "Find a branch", "Routing number", "Report fraud"],
  };
  const social = [Facebook, Instagram, Linkedin, Twitter];
  return (
    <footer className="bg-navy-gradient text-navy-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <ul className="mt-6 space-y-2.5 text-sm text-navy-foreground/70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" />1-800-555-0142</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" />help@trustora.org</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Routing # 000000000</li>
            </ul>
            <div className="mt-6 flex gap-2">
              {social.map((S, i) => (
                <a key={i} href="#" aria-label="Social profile" className="grid h-9 w-9 place-items-center rounded-full border border-navy-foreground/20 transition hover:bg-navy-foreground/10"><S className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(cols).map(([h, ls]) => (
              <div key={h}>
                <p className="text-sm font-semibold">{h}</p>
                <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/65">
                  {ls.map((l) => <li key={l}><a href="#" className="hover:text-navy-foreground">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 border-t border-navy-foreground/15 pt-8 text-xs leading-relaxed text-navy-foreground/55">
          <p>Federally insured by NCUA. Your savings are federally insured to at least $250,000 and backed by the full faith and credit of the United States Government. Equal Housing Opportunity.</p>
          <p className="mt-3">*APY = Annual Percentage Yield. APR = Annual Percentage Rate. Rates are subject to change and based on creditworthiness. Membership eligibility required.</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {["Privacy", "Accessibility", "Disclosures", "Terms of use", "Security center"].map((l) => <a key={l} href="#" className="hover:text-navy-foreground">{l}</a>)}
            <span className="ml-auto">© 2026 Trustora Credit Union</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Benefits />
        <Products />
        <Wellness />
        <Stories />
        <AppStrip />
        <Security />
      </main>
      <Footer />
    </div>
  );
}
