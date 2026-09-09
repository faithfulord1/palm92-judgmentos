import { useMemo, useState } from 'react';
import { ShieldCheck, FileSearch, Gauge, ScrollText, CheckCircle2, AlertTriangle } from 'lucide-react';

type Check = { id: string; label: string; done: boolean };

type Audit = { at: string; actor: string; action: string; detail: string };

const initialChecks: Check[] = [
  { id: 'policy', label: 'Policy identity confirmed', done: false },
  { id: 'insured', label: 'Insured party confirmed', done: false },
  { id: 'cover', label: 'Policy coverage amount confirmed', done: false },
  { id: 'lease', label: 'Lease requirement confirmed', done: false },
  { id: 'evidence', label: 'Source evidence reviewed', done: false },
  { id: 'math', label: '£5m discrepancy calculation confirmed', done: false },
];

const evidence = [
  { kind: 'Fact', claim: 'Lease requires £10,000,000 public liability cover', source: 'Demo Lease Agreement · insurance clause', confidence: 99 },
  { kind: 'Fact', claim: 'Insurance policy provides £5,000,000 public liability cover', source: 'Demo Insurance Schedule · liability section', confidence: 99 },
  { kind: 'Fact', claim: 'Coverage shortfall is £5,000,000', source: 'Deterministic comparison: £10m − £5m', confidence: 100 },
  { kind: 'Inference', claim: 'The policy does not satisfy the seeded lease requirement', source: 'Comparison of the two verified facts above', confidence: 98 },
  { kind: 'Recommendation', claim: 'Escalate for human review before any acceptance, notification or ERP action', source: 'JudgmentOS high-consequence delegation rule', confidence: 100 },
];

export default function App() {
  const [checks, setChecks] = useState(initialChecks);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Approved' | 'Rejected' | 'Escalated'>('Pending');
  const [audit, setAudit] = useState<Audit[]>([
    { at: new Date(Date.now() - 35 * 60000).toISOString(), actor: 'LeaseGuard AI', action: 'Analysis completed', detail: 'Detected £5m shortfall and routed case to human approval.' },
    { at: new Date(Date.now() - 36 * 60000).toISOString(), actor: 'System', action: 'Delegation contract enforced', detail: 'Autonomous approval, rejection, customer notification and ERP posting prohibited.' },
  ]);

  const allVerified = useMemo(() => checks.every((c) => c.done), [checks]);
  const completeness = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  function decide(next: 'Approved' | 'Rejected' | 'Escalated') {
    if (!allVerified) {
      setAudit((a) => [{ at: new Date().toISOString(), actor: 'System', action: 'Decision blocked', detail: 'Required verification checks are incomplete.' }, ...a]);
      return;
    }
    if (!note.trim()) return;
    const previous = status;
    setStatus(next);
    setAudit((a) => [{ at: new Date().toISOString(), actor: 'Head of Property Risk', action: next, detail: `${previous} → ${next}. Reason: ${note.trim()}` }, ...a]);
    setNote('');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><ScrollText size={18}/><div><strong>Palm92</strong><span>JudgmentOS</span></div></div>
        <nav>
          <a className="active" href="#case">LeaseGuard flagship</a>
          <a href="#contract">Delegation contract</a>
          <a href="#evidence">Evidence & provenance</a>
          <a href="#approval">Human approval</a>
          <a href="#evaluation">Evaluation</a>
        </nav>
        <p className="motto">AI investigates.<br/>Humans decide.</p>
      </aside>

      <main>
        <header className="topbar">
          <div><p className="eyebrow">Palm92 LeaseGuard AI</p><h1>Insurance coverage exception review</h1></div>
          <span className="badge high">High consequence</span>
        </header>

        <section id="case" className="hero-card">
          <div><p className="eyebrow">Executive summary</p><h2>Required cover £10m. Policy cover £5m. <span>£5m shortfall.</span></h2>
          <p>High-consequence exception. Human decision required before any customer, contractual, ERP or financial action.</p></div>
          <div className="status-card"><span>Approval status</span><strong>{status}</strong><small>Verification {completeness}% complete</small></div>
        </section>

        <section id="contract" className="grid two">
          <article className="panel"><div className="panel-title"><ShieldCheck size={18}/><h3>Delegation Contract</h3></div>
            <dl>
              <dt>Outcome</dt><dd>Determine whether the supplied policy satisfies the seeded lease insurance requirement.</dd>
              <dt>AI may</dt><dd>Extract, compare, explain and recommend.</dd>
              <dt>AI may not</dt><dd>Approve/reject policy, contact customer, post to ERP, create financial commitment, alter contract record.</dd>
              <dt>Human approver</dt><dd>Head of Property Risk</dd>
              <dt>Stop condition</dt><dd>Missing material evidence, ambiguous coverage or verification failure.</dd>
            </dl>
          </article>
          <article className="panel"><div className="panel-title"><AlertTriangle size={18}/><h3>Consequence model</h3></div>
            <div className="risk-row"><span>Low</span><p>AI can act within reversible, low-impact boundaries.</p></div>
            <div className="risk-row"><span>Medium</span><p>AI acts with monitoring and exception review.</p></div>
            <div className="risk-row active-risk"><span>High</span><p>Human approval required before consequential action.</p></div>
            <div className="risk-row"><span>Critical</span><p>Strict controls, evidence and potentially multiple approvals.</p></div>
          </article>
        </section>

        <section id="evidence" className="panel">
          <div className="panel-title"><FileSearch size={18}/><h3>Evidence, facts and assumptions</h3></div>
          <div className="evidence-list">{evidence.map((e) => <div className="evidence" key={e.claim}><span className={`kind ${e.kind.toLowerCase()}`}>{e.kind}</span><div><strong>{e.claim}</strong><p>{e.source}</p></div><b>{e.confidence}%</b></div>)}</div>
        </section>

        <section id="approval" className="grid two">
          <article className="panel"><div className="panel-title"><CheckCircle2 size={18}/><h3>Verification checklist</h3></div>
            <div className="checklist">{checks.map((c) => <label key={c.id}><input type="checkbox" checked={c.done} onChange={() => setChecks((x) => x.map((i) => i.id === c.id ? {...i, done: !i.done} : i))}/><span>{c.label}</span></label>)}</div>
            <div className="progress"><div style={{width: `${completeness}%`}}/></div><small>{completeness}% verified. Approval remains blocked until all required checks pass.</small>
          </article>
          <article className="panel"><div className="panel-title"><ShieldCheck size={18}/><h3>Human decision</h3></div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mandatory rationale for consequential decision" />
            <div className="actions"><button onClick={() => decide('Approved')}>Approve recommendation</button><button className="secondary" onClick={() => decide('Escalated')}>Escalate</button><button className="danger" onClick={() => decide('Rejected')}>Reject</button></div>
            {!allVerified && <p className="warning">Complete all verification checks first.</p>}
            {allVerified && !note.trim() && <p className="warning">Add a decision rationale before acting.</p>}
          </article>
        </section>

        <section id="evaluation" className="grid two">
          <article className="panel"><div className="panel-title"><Gauge size={18}/><h3>Continue / Improve / Stop</h3></div>
            <div className="recommendation"><span>Current recommendation</span><strong>IMPROVE</strong><p>Control design is working, but this seeded high-consequence case remains incomplete until human verification and decision are recorded.</p></div>
          </article>
          <article className="panel"><div className="panel-title"><ScrollText size={18}/><h3>Audit timeline</h3></div>
            <div className="timeline">{audit.map((a, i) => <div key={`${a.at}-${i}`}><strong>{a.action}</strong><p>{a.detail}</p><small>{a.actor} · {new Date(a.at).toLocaleString()}</small></div>)}</div>
          </article>
        </section>

        <footer>Demo environment. Illustrative data only. No legal, insurance, regulatory, compliance or financial correctness is guaranteed.</footer>
      </main>
    </div>
  );
}
