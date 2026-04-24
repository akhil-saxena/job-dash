/* ═══ APP SHELL — sidebar nav + section rendering ═══ */

const SECTIONS = [
  { id: 'tokens', label: 'Design Tokens', icon: 'palette' },
  { id: 'buttons', label: 'Buttons & CTAs', icon: 'pointer' },
  { id: 'inputs', label: 'Inputs & Selects', icon: 'text' },
  { id: 'controls', label: 'Checkboxes & Toggles', icon: 'toggle' },
  { id: 'datepicker', label: 'Date Picker', icon: 'calendar' },
  { id: 'chips', label: 'Chips & Badges', icon: 'tag' },
  { id: 'cards', label: 'Cards & Containers', icon: 'card' },
  { id: 'modals', label: 'Modals & Dialogs', icon: 'modal' },
  { id: 'tooltips', label: 'Tooltips & Popovers', icon: 'tooltip' },
  { id: 'tables', label: 'Tables', icon: 'table' },
  { id: 'tabs', label: 'Tabs & Navigation', icon: 'tabs' },
  { id: 'dragdrop', label: 'Drag & Drop', icon: 'drag' },
  { id: 'feedback', label: 'Toasts & Progress', icon: 'bell' },
  { id: 'avatars', label: 'Avatars & Presence', icon: 'avatar' },
];

function NavIcon({ type }) {
  const s = { width: 15, height: 15, display: 'inline-block', verticalAlign: 'middle' };
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (type) {
    case 'palette': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/></svg>;
    case 'pointer': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="4" y="8" width="16" height="8" rx="4"/></svg>;
    case 'text': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>;
    case 'toggle': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="1" y="7" width="22" height="10" rx="5"/><circle cx="16" cy="12" r="3"/></svg>;
    case 'calendar': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'tag': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
    case 'card': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case 'modal': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'tooltip': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'table': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'tabs': return <svg viewBox="0 0 24 24" {...p} style={s}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M8 6V10"/><path d="M14 6V10"/></svg>;
    case 'drag': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>;
    case 'bell': return <svg viewBox="0 0 24 24" {...p} style={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'avatar': return <svg viewBox="0 0 24 24" {...p} style={s}><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>;
    default: return null;
  }
}

function DSSubsection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 4, height: 14, background: 'var(--amber)', borderRadius: 2 }}></span>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function StateRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function DSApp() {
  const [section, setSection] = React.useState('tokens');
  const [dark, setDark] = React.useState(false);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  React.useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [section]);

  const renderSection = () => {
    switch (section) {
      case 'tokens': return <TokensSection />;
      case 'buttons': return <ButtonsSection />;
      case 'inputs': return <InputsSection />;
      case 'controls': return <ControlsSection />;
      case 'datepicker': return <DatePickerSection />;
      case 'chips': return <ChipsSection />;
      case 'cards': return <CardsSection />;
      case 'modals': return <ModalsSection />;
      case 'tooltips': return <TooltipsSection />;
      case 'tables': return <TablesSection />;
      case 'tabs': return <TabsSection />;
      case 'dragdrop': return <DragDropSection />;
      case 'feedback': return <FeedbackSection />;
      case 'avatars': return <AvatarsSection />;
      default: return null;
    }
  };

  return (
    <div className="ds-chrome">
      <aside className="ds-sidebar">
        <div className="ds-sidebar-logo">
          <svg viewBox="0 0 210 100" width="28" height="14">
            <g stroke="var(--amber)" strokeLinecap="round" fill="none" strokeWidth="5">
              <line x1="16" y1="42" x2="60" y2="42" opacity=".5"/>
              <line x1="14" y1="54" x2="72" y2="54" opacity=".85"/>
              <line x1="20" y1="66" x2="60" y2="66" opacity=".5"/>
            </g>
            <g transform="translate(100 20) skewX(-14)">
              <rect x="0" y="0" width="40" height="12" rx="2" fill="var(--ink)"/>
              <rect x="14" y="0" width="12" height="48" rx="2" fill="var(--ink)"/>
              <path d="M 20 48 Q 20 64 6 64 Q -4 64 -5 54" fill="none" stroke="var(--amber)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </svg>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, letterSpacing: '-.02em' }}>Design System</span>
        </div>

        <div className="ds-sidebar-section">
          <div className="ds-sidebar-label">Components</div>
          {SECTIONS.map(s => (
            <div key={s.id} className={`ds-sidebar-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
              <NavIcon type={s.icon} />
              {s.label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid var(--rule)' }}>
          <label className="ds-check-label" style={{ fontSize: 12, gap: 8 }}>
            <div className={`ds-toggle ${dark ? 'on' : ''}`} onClick={() => setDark(!dark)}>
              <div className="ds-toggle-thumb"></div>
            </div>
            Dark mode
          </label>
        </div>
      </aside>

      <main className="ds-main" ref={contentRef}>
        <div className="ds-main-hd">
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.025em' }}>
              {SECTIONS.find(s => s.id === section)?.label}
            </h1>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>
              JobDash UI Kit · v1.0
            </p>
          </div>
        </div>
        <div className="ds-main-body">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { DSApp, DSSubsection, StateRow, NavIcon });
