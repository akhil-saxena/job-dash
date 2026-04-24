/* ═══ DATE PICKER, CHIPS, TAGS, BADGES ═══ */

function DatePickerSection() {
  const [selectedDate, setSelectedDate] = React.useState(24);
  const [month] = React.useState(3); // April 2026
  const [open, setOpen] = React.useState(true);
  const today = 24;
  const daysInMonth = 30;
  const startDay = 3; // April 2026 starts on Wednesday
  const monthName = 'April 2026';
  const events = { 24: 'Recruiter intro', 29: 'Tech screen' };

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <DSSubsection title="Date Picker">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Calendar */}
          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>{monthName}</span>
              <button className="ds-icbtn" style={{ width: 28, height: 28 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-4)', padding: '4px 0', letterSpacing: '.05em' }}>{d}</div>
              ))}
              {days.map((d, i) => (
                <div key={i} onClick={() => d && setSelectedDate(d)} style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, fontSize: 12, fontWeight: d === selectedDate ? 700 : 400, cursor: d ? 'pointer' : 'default',
                  background: d === selectedDate ? 'var(--amber)' : d === today && d !== selectedDate ? 'var(--amber-l)' : 'transparent',
                  color: d === selectedDate ? '#fff' : d ? 'var(--ink)' : 'transparent',
                  position: 'relative',
                  transition: 'background .1s',
                }}>
                  {d || ''}
                  {d && events[d] && <span style={{ position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: '50%', background: d === selectedDate ? '#fff' : 'var(--amber)' }}></span>}
                </div>
              ))}
            </div>
            {selectedDate && events[selectedDate] && (
              <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--amber-l)', border: '1px solid rgba(245,158,11,.2)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber-d)', fontWeight: 600 }}>
                {events[selectedDate]} · Apr {selectedDate}
              </div>
            )}
          </div>

          {/* Date input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="ds-field">
              <label className="ds-label">Interview date</label>
              <div className="ds-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <input className="ds-input" value={`Apr ${selectedDate}, 2026`} readOnly style={{ fontFamily: 'var(--mono)' }} />
              </div>
            </div>
            <div className="ds-field">
              <label className="ds-label">Date range</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="ds-input-wrap" style={{ flex: 1 }}>
                  <input className="ds-input" value="Apr 16" readOnly style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)' }}>→</span>
                <div className="ds-input-wrap" style={{ flex: 1 }}>
                  <input className="ds-input" value="Apr 30" readOnly style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DSSubsection>
    </div>
  );
}

function ChipsSection() {
  const [tags, setTags] = React.useState(['React', 'TypeScript', 'Remote', 'Async']);
  const [inputVal, setInputVal] = React.useState('');

  const removeTag = (t) => setTags(tags.filter(x => x !== t));
  const addTag = () => { if (inputVal.trim()) { setTags([...tags, inputVal.trim()]); setInputVal(''); } };

  return (
    <div>
      <DSSubsection title="Chips / Tags">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {tags.map(t => (
            <span key={t} className="ds-chip">
              {t}
              <span className="ds-chip-x" onClick={() => removeTag(t)}>×</span>
            </span>
          ))}
          <input className="ds-chip-input" placeholder="Add tag…" value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()} />
        </div>
      </DSSubsection>

      <DSSubsection title="Chip Variants">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="ds-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path></svg>Remote</span>
          <span className="ds-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>$70K–170K</span>
          <span className="ds-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>2d ago</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Skill Chips (match/miss)">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="ds-skill match"><span className="dot" style={{ background: '#22c55e' }}></span>React · 5y</span>
          <span className="ds-skill match"><span className="dot" style={{ background: '#22c55e' }}></span>TypeScript · 4y</span>
          <span className="ds-skill match"><span className="dot" style={{ background: '#22c55e' }}></span>PHP · 3y</span>
          <span className="ds-skill miss"><span className="dot" style={{ background: '#ef4444' }}></span>WordPress ecosystem</span>
          <span className="ds-skill miss"><span className="dot" style={{ background: '#ef4444' }}></span>GraphQL at scale</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Badges">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="ds-badge upcoming">Upcoming</span>
          <span className="ds-badge passed">Passed</span>
          <span className="ds-badge pending">Pending</span>
          <span className="ds-badge done">Done</span>
          <span className="ds-badge" style={{ background: 'var(--amber-l)', color: 'var(--amber-d)' }}>3</span>
          <span className="ds-badge" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>New</span>
          <span className="ds-badge" style={{ background: 'rgba(239,68,68,.12)', color: '#b91c1c' }}>Urgent</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Pipeline Stepper">
        <div className="glass" style={{ padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 0 }}>
          {['Saved','Applied','Screening','Interview','Offer'].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <div style={{ width: 24, height: 1, background: 'var(--ink-5)', flexShrink: 0 }}></div>}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '0 10px',
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
                color: i < 2 ? 'var(--ink-3)' : i === 2 ? 'var(--blue)' : 'var(--ink-4)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: i < 2 ? 'var(--ink-3)' : i === 2 ? 'var(--blue)' : 'var(--ink-5)',
                  boxShadow: i === 2 ? '0 0 0 4px rgba(59,130,246,.15)' : 'none'
                }}></span>
                {s}
              </div>
            </React.Fragment>
          ))}
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { DatePickerSection, ChipsSection });
