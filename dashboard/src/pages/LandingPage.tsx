import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

interface FlagRow {
  key: string;
  description: string;
  on: boolean;
  rollout: number;
}

const INITIAL_FLAGS: FlagRow[] = [
  {
    key: "dark_mode",
    description: "Dark theme across the app",
    on: true,
    rollout: 82,
  },
  {
    key: "new_checkout",
    description: "Redesigned payment flow",
    on: true,
    rollout: 45,
  },
  {
    key: "beta_search",
    description: "Vector-based search",
    on: false,
    rollout: 12,
  },
  {
    key: "premium_badge",
    description: "Subscriber profile badge",
    on: true,
    rollout: 100,
  },
  {
    key: "ai_recommendations",
    description: "Recommendation engine",
    on: false,
    rollout: 5,
  },
  {
    key: "legacy_api_killswitch",
    description: "Disable old REST endpoints",
    on: false,
    rollout: 0,
  },
];

function useSwitchboard() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlags((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((f, i) => (i === idx ? { ...f, on: !f.on } : f));
      });
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return flags;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const flags = useSwitchboard();

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md grain-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold landing-mono">T</span>
          </div>
          <span className="landing-display font-semibold text-lg tracking-tight">
            Tana
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="hidden sm:block text-sm text-[#4B5468] hover:text-[#12141C] transition-colors"
          >
            How it works
          </a>
          <a
            href="https://github.com/constantine950/tana-feature-flags"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:block text-sm text-[#4B5468] hover:text-[#12141C] transition-colors"
          >
            Source
          </a>
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-[#12141C] hover:text-[#2C5CF6] transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm font-medium text-white bg-[#12141C] hover:bg-[#2C5CF6] px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 landing-mono text-xs tracking-wide text-[#2C5CF6] bg-[#EAF0FF] border border-[#D3DEFC] rounded-full px-3 py-1 mb-6">
            <span className="pulse-dot" />
            DEPLOY WITHOUT FEAR
          </div>
          <h1 className="landing-display text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            Ship the code.
            <br />
            Flip it live.
          </h1>
          <p className="text-lg text-[#4B5468] max-w-md mb-8 leading-relaxed">
            Tana separates deploy from release. Merge behind a flag, roll out by
            percentage, target real users — and pull it back in under a second
            if something breaks.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="text-sm font-medium text-white bg-[#2C5CF6] hover:bg-[#1E4AE0] px-5 py-3 rounded-lg transition-colors"
            >
              Start for free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-[#12141C] border border-[#DCE2EA] hover:border-[#B5BCC9] bg-white px-5 py-3 rounded-lg transition-colors"
            >
              I have an account
            </button>
          </div>
          <p className="landing-mono text-xs text-[#8A93A6] mt-6">
            &lt;50ms evaluation · server-side rules · zero redeploys
          </p>
        </div>

        {/* Signature: live switchboard */}
        <div className="switchboard px-2 py-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEF1F5]">
            <span className="landing-mono text-xs text-[#8A93A6]">
              production · flags
            </span>
            <span className="landing-mono text-xs text-[#8A93A6]">live</span>
          </div>
          {flags.map((flag) => (
            <div
              key={flag.key}
              className="switch-row flex items-center gap-4 px-4 py-4"
            >
              <span className={`pulse-dot ${flag.on ? "" : "is-off"}`} />
              <div className="flex-1 min-w-0">
                <div className="landing-mono text-sm text-[#12141C] truncate">
                  {flag.key}
                </div>
                <div className="text-xs text-[#8A93A6] truncate">
                  {flag.description}
                </div>
              </div>
              <div className="w-16 hidden sm:block">
                <div className="rollout-bar">
                  <div
                    className="rollout-fill"
                    style={{ width: `${flag.on ? flag.rollout : 0}%` }}
                  />
                </div>
                <div className="landing-mono text-[10px] text-[#8A93A6] mt-1 text-right">
                  {flag.on ? flag.rollout : 0}%
                </div>
              </div>
              <div className={`switch-track ${flag.on ? "is-on" : ""}`}>
                <div className="switch-thumb" />
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Features */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="switchboard p-6">
            <div className="landing-mono text-xs text-[#2C5CF6] mb-3">
              01 · rollout
            </div>
            <h3 className="landing-display font-semibold text-lg mb-2">
              Progressive rollout
            </h3>
            <p className="text-sm text-[#4B5468] leading-relaxed">
              Move a flag from 0% to 100% on your own schedule, with
              deterministic bucketing so the same user always lands on the same
              side.
            </p>
          </div>
          <div className="switchboard p-6">
            <div className="landing-mono text-xs text-[#2C5CF6] mb-3">
              02 · targeting
            </div>
            <h3 className="landing-display font-semibold text-lg mb-2">
              User targeting
            </h3>
            <p className="text-sm text-[#4B5468] leading-relaxed">
              Whitelist your team, blacklist a flaky account, or combine both
              with a percentage rule — evaluated server-side so rules stay
              private.
            </p>
          </div>
          <div className="switchboard p-6">
            <div className="landing-mono text-xs text-[#2C5CF6] mb-3">
              03 · kill switch
            </div>
            <h3 className="landing-display font-semibold text-lg mb-2">
              Instant kill switch
            </h3>
            <p className="text-sm text-[#4B5468] leading-relaxed">
              Something's on fire? Toggle it off from the dashboard. No
              redeploy, no rollback — just an update your app already polls for.
            </p>
          </div>
        </div>
      </section>

      {/* Code sample */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="switchboard overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#EEF1F5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DCE2EA]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#DCE2EA]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#DCE2EA]" />
            <span className="landing-mono text-xs text-[#8A93A6] ml-2">
              checkout.ts
            </span>
          </div>
          <pre className="landing-mono text-sm leading-relaxed p-6 overflow-x-auto text-[#12141C]">
            {`import { TanaClient } from "@tana/feature-flags-sdk";

const tana = new TanaClient({ apiKey: process.env.TANA_KEY });

if (await tana.isEnabled("new_checkout", userId)) {
  return renderNewCheckout();
}
return renderLegacyCheckout();`}
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-[#E4E9F0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="landing-mono text-xs text-[#8A93A6]">
          Tana Feature Flags
        </span>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/constantine950/tana-feature-flags"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#4B5468] hover:text-[#12141C] transition-colors"
          >
            GitHub
          </a>
          <button
            onClick={() => navigate("/register")}
            className="text-xs font-medium text-[#2C5CF6] hover:text-[#1E4AE0] transition-colors"
          >
            Get started →
          </button>
        </div>
      </footer>
    </div>
  );
}
