import { useMemo, useState } from "react";
import "./App.css";

const DEFAULTS = {
  context: "I have two job offers.",
  optionA: "Offer A: higher salary, longer commute",
  optionB: "Offer B: lower salary, remote",
  constraints: "I value learning and work-life balance",
};

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

function Card({ title, right, children }) {
  return (
    <div className="card">
      {(title || right) && (
        <div className="cardHeader">
          <div className="cardTitle">{title}</div>
          <div className="cardRight">{right}</div>
        </div>
      )}
      <div className="cardBody">{children}</div>
    </div>
  );
}

function Label({ children }) {
  return <div className="label">{children}</div>;
}

function Textarea({ value, onChange, rows = 4, placeholder }) {
  return (
    <textarea
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
    />
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function ChoiceBadge({ choice }) {
  const c = (choice || "Depends").toLowerCase();
  return <span className={clsx("badge", `badge-${c}`)}>{choice || "Depends"}</span>;
}

function Skeleton() {
  return (
    <div className="skeleton">
      <div className="skLine w60" />
      <div className="skLine w90" />
      <div className="skLine w80" />
      <div className="skLine w70" />
      <div className="skLine w50" />
    </div>
  );
}

function List({ items }) {
  if (!items?.length) return <div className="muted">—</div>;
  return (
    <ul className="list">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [context, setContext] = useState(DEFAULTS.context);
  const [optionA, setOptionA] = useState(DEFAULTS.optionA);
  const [optionB, setOptionB] = useState(DEFAULTS.optionB);
  const [constraints, setConstraints] = useState(DEFAULTS.constraints);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pros"); // pros | cons

  const canRun = useMemo(() => context.trim() && optionA.trim() && optionB.trim(), [context, optionA, optionB]);

  const recommendation = result?.recommendation;
  const confidence = result?.confidence;
  const choice = recommendation?.choice || "Depends";
  const score = typeof confidence?.score === "number" ? confidence.score : null;

  async function onExplain() {
    setError("");
    setResult(null);
    setRaw("");
    setLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, optionA, optionB, constraints }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ? `${data.error}` : "Request failed";
        const details = data?.details ? JSON.stringify(data.details, null, 2) : "";
        throw new Error(details ? `${msg}\n\n${details}` : msg);
      }

      setResult(data);
      setRaw(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setContext(DEFAULTS.context);
    setOptionA(DEFAULTS.optionA);
    setOptionB(DEFAULTS.optionB);
    setConstraints(DEFAULTS.constraints);
    setResult(null);
    setRaw("");
    setError("");
    setTab("pros");
  }

  async function onCopy() {
    if (!raw) return;
    await navigator.clipboard.writeText(raw);
  }

  function onDownload() {
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decisionlens-output.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <div className="bgGlow" />

      <header className="header">
        <div className="brand">
          <div className="logo">DL</div>
          <div>
            <div className="brandName">DecisionLens</div>
            <div className="brandTag">AI decision explainer with structured reasoning & guardrails</div>
          </div>
        </div>

        <div className="headerRight">
          <Pill>Serverless</Pill>
          <Pill>OpenAI</Pill>
          <Pill>Vercel</Pill>
        </div>
      </header>

      <main className="grid">
        <section className="left">
          <Card
            title="Decision input"
            right={
              <div className="mutedSmall">
                Required: <b>Context</b>, <b>Option A</b>, <b>Option B</b>
              </div>
            }
          >
            <div className="field">
              <Label>Context</Label>
              <Textarea value={context} onChange={setContext} rows={3} placeholder="What decision are you making?" />
            </div>

            <div className="twoCol">
              <div className="field">
                <Label>Option A</Label>
                <Textarea value={optionA} onChange={setOptionA} rows={4} placeholder="Describe option A..." />
              </div>
              <div className="field">
                <Label>Option B</Label>
                <Textarea value={optionB} onChange={setOptionB} rows={4} placeholder="Describe option B..." />
              </div>
            </div>

            <div className="field">
              <Label>Constraints (optional)</Label>
              <Input value={constraints} onChange={setConstraints} placeholder="Budget, timeline, priorities, etc." />
            </div>

            <div className="actions">
              <button className="btnPrimary" onClick={onExplain} disabled={!canRun || loading}>
                {loading ? "Explaining…" : "Explain decision"}
              </button>
              <button className="btnGhost" onClick={onReset} disabled={loading}>
                Reset
              </button>

              <div className="spacer" />

              <button className="btnGhost" onClick={onCopy} disabled={!raw || loading}>
                Copy JSON
              </button>
              <button className="btnGhost" onClick={onDownload} disabled={!raw || loading}>
                Download
              </button>
            </div>

            {error && (
              <div className="errorBox">
                <div className="errorTitle">Request failed</div>
                <pre className="errorText">{error}</pre>
              </div>
            )}
          </Card>

          <Card title="What makes this “FAANG signal”">
            <div className="signal">
              <div className="signalItem">
                <div className="signalTop">Structured output</div>
                <div className="mutedSmall">JSON schema for predictable downstream use.</div>
              </div>
              <div className="signalItem">
                <div className="signalTop">Guardrails</div>
                <div className="mutedSmall">Missing info + no invented facts.</div>
              </div>
              <div className="signalItem">
                <div className="signalTop">Production deploy</div>
                <div className="mutedSmall">Serverless API + env vars + Vercel.</div>
              </div>
            </div>
          </Card>
        </section>

        <section className="right">
          <Card
            title="Recommendation"
            right={
              <div className="recRight">
                <ChoiceBadge choice={choice} />
                {score !== null && <Pill>Confidence {score}/100</Pill>}
              </div>
            }
          >
            {loading && <Skeleton />}
            {!loading && !result && <div className="muted">Run an explanation to see results here.</div>}
            {!loading && result && (
              <>
                <div className="recSummary">{recommendation?.summary}</div>
                <div className="recWhy">{confidence?.why}</div>
                <div className="divider" />

                <div className="tabs">
                  <button className={clsx("tab", tab === "pros" && "tabActive")} onClick={() => setTab("pros")}>
                    Pros
                  </button>
                  <button className={clsx("tab", tab === "cons" && "tabActive")} onClick={() => setTab("cons")}>
                    Cons
                  </button>
                </div>

                <div className="twoCol">
                  <div>
                    <div className="subTitle">Option A</div>
                    <List items={tab === "pros" ? result?.pros?.A : result?.cons?.A} />
                  </div>
                  <div>
                    <div className="subTitle">Option B</div>
                    <List items={tab === "pros" ? result?.pros?.B : result?.cons?.B} />
                  </div>
                </div>

                <div className="divider" />

                <div className="twoCol">
                  <div>
                    <div className="subTitle">Risks</div>
                    <List items={result?.risks} />
                  </div>
                  <div>
                    <div className="subTitle">Missing info</div>
                    <List items={result?.missing_info} />
                  </div>
                </div>

                <div className="divider" />

                <div>
                  <div className="subTitle">Next actions (7 days)</div>
                  <List items={result?.next_actions_7_days} />
                </div>
              </>
            )}
          </Card>

          <Card title="Raw JSON (recruiter-friendly)">
            {loading && <Skeleton />}
            {!loading && !raw && <div className="muted">Raw JSON will appear after you run an explanation.</div>}
            {!loading && raw && <pre className="code">{raw}</pre>}
          </Card>
        </section>
      </main>

      <footer className="footer">
        Built by <b>José Horta</b> • React + Vite • Vercel Serverless • OpenAI
      </footer>
    </div>
  );
}
