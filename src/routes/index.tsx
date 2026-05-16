import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home, Calendar, Bell, LineChart, Star, FileText, Settings,
  Globe, ShieldCheck, CalendarDays, Brain, Target, ShieldAlert,
  Send, Circle, Droplet, ArrowUpRight, BarChart3, LogIn,
  Check, X, CircleDot, TrendingUp, TrendingDown, Minus, AlertTriangle, Clock,
} from "lucide-react";
import zozoLogo from "@/assets/zozo-logo.png";

type ViewKey = "overview" | "daily";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZOZO SmartFlow — FX Market Brief" },
      { name: "description", content: "Napi FX piaci áttekintés, setupok és kockázatkezelés." },
    ],
  }),
  component: Dashboard,
});

/* ---------- helpers ---------- */
const sideItems: { icon: typeof Home; label: string; key: ViewKey | null }[] = [
  { icon: Home, label: "ÁTTEKINTÉS", key: "overview" },
  { icon: Calendar, label: "ECONOMIC CALENDAR", key: null },
  { icon: Bell, label: "ALERT NAPLÓ", key: null },
  { icon: LineChart, label: "JELZÉSEK", key: null },
  { icon: Star, label: "ÉRTÉKELÉS", key: null },
  { icon: FileText, label: "NAPI ELEMZÉS", key: "daily" },
  { icon: Settings, label: "BEÁLLÍTÁSOK", key: null },
];

type Bias = "BULLISH" | "BEARISH" | "NEUTRAL";
type Mark = "yes" | "no" | "partial";
type Status = "LONG SETUP" | "SHORT BIAS" | "VÁRJ RETESTRE" | "VÁRJ";
type Action = "FIGYELD LONGRA" | "FIGYELD SHORTRA" | "VÁRJ";

interface Row {
  pair: string;
  bias: Bias;
  sweep: Mark;
  choch: Mark;
  fvg: Mark;
  /** 4 bars: g=green b=red y=amber d=dim */
  trend: Array<"g" | "r" | "y" | "d">;
  status: Status;
  action: Action;
}

const rows: Row[] = [
  { pair: "EUR/USD", bias: "BULLISH", sweep: "yes", choch: "yes", fvg: "yes", trend: ["g","g","g","d"], status: "LONG SETUP", action: "FIGYELD LONGRA" },
  { pair: "GBP/USD", bias: "BULLISH", sweep: "no",  choch: "yes", fvg: "yes", trend: ["g","g","g","d"], status: "LONG SETUP", action: "FIGYELD LONGRA" },
  { pair: "USD/JPY", bias: "NEUTRAL", sweep: "no",  choch: "no",  fvg: "partial", trend: ["y","y","d","d"], status: "VÁRJ RETESTRE", action: "VÁRJ" },
  { pair: "USD/CHF", bias: "BEARISH", sweep: "yes", choch: "no",  fvg: "yes", trend: ["r","r","r","d"], status: "SHORT BIAS", action: "FIGYELD SHORTRA" },
  { pair: "XAU/USD", bias: "BULLISH", sweep: "yes", choch: "yes", fvg: "yes", trend: ["g","g","g","d"], status: "LONG SETUP", action: "FIGYELD LONGRA" },
  { pair: "US30 (DOW)", bias: "NEUTRAL", sweep: "no", choch: "no", fvg: "partial", trend: ["y","y","y","d"], status: "VÁRJ", action: "VÁRJ" },
];

function biasChip(b: Bias) {
  const cls = b === "BULLISH" ? "zz-chip-bull" : b === "BEARISH" ? "zz-chip-bear" : "zz-chip-neutral";
  return <span className={`zz-chip ${cls}`}>{b}</span>;
}

function MarkIcon({ m }: { m: Mark }) {
  if (m === "yes")
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.35_0.12_150/0.35)] ring-1 ring-[oklch(0.55_0.15_150/0.6)]">
        <Check className="h-4 w-4 text-[oklch(0.86_0.18_150)]" strokeWidth={3} />
      </span>
    );
  if (m === "no")
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.35_0.15_25/0.35)] ring-1 ring-[oklch(0.55_0.18_25/0.6)]">
        <X className="h-4 w-4 text-[oklch(0.82_0.2_25)]" strokeWidth={3} />
      </span>
    );
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-[oklch(0.7_0.17_75/0.7)]">
      <CircleDot className="h-4 w-4 text-[oklch(0.85_0.17_75)]" />
    </span>
  );
}

function TrendBars({ t }: { t: Row["trend"] }) {
  const map: Record<string, string> = {
    g: "bg-[oklch(0.7_0.18_150)]",
    r: "bg-[oklch(0.65_0.22_25)]",
    y: "bg-[oklch(0.78_0.17_75)]",
    d: "bg-[oklch(0.32_0.03_250)]",
  };
  return (
    <div className="flex items-center gap-1.5">
      {t.map((c, i) => <span key={i} className={`h-4 w-5 rounded-[3px] ${map[c]}`} />)}
    </div>
  );
}

function StatusPill({ s }: { s: Status }) {
  const cls =
    s === "LONG SETUP" ? "text-[oklch(0.86_0.18_150)]" :
    s === "SHORT BIAS" ? "text-[oklch(0.82_0.2_25)]" :
    s === "VÁRJ RETESTRE" ? "text-[oklch(0.85_0.17_75)]" :
    "text-[oklch(0.85_0.17_75)]";
  return <span className={`text-[12px] font-bold tracking-wider ${cls}`}>{s}</span>;
}

function ActionBtn({ a }: { a: Action }) {
  const cls =
    a === "FIGYELD LONGRA" ? "zz-action-long" :
    a === "FIGYELD SHORTRA" ? "zz-action-short" :
    "zz-action-wait";
  return <button className={`zz-action ${cls} hover:brightness-110 transition`}>{a}</button>;
}

/* ---------- top stat cards ---------- */

function GaugeCard() {
  return (
    <div className="zz-card flex flex-col items-center justify-between px-6 py-4">
      <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">MARKET SENTIMENT</p>
      <div className="relative mt-1 h-[70px] w-[170px]">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          <defs>
            <linearGradient id="gg" x1="0" x2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.22 25)" />
              <stop offset="50%" stopColor="oklch(0.82 0.18 75)" />
              <stop offset="100%" stopColor="oklch(0.7 0.18 150)" />
            </linearGradient>
          </defs>
          <path d="M15,100 A85,85 0 0 1 185,100" stroke="oklch(0.3 0.03 250)" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M15,100 A85,85 0 0 1 185,100" stroke="url(#gg)" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="267" strokeDashoffset="0" />
          {/* needle at 68% */}
          <g transform="translate(100,100) rotate(32)">
            <line x1="0" y1="0" x2="0" y2="-78" stroke="oklch(0.96 0.01 250)" strokeWidth="2.5" strokeLinecap="round" />
            <circle r="5" fill="oklch(0.96 0.01 250)" />
          </g>
        </svg>
        <div className="absolute -bottom-1 left-0 text-[10px] text-muted-foreground">0%</div>
        <div className="absolute -bottom-1 right-0 text-[10px] text-muted-foreground">100%</div>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[15px] font-bold text-[oklch(0.78_0.2_150)]">BULLISH</span>
        <span className="text-[15px] font-bold">68%</span>
      </div>
    </div>
  );
}

function SessionCard() {
  return (
    <div className="zz-card flex flex-col items-center justify-between px-6 py-4">
      <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">SESSION</p>
      <Globe className="h-7 w-7 text-[oklch(0.78_0.14_235)]" />
      <p className="text-[15px] font-bold leading-tight">
        <span className="text-[oklch(0.78_0.14_235)]">London</span>{" "}
        <span className="text-[oklch(0.78_0.2_150)]">OPEN</span>
      </p>
      <p className="text-[18px] font-extrabold tracking-wide">12:45</p>
      <p className="text-[10px] text-muted-foreground">(GMT+1)</p>
    </div>
  );
}

function RiskCard() {
  return (
    <div className="zz-card flex flex-col items-center justify-between px-6 py-4">
      <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">RISK LEVEL</p>
      <ShieldCheck className="h-8 w-8 text-[oklch(0.78_0.14_235)]" />
      <p className="text-[18px] font-extrabold tracking-wider text-[oklch(0.85_0.17_75)]">KÖZEPES</p>
      <p className="text-[11px] text-muted-foreground">Volatilitás: 1.2x</p>
    </div>
  );
}

function NewsCard() {
  return (
    <div className="zz-card flex flex-col items-center justify-between px-6 py-4">
      <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">NEWS IMPACT</p>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-[oklch(0.78_0.14_235)]" />
        <p className="text-[13px] font-bold text-[oklch(0.82_0.2_25)]">Magas hatás: 2h 15m</p>
      </div>
      <p className="text-[14px] font-bold">USD CPI</p>
      <p className="text-[12px] text-muted-foreground">14:30 (GMT+1)</p>
      <div className="mt-1 flex items-center gap-1.5">
        {[1,1,1,0,0,0].map((on, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${on ? "bg-[oklch(0.78_0.17_75)]" : "bg-[oklch(0.32_0.03_250)]"}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------- main ---------- */

function Dashboard() {
  const [view, setView] = useState<ViewKey>("overview");
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-[230px] shrink-0 p-4 flex flex-col gap-4">
        <div className="zz-card px-4 py-5 flex flex-col items-center text-center">
          <img src={zozoLogo} alt="ZOZO SmartFlow" className="h-32 w-auto object-contain drop-shadow-[0_6px_22px_oklch(0.55_0.18_240/0.5)]" />
          <p className="mt-2 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground">FX Market Brief</p>
        </div>

        <nav className="zz-card p-2 flex flex-col gap-1">
          {sideItems.map(({ icon: Icon, label, key }) => {
            const active = key !== null && view === key;
            return (
              <button
                key={label}
                onClick={() => key && setView(key)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-bold tracking-wider transition
                  ${active
                    ? "bg-[oklch(0.3_0.05_250)] text-[oklch(0.78_0.14_235)] ring-1 ring-[oklch(0.45_0.08_240/0.5)]"
                    : "text-muted-foreground hover:bg-[oklch(0.27_0.03_250)] hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="zz-card px-4 py-4">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground">UTOLSÓ FRISSÍTÉS</p>
          <p className="mt-2 text-[22px] font-extrabold text-[oklch(0.78_0.14_235)]">12:45:21</p>
          <p className="text-[11px] text-muted-foreground">2025.05.19</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground">AUTO REFRESH</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.4_0.15_150)] px-2.5 py-1 text-[10px] font-bold text-white">
              ON <span className="h-3 w-3 rounded-full bg-white" />
            </span>
          </div>
        </div>

        <div className="zz-card px-4 py-4">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-[oklch(0.78_0.14_235)]" />
            <span className="text-[11px] font-bold tracking-[0.15em] text-muted-foreground">TELEGRAM ALERT</span>
          </div>
          <p className="mt-2 text-[14px] font-extrabold text-[oklch(0.78_0.2_150)]">AKTÍV</p>
          <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[oklch(0.78_0.2_150)]" /> Kapcsolat rendben
          </p>
        </div>
      </aside>

      {/* Center column */}
      <main className="flex-1 p-4 grid gap-4 grid-cols-1 xl:grid-cols-[1fr_320px]">
        {view === "daily" ? <DailyBriefPanel /> : <OverviewPanel />}

        {/* Right column */}
        <aside className="flex flex-col gap-4">
          <div className="zz-card p-4">
            <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.15em]">
              <Brain className="h-4 w-4 text-[oklch(0.78_0.16_305)]" /> AI ÖSSZEGZÉS
            </div>
            <p className="mt-3 text-[16px] font-extrabold text-[oklch(0.78_0.2_150)]">Bullish folytatás esélyes</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/80">
              Az USD gyengeség látható, EUR és GBP párok erősek. Várható retrace a következő FVG zónába. Figyeld a CHoCH szinteket M5/M3-on.
            </p>
            <button className="mt-4 w-full rounded-lg bg-[oklch(0.4_0.15_150)] py-2.5 text-[12px] font-extrabold tracking-[0.15em] text-white ring-1 ring-[oklch(0.55_0.15_150/0.7)] hover:brightness-110 transition">
              LONG BIAS
            </button>
          </div>

          <div className="zz-card p-4">
            <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.15em]">
              <Target className="h-4 w-4 text-[oklch(0.78_0.16_305)]" /> KULCS SZINTEK – EUR/USD
            </div>
            <ul className="mt-3 text-[12.5px]">
              {[
                ["HTF CHoCH","1.08950","text-foreground"],
                ["FVG ZÓNA","1.08720 – 1.08830","text-[oklch(0.78_0.2_150)]"],
                ["LIQUIDITY LOW","1.08510","text-foreground"],
                ["LIQUIDITY HIGH","1.09340","text-[oklch(0.78_0.2_150)]"],
              ].map(([k,v,c]) => (
                <li key={String(k)} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
                  <span className="font-bold text-muted-foreground">{k}</span>
                  <span className={`font-extrabold ${c}`}>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="zz-card p-4">
            <p className="text-[12px] font-bold tracking-[0.15em]">AJÁNLOTT FORGATÓKÖNYV</p>
            <ul className="mt-3 space-y-2.5 text-[12.5px]">
              {[
                [<Circle className="h-4 w-4 text-[oklch(0.85_0.17_75)]" />, "1. Retrace az FVG zónába"],
                [<Droplet className="h-4 w-4 text-[oklch(0.78_0.14_235)]" />, "2. Liquidity sweep (low)"],
                [<ArrowUpRight className="h-4 w-4 text-[oklch(0.78_0.2_150)]" />, "3. CHoCH M5/M3"],
                [<BarChart3 className="h-4 w-4 text-[oklch(0.78_0.14_235)]" />, "4. Bullish FVG kialakulás"],
                [<LogIn className="h-4 w-4 text-[oklch(0.78_0.2_150)]" />, "5. Belépés retestnél"],
              ].map(([icon,text],i) => (
                <li key={i} className="flex items-center gap-3 text-foreground/90">{icon}{text}</li>
              ))}
            </ul>
          </div>

          <div className="zz-card p-4">
            <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.15em]">
              <ShieldAlert className="h-4 w-4 text-[oklch(0.78_0.2_150)]" /> RISK MENEDZSMENT
            </div>
            <ul className="mt-3 text-[12.5px]">
              {[
                ["Javasolt kockázat / trade","1.0%","text-[oklch(0.78_0.2_150)]"],
                ["Napi max. kockázat","3.0%","text-[oklch(0.78_0.2_150)]"],
                ["Aktuális nyitott kockázat","0.8%","text-[oklch(0.78_0.2_150)]"],
                ["Ajánlott RR minimum","1:1.5","text-[oklch(0.78_0.2_150)]"],
              ].map(([k,v,c]) => (
                <li key={String(k)} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
                  <span className="font-bold text-muted-foreground">{k}</span>
                  <span className={`font-extrabold ${c}`}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ---------- Daily Brief ---------- */

interface BriefPair {
  symbol: string;
  bias: string;
  condition: string;
  confidence: number;
}
interface DailyBrief {
  last_updated: string;
  market_bias: string;
  macro_regime: string;
  headline: string;
  pairs: BriefPair[];
  risk: {
    market_risk: string;
    event_risk: string;
    recommended_exposure: string;
  };
}

function biasTone(b: string) {
  const v = b.toUpperCase();
  if (v.includes("BULL")) return { cls: "text-[oklch(0.82_0.2_150)]", Icon: TrendingUp };
  if (v.includes("BEAR")) return { cls: "text-[oklch(0.78_0.22_25)]", Icon: TrendingDown };
  return { cls: "text-[oklch(0.85_0.17_75)]", Icon: Minus };
}

function DailyBriefPanel() {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/briefs/daily_brief_latest.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("not ok");
        return r.json();
      })
      .then((data) => { if (!cancelled) setBrief(data); })
      .catch(() => { if (!cancelled) setError("Daily brief nem elérhető."); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="zz-card p-10 flex flex-col items-center justify-center text-center gap-3">
        <AlertTriangle className="h-10 w-10 text-[oklch(0.78_0.22_25)]" />
        <p className="text-[15px] font-bold text-[oklch(0.85_0.17_75)]">{error}</p>
        <p className="text-[12px] text-muted-foreground">Ellenőrizd a /briefs/daily_brief_latest.json fájlt.</p>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="zz-card p-10 text-center text-muted-foreground text-[13px]">Betöltés…</div>
    );
  }

  const bias = biasTone(brief.market_bias);

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Document header */}
      <div className="zz-card p-6 border border-border/60">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-[oklch(0.78_0.14_235)]">ZOZO SMARTFLOW</p>
            <h1 className="mt-1 text-[22px] font-extrabold tracking-tight">DAILY MARKET BRIEF</h1>
            <p className="mt-1 text-[11px] text-muted-foreground">Institutional FX & Macro Snapshot</p>
          </div>
          <img src={zozoLogo} alt="ZOZO" className="h-14 w-auto object-contain opacity-90" />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="rounded-md bg-[oklch(0.18_0.03_250)] ring-1 ring-border/60 px-3 py-2.5">
            <p className="font-bold tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> LAST UPDATED
            </p>
            <p className="mt-1 text-[13px] font-extrabold text-foreground">{brief.last_updated}</p>
          </div>
          <div className="rounded-md bg-[oklch(0.18_0.03_250)] ring-1 ring-border/60 px-3 py-2.5">
            <p className="font-bold tracking-[0.18em] text-muted-foreground">MARKET BIAS</p>
            <p className={`mt-1 text-[13px] font-extrabold flex items-center gap-1.5 ${bias.cls}`}>
              <bias.Icon className="h-3.5 w-3.5" /> {brief.market_bias}
            </p>
          </div>
          <div className="rounded-md bg-[oklch(0.18_0.03_250)] ring-1 ring-border/60 px-3 py-2.5">
            <p className="font-bold tracking-[0.18em] text-muted-foreground">MACRO REGIME</p>
            <p className="mt-1 text-[13px] font-extrabold text-[oklch(0.78_0.14_235)]">{brief.macro_regime}</p>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="zz-card p-5">
        <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">HEADLINE</p>
        <p className="mt-2 text-[16px] leading-relaxed font-semibold text-foreground/95">
          “{brief.headline}”
        </p>
      </div>

      {/* Instrument cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {brief.pairs.slice(0, 4).map((p) => {
          const tone = biasTone(p.bias);
          return (
            <div key={p.symbol} className="zz-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-extrabold tracking-wide">{p.symbol}</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold tracking-[0.15em] ${tone.cls}`}>
                  <tone.Icon className="h-3.5 w-3.5" /> {p.bias}
                </span>
              </div>
              <p className="mt-2 text-[12.5px] text-foreground/80 leading-relaxed">{p.condition}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-muted-foreground">
                  <span>CONFIDENCE</span>
                  <span className="text-foreground">{p.confidence}/10</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[oklch(0.22_0.03_250)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.15_240)] to-[oklch(0.78_0.18_150)]"
                    style={{ width: `${Math.max(0, Math.min(10, p.confidence)) * 10}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk management */}
      <div className="zz-card p-5">
        <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.2em]">
          <ShieldAlert className="h-4 w-4 text-[oklch(0.78_0.2_150)]" /> RISK MANAGEMENT
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
          <div className="rounded-md bg-[oklch(0.18_0.03_250)] ring-1 ring-border/60 px-3 py-3">
            <p className="font-bold tracking-[0.18em] text-muted-foreground text-[10px]">MARKET RISK</p>
            <p className="mt-1.5 text-[14px] font-extrabold text-[oklch(0.85_0.17_75)]">{brief.risk.market_risk}</p>
          </div>
          <div className="rounded-md bg-[oklch(0.18_0.03_250)] ring-1 ring-border/60 px-3 py-3">
            <p className="font-bold tracking-[0.18em] text-muted-foreground text-[10px]">EVENT RISK</p>
            <p className="mt-1.5 text-[14px] font-extrabold text-[oklch(0.78_0.22_25)]">{brief.risk.event_risk}</p>
          </div>
          <div className="rounded-md bg-[oklch(0.18_0.03_250)] ring-1 ring-border/60 px-3 py-3">
            <p className="font-bold tracking-[0.18em] text-muted-foreground text-[10px]">RECOMMENDED EXPOSURE</p>
            <p className="mt-1.5 text-[14px] font-extrabold text-[oklch(0.78_0.2_150)]">{brief.risk.recommended_exposure}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] tracking-[0.25em] text-muted-foreground py-2">
        © ZOZO SMARTFLOW — FOR INTERNAL USE ONLY
      </p>
    </div>
  );
}
