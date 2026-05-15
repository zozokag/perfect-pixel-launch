import { createFileRoute } from "@tanstack/react-router";
import {
  Home, Calendar, Bell, LineChart, Star, FileText, Settings,
  Globe, ShieldCheck, CalendarDays, Brain, Target, ShieldAlert,
  Send, Circle, Droplet, ArrowUpRight, BarChart3, LogIn,
  Check, X, CircleDot,
} from "lucide-react";

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
const sideItems = [
  { icon: Home, label: "ÁTTEKINTÉS", active: true },
  { icon: Calendar, label: "ECONOMIC CALENDAR" },
  { icon: Bell, label: "ALERT NAPLÓ" },
  { icon: LineChart, label: "JELZÉSEK" },
  { icon: Star, label: "ÉRTÉKELÉS" },
  { icon: FileText, label: "NAPI ELEMZÉS" },
  { icon: Settings, label: "BEÁLLÍTÁSOK" },
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
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-[230px] shrink-0 p-4 flex flex-col gap-4">
        <div className="zz-card px-4 py-5 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <BarChart3 className="h-9 w-9 text-[oklch(0.78_0.14_235)]" />
              <div className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-[oklch(0.78_0.14_235)] blur-[2px]" />
            </div>
            <div className="leading-none text-left">
              <p className="text-[18px] font-extrabold tracking-tight text-[oklch(0.78_0.14_235)]">ZOZO</p>
              <p className="text-[15px] font-extrabold tracking-tight text-[oklch(0.96_0.01_250)] -mt-0.5">SmartFlow</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground">FX Market Brief</p>
        </div>

        <nav className="zz-card p-2 flex flex-col gap-1">
          {sideItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-bold tracking-wider transition
                ${active
                  ? "bg-[oklch(0.3_0.05_250)] text-[oklch(0.78_0.14_235)] ring-1 ring-[oklch(0.45_0.08_240/0.5)]"
                  : "text-muted-foreground hover:bg-[oklch(0.27_0.03_250)] hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
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
        <div className="flex flex-col gap-4 min-w-0">
          {/* Top stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GaugeCard />
            <SessionCard />
            <RiskCard />
            <NewsCard />
          </div>

          {/* Pairs table */}
          <div className="zz-card p-4">
            <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.7fr_1.1fr_1.2fr_1.3fr] items-center gap-3 border-b border-border/60 pb-3 text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="text-[oklch(0.78_0.14_235)]">▸</span> PÁR</div>
              <div>HTF BIAS</div>
              <div className="text-center">SWEEP</div>
              <div className="text-center">CHoCH</div>
              <div className="text-center">FVG</div>
              <div>TREND ERŐ</div>
              <div>STÁTUSZ</div>
              <div>TEENDŐ</div>
            </div>

            {rows.map((r) => (
              <div
                key={r.pair}
                className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.7fr_1.1fr_1.2fr_1.3fr] items-center gap-3 border-b border-border/40 py-3 last:border-0 hover:bg-[oklch(0.26_0.035_250/0.5)] transition rounded-md px-1"
              >
                <div className="flex items-center gap-2.5">
                  <Star className="h-4 w-4 fill-[oklch(0.78_0.17_75)] text-[oklch(0.78_0.17_75)]" />
                  <span className="text-[14px] font-bold">{r.pair}</span>
                </div>
                <div>{biasChip(r.bias)}</div>
                <div className="flex justify-center"><MarkIcon m={r.sweep} /></div>
                <div className="flex justify-center"><MarkIcon m={r.choch} /></div>
                <div className="flex justify-center"><MarkIcon m={r.fvg} /></div>
                <div><TrendBars t={r.trend} /></div>
                <div><StatusPill s={r.status} /></div>
                <div><ActionBtn a={r.action} /></div>
              </div>
            ))}

            <div className="mt-3 flex items-center gap-6 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[oklch(0.78_0.2_150)]" strokeWidth={3} /> Van</span>
              <span className="inline-flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-[oklch(0.68_0.22_25)]" strokeWidth={3} /> Nincs</span>
              <span className="inline-flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5 text-[oklch(0.78_0.17_75)]" /> Részleges</span>
            </div>
          </div>

          {/* Bottom: alerts / chart / quick status */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr_0.9fr] gap-4">
            <div className="zz-card p-4">
              <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.15em]">
                <Bell className="h-4 w-4 text-[oklch(0.78_0.14_235)]" /> LEGUTÓBBI ALERT-ek
              </div>
              <ul className="mt-4 space-y-3 text-[12px]">
                {[
                  ["12:44","EUR/USD – Long setup forming","g"],
                  ["12:41","GBP/USD – CHoCH detected","g"],
                  ["12:38","USD/CHF – Short bias detected","r"],
                  ["12:35","XAU/USD – FVG retest folyamatban","y"],
                  ["12:31","USD/JPY – Várj retestre","y"],
                ].map(([t,msg,c]) => (
                  <li key={t} className="grid grid-cols-[52px_1fr] items-center gap-3">
                    <span className={`font-bold ${c==="g"?"text-[oklch(0.78_0.2_150)]":c==="r"?"text-[oklch(0.7_0.22_25)]":"text-[oklch(0.85_0.17_75)]"}`}>{t}</span>
                    <span className="text-foreground/90">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="zz-card p-4">
              <p className="text-[12px] font-bold tracking-[0.15em]">
                CHART ELŐNÉZET – <span className="text-[oklch(0.78_0.14_235)]">EUR/USD (H1)</span>
              </p>
              <div className="mt-3 h-[230px] rounded-lg bg-[oklch(0.14_0.03_250)] ring-1 ring-border relative overflow-hidden p-3">
                <svg viewBox="0 0 400 220" className="h-full w-full">
                  {/* candles */}
                  {[
                    [20,40,90,30,"r"],[35,60,110,50,"r"],[50,80,140,70,"r"],
                    [65,90,150,85,"r"],[80,110,160,100,"g"],[95,120,150,110,"r"],
                    [110,130,170,125,"r"],[125,140,180,135,"r"],[140,150,190,145,"g"],
                    [155,140,180,135,"g"],[170,130,170,125,"g"],[185,120,160,115,"g"],
                    [200,115,155,108,"g"],[215,108,150,100,"g"],[230,100,140,95,"g"],
                  ].map(([x,h,l,c,col],i) => {
                    const color = col === "g" ? "oklch(0.7 0.18 150)" : "oklch(0.65 0.22 25)";
                    const top = Math.min(Number(h), Number(c));
                    const bot = Math.max(Number(h), Number(c));
                    return (
                      <g key={i}>
                        <line x1={Number(x)+4} x2={Number(x)+4} y1={Number(h)-15} y2={Number(l)+5} stroke={color} strokeWidth={1} />
                        <rect x={Number(x)} y={top} width={9} height={Math.max(4, bot-top)} fill={color} />
                      </g>
                    );
                  })}
                  {/* CHoCH line */}
                  <line x1="120" y1="115" x2="380" y2="115" stroke="oklch(0.96 0.01 250)" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="195" y="110" fill="oklch(0.96 0.01 250)" fontSize="10" fontWeight="700">CHoCH</text>
                  {/* trend arrow */}
                  <path d="M250,150 L320,90 L300,90 M320,90 L320,110" stroke="oklch(0.96 0.01 250)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                </svg>
                <div className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-md bg-[oklch(0.4_0.15_150/0.6)] px-3 py-1.5 ring-1 ring-[oklch(0.55_0.15_150/0.6)]">
                  <span className="text-[11px] font-bold text-[oklch(0.9_0.18_150)]">FVG ZÓNA</span>
                </div>
              </div>
            </div>

            <div className="zz-card p-4">
              <p className="text-[12px] font-bold tracking-[0.15em]">GYORS STÁTUSZ</p>
              <ul className="mt-4 space-y-3 text-[13px]">
                {[
                  ["Long setup", 3, "text-[oklch(0.78_0.2_150)]"],
                  ["Short setup", 1, "text-[oklch(0.7_0.22_25)]"],
                  ["Várj retestre", 2, "text-[oklch(0.85_0.17_75)]"],
                  ["Nincs tiszta setup", 0, "text-muted-foreground"],
                  ["Összes megfigyelt pár", 6, "text-[oklch(0.78_0.14_235)]"],
                ].map(([k,v,c]) => (
                  <li key={String(k)} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                    <span className={`font-bold ${c}`}>{k}</span>
                    <span className={`font-extrabold ${c}`}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

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
