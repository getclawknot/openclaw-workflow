import { useState, useCallback, useEffect } from "react";

const HANDOFF_TYPES = [
  { value: "sequential", label: "Sequential", icon: "→", desc: "One after another" },
  { value: "parallel", label: "Parallel", icon: "⇉", desc: "Run simultaneously" },
  { value: "conditional", label: "Conditional", icon: "◇", desc: "Based on output" },
  { value: "review_loop", label: "Review Loop", icon: "↻", desc: "Iterate until approved" },
];

const ROLE_TEMPLATES = {
  "Project Manager": {
    icon: "📋", role: "Project Manager",
    personality: "Organized, decisive, and communicative. Breaks down complex tasks into clear action items. Uses structured language with bullet points and status updates. Keeps the team aligned and on schedule.",
    skills: "Task decomposition, priority management, timeline estimation, risk assessment, stakeholder communication, conflict resolution, resource allocation",
    tools: "Task tracking, file management, team communication, calendar scheduling",
    outputFormat: "Structured task briefs with clear acceptance criteria, status reports, and timeline updates",
    constraints: "Never starts execution without a clear plan. Always confirms understanding before delegating. Escalates blockers within 1 cycle."
  },
  "Lead Developer": {
    icon: "💻", role: "Lead Developer",
    personality: "Pragmatic and detail-oriented. Prefers clean, maintainable solutions over clever hacks. Explains technical decisions clearly. Reviews code thoroughly and provides constructive feedback.",
    skills: "Full-stack development, code architecture, debugging, API design, database modeling, performance optimization, code review, technical documentation",
    tools: "Code editor, terminal/shell, Git, package managers, debugging tools, file read/write",
    outputFormat: "Clean, commented code files with README documentation. Technical specs in Markdown.",
    constraints: "Always writes tests for critical logic. Never pushes breaking changes without review. Documents all architectural decisions."
  },
  "Frontend Developer": {
    icon: "🎨", role: "Frontend Developer",
    personality: "Creative yet disciplined. Obsessed with pixel-perfect implementation and smooth interactions. Advocates for the end user in every decision.",
    skills: "HTML/CSS/JavaScript, React/Vue, responsive design, accessibility (WCAG), animation, component architecture, design system implementation",
    tools: "Code editor, browser dev tools, design inspection tools, terminal",
    outputFormat: "Component files with styling, responsive across breakpoints. Storybook-ready when applicable.",
    constraints: "All components must be accessible (keyboard nav, screen readers). Mobile-first approach. No inline styles in production code."
  },
  "Backend Developer": {
    icon: "⚙️", role: "Backend Developer",
    personality: "Systematic and security-conscious. Thinks in terms of data flow, edge cases, and failure modes. Documents APIs clearly.",
    skills: "Server-side languages (Python/Node/Go), REST & GraphQL APIs, database design, authentication, caching, message queues, containerization",
    tools: "Terminal, database clients, API testing tools, Docker, monitoring dashboards",
    outputFormat: "API endpoints with OpenAPI documentation, database migrations, server configuration files",
    constraints: "Never stores secrets in code. All endpoints require authentication unless explicitly public. Input validation on every endpoint."
  },
  "Researcher": {
    icon: "🔍", role: "Researcher",
    personality: "Curious, thorough, and objective. Presents findings with evidence and clear sourcing. Distinguishes between facts and interpretations. Asks clarifying questions before diving in.",
    skills: "Web research, data gathering, source evaluation, competitive analysis, trend analysis, literature review, fact-checking, synthesis and summarization",
    tools: "Web search, document reading, data extraction, spreadsheet analysis",
    outputFormat: "Research briefs with executive summary, key findings, sources cited, and recommended actions",
    constraints: "Always cites sources. Flags low-confidence findings. Never presents opinions as facts. Checks multiple sources for verification."
  },
  "Content Writer": {
    icon: "✍️", role: "Content Writer",
    personality: "Engaging, adaptable, and brand-conscious. Adjusts tone from formal to casual based on audience. Strong storytelling instincts. Receptive to editorial feedback.",
    skills: "Copywriting, long-form content, SEO writing, brand voice adaptation, headline crafting, content strategy, editing, proofreading",
    tools: "Document editor, grammar tools, SEO analysis, content management systems",
    outputFormat: "Polished content in Markdown with headlines, subheadings, and meta descriptions where applicable",
    constraints: "Follows brand voice guidelines strictly. All claims must be verifiable. No plagiarism — all content is original."
  },
  "UI/UX Designer": {
    icon: "🖌️", role: "UI/UX Designer",
    personality: "Empathetic and user-centered. Makes decisions based on user needs and data. Communicates design rationale clearly. Iterates based on feedback without ego.",
    skills: "User research, wireframing, prototyping, visual design, design systems, usability testing, information architecture, interaction design",
    tools: "Design tools (Figma/Sketch), prototyping, user testing platforms, design handoff tools",
    outputFormat: "Wireframes, mockups, or design specs with annotations. User flow diagrams when applicable.",
    constraints: "All designs must meet WCAG AA accessibility. Designs must include mobile and desktop variants. Always provides design rationale."
  },
  "QA/QC Reviewer": {
    icon: "✅", role: "QA/QC Reviewer",
    personality: "Meticulous and constructively critical. Catches what others miss. Provides specific, actionable feedback rather than vague complaints. Firm on quality standards but collaborative in approach.",
    skills: "Code review, content review, test case design, regression testing, acceptance testing, bug reporting, quality metrics, standards compliance",
    tools: "Testing frameworks, code inspection, document review, checklist management",
    outputFormat: "Review reports with pass/fail status, specific issues found (with line references), severity ratings, and fix recommendations",
    constraints: "Every issue must include a specific fix recommendation. Never approves with known critical issues. Review must cover all acceptance criteria."
  },
  "Data Analyst": {
    icon: "📊", role: "Data Analyst",
    personality: "Analytical and precise. Lets data tell the story. Translates complex findings into clear insights. Questions assumptions and validates data quality before analysis.",
    skills: "Data cleaning, statistical analysis, data visualization, SQL, Python/R, spreadsheet modeling, trend analysis, A/B test analysis, reporting",
    tools: "Data processing (Python/pandas), SQL databases, visualization tools, spreadsheets, statistical software",
    outputFormat: "Analysis reports with charts, key metrics highlighted, statistical confidence levels, and actionable recommendations",
    constraints: "Always validates data quality before analysis. States confidence levels and limitations. Never extrapolates beyond what data supports."
  },
  "DevOps Engineer": {
    icon: "🚀", role: "DevOps Engineer",
    personality: "Automation-first mindset. Thinks about reliability, scalability, and reproducibility. Documents infrastructure decisions thoroughly. Cautious with production changes.",
    skills: "CI/CD pipelines, infrastructure as code, containerization, monitoring, cloud platforms (AWS/GCP/Azure), security hardening, performance tuning",
    tools: "Docker, Kubernetes, Terraform, GitHub Actions, monitoring tools, cloud consoles, terminal",
    outputFormat: "Infrastructure configs, deployment scripts, runbooks, and architecture diagrams",
    constraints: "Never makes manual changes to production. All infrastructure must be version-controlled. Rollback plan required for every deployment."
  },
  "Product Strategist": {
    icon: "🧭", role: "Product Strategist",
    personality: "Big-picture thinker who connects user needs to business goals. Data-informed but not data-paralyzed. Communicates vision clearly and builds consensus.",
    skills: "Market analysis, user story mapping, feature prioritization, competitive positioning, roadmap planning, stakeholder management, go-to-market strategy",
    tools: "Research tools, analytics dashboards, documentation, presentation tools",
    outputFormat: "Strategy docs with user stories, priority matrices, competitive analysis, and roadmap recommendations",
    constraints: "All recommendations must tie to user needs or business metrics. Always includes trade-off analysis. Gets stakeholder alignment before major pivots."
  },
  "Security Auditor": {
    icon: "🛡️", role: "Security Auditor",
    personality: "Vigilant and thorough. Thinks like an attacker to defend like a pro. Explains vulnerabilities in terms of real-world risk. Non-negotiable on critical security issues.",
    skills: "Vulnerability assessment, code security review, OWASP compliance, penetration testing methodology, security best practices, incident response planning",
    tools: "Security scanners, code analysis tools, network tools, vulnerability databases",
    outputFormat: "Security audit reports with severity ratings (Critical/High/Medium/Low), proof of concept, and remediation steps",
    constraints: "Critical vulnerabilities must be flagged immediately — no batching. Never discloses vulnerability details outside the team. Follow responsible disclosure principles."
  },
  "Marketer": {
    icon: "📣", role: "Marketer",
    personality: "Creative, data-driven, and trend-aware. Speaks the language of the target audience. Balances brand consistency with platform-specific best practices. Thinks in funnels, hooks, and conversions.",
    skills: "Social media strategy, paid ads (Meta/Google/TikTok), content calendar planning, copywriting for ads, A/B testing, audience targeting, campaign analytics, influencer coordination, email marketing, SEO/SEM",
    tools: "Ad platforms (Meta Ads, Google Ads, TikTok Ads), social media schedulers, analytics dashboards, Canva/design tools, email marketing platforms, UTM tracking",
    outputFormat: "Campaign briefs, ad copy variants with headlines/body/CTA, content calendars, performance reports with ROAS and conversion metrics",
    constraints: "All ads must comply with platform policies. Never makes claims that can't be backed up. A/B tests before scaling spend. Always tracks attribution and UTMs."
  },
  "Trader": {
    icon: "💰", role: "Trader",
    personality: "Disciplined and emotionless in execution. Follows the system, never chases losses or FOMO trades. Communicates positions clearly with entry price, size, and rationale. Thinks in probabilities, not certainties.",
    skills: "Trade execution, position sizing, risk/reward calculation, order management, portfolio tracking, P&L reporting, market microstructure, liquidity assessment",
    tools: "Trading API, portfolio tracker, order management system, position calculator, trade log",
    outputFormat: "Trade execution reports: market, position (YES/NO), size, entry price, rationale summary, risk level, stop-loss criteria",
    constraints: "Never executes without signals from Research and News agents. Never exceeds position size limits set by Operator. Logs every trade with full rationale. No revenge trading — if stopped out, wait for next cycle."
  },
  "News Monitor": {
    icon: "📰", role: "News Monitor",
    personality: "Always-on, alert, and fast. Scans broadly but filters ruthlessly for relevance. Distinguishes breaking news from noise. Flags urgency levels accurately — never cries wolf.",
    skills: "Real-time news monitoring, event detection, geopolitical analysis, social media signal tracking, rumor vs. fact assessment, urgency classification, source credibility evaluation",
    tools: "News APIs, social media feeds, RSS aggregators, event trackers, alert systems",
    outputFormat: "News briefs with: headline, source, credibility rating (1-5), relevance to active markets, urgency level (LOW/MEDIUM/HIGH/CRITICAL), potential market impact direction",
    constraints: "Always includes source credibility rating. Never reports unverified rumors as facts. CRITICAL alerts trigger immediate Operator notification. Timestamps everything."
  },
  "Operator": {
    icon: "🎛️", role: "Operator",
    personality: "Calm, authoritative, and risk-aware. The adult in the room. Monitors all agents, enforces guardrails, and has final say on every trade. Prioritizes capital preservation over profit. Steps in decisively when something is off.",
    skills: "Risk management, system monitoring, agent oversight, portfolio-level risk assessment, drawdown management, circuit breaker implementation, performance benchmarking, compliance enforcement",
    tools: "System dashboard, agent activity logs, portfolio monitor, risk calculator, alert system, kill switch",
    outputFormat: "System status reports, trade approval/rejection with reasoning, risk alerts, daily P&L summaries, agent performance scorecards",
    constraints: "Has VETO power over any trade. Can pause the entire system. Enforces max daily loss limits — if hit, all trading stops for the day. Reviews every trade before execution. Never overrides risk limits, even during winning streaks."
  },
};

const WORKFLOW_PRESETS = {
  "Content Pipeline": {
    description: "Research → Write → Review → Publish",
    agents: ["Researcher", "Content Writer", "QA/QC Reviewer", "Project Manager"],
    steps: [
      { from: 3, to: 0, type: "sequential", desc: "PM assigns research brief to Researcher" },
      { from: 0, to: 1, type: "sequential", desc: "Researcher delivers findings for Writer to draft content" },
      { from: 1, to: 2, type: "review_loop", desc: "Writer submits draft for QA review — loops until approved", condition: "Content meets quality standards, all facts verified, brand voice consistent" },
      { from: 2, to: 3, type: "sequential", desc: "QA-approved content delivered to PM for final sign-off" },
    ]
  },
  "Software Development": {
    description: "Plan → Build → Test → Deploy",
    agents: ["Project Manager", "Lead Developer", "QA/QC Reviewer", "DevOps Engineer"],
    steps: [
      { from: 0, to: 1, type: "sequential", desc: "PM creates technical spec and assigns to Developer" },
      { from: 1, to: 2, type: "review_loop", desc: "Developer submits code for QA — loops until tests pass", condition: "All tests pass, code review approved, no critical issues" },
      { from: 2, to: 3, type: "sequential", desc: "QA-approved code handed to DevOps for deployment" },
      { from: 3, to: 0, type: "sequential", desc: "DevOps confirms deployment, PM updates status" },
    ]
  },
  "Full-Stack Feature": {
    description: "Design → Frontend + Backend → QA → Deploy",
    agents: ["Project Manager", "UI/UX Designer", "Frontend Developer", "Backend Developer", "QA/QC Reviewer"],
    steps: [
      { from: 0, to: 1, type: "sequential", desc: "PM briefs Designer on feature requirements" },
      { from: 1, to: 2, type: "sequential", desc: "Designer hands off specs to Frontend Developer" },
      { from: 1, to: 3, type: "parallel", desc: "Designer hands off API requirements to Backend Developer" },
      { from: 2, to: 4, type: "review_loop", desc: "Frontend submits for QA review", condition: "UI matches design specs, responsive, accessible" },
      { from: 3, to: 4, type: "review_loop", desc: "Backend submits for QA review", condition: "API tests pass, security review clean" },
      { from: 4, to: 0, type: "sequential", desc: "QA-approved feature delivered to PM" },
    ]
  },
  "Research & Analysis": {
    description: "Research → Analyze → Report → Review",
    agents: ["Researcher", "Data Analyst", "Content Writer", "QA/QC Reviewer"],
    steps: [
      { from: 0, to: 1, type: "sequential", desc: "Researcher gathers raw data and sources for analysis" },
      { from: 1, to: 2, type: "sequential", desc: "Analyst delivers insights for Writer to produce report" },
      { from: 2, to: 3, type: "review_loop", desc: "Writer submits report for QA — checks accuracy and clarity", condition: "All data points verified, visualizations accurate, executive summary clear" },
      { from: 3, to: 0, type: "conditional", desc: "If new data needed, back to Researcher; else deliver to owner", condition: "Report passes all quality checks" },
    ]
  },
  "Product Launch": {
    description: "Strategy → Design → Content → Review",
    agents: ["Product Strategist", "UI/UX Designer", "Content Writer", "QA/QC Reviewer", "Project Manager"],
    steps: [
      { from: 0, to: 1, type: "sequential", desc: "Strategist delivers positioning and requirements to Designer" },
      { from: 0, to: 2, type: "parallel", desc: "Strategist briefs Writer on messaging and copy needs" },
      { from: 1, to: 3, type: "review_loop", desc: "Designer submits assets for QA", condition: "Brand-consistent, all formats delivered, mobile-ready" },
      { from: 2, to: 3, type: "review_loop", desc: "Writer submits copy for QA", condition: "On-brand, error-free, SEO-optimized" },
      { from: 3, to: 4, type: "sequential", desc: "All approved materials compiled for PM to coordinate launch" },
    ]
  },
  "Paid Ads Campaign": {
    description: "Research → Strategy → Creative → Ads → Review → Launch",
    agents: ["Researcher", "Marketer", "Content Writer", "UI/UX Designer", "QA/QC Reviewer"],
    steps: [
      { from: 1, to: 0, type: "sequential", desc: "Marketer briefs Researcher on competitors, audience, and market landscape to analyze" },
      { from: 0, to: 1, type: "sequential", desc: "Researcher delivers competitor ad teardowns, audience insights, trending hooks, and gap analysis to Marketer" },
      { from: 1, to: 2, type: "sequential", desc: "Marketer creates campaign strategy (angles, hooks, CTAs, targeting) and briefs Writer on ad copy variants" },
      { from: 1, to: 3, type: "parallel", desc: "Marketer briefs Designer on creative assets — ad visuals, video hooks, carousel layouts, thumb-stopping media" },
      { from: 2, to: 4, type: "review_loop", desc: "Writer submits ad copy variants (headlines, body, CTAs) for QA review", condition: "Copy is platform-compliant, hooks are strong, CTAs are clear, no false claims" },
      { from: 3, to: 4, type: "review_loop", desc: "Designer submits ad creatives for QA review", condition: "Visuals match brand guidelines, correct dimensions per platform, text-to-image ratio passes" },
      { from: 4, to: 1, type: "sequential", desc: "QA-approved copy + creatives compiled by Marketer into final campaign package with targeting specs, budgets, and A/B test plan" },
    ]
  },
  "Market Trading": {
    description: "News → Research → Analyze → Validate → Trade → Oversee",
    agents: ["Operator", "News Monitor", "Researcher", "Data Analyst", "Trader"],
    steps: [
      { from: 0, to: 1, type: "sequential", desc: "Operator initiates 15-min cycle — News Monitor scans for breaking news, events, and sentiment shifts across active markets" },
      { from: 1, to: 2, type: "sequential", desc: "News Monitor delivers prioritized news briefs to Researcher for deep-dive on relevant markets and event probability assessment" },
      { from: 1, to: 3, type: "parallel", desc: "News Monitor simultaneously feeds raw signals to Data Analyst for quantitative analysis — odds movement, volume, historical patterns" },
      { from: 2, to: 3, type: "sequential", desc: "Researcher delivers market research (event analysis, source credibility, probability estimate) to Data Analyst for model validation" },
      { from: 3, to: 4, type: "conditional", desc: "Data Analyst produces trade signal with confidence score — if confidence ≥ 70% and risk/reward favorable, signal goes to Trader; else hold", condition: "Confidence score ≥ 70%, positive expected value, within risk limits" },
      { from: 4, to: 0, type: "review_loop", desc: "Trader prepares trade plan (market, direction, size, entry, rationale) and submits to Operator for approval before execution", condition: "Trade within position limits, rationale supported by research + data, no conflicting signals" },
      { from: 0, to: 4, type: "sequential", desc: "Operator approves or vetoes — if approved, Trader executes and logs; Operator monitors portfolio-level risk and updates system status" },
    ]
  },
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function Badge({ children, color = "#6ee7b7" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      background: color + "22", color, fontSize: 11, fontWeight: 600,
      letterSpacing: 0.5, border: `1px solid ${color}44`, marginLeft: 6
    }}>{children}</span>
  );
}

function StepIndicator({ current }) {
  const STEPS = ["Project Setup", "Define Agents", "Design Workflow", "Review & Generate"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: i <= current ? 1 : 0.35, transition: "all 0.3s" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, background: i < current ? "#6ee7b7" : i === current ? "#0f0" : "#333",
              color: i <= current ? "#0a0a0a" : "#888", transition: "all 0.3s",
              boxShadow: i === current ? "0 0 16px #0f04" : "none"
            }}>{i < current ? "✓" : i + 1}</div>
            <span style={{ fontSize: 11, fontWeight: i === current ? 700 : 500, color: i <= current ? "#e0e0e0" : "#555", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, margin: "0 10px", background: i < current ? "#6ee7b7" : "#222" }} />}
        </div>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, multiline, rows = 3, hint, ...props }) {
  const base = {
    width: "100%", padding: "10px 14px", background: "#111", border: "1px solid #2a2a2a",
    borderRadius: 8, color: "#e0e0e0", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace",
    outline: "none", transition: "border 0.2s", boxSizing: "border-box", resize: "vertical"
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color: "#888", marginBottom: 5, letterSpacing: 0.8, textTransform: "uppercase" }}>
        <span>{label}</span>
        {hint && <span style={{ color: "#555", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{hint}</span>}
      </label>}
      {multiline ? (
        <textarea style={{ ...base, minHeight: rows * 22 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} {...props}
          onFocus={e => e.target.style.borderColor = "#6ee7b7"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
      ) : (
        <input style={base} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} {...props}
          onFocus={e => e.target.style.borderColor = "#6ee7b7"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, style: sx, title }) {
  const styles = {
    primary: { background: "#6ee7b7", color: "#0a0a0a", fontWeight: 700 },
    secondary: { background: "#1a1a1a", color: "#ccc", border: "1px solid #333" },
    danger: { background: "#ff4444", color: "#fff", fontWeight: 600 },
    ghost: { background: "transparent", color: "#6ee7b7", border: "1px solid #6ee7b744" },
  };
  return (
    <button disabled={disabled} onClick={onClick} title={title} style={{
      padding: "10px 18px", borderRadius: 8, border: "none", fontSize: 12,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
      transition: "all 0.2s", letterSpacing: 0.3, ...styles[variant], ...sx
    }}>{children}</button>
  );
}

function RolePicker({ onSelect, onSelectCustom, existingRoles }) {
  const roles = Object.keys(ROLE_TEMPLATES);
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Choose a role — we'll pre-fill everything for you
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {roles.map(r => {
          const t = ROLE_TEMPLATES[r];
          const exists = existingRoles.includes(r);
          return (
            <div key={r} onClick={() => !exists && onSelect(r)} style={{
              padding: "12px 14px", borderRadius: 10, cursor: exists ? "not-allowed" : "pointer",
              background: exists ? "#0a0a0a" : "#111", border: `1px solid ${exists ? "#1a1a1a" : "#2a2a2a"}`,
              opacity: exists ? 0.35 : 1, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 10
            }}
              onMouseEnter={e => { if (!exists) { e.currentTarget.style.borderColor = "#6ee7b744"; e.currentTarget.style.background = "#151515"; } }}
              onMouseLeave={e => { if (!exists) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.background = "#111"; } }}
            >
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: exists ? "#555" : "#ddd" }}>{r}</div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2, lineHeight: 1.4 }}>
                  {t.skills.split(",").slice(0, 3).join(", ")}
                </div>
              </div>
              {exists && <span style={{ marginLeft: "auto", fontSize: 9, color: "#444" }}>Added</span>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10 }}>
        <div onClick={onSelectCustom} style={{
          padding: "14px 16px", borderRadius: 10, cursor: "pointer",
          background: "#111", border: "1px dashed #6ee7b744", transition: "all 0.15s",
          display: "flex", alignItems: "center", gap: 10
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#6ee7b7"; e.currentTarget.style.background = "#151515"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#6ee7b744"; e.currentTarget.style.background = "#111"; }}
        >
          <span style={{ fontSize: 22 }}>🛠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7" }}>Custom Agent</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 2, lineHeight: 1.4 }}>
              Build your own from scratch — define role, skills, personality, everything
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentEditor({ agent, onSave, onCancel, isNew }) {
  const [data, setData] = useState({ ...agent });
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const isCustom = agent._custom;

  const resetToTemplate = () => {
    const t = ROLE_TEMPLATES[data.role];
    if (t) setData(p => ({ ...p, ...t, name: p.name || data.role }));
  };

  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #6ee7b733", borderRadius: 14, padding: 22,
      boxShadow: "0 0 40px #6ee7b708"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#6ee7b7" }}>
          {isNew ? (isCustom ? "Custom Agent" : `New Agent: ${data.role}`) : `Editing: ${data.name}`}
        </div>
        {!isCustom && ROLE_TEMPLATES[data.role] && (
          <Btn variant="ghost" onClick={resetToTemplate} style={{ padding: "4px 10px", fontSize: 10 }}>↻ Reset to defaults</Btn>
        )}
      </div>

      <div style={{
        background: "#111", border: "1px solid #222", borderRadius: 8, padding: 12, marginBottom: 16,
        fontSize: 11, color: "#888", lineHeight: 1.6
      }}>
        {isCustom
          ? <>🛠️ <strong style={{ color: "#aaa" }}>Custom agent — fill in each field to define your agent.</strong> Be as specific as possible for best results.</>
          : <>💡 <strong style={{ color: "#aaa" }}>Everything below is pre-filled based on the role.</strong> Tweak anything to fit your specific needs, or leave as-is for a solid default.</>
        }
      </div>

      <Input label="Agent Name" hint="Give them a unique name" value={data.name || ""} onChange={v => set("name", v)} placeholder="e.g. Lead Dev, Content Lead, Ops Manager..." />
      {isCustom && (
        <Input label="Role / Title" hint="What do they do?" value={data.role || ""} onChange={v => set("role", v)} placeholder="e.g. Email Specialist, Community Manager, Translator..." />
      )}
      <Input label="Personality & Communication Style" multiline rows={3} value={data.personality || ""} onChange={v => set("personality", v)} hint="How they talk and think"
        placeholder={isCustom ? "e.g. Friendly and proactive. Uses clear, concise language. Always explains the 'why' behind decisions..." : undefined} />
      <Input label="Core Skills & Expertise" multiline rows={2} value={data.skills || ""} onChange={v => set("skills", v)} hint="Comma-separated"
        placeholder={isCustom ? "e.g. Email automation, A/B testing, segmentation, deliverability optimization..." : undefined} />
      <Input label="Tools & Capabilities" multiline rows={2} value={data.tools || ""} onChange={v => set("tools", v)} hint="What can they access?"
        placeholder={isCustom ? "e.g. Email platform, CRM, analytics dashboard, template editor..." : undefined} />
      <Input label="Expected Output Format" value={data.outputFormat || ""} onChange={v => set("outputFormat", v)} hint="How they deliver work"
        placeholder={isCustom ? "e.g. Campaign reports in Markdown, email drafts with subject line variants..." : undefined} />
      <Input label="Constraints & Boundaries" multiline rows={2} value={data.constraints || ""} onChange={v => set("constraints", v)} hint="Rules they must follow"
        placeholder={isCustom ? "e.g. Never send without approval. Always include unsubscribe link. Follow GDPR guidelines..." : undefined} />

      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <Btn onClick={() => onSave({ ...data, id: data.id || uid(), _custom: undefined })} disabled={!data.name || (isCustom && !data.role)}>Save Agent</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

function AgentCard({ agent, onEdit, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18, background: "#1a1a1a", border: "1px solid #2a2a2a"
          }}>{agent.icon || "🤖"}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e0e0" }}>{agent.name}</div>
            <div style={{ fontSize: 11, color: "#666" }}>{agent.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#444", marginRight: 4 }}>{expanded ? "▲" : "▼"}</span>
          <Btn variant="ghost" onClick={e => { e.stopPropagation(); onEdit(); }} style={{ padding: "5px 10px", fontSize: 10 }}>Edit</Btn>
          <Btn variant="danger" onClick={e => { e.stopPropagation(); onRemove(); }} style={{ padding: "5px 10px", fontSize: 10 }}>✕</Btn>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a1a", fontSize: 12, color: "#888", lineHeight: 1.7 }}>
          {[["Personality", agent.personality], ["Skills", agent.skills], ["Tools", agent.tools],
            ["Output Format", agent.outputFormat], ["Constraints", agent.constraints]
          ].map(([label, val]) => val ? (
            <div key={label} style={{ marginBottom: 6 }}>
              <strong style={{ color: "#6ee7b7", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}:</strong>
              <div style={{ marginTop: 2 }}>{val}</div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}

function WorkflowPresetPicker({ onSelect, activePreset }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Quick start — pick a template (this will set up agents + workflow)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {Object.entries(WORKFLOW_PRESETS).map(([name, preset]) => (
          <div key={name} onClick={() => onSelect(name, preset)} style={{
            padding: "14px 16px", borderRadius: 10, cursor: "pointer",
            background: activePreset === name ? "#6ee7b711" : "#111",
            border: `1px solid ${activePreset === name ? "#6ee7b744" : "#2a2a2a"}`, transition: "all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6ee7b744"; }}
            onMouseLeave={e => { if (activePreset !== name) e.currentTarget.style.borderColor = "#2a2a2a"; }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#6ee7b7", marginTop: 4 }}>{preset.description}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>{preset.agents.join(" → ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowDesigner({ agents, workflow, setWorkflow }) {
  const addStep = () => {
    setWorkflow(p => [...p, { id: uid(), fromAgent: agents[0]?.id || "", toAgent: agents[1]?.id || "", handoffType: "sequential", condition: "", description: "" }]);
  };
  const updateStep = (i, k, v) => setWorkflow(p => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  const removeStep = (i) => setWorkflow(p => p.filter((_, idx) => idx !== i));
  const moveStep = (i, dir) => {
    setWorkflow(p => {
      const arr = [...p]; const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]]; return arr;
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>Pipeline Steps</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Define handoffs between agents</div>
        </div>
        <Btn onClick={addStep} variant="ghost" style={{ fontSize: 11 }}>+ Add Step</Btn>
      </div>

      {workflow.length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: "#444", fontSize: 12, border: "1px dashed #222", borderRadius: 10 }}>
          No steps yet. Pick a template above or add steps manually.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {workflow.map((step, i) => {
          const ht = HANDOFF_TYPES.find(h => h.value === step.handoffType);
          return (
            <div key={step.id}>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#555" }}>STEP {i + 1}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      <Btn variant="secondary" onClick={() => moveStep(i, -1)} disabled={i === 0} style={{ padding: "2px 6px", fontSize: 9 }}>▲</Btn>
                      <Btn variant="secondary" onClick={() => moveStep(i, 1)} disabled={i === workflow.length - 1} style={{ padding: "2px 6px", fontSize: 9 }}>▼</Btn>
                    </div>
                  </div>
                  <Btn variant="danger" onClick={() => removeStep(i)} style={{ padding: "3px 8px", fontSize: 9 }}>Remove</Btn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end", marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>From</label>
                    <select value={step.fromAgent} onChange={e => updateStep(i, "fromAgent", e.target.value)} style={{
                      width: "100%", padding: "8px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#ddd", fontSize: 12, marginTop: 3
                    }}>
                      <option value="">Select...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                    </select>
                  </div>
                  <div style={{ textAlign: "center", paddingBottom: 4 }}>
                    <select value={step.handoffType} onChange={e => updateStep(i, "handoffType", e.target.value)} style={{
                      padding: "6px 8px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 4, color: "#6ee7b7", fontSize: 10
                    }}>
                      {HANDOFF_TYPES.map(h => <option key={h.value} value={h.value}>{h.icon} {h.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>To</label>
                    <select value={step.toAgent} onChange={e => updateStep(i, "toAgent", e.target.value)} style={{
                      width: "100%", padding: "8px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#ddd", fontSize: 12, marginTop: 3
                    }}>
                      <option value="">Select...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                    </select>
                  </div>
                </div>
                <Input label="What happens" value={step.description} onChange={v => updateStep(i, "description", v)}
                  placeholder="e.g. Developer sends completed code for QA review..." />
                {(step.handoffType === "conditional" || step.handoffType === "review_loop") && (
                  <Input label={step.handoffType === "conditional" ? "Condition" : "Approval Criteria"}
                    value={step.condition || ""} onChange={v => updateStep(i, "condition", v)}
                    placeholder={step.handoffType === "conditional" ? "e.g. If tests pass → deploy; else → back to developer" : "e.g. All items pass checklist, no critical issues"} />
                )}
              </div>
              {i < workflow.length - 1 && <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}><div style={{ width: 2, height: 16, background: "#292929" }} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VisualPipeline({ agents, workflow }) {
  const lk = {}; agents.forEach(a => { lk[a.id] = a; });
  if (workflow.length === 0) return null;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 10, padding: 16, marginBottom: 20, overflowX: "auto" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Pipeline Flow</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <div style={{ padding: "6px 14px", background: "#1a1a1a", borderRadius: 6, fontSize: 11, color: "#888", fontWeight: 600, border: "1px solid #2a2a2a" }}>👤 Owner assigns task</div>
        {workflow.map((step) => {
          const from = lk[step.fromAgent]; const to = lk[step.toAgent];
          const ht = HANDOFF_TYPES.find(h => h.value === step.handoffType);
          return (
            <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ color: "#333", fontSize: 12 }}>↓</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#111", borderRadius: 8, border: "1px solid #6ee7b722", fontSize: 11 }}>
                <span style={{ color: "#6ee7b7", fontWeight: 600 }}>{from?.icon} {from?.name || "?"}</span>
                <span style={{ color: "#6ee7b7", fontSize: 14 }}>{ht?.icon}</span>
                <span style={{ color: "#6ee7b7", fontWeight: 600 }}>{to?.icon} {to?.name || "?"}</span>
                <span style={{ color: "#444", fontSize: 9, marginLeft: 4 }}>({ht?.label})</span>
              </div>
            </div>
          );
        })}
        <div style={{ color: "#333", fontSize: 12 }}>↓</div>
        <div style={{ padding: "6px 14px", background: "#1a1a1a", borderRadius: 6, fontSize: 11, color: "#888", fontWeight: 600, border: "1px solid #2a2a2a" }}>👤 Final output to Owner</div>
      </div>
    </div>
  );
}

function generateOutputFiles(project, agents, workflow) {
  const files = []; const lk = {}; agents.forEach(a => { lk[a.id] = a; });
  files.push({ name: "SOUL.md", content: `# ${project.name || "Multi-Agent Workflow"} — SOUL.md

## Project Identity
**Name:** ${project.name || "Untitled Project"}
**Owner:** ${project.owner || "Not specified"}
**Description:** ${project.description || "No description provided."}

## Mission
${project.mission || "Execute tasks collaboratively through a structured multi-agent pipeline with quality assurance."}

## Core Values
- **Quality First** — Every output passes through review before delivery.
- **Clear Communication** — Agents communicate context and status at every handoff.
- **Ownership** — Each agent owns their domain and is accountable for their output.
- **Iteration** — Continuous improvement through feedback loops.

## Team Structure
This project operates with **${agents.length} specialized agents**:

${agents.map((a, i) => `${i + 1}. **${a.name}** (${a.role}) ${a.icon} — ${a.skills?.split(",")[0]?.trim() || "General purpose"}`).join("\n")}

## Workflow Philosophy
${project.workflowPhilosophy || "Tasks flow through a structured pipeline where each agent contributes their expertise. Handoffs include full context, and review loops ensure quality before final delivery to the owner."}

## Communication Protocol
- Every handoff must include: **Task context**, **Work completed**, **Outstanding items**, **Questions/blockers**
- Review feedback must be **specific** and **actionable**
- Final outputs are compiled and delivered as a unified package

## Quality Standards
- All outputs must meet the acceptance criteria defined in the task
- QA/QC review is mandatory before owner delivery
- Agents may request clarification rather than assume
` });

  agents.forEach(agent => {
    const incoming = workflow.filter(s => s.toAgent === agent.id);
    const outgoing = workflow.filter(s => s.fromAgent === agent.id);
    files.push({ name: `agents/${agent.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/agent.md`, content: `# ${agent.name} — agent.md

## Identity
- **Name:** ${agent.name}
- **Role:** ${agent.role}
- **Icon:** ${agent.icon || "🤖"}

## Personality & Communication Style
${agent.personality || "Professional and focused."}

## Core Skills & Expertise
${agent.skills || "General purpose skills."}

## Tools & Capabilities
${agent.tools || "Standard tools available."}

## Expected Output Format
${agent.outputFormat || "Markdown format unless otherwise specified."}

## Constraints & Boundaries
${agent.constraints || "Follow project guidelines."}

## Workflow Position
${incoming.length > 0 ? `### Receives Work From:\n${incoming.map(s => `- **${lk[s.fromAgent]?.name || "Unknown"}** via ${s.handoffType}${s.description ? ` — ${s.description}` : ""}`).join("\n")}` : "### Starting Agent\nThis agent can receive tasks directly from the owner."}

${outgoing.length > 0 ? `### Hands Off To:\n${outgoing.map(s => { const ht = HANDOFF_TYPES.find(h => h.value === s.handoffType); return `- **${lk[s.toAgent]?.name || "Unknown"}** via ${ht?.label || s.handoffType}${s.condition ? ` (Condition: ${s.condition})` : ""}${s.description ? ` — ${s.description}` : ""}`; }).join("\n")}` : "### Final Agent\nThis agent delivers completed work to the owner."}

## Handoff Protocol
When handing off work, always include:
1. **Summary** of what was done
2. **Files/artifacts** produced
3. **Status** (complete / needs review / blocked)
4. **Context** for the next agent
5. **Open questions** or decisions needed
` });
  });

  files.push({ name: "workflow.md", content: `# Workflow Pipeline — workflow.md

## Overview
Task flow for **${project.name || "the project"}**.

## Pipeline Steps

${workflow.map((step, i) => { const from = lk[step.fromAgent]; const to = lk[step.toAgent]; const ht = HANDOFF_TYPES.find(h => h.value === step.handoffType); return `### Step ${i + 1}: ${from?.name || "?"} ${ht?.icon || "→"} ${to?.name || "?"}\n- **Type:** ${ht?.label || step.handoffType}\n- **Description:** ${step.description || "No description."}${step.condition ? `\n- **Condition:** ${step.condition}` : ""}\n`; }).join("\n")}

## Task Lifecycle
\`\`\`
Owner assigns task
    ↓
${workflow.map((step, i) => { const from = lk[step.fromAgent]; const to = lk[step.toAgent]; const ht = HANDOFF_TYPES.find(h => h.value === step.handoffType); return `[Step ${i + 1}] ${from?.name || "?"} ${ht?.icon || "→"} ${to?.name || "?"}`; }).join("\n    ↓\n")}
    ↓
Final output delivered to Owner
\`\`\`

## Error Handling
- If blocked, escalate to Project Manager or Owner.
- Review loops exceeding 3 iterations → escalate to Owner.
- Incomplete output → receiving agent requests clarification before proceeding.
` });

  return files;
}

function FilePreview({ files, activeFile, setActiveFile }) {
  const file = files[activeFile];
  return (
    <div style={{ display: "flex", height: "100%", minHeight: 360 }}>
      <div style={{ width: 200, background: "#0a0a0a", borderRight: "1px solid #222", borderRadius: "10px 0 0 10px", overflowY: "auto", padding: "6px 0" }}>
        <div style={{ padding: "8px 12px", fontSize: 9, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 1 }}>Files</div>
        {files.map((f, i) => (
          <div key={i} onClick={() => setActiveFile(i)} style={{
            padding: "7px 12px", cursor: "pointer", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            background: i === activeFile ? "#151515" : "transparent", color: i === activeFile ? "#6ee7b7" : "#666",
            borderLeft: i === activeFile ? "2px solid #6ee7b7" : "2px solid transparent",
          }}>📄 {f.name}</div>
        ))}
      </div>
      <div style={{ flex: 1, background: "#0d0d0d", borderRadius: "0 10px 10px 0", overflow: "auto" }}>
        <div style={{ padding: "8px 14px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#aaa", fontFamily: "'IBM Plex Mono', monospace" }}>{file?.name}</span>
          <Btn variant="ghost" style={{ padding: "3px 10px", fontSize: 9 }} onClick={() => { if (navigator?.clipboard) navigator.clipboard.writeText(file?.content || ""); }}>Copy</Btn>
        </div>
        <pre style={{ padding: 14, margin: 0, fontSize: 11, lineHeight: 1.7, color: "#bbb", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{file?.content}</pre>
      </div>
    </div>
  );
}

// Lightweight ZIP builder — no external dependencies
function downloadZip(files, projectName) {
  const folderName = (projectName || "openclaw-project").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Build a simple ZIP file using raw bytes
  const encoder = new TextEncoder();
  const localFiles = [];
  const centralDir = [];
  let offset = 0;

  files.forEach(f => {
    const fullPath = `${folderName}/${f.name}`;
    const nameBytes = encoder.encode(fullPath);
    const contentBytes = encoder.encode(f.content);

    // CRC32
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < contentBytes.length; i++) {
      crc ^= contentBytes[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    crc ^= 0xFFFFFFFF;

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // compression (store)
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0, true); // mod date
    lv.setUint32(14, crc >>> 0, true);
    lv.setUint32(18, contentBytes.length, true); // compressed
    lv.setUint32(22, contentBytes.length, true); // uncompressed
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra len
    localHeader.set(nameBytes, 30);

    localFiles.push(localHeader, contentBytes);

    // Central directory entry
    const cdEntry = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdEntry.buffer);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, 0, true); // compression
    cv.setUint16(12, 0, true); // mod time
    cv.setUint16(14, 0, true); // mod date
    cv.setUint32(16, crc >>> 0, true);
    cv.setUint32(20, contentBytes.length, true);
    cv.setUint32(24, contentBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra len
    cv.setUint16(32, 0, true); // comment len
    cv.setUint16(34, 0, true); // disk start
    cv.setUint16(36, 0, true); // internal attr
    cv.setUint32(38, 0, true); // external attr
    cv.setUint32(42, offset, true); // offset
    cdEntry.set(nameBytes, 46);

    centralDir.push(cdEntry);
    offset += localHeader.length + contentBytes.length;
  });

  const cdOffset = offset;
  let cdSize = 0;
  centralDir.forEach(e => cdSize += e.length);

  // End of central directory
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdOffset, true);
  ev.setUint16(20, 0, true);

  const blob = new Blob([...localFiles, ...centralDir, eocd], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${folderName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [step, setStep] = useState(0);
  const [project, setProject] = useState({ name: "", owner: "", description: "", mission: "", workflowPhilosophy: "" });
  const [agents, setAgents] = useState([]);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [workflow, setWorkflow] = useState([]);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(0);
  const [activePreset, setActivePreset] = useState(null);

  const setProj = (k, v) => setProject(p => ({ ...p, [k]: v }));
  const canNext = () => {
    if (step === 0) return project.name && project.owner;
    if (step === 1) return agents.length >= 2;
    if (step === 2) return workflow.length >= 1;
    return true;
  };

  const handleSelectRole = (roleName) => {
    const template = ROLE_TEMPLATES[roleName];
    setEditingAgent({ name: roleName, ...template, id: null });
    setShowRolePicker(false);
  };

  const handleSelectCustom = () => {
    setEditingAgent({
      name: "", role: "", icon: "🛠️", personality: "", skills: "", tools: "",
      outputFormat: "", constraints: "", id: null, _custom: true
    });
    setShowRolePicker(false);
  };

  const applyWorkflowPreset = (name, preset) => {
    setActivePreset(name);
    const newAgents = preset.agents.map(roleName => {
      const existing = agents.find(a => a.role === roleName);
      if (existing) return existing;
      const t = ROLE_TEMPLATES[roleName];
      return { id: uid(), name: roleName, ...t };
    });
    setAgents(newAgents);
    const newWorkflow = preset.steps.map(s => ({
      id: uid(), fromAgent: newAgents[s.from]?.id || "", toAgent: newAgents[s.to]?.id || "",
      handoffType: s.type, description: s.desc, condition: s.condition || ""
    }));
    setWorkflow(newWorkflow);
  };

  const handleGenerate = () => { setGeneratedFiles(generateOutputFiles(project, agents, workflow)); setActiveFile(0); };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0", fontFamily: "'IBM Plex Mono', 'SF Mono', monospace", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#111", border: "1px solid #6ee7b744", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🦞</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", background: "linear-gradient(135deg, #6ee7b7, #34d399, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>OpenClaw</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>Multi-Agent Workflow Generator</div>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, #6ee7b733, transparent)", margin: "14px 0 20px" }} />
        <StepIndicator current={step} />

        {step === 0 && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 3 }}>Project Setup</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>Tell us about your project — this shapes the entire workflow.</div>
            <Input label="Project Name" value={project.name} onChange={v => setProj("name", v)} placeholder="e.g. Content Pipeline, Code Factory, Marketing Engine..." />
            <Input label="Owner / Your Name" value={project.owner} onChange={v => setProj("owner", v)} placeholder="Who owns this workflow?" />
            <Input label="What does this project do?" multiline value={project.description} onChange={v => setProj("description", v)}
              placeholder="Describe the goal — e.g. 'Automate blog content from research to publish with AI agents doing research, writing, editing, and SEO optimization.'" hint="Helps us suggest agents" />
            <Input label="Mission Statement" multiline rows={2} value={project.mission} onChange={v => setProj("mission", v)}
              placeholder="e.g. Deliver production-ready code through collaborative AI agents with built-in quality assurance..." hint="Optional — auto-generated if blank" />
            <Input label="Workflow Philosophy" multiline rows={2} value={project.workflowPhilosophy} onChange={v => setProj("workflowPhilosophy", v)}
              placeholder="e.g. 'Every output must be reviewed before moving forward. Agents ask questions rather than assume.'" hint="Optional" />
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Your Agents <Badge>{agents.length}</Badge></div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>Pick roles — we pre-fill personality, skills, tools, everything. Tweak to fit. Min 2.</div>
              </div>
              {!showRolePicker && !editingAgent && <Btn onClick={() => setShowRolePicker(true)}>+ Add Agent</Btn>}
            </div>

            {showRolePicker && !editingAgent && (
              <div style={{ background: "#0d0d0d", border: "1px solid #6ee7b733", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 0 40px #6ee7b708" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>Pick a Role</span>
                  <Btn variant="secondary" onClick={() => setShowRolePicker(false)} style={{ padding: "4px 10px", fontSize: 10 }}>Cancel</Btn>
                </div>
                <RolePicker onSelect={handleSelectRole} onSelectCustom={handleSelectCustom} existingRoles={agents.map(a => a.role)} />
              </div>
            )}

            {editingAgent && (
              <div style={{ marginBottom: 16 }}>
                <AgentEditor agent={editingAgent} isNew={!editingAgent.id}
                  onSave={(a) => {
                    if (agents.find(x => x.id === a.id)) setAgents(p => p.map(x => x.id === a.id ? a : x));
                    else setAgents(p => [...p, a]);
                    setEditingAgent(null);
                  }}
                  onCancel={() => setEditingAgent(null)} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.map((a, i) => (
                <AgentCard key={a.id} agent={a}
                  onEdit={() => { setEditingAgent(a); setShowRolePicker(false); }}
                  onRemove={() => { setAgents(p => p.filter(x => x.id !== a.id)); setWorkflow(p => p.filter(s => s.fromAgent !== a.id && s.toAgent !== a.id)); }} />
              ))}
            </div>
            {agents.length === 0 && !showRolePicker && !editingAgent && (
              <div style={{ textAlign: "center", padding: 30, border: "1px dashed #222", borderRadius: 10, color: "#444", fontSize: 12, marginTop: 8 }}>
                No agents yet. Click <strong style={{ color: "#6ee7b7" }}>+ Add Agent</strong> to pick a role.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 3 }}>Design Workflow</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>Pick a template to auto-setup agents + pipeline, or build from scratch.</div>
            <WorkflowPresetPicker onSelect={applyWorkflowPreset} activePreset={activePreset} />
            <VisualPipeline agents={agents} workflow={workflow} />
            <WorkflowDesigner agents={agents} workflow={workflow} setWorkflow={setWorkflow} />
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Review & Export</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>Generate your files, preview them, then download the ZIP to drop into OpenClaw.</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={handleGenerate}>{generatedFiles.length > 0 ? "↻ Regenerate" : "⚡ Generate Files"}</Btn>
              </div>
            </div>

            {/* Project Summary */}
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", marginBottom: 8 }}>Project Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div><span style={{ color: "#555" }}>Project:</span> <span style={{ color: "#ddd" }}>{project.name}</span></div>
                <div><span style={{ color: "#555" }}>Owner:</span> <span style={{ color: "#ddd" }}>{project.owner}</span></div>
                <div><span style={{ color: "#555" }}>Agents:</span> <span style={{ color: "#ddd" }}>{agents.length}</span></div>
                <div><span style={{ color: "#555" }}>Steps:</span> <span style={{ color: "#ddd" }}>{workflow.length}</span></div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {agents.map(a => <span key={a.id} style={{ padding: "3px 8px", background: "#1a1a1a", borderRadius: 6, fontSize: 10, color: "#aaa", border: "1px solid #222" }}>{a.icon} {a.name}</span>)}
              </div>
            </div>

            <VisualPipeline agents={agents} workflow={workflow} />

            {generatedFiles.length > 0 && (
              <>
                {/* Folder Structure Preview */}
                <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>
                      Folder Structure
                    </div>
                    <Btn variant="primary" onClick={() => downloadZip(generatedFiles, project.name)} style={{ padding: "8px 20px", fontSize: 12 }}>
                      📦 Download ZIP
                    </Btn>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: 2, color: "#888" }}>
                    <div style={{ color: "#6ee7b7", fontWeight: 600 }}>📁 {(project.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-")}/</div>
                    {generatedFiles.map((f, i) => {
                      const parts = f.name.split("/");
                      const indent = (parts.length - 1) * 20;
                      const isFolder = parts.length > 1;
                      const folderPath = parts.slice(0, -1).join("/");
                      const shownFolders = new Set();
                      const lines = [];

                      if (isFolder && !shownFolders.has(folderPath)) {
                        shownFolders.add(folderPath);
                      }

                      return (
                        <div key={i} onClick={() => setActiveFile(i)} style={{
                          paddingLeft: 20 + indent, cursor: "pointer", borderRadius: 4,
                          background: activeFile === i ? "#111" : "transparent",
                          color: activeFile === i ? "#6ee7b7" : "#888",
                          transition: "all 0.1s"
                        }}
                          onMouseEnter={e => { if (activeFile !== i) e.currentTarget.style.background = "#0d0d0d"; }}
                          onMouseLeave={e => { if (activeFile !== i) e.currentTarget.style.background = "transparent"; }}
                        >
                          {isFolder ? "├── 📁 " : "├── "}📄 {parts[parts.length - 1]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* File Preview */}
                <div style={{ border: "1px solid #222", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                  <FilePreview files={generatedFiles} activeFile={activeFile} setActiveFile={setActiveFile} />
                </div>

                {/* Deploy Instructions */}
                <div style={{ background: "#111", border: "1px solid #6ee7b733", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🚀</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#6ee7b7" }}>How to Deploy</span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { step: "1", title: "Download & Extract", desc: "Click \"Download ZIP\" above. Extract the folder into your OpenClaw project root." },
                        { step: "2", title: "Verify Structure", desc: `Your project should have SOUL.md and workflow.md at the root, with an agents/ folder containing a subfolder for each agent with its own agent.md.` },
                        { step: "3", title: "Initialize", desc: "Open your OpenClaw and prompt it with:" , code: `Read SOUL.md and workflow.md to understand the project and team. Then read each agent.md in the agents/ folder. Initialize all agents and confirm you're ready to receive tasks.` },
                        { step: "4", title: "Assign Your First Task", desc: "Give it a task and watch the agents coordinate:" , code: `New task: [describe your task here]. Follow the workflow pipeline — start with the first agent, hand off through each step, and deliver the final output to me.` },
                      ].map(item => (
                        <div key={item.step} style={{ display: "flex", gap: 12 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%", background: "#6ee7b7", color: "#0a0a0a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1
                          }}>{item.step}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 3 }}>{item.title}</div>
                            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>{item.desc}</div>
                            {item.code && (
                              <div style={{
                                marginTop: 8, padding: "10px 12px", background: "#0a0a0a", borderRadius: 6,
                                border: "1px solid #222", fontSize: 11, color: "#6ee7b7",
                                fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.6, position: "relative"
                              }}>
                                <button onClick={() => { if (navigator?.clipboard) navigator.clipboard.writeText(item.code); }}
                                  style={{
                                    position: "absolute", top: 6, right: 6, padding: "2px 8px", fontSize: 9,
                                    background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "#888", cursor: "pointer"
                                  }}>Copy</button>
                                {item.code}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
          <Btn variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>← Back</Btn>
          {step < 3 && <Btn onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next →</Btn>}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        select { cursor: pointer; } select:focus { outline: none; border-color: #6ee7b7 !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
    </div>
  );
}
