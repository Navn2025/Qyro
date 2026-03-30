import {useState, useRef, useEffect, useMemo, useCallback} from 'react'
import './App.css'

/* ────────────────────────────────────────────
   ICONS (inline SVG helpers)
──────────────────────────────────────────── */
const Icon={
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z" />
    </svg>
  ),
  QyroLogo: () => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="320 60" transform="rotate(-40 100 100)" />
      <circle cx="100" cy="100" r="10" fill="currentColor" />
      <path d="M120 120 L150 150" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
    </svg>
  ),
  Stop: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  ),
  Clear: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Loader: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Circle: ({fill, color}) => (
    <svg viewBox="0 0 24 24" fill={"white"||"none"} stroke={color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
  Shuffle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  Lightbulb: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 6.5 9c0 1.61.59 3.09 1.56 4.23l.18.21c.71.86 1.17 1.62 1.35 2.56" />
    </svg>
  ),
  Wrench: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Scale: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c1.5 0 2-1 2-2 0-3-4-8-12-8S4 11 4 14c0 1 .5 2 2 2l3-8 3 8" /><path d="m12 16v6" /><path d="m10 22h4" /><path d="M12 4v4" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Hash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}


const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Utility to construct API URLs.
 * In development, it uses the relative path (proxied via Vite).
 * In production (when VITE_API_URL is set), it prepends the base URL and strips the '/api' prefix.
 */
function getApiUrl(path) {
  if (API_BASE) {
    // If we have an absolute base URL, we strip the '/api' prefix used for the local proxy.
    return `${API_BASE}${path.replace(/^\/api/, '')}`;
  }
  return path;
}

/* ────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────── */
function parseName(raw)
{
  // Extract node name from a chunk like "{'generate_question': {...}}"
  const match=raw.match(/"?'?([a-z_]+)'?"?\s*:/)
  if (match) return match[1].replace(/_/g, ' ')
  return raw.substring(0, 60)
}

function formatNodeName(name)
{
  return name.split('_').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ')
}

function extractQAFromSteps(steps)
{
  // Try to find final answer block in the stream chunks
  for (let i=steps.length-1;i>=0;i--)
  {
    const s=steps[i]
    if (s.raw&&s.raw.includes('create_memory'))
    {
      try
      {
        // Try to extract Q&A data from raw string
        const inner=s.raw.slice(s.raw.indexOf('{'), s.raw.lastIndexOf('}')+1)
        return null // will rely on structured result separately
      } catch { /* noop */}
    }
  }
  return null
}

function downloadJSON(data, filename)
{
  const blob=new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url; a.download=filename; a.click()
  URL.revokeObjectURL(url)
}

const UI_BLOOM_DESC={
  'L1 - Recall': 'Define, list, identify',
  'L2 - Understand': 'Explain, summarize, interpret',
  'L3 - Apply': 'Solve, implement, use',
  'L4 - Analyze': 'Compare, debug, infer',
  'L5 - Evaluate': 'Justify, critique, decide',
  'L6 - Create': 'Design, architect',
  'L7 - Innovate': 'Propose novel or optimized solutions',
  'Mixed Bloom': 'Mixed auto-selects across all 7 levels'
}

const UI_BLOOM_ICON={
  'Mixed Bloom': Icon.Shuffle,
  'L1 - Recall': Icon.Brain,
  'L2 - Understand': Icon.Lightbulb,
  'L3 - Apply': Icon.Wrench,
  'L4 - Analyze': Icon.Search,
  'L5 - Evaluate': Icon.Scale,
  'L6 - Create': Icon.Sparkle,
  'L7 - Innovate': Icon.Star
}

const UI_DIFF_ICON={
  'easy': () => <Icon.Circle fill="var(--success-neon)" color="var(--success-neon)" />,
  'medium': () => <Icon.Circle fill="var(--warning)" color="var(--warning)" />,
  'hard': () => <Icon.Circle fill="var(--danger)" color="var(--danger)" />
}

const UI_DIFF_LABEL={
  'easy': 'Easy',
  'medium': 'Medium',
  'hard': 'Hard'
}
/* ────────────────────────────────────────────
   SUB-COMPONENTS
──────────────────────────────────────────── */

/** Shows the "User" config message bubble */
function UserConfigBubble({params})
{
  return (
    <div className="msg-group user">
      <div className="msg-sender" style={{justifyContent: 'flex-end'}}>
        <span>You</span>
        <div className="avatar"><Icon.User /></div>
      </div>
      <div className="msg-bubble">
        <div style={{marginBottom: 8, fontWeight: 600}}>Generate Q&amp;A Set</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, opacity: 0.8}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}><span style={{display: 'flex', width: 14, height: 14, flexShrink: 0}}><Icon.Book /></span> <span>Subject: <strong>{params.subject}</strong></span></div>
          {params.subject_description&&<div style={{display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.3}}><span style={{marginTop: 2, display: 'flex', width: 14, height: 14, flexShrink: 0}}><Icon.Info /></span> <span style={{opacity: 0.8, fontStyle: 'italic'}}>{params.subject_description}</span></div>}
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 4}}><span style={{display: 'flex', width: 14, height: 14, flexShrink: 0}}><Icon.Zap /></span> <span>Difficulty: <strong>{params.difficulty}</strong></span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}><span style={{display: 'flex', width: 14, height: 14, flexShrink: 0}}><Icon.Brain /></span> <span>Bloom: <strong>{params.bloom_level||'Mixed'}</strong></span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}><span style={{display: 'flex', width: 14, height: 14, flexShrink: 0}}><Icon.Hash /></span> <span>Questions per Batch: <strong>{params.N}</strong></span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}><span style={{display: 'flex', width: 14, height: 14, flexShrink: 0}}><Icon.Sparkle /></span> <span>Parallel Workflows: <strong>{params.parallel_workflows}</strong></span></div>
        </div>
      </div>
    </div>
  )
}

/** Agent thinking + streaming steps */
function AgentStreamBubble({steps=[], status, errorMsg})
{
  const stepsRef=useRef(null)
  useEffect(() =>
  {
    if (stepsRef.current)
    {
      const el = stepsRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [steps])

  return (
    <div className="msg-group agent">
      <div className="msg-sender">
        <div className="avatar"><Icon.Bot /></div>
        <span>Agent</span>
      </div>
      <div className="stream-bubble">
        <div className="stream-header">
          <span className="stream-header__label">
            <Icon.Sparkle />
            Agent Pipeline
          </span>
          <span className={`stream-status ${status}`} style={{display: 'flex', alignItems: 'center', gap: 4}}>
            {status==='running'&&<><Icon.Loader /> Running</>}
            {status==='done'&&<><Icon.Check /> Done</>}
            {status==='error'&&<><Icon.X /> Error</>}
          </span>
        </div>
        <div className="stream-steps" ref={stepsRef}>
          {(steps === undefined || steps.length===0) && status==='running' && (
            <div className="stream-step running">
              <div className="stream-step__icon"><Icon.Loader /></div>
              <span>Initialising agent graph…</span>
            </div>
          )}
          {steps.length===0&&status==='error'&&(
            <div className="stream-step error">
              <div className="stream-step__icon"><Icon.X /></div>
              <span>Agent encountered an error.</span>
            </div>
          )}
          {steps.map((step, i) => (
            <div key={i} className={`stream-step ${step.type}`}>
              <div className="stream-step__icon">
                {step.type==='done'&&<Icon.Check />}
                {step.type==='running'&&<Icon.Loader />}
                {step.type==='error'&&<Icon.X />}
              </div>
              <span>{step.label}</span>
            </div>
          ))}
          {status==='running'&&steps.length>0&&(
            <div className="stream-step running">
              <div className="stream-step__icon"><Icon.Loader /></div>
              <span>Processing…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Expandable Q&A answer */
function QACard({item, index})
{
  const [open, setOpen]=useState(false)

  const diffClass=`difficulty-${(item.difficulty||'medium').toLowerCase()}`
  const hasOptions=item.options&&Object.keys(item.options).length>0
  const correctKey=item.correct_option

  return (
    <div className="qa-card">
      <div className="qa-card__meta">
        <span className="qa-card__num">Q{index+1}</span>
        <span className={`badge ${diffClass}`}>{item.difficulty||'medium'}</span>
        {item.bloom_level&&(
          <span className="badge">{item.bloom_level}</span>
        )}
        {(item.topic_tags||[]).slice(0, 2).map(tag => (
          <span key={tag} className="badge">{tag}</span>
        ))}
      </div>

      <p className="qa-card__question">{item.question_text}</p>

      {hasOptions&&!open&&(
        <div className="qa-card__options">
          {Object.entries(item.options).map(([key, val]) => (
            <div key={key} className={`option ${key===correctKey? 'correct':''}`}>
              <span className="option__key">{key.toUpperCase()}.</span>
              <span>{val}</span>
            </div>
          ))}
        </div>
      )}

      {item.answer&&(
        <button
          className={`qa-card__ans-toggle ${open? 'open':''}`}
          onClick={() => setOpen(v => !v)}
        >
          <Icon.ChevronRight />
          {open? 'Hide explanation':'Show explanation'}
        </button>
      )}
      {open&&item.answer&&(
        <div className="qa-card__answer">
          {hasOptions&&(
            <div className="qa-card__options" style={{marginBottom: 12}}>
              {Object.entries(item.options).map(([key, val]) => (
                <div key={key} className={`option ${key===correctKey? 'correct':''}`}>
                  <span className="option__key">{key.toUpperCase()}.</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          )}
          <p className="qa-card__answer-text">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

/** Final result block */
function QAResultBubble({result, params})
{
  if (!result||!result.length) return null

  return (
    <div className="msg-group agent">
      <div className="msg-sender">
        <div className="avatar"><Icon.Bot /></div>
        <span>Agent</span>
      </div>
      <div className="qa-result">
        <div className="qa-result__header">
          <span className="qa-result__title">
            <Icon.Book />
            {params.subject}
            <span className="qa-result__count">
              {result.length} question{result.length!==1? 's':''}
            </span>
          </span>
          <button
            className="icon-btn"
            title="Download JSON"
            onClick={() => downloadJSON(result, `qa_${params.subject}_${Date.now()}.json`)}
          >
            <Icon.Download />
          </button>
        </div>
        <div className="qa-cards">
          {result.map((item, i) => (
            <QACard key={item.id||i} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

const ICON_MAP={
  'check': Icon.Check,
  'x': Icon.X,
  'alert': Icon.Alert,
  'shuffle': Icon.Shuffle,
  'clock': Icon.Loader,
}

function SystemMsg({msg})
{
  const IconComponent=msg.iconName? ICON_MAP[msg.iconName]:null
  return (
    <div className="msg-group system">
      <div className="msg-bubble" style={{display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8}}>
        {IconComponent&&<span style={{display: 'flex', width: 16, height: 16}}><IconComponent /></span>}
        {msg.text}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   SIDEBAR
──────────────────────────────────────────── */
function Sidebar({sessions, activeId, onSelect, agentStatus, onNewChat, isSidebarOpen, setIsSidebarOpen})
{
  return (
    <aside className={`sidebar ${isSidebarOpen? 'active':''}`}>
      <div className="sidebar__head">
        <div className="logo">
          <div className="logo__icon" style={{width: 32, height: 32, flexShrink: 0}}><Icon.QyroLogo /></div>
          <span className="logo__name">Qyro</span>
        </div>
        <button className="icon-btn new-chat-btn" title="New Generation" onClick={onNewChat}>
          <span style={{display: 'flex', width: 18, height: 18}}><Icon.Sparkle /></span>
        </button>
      </div>

      <div className="sidebar__body">
        {sessions.length>0&&(
          <>
            <div className="sidebar__section-title">Generations</div>
            {sessions.map(s => (
              <div
                key={s.id}
                className={`history-item ${s.id===activeId? 'active':''}`}
                onClick={() => {onSelect(s.id); setIsSidebarOpen(false)}}
              >
                <div className="history-item__dot" />
                <span className="history-item__label">{s.label}</span>
                <span className="history-item__meta">{s.qCount}Q</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="sidebar__footer">
        <div className="agent-status">
          <div className={`status-dot ${agentStatus}`} />
          <span>
            {agentStatus==='online'&&'Agent ready'}
            {agentStatus==='thinking'&&'Agent running…'}
            {agentStatus==='offline'&&'Agent offline'}
          </span>
        </div>
      </div>
    </aside>
  )
}

/* ────────────────────────────────────────────
   FORM PANEL
──────────────────────────────────────────── */
function FormPanel({params, setParams, onGenerate, onClear, isRunning, subjects, difficulties, bloomLevels, cooldown, isOpen})
{
  // Compute exactly the grouped structure that the UI expects
  const groupedSubjects=useMemo(() =>
  {
    const acc={};
    for (const s of subjects)
    {
      if (!acc[s.group]) acc[s.group]=[];
      acc[s.group].push(s);
    }
    return Object.entries(acc).map(([group, options]) => ({group, options}));
  }, [subjects]);

  const getSubjectDescription=(name) =>
  {
    const found=subjects.find(s => s.name===name);
    return found? found.description:"Choose a predefined subject or topic.";
  }

  return (
    <aside className={`form-panel ${isOpen? 'open':''}`}>
      <div className="form-panel__head">
        <div className="form-panel__title">Configuration</div>
        <div className="form-panel__sub">Set parameters for generation</div>
      </div>

      <div className="form-panel__body">
        {/* Subject */}
        <div className="form-group">
          <label className="form-label" htmlFor="subject">Subject / Topic</label>
          <select
            id="subject"
            className="form-select"
            value={params.subject}
            onChange={e => setParams(p => ({...p, subject: e.target.value}))}
            disabled={isRunning||subjects.length===0}
          >
            <option value="" disabled>Select a subject…</option>
            {groupedSubjects.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map(opt => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="form-hint">
            {getSubjectDescription(params.subject)}
          </span>
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label className="form-label">Difficulty</label>
          <div className="pill-grid" role="group" aria-label="Difficulty">
            {difficulties.map(d =>
            {
              const DiffIcon=UI_DIFF_ICON[d.name]||(() => <Icon.Circle />)
              return (
                <button
                  key={d.id}
                  id={`diff-${d.name}`}
                  type="button"
                  className={`pill pill--diff-${d.name} ${params.difficulty===d.name? 'pill--active':''}`}
                  onClick={() => !isRunning&&setParams(p => ({...p, difficulty: d.name}))}
                  disabled={isRunning}
                  aria-pressed={params.difficulty===d.name}
                >
                  <span className="pill__emoji" style={{display: 'flex', width: 14, height: 14}}><DiffIcon /></span>
                  {UI_DIFF_LABEL[d.name]||d.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bloom */}
        <div className="form-group">
          <label className="form-label">Bloom's Taxonomy Level</label>
          <div className="pill-grid pill-grid--wrap" role="group" aria-label="Bloom's Taxonomy">
            {bloomLevels.map(b =>
            {
              const BloomIcon=UI_BLOOM_ICON[b.name]||Icon.Lightbulb
              return (
                <button
                  key={b.id}
                  id={`bloom-${b.name}`}
                  type="button"
                  className={`pill ${params.bloom_levels.includes(b.name)? 'pill--active':''}`}
                  onClick={() =>
                  {
                    if (isRunning) return;
                    setParams(p =>
                    {
                      let next=[...p.bloom_levels];
                      if (b.name==='Mixed Bloom')
                      {
                        next=next.includes('Mixed Bloom')? []:['Mixed Bloom'];
                      } else
                      {
                        next=next.filter(x => x!=='Mixed Bloom');
                        if (next.includes(b.name))
                        {
                          next=next.filter(x => x!==b.name);
                        } else
                        {
                          next.push(b.name);
                        }
                      }
                      return {...p, bloom_levels: next};
                    });
                  }}
                  disabled={isRunning}
                  aria-pressed={params.bloom_levels.includes(b.name)}
                  title={UI_BLOOM_DESC[b.name]}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '28px 40px 14px',
                    gap: '4px',
                    height: 'auto',
                    whiteSpace: 'normal',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500}}>
                    <span className="pill__emoji" style={{display: 'flex', width: 14, height: 14, flexShrink: 0}}><BloomIcon /></span>
                    {b.name}
                  </div>
                  {UI_BLOOM_DESC[b.name]&&(
                    <div style={{fontSize: 11, opacity: 0.65, lineHeight: 1.3, fontWeight: 400, marginTop: 2, textTransform: 'none', letterSpacing: 'normal', width: '100%'}}>
                      {UI_BLOOM_DESC[b.name]}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* N */}
        <div className="form-group">
          <label className="form-label">Questions per Workflow</label>
          <div className="range-row">
            <input
              type="range"
              id="n-slider"
              className="form-range"
              min={1} max={20}
              value={params.N}
              onChange={e => setParams(p => ({...p, N: Number(e.target.value)}))}
              disabled={isRunning}
            />
            <span className="range-val">{params.N}</span>
          </div>
          <span className="form-hint">Larger batches take longer to generate.</span>
        </div>

        {/* PARALLEL WORKFLOWS */}
        <div className="form-group">
          <label className="form-label">Parallel Workflows</label>
          <div className="range-row">
            <input
              type="range"
              id="parallel-slider"
              className="form-range"
              min={1} max={10}
              value={params.parallel_workflows}
              onChange={e => setParams(p => ({...p, parallel_workflows: Number(e.target.value)}))}
              disabled={isRunning}
            />
            <span className="range-val">{params.parallel_workflows}</span>
          </div>
          <span className="form-hint" style={{fontWeight: 500}}>Total Questions = {params.N*params.parallel_workflows}</span>
        </div>

        <div className="divider" />

        {/* Info */}
        <div style={{fontSize: 11, color: 'var(--text-3)', lineHeight: 1.7}}>
          <strong style={{color: 'var(--text-2)', display: 'block', marginBottom: 4}}>How it works</strong>
          The agent runs a <em>parallel LangGraph pipeline</em>: questions are generated, deduplicated across batches, answered with structured output, persisted in Pinecone, and returned.
        </div>
      </div>

      <div className="form-panel__footer">
        <button
          id="generate-btn"
          className={`btn btn-primary ${isRunning? 'btn-loading':''}`}
          onClick={onGenerate}
          disabled={isRunning||!params.subject.trim()||cooldown>0}
        >
          {isRunning? (
            <><div className="spinner" />Generating…</>
          ):cooldown>0? (
            <><Icon.Stop /> Wait {Math.floor(cooldown/60)}:{String(cooldown%60).padStart(2, '0')}</>
          ):(
            <><Icon.Send />Generate Q&amp;A</>
          )}
        </button>
        {isRunning&&(
          <button className="btn btn-secondary" onClick={onClear} id="stop-btn">
            <Icon.Stop />Abort
          </button>
        )}
        {!isRunning&&(
          <button className="btn btn-secondary" onClick={onClear} id="clear-btn">
            <Icon.Clear />Clear Chat
          </button>
        )}
      </div>
    </aside>
  )
}

function SettingsModal({isOpen, onClose, userId})
{
  const [keys, setKeys]=useState({
    gemini_api_key: '',
    gemini_api_key_2: '',
    groq_api_key: '',
    groq_api_key_2: '',
    huggingfacehub_api_token: '',
    database_uri: ''
  })
  const [isSaving, setIsSaving]=useState(false)

  useEffect(() =>
  {
    if (isOpen&&userId)
    {
      fetch(getApiUrl(`/api/v1/chats/settings/${userId}`))
        .then(r => r.json())
        .then(data =>
        {
          if (data) setKeys({
            gemini_api_key: data.gemini_api_key||'',
            gemini_api_key_2: data.gemini_api_key_2||'',
            groq_api_key: data.groq_api_key||'',
            groq_api_key_2: data.groq_api_key_2||'',
            huggingfacehub_api_token: data.huggingfacehub_api_token||'',
            database_uri: data.database_uri||''
          })
        })
    }
  }, [isOpen, userId])

  const handleSave=() =>
  {
    setIsSaving(true)
    fetch(getApiUrl(`/api/v1/chats/settings/${userId}`), {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(keys)
    }).then(() =>
    {
      setIsSaving(false)
      onClose()
    }).catch(err =>
    {
      console.error(err)
      setIsSaving(false)
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{fontSize: 18, color: 'var(--white)', margin: 0, display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{display: 'flex', width: 20, height: 20}}><Icon.Settings /></span> API Keys & Database
          </h2>
          <button className="icon-btn" onClick={onClose}><span style={{display: 'flex', width: 16, height: 16}}><Icon.X /></span></button>
        </div>
        <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', overflowY: 'auto', flex: 1}}>
          {/* GEMINI KEYS */}
          <p style={{fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.6px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4}}>Gemini Keys</p>
          <div className="form-group">
            <label className="form-label">Key 1 — Question Generation</label>
            <input type="password" placeholder="AIzaSy..." className="form-input" value={keys.gemini_api_key} onChange={e => setKeys(p => ({...p, gemini_api_key: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Key 2 — Answer Generation</label>
            <input type="password" placeholder="AIzaSy..." className="form-input" value={keys.gemini_api_key_2} onChange={e => setKeys(p => ({...p, gemini_api_key_2: e.target.value}))} />
            <span className="form-hint">Falls back to Key 1 if left empty.</span>
          </div>

          {/* GROQ KEYS */}
          <p style={{fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.6px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4, marginTop: 4}}>Groq Keys</p>
          <div className="form-group">
            <label className="form-label">Key 1 — Even-numbered workflows</label>
            <input type="password" placeholder="gsk_..." className="form-input" value={keys.groq_api_key} onChange={e => setKeys(p => ({...p, groq_api_key: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Key 2 — Odd-numbered workflows</label>
            <input type="password" placeholder="gsk_..." className="form-input" value={keys.groq_api_key_2} onChange={e => setKeys(p => ({...p, groq_api_key_2: e.target.value}))} />
            <span className="form-hint">Falls back to Key 1 if left empty.</span>
          </div>

          {/* OTHER */}
          <div className="form-group">
            <label className="form-label">HuggingFace Token</label>
            <input type="password" placeholder="hf_..." className="form-input" value={keys.huggingfacehub_api_token} onChange={e => setKeys(p => ({...p, huggingfacehub_api_token: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Database URI</label>
            <input type="text" placeholder="postgresql://postgres:1234@localhost:5432/q&a_dataset" className="form-input" value={keys.database_uri} onChange={e => setKeys(p => ({...p, database_uri: e.target.value}))} />
            <span className="form-hint">Used strictly for exporting Q&A datasets.</span>
          </div>
        </div>
        <div className="modal-footer" style={{padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12}}>
          <button className="btn btn-secondary" style={{width: 'auto'}} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{width: 'auto'}} onClick={handleSave} disabled={isSaving}>
            {isSaving? 'Saving...':'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}


/* ────────────────────────────────────────────
   ROOT APP
──────────────────────────────────────────── */
let sessionCounter=0

export default function App()
{
  const [isSidebarOpen, setIsSidebarOpen]=useState(false)
  const [isConfigOpen, setIsConfigOpen]=useState(false)
  const [showSettings, setShowSettings]=useState(false)
  const [params, setParams]=useState({
    subject: '',
    difficulty: 'medium',
    bloom_levels: [],
    N: 5,
    parallel_workflows: 5
  })

  // Metadata API state
  const [subjects, setSubjects]=useState([])
  const [difficulties, setDifficulties]=useState([])
  const [bloomLevels, setBloomLevels]=useState([])
  const [isServerReady, setIsServerReady]=useState(false)

  const [messages, setMessages]=useState([])       // chat messages
  const [isRunning, setIsRunning]=useState(false)
  const [sessions, setSessions]=useState([])
  const [activeSessionId, setActiveSessionId]=useState(null)

  const [isSessionLoading, setIsSessionLoading]=useState(false)
  const [userId, setUserId]=useState(null)

  const [cooldown, setCooldown]=useState(0)

  const feedRef=useRef(null)
  const abortRef=useRef(null)
  const lastFetchedId=useRef(null)

  // Rate Limiting Cooldown Clock
  useEffect(() =>
  {
    const checkCooldown=() =>
    {
      const nextTime=parseInt(localStorage.getItem('nextRequestTime')||'0', 10)
      const now=Date.now()
      if (nextTime>now)
      {
        setCooldown(Math.ceil((nextTime-now)/1000))
      } else
      {
        setCooldown(0)
      }
    }
    checkCooldown()
    const timer=setInterval(checkCooldown, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch metadata on mount & wait for server
  useEffect(() =>
  {
    let timeoutId;
    async function fetchMetadata()
    {
      try
      {
        const res=await fetch(getApiUrl('/api/v1/metadata/all'))
        if (res.ok)
        {
          const data=await res.json()
          setSubjects(data.subjects)
          setDifficulties(data.difficulties)
          setBloomLevels(data.bloom_levels)
          setIsServerReady(true)
        } else
        {
          throw new Error("API not fully initialized")
        }
      } catch (err)
      {
        console.warn("Waiting for the agent server to start...", err)
        timeoutId=setTimeout(fetchMetadata, 2000)
      }
    }
    fetchMetadata()
    return () => clearTimeout(timeoutId)
  }, [])

  // Initialize DB User Identity
  useEffect(() =>
  {
    const localUser=localStorage.getItem('agent_user_id')
    fetch(getApiUrl('/api/v1/chats/init_user'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({user_id: localUser})
    })
      .then(res => res.json())
      .then(data =>
      {
        setUserId(data.user_id)
        localStorage.setItem('agent_user_id', data.user_id)
      })
      .catch(err => console.error("Could not init user", err))
  }, [])

  // Fetch Side Sessions
  const fetchSessions=useCallback(() =>
  {
    if (!userId) return
    fetch(getApiUrl(`/api/v1/chats/sessions/${userId}`))
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(console.error)
  }, [userId])

  useEffect(() =>
  {
    fetchSessions()
  }, [fetchSessions])

  // Fetch Feed on Session Select
  const isInitialMount=useRef(true)
  useEffect(() =>
  {
    if (isInitialMount.current) {isInitialMount.current=false; return;}
    
    // Only fetch if session CHANGED (prevents overwriting local state after generation)
    if (!activeSessionId)
    {
      setMessages([])
      lastFetchedId.current=null
      return
    }
    
    if (activeSessionId===lastFetchedId.current) return
    if (isRunning) return

    setIsSessionLoading(true)
    fetch(getApiUrl(`/api/v1/chats/sessions/${activeSessionId}/messages`))
      .then(res => res.json())
      .then(data =>
      {
        if (data&&Array.isArray(data))
        {
          setMessages(data)
          lastFetchedId.current=activeSessionId
        }
      })
      .catch(console.error)
      .finally(() => setIsSessionLoading(false))
  }, [activeSessionId, isRunning])

  // Auto-scroll chat
  useEffect(() =>
  {
    if (feedRef.current)
    {
      const el = feedRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages])

  function updateAgentStream(streamId, updater)
  {
    setMessages(prev =>
    {
      const copy=[...prev]
      const idx=copy.findIndex(m => m.id===streamId)
      if (idx!==-1)
      {
        const currentPayload = copy[idx].payload || { steps: [], status: 'running' }
        const updatedPayload = {
          ...currentPayload,
          ...updater(currentPayload)
        }
        const updated={
          ...copy[idx],
          payload: updatedPayload
        }
        copy[idx]=updated
        
        // OPTIMIZATION: Only persist to DB if status flipped to 'done' or 'error'
        if (updatedPayload.status!=='running')
        {
          saveMessage(updated, activeSessionId)
        }
        
        return copy
      }
      return copy
    })
  }

  const agentStatus=isRunning? 'thinking':(messages.length>0? 'online':'online')

  const saveMessage=(msg, sId=activeSessionId) =>
  {
    if (!sId) return
    const {icon, text, steps, status, result, params, errorMsg, ...rest}=msg

    const cleanPayload={
      ...rest,
      ...(text!==undefined&&{text}),
      ...(steps!==undefined&&{steps}),
      ...(status!==undefined&&{status}),
      ...(result!==undefined&&{result}),
      ...(params!==undefined&&{params}),
      ...(errorMsg!==undefined&&{errorMsg}),
    }

    fetch(getApiUrl('/api/v1/chats/messages'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: msg.id,
        session_id: sId,
        type: msg.type,
        payload: cleanPayload
      })
    }).catch(e => {})
  }

  function addMessage(msg, sId=activeSessionId)
  {
    setMessages(prev => [...prev, msg])
    saveMessage(msg, sId)
  }

  function updateLastAgentStream(updater, sId=activeSessionId)
  {
    setMessages(prev =>
    {
      const copy=[...prev]
      for (let i=copy.length-1;i>=0;i--)
      {
        if (copy[i].type==='agent-stream')
        {
          const currentPayload = copy[i].payload || { steps: [], status: 'running' }
          const updatedPayload = {
            ...currentPayload,
            ...updater(currentPayload)
          }
          const updated={
            ...copy[i],
            payload: updatedPayload
          }
          copy[i]=updated
          saveMessage(updated, sId)
          return copy
        }
      }
      return copy
    })
  }

  async function handleGenerate()
  {
    if (!params.subject.trim()||isRunning||!userId) return
    setIsConfigOpen(false)

    const desc=subjects.find(s => s.name===params.subject)?.description||''
    const label=`${params.subject} (${params.difficulty})`

    // Look up an existing session for this subject+difficulty
    const existing=sessions.find(s => s.label===label)
    const sessionId=existing? existing.id : crypto.randomUUID()
    const isNewSession=!existing

    // Register or update session in DB
    await fetch(getApiUrl('/api/v1/chats/sessions'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: userId,
        id: sessionId,
        label,
        q_count: params.N*params.parallel_workflows
      })
    }).catch(console.error)

    // Only clear messages if this is a brand-new session
    if (isNewSession) setMessages([])

    setActiveSessionId(sessionId)
    lastFetchedId.current = sessionId
    setIsRunning(true)

    // 1) user config bubble
    const userMsg={
      id: `u-${Date.now()}`,
      type: 'user-config',
      params: {...params, subject_description: desc},
    }
    addMessage(userMsg, sessionId)

    // 2) agent stream bubble
    const streamMessageId = `stream-${Date.now()}`
    const streamMsg={
      id: streamMessageId,
      type: 'agent-stream',
      payload: {
        steps: [],
        status: 'running',
      }
    }
    addMessage(streamMsg, sessionId)

    const controller=new AbortController()
    abortRef.current=controller

    let finalResult=null

    try
    {
      const body={
        user_id: userId,
        subject: params.subject,
        subject_description: desc,
        difficulty: params.difficulty,
        bloom_level: params.bloom_level||null,
        N: params.N,
        parallel_workflows: params.parallel_workflows,
        count: 0,
      }

      const res=await fetch(getApiUrl('/api/v1/generate/stream'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok)
      {
        if (res.status===429)
        {
          const errData=await res.json()
          throw new Error(errData.detail||"Rate limit exceeded. Please wait.")
        }
        throw new Error(`Server error: ${res.status}`)
      }

      const reader=res.body.getReader()
      const decoder=new TextDecoder()
      let buffer=''

      while (true)
      {
        const {done, value}=await reader.read()
        if (done) break

        buffer+=decoder.decode(value, {stream: true})
        const lines=buffer.split('\n')
        buffer=lines.pop()??''

        for (const line of lines)
        {
          const trimmed=line.trim()
          if (!trimmed) continue

          let parsed
          try {parsed=JSON.parse(trimmed)} catch {continue}

          if (parsed.step==='started')
          {
            updateAgentStream(streamMessageId, p => ({
              steps: [...(p?.steps || []), {type: 'done', label: 'Stream started'}],
            }))
          } else if (parsed.step==='progress'&&parsed.data)
          {
            const raw=parsed.data
            const name=parseName(raw)

            updateAgentStream(streamMessageId, p => ({
              steps: [...(p?.steps || []), {
                type: 'done',
                label: `✓ ${formatNodeName(name)}`,
                raw,
              }],
            }))
          } else if (parsed.step==='completed')
          {
            updateAgentStream(streamMessageId, () => ({status: 'done'}))
          } else if (parsed.step==='result')
          {
            finalResult=parsed.result;
            // Immediate completion if result is received 
            updateAgentStream(streamMessageId, () => ({status: 'done'}))
          } else if (parsed.step==='error')
          {
            updateAgentStream(streamMessageId, () => ({
              status: 'error',
              steps: [],
              errorMsg: parsed.message,
            }))
            addMessage({
              id: `err-${Date.now()}`,
              type: 'system',
              iconName: 'x',
              text: `Agent error: ${parsed.message}`,
            }, sessionId)
          }
        }
      }

      // 3) completion system message and result bubble
      if (finalResult&&finalResult.length>0)
      {
        addMessage({
          id: `sys-${Date.now()}`,
          type: 'system',
          iconName: 'check',
          text: 'Generation complete. Questions saved to Pinecone vector store.',
        }, sessionId)
        addMessage({
          id: `res-${Date.now()}`,
          type: 'qa-result',
          result: finalResult,
          params: {...params}
        }, sessionId)

        // Trigger 2 minute cooldown visually and locally
        localStorage.setItem('nextRequestTime', Date.now()+120000)
        setCooldown(120)

        // Refresh sidebar to move this subject to top
        fetchSessions()
      } else
      {
        addMessage({
          id: `sys-${Date.now()}`,
          type: 'system',
          iconName: 'alert',
          text: 'Generation completed but no question output could be parsed.',
        }, sessionId)
      }

      // Update sessions history locally (DB handles initial creation, but we update UI)
      setSessions(prev => [
        ...prev,
        {
          id: sessionId,
          label: `${params.subject} (${params.difficulty})`,
          qCount: params.N*params.parallel_workflows,
        },
      ])

    } catch (err)
    {
      if (err.name==='AbortError')
      {
        updateLastAgentStream(() => ({status: 'error'}), sessionId)
        addMessage({
          id: `sys-${Date.now()}`,
          type: 'system',
          iconName: 'shuffle',
          text: 'Generation aborted by user.',
        }, sessionId)
      } else
      {
        updateLastAgentStream(() => ({status: 'error'}), sessionId)
        const isRl=err.name==='Error'&&err.message.toLowerCase().includes('wait');
        addMessage({
          id: `sys-${Date.now()}`,
          type: 'system',
          iconName: isRl? 'clock':'x',
          text: isRl? err.message:`Connection error: ${err.message}. Is the FastAPI server running on port 8000?`,
        }, sessionId)
      }
    } finally
    {
      setIsRunning(false)
      abortRef.current=null
    }
  }

  function handleClear()
  {
    if (isRunning&&abortRef.current)
    {
      abortRef.current.abort()
    } else
    {
      setMessages([])
    }
  }

  return !isServerReady? (
    <div className="preloader-overlay">
      <div className="preloader-orbits">
        <div className="orbit orbit-1"></div>
        <div className="orbit orbit-2"></div>
        <div className="orbit orbit-3"></div>
        <div className="orbit-core" style={{width: 48, height: 48}}><Icon.QyroLogo /></div>
      </div>
      <div className="preloader-text-container">
        <h2 className="preloader-title">Initializing Qyro Agent</h2>
        <p className="preloader-subtitle">Establishing connection to Qyro Server...</p>
      </div>
    </div>
  ):(
    <div className={`shell ${isSidebarOpen? 'sidebar-open':''} ${isConfigOpen? 'config-open':''}`}>
      {/* Backdrop for mobile overlays */}
      {(isSidebarOpen || isConfigOpen) && (
        <div className="drawer-overlay" onClick={() => { setIsSidebarOpen(false); setIsConfigOpen(false); }} />
      )}

      {/* ── SIDEBAR ── */}
      <Sidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        agentStatus={agentStatus}
        onNewChat={() => {setActiveSessionId(null); setMessages([]); setIsSidebarOpen(false)}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* ── MAIN ── */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar__title">
            <button className="icon-btn mobile-only" onClick={() => setIsSidebarOpen(true)}>
              <span style={{display: 'flex', width: 20, height: 20}}><Icon.Menu /></span>
            </button>
            <div className="logo__icon" style={{width: 28, height: 28, borderRadius: 6, background: 'var(--white)', padding: 3, marginLeft: '4px'}}>
              <Icon.QyroLogo />
            </div>
            Qyro <span className="tag">Agent v1.0</span>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn mobile-only" title="Configure" onClick={() => setIsConfigOpen(true)}>
              <span style={{display: 'flex', width: 20, height: 20}}><Icon.Wrench /></span>
            </button>
            <button className="icon-btn" title="Settings" onClick={() => setShowSettings(true)}>
              <span style={{display: 'flex', width: 20, height: 20}}><Icon.Settings /></span>
            </button>
            <button className="icon-btn" title="Clear chat" onClick={handleClear}>
              <span style={{display: 'flex', width: 20, height: 20}}><Icon.Clear /></span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="app-content">
          <div className="body">
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} userId={userId} />

            {/* CHAT CONTAINER (Feed) */}
            <div className="chat-container">
              <div className="chat-feed" ref={feedRef}>
              {isSessionLoading? (
                <div className="session-loader">
                  <div className="session-loader__spinner">
                    <div className="session-loader__ring"></div>
                    <div className="session-loader__icon"><Icon.QyroLogo /></div>
                  </div>
                  <p className="session-loader__text">Loading session…</p>
                </div>
              ):!activeSessionId? (
                <div className="empty-state">
                  <div className="empty-state__icon"><Icon.QyroLogo /></div>
                  <h2 className="empty-state__title">Ready to Generate</h2>
                  <p className="empty-state__desc">
                    Configure your parameters and click <strong>Generate Q&A</strong> to start the agent pipeline.<br/>
                    Questions will stream in real-time.
                  </p>
                </div>
              ):(
                messages.map(msg =>
                {
                  if (msg.type==='user-config')
                  {
                    return <UserConfigBubble key={msg.id} params={msg.params} />
                  }
                  if (msg.type==='agent-stream')
                  {
                    return (
                      <AgentStreamBubble
                        key={msg.id}
                        {...(msg.payload || {})}
                        id={msg.id}
                      />
                    )
                  }
                  if (msg.type==='qa-result')
                  {
                    return (
                      <QAResultBubble
                        key={msg.id}
                        result={msg.result}
                        params={msg.params}
                      />
                    )
                  }
                  if (msg.type==='system')
                  {
                    return <SystemMsg key={msg.id} msg={msg} />
                  }
                  return null
                })
              )}
              {/* typing indicator while running */}
              {isRunning&&(
                <div className="msg-group agent" style={{paddingTop: 0}}>
                  <div className="msg-bubble" style={{paddingTop: 10, paddingBottom: 10}}>
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          <div className={`form-panel-wrapper ${isConfigOpen ? 'active' : ''}`}>
            <FormPanel
              params={params}
              setParams={setParams}
              onGenerate={handleGenerate}
              onClear={() => setMessages([])}
              isRunning={isRunning}
              subjects={subjects}
              difficulties={difficulties}
              bloomLevels={bloomLevels}
              cooldown={cooldown}
              isOpen={true} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}
