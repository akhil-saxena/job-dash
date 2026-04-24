/* ═══ BUTTONS, INPUTS, SELECTS, CHECKBOXES, RADIOS, TOGGLES ═══ */

function ButtonsSection() {
  const [loading, setLoading] = React.useState(false);
  return (
    <div>
      <DSSubsection title="Button Variants">
        <StateRow label="Primary (dark)">
          <button className="ds-btn dark">Default</button>
          <button className="ds-btn dark hover">Hover</button>
          <button className="ds-btn dark" style={{ opacity: .5, pointerEvents: 'none' }}>Disabled</button>
          <button className="ds-btn dark loading" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>
            {loading ? <><span className="spinner"></span>Saving…</> : 'Click to load'}
          </button>
        </StateRow>
        <StateRow label="Amber (CTA)">
          <button className="ds-btn amber">Default</button>
          <button className="ds-btn amber hover">Hover</button>
          <button className="ds-btn amber" style={{ opacity: .5 }}>Disabled</button>
        </StateRow>
        <StateRow label="Secondary">
          <button className="ds-btn">Default</button>
          <button className="ds-btn hover">Hover</button>
          <button className="ds-btn" style={{ opacity: .5 }}>Disabled</button>
        </StateRow>
        <StateRow label="Ghost">
          <button className="ds-btn ghost">Default</button>
          <button className="ds-btn ghost hover">Hover</button>
          <button className="ds-btn ghost" style={{ opacity: .5 }}>Disabled</button>
        </StateRow>
        <StateRow label="Danger">
          <button className="ds-btn danger">Delete</button>
          <button className="ds-btn danger hover">Hover</button>
        </StateRow>
      </DSSubsection>

      <DSSubsection title="Button Sizes">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="ds-btn dark" style={{ fontSize: 11, padding: '4px 10px' }}>Small</button>
          <button className="ds-btn dark">Medium</button>
          <button className="ds-btn dark" style={{ fontSize: 14, padding: '10px 20px' }}>Large</button>
        </div>
      </DSSubsection>

      <DSSubsection title="Icon Buttons">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 5v14M5 12h14"></path></svg></button>
          <button className="ds-icbtn active"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect></svg></button>
          <button className="ds-icbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
        </div>
      </DSSubsection>

      <DSSubsection title="Button with icons">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ds-btn dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M12 5v14M5 12h14"></path></svg>Add Application</button>
          <button className="ds-btn amber">Advance →</button>
          <button className="ds-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Upload</button>
          <button className="ds-btn ghost">↗ Open full posting</button>
        </div>
      </DSSubsection>
    </div>
  );
}

function InputsSection() {
  const [val, setVal] = React.useState('');
  const [focused, setFocused] = React.useState(null);
  return (
    <div>
      <DSSubsection title="Text Input States">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div className="ds-field">
            <label className="ds-label">Company</label>
            <input className="ds-input" placeholder="Enter company name…" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Role</label>
            <input className="ds-input" defaultValue="Senior Engineer" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Disabled</label>
            <input className="ds-input" defaultValue="Can't edit" disabled />
          </div>
          <div className="ds-field">
            <label className="ds-label">Error</label>
            <input className="ds-input error" defaultValue="bad@" />
            <span className="ds-error-text">Please enter a valid URL</span>
          </div>
          <div className="ds-field">
            <label className="ds-label">With icon</label>
            <div className="ds-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"></circle></svg>
              <input className="ds-input" placeholder="Search applications…" />
              <span className="ds-kbd">⌘K</span>
            </div>
          </div>
          <div className="ds-field">
            <label className="ds-label">Salary</label>
            <div className="ds-input-wrap">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>$</span>
              <input className="ds-input" placeholder="0" type="text" style={{ fontFamily: 'var(--mono)' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)' }}>USD</span>
            </div>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Textarea">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="ds-field">
            <label className="ds-label">Notes</label>
            <textarea className="ds-textarea" rows={4} placeholder="Add notes about this application…"></textarea>
          </div>
          <div className="ds-field">
            <label className="ds-label">Cover letter excerpt</label>
            <textarea className="ds-textarea" rows={4} defaultValue="I'm excited about Automattic's async-first culture and would love to contribute to WooCommerce's payments infrastructure."></textarea>
          </div>
        </div>
      </DSSubsection>

      <DSSubsection title="Select / Dropdown">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <SelectDropdown label="Stage" options={['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer']} defaultVal="Applied" dotColors={{ Wishlist: 'var(--ink-4)', Applied: 'var(--blue)', Screening: 'var(--purple)', Interviewing: 'var(--amber)', Offer: 'var(--green)' }} />
          <SelectDropdown label="Priority" options={['Low', 'Medium', 'High', 'Urgent']} defaultVal="Medium" dotColors={{ Low: 'var(--ink-5)', Medium: 'var(--amber)', High: 'var(--red)', Urgent: 'var(--red)' }} />
          <SelectDropdown label="Source" options={['Company Website', 'LinkedIn', 'Referral', 'AngelList', 'Other']} defaultVal="Company Website" />
        </div>
      </DSSubsection>
    </div>
  );
}

function SelectDropdown({ label, options, defaultVal, dotColors }) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(defaultVal);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <div className="ds-field" ref={ref}>
      <label className="ds-label">{label}</label>
      <div className="ds-select" onClick={() => setOpen(!open)} data-open={open}>
        {dotColors && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColors[selected] || 'var(--ink-4)', flexShrink: 0 }}></span>}
        <span style={{ flex: 1 }}>{selected}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ transition: 'transform .15s', transform: open ? 'rotate(180deg)' : '' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {open && (
        <div className="ds-dropdown">
          {options.map(o => (
            <div key={o} className={`ds-dropdown-item ${o === selected ? 'active' : ''}`} onClick={() => { setSelected(o); setOpen(false); }}>
              {dotColors && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColors[o] || 'var(--ink-4)' }}></span>}
              {o}
              {o === selected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ControlsSection() {
  const [checks, setChecks] = React.useState({ a: true, b: false, c: false });
  const [radio, setRadio] = React.useState('remote');
  const [toggles, setToggles] = React.useState({ notif: true, dark: false, auto: true });

  return (
    <div>
      <DSSubsection title="Checkboxes">
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { id: 'a', label: 'Remote only' },
            { id: 'b', label: 'Has referral' },
            { id: 'c', label: 'Cover letter sent' },
          ].map(c => (
            <label key={c.id} className="ds-check-label">
              <div className={`ds-checkbox ${checks[c.id] ? 'checked' : ''}`}
                onClick={() => setChecks(p => ({ ...p, [c.id]: !p[c.id] }))}>
                {checks[c.id] && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              {c.label}
            </label>
          ))}
          <label className="ds-check-label" style={{ opacity: .5 }}>
            <div className="ds-checkbox disabled"></div>
            Disabled
          </label>
        </div>
      </DSSubsection>

      <DSSubsection title="Radio Buttons">
        <div style={{ display: 'flex', gap: 24 }}>
          {['remote', 'hybrid', 'onsite'].map(v => (
            <label key={v} className="ds-check-label" onClick={() => setRadio(v)}>
              <div className={`ds-radio ${radio === v ? 'checked' : ''}`}>
                {radio === v && <div className="ds-radio-dot"></div>}
              </div>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </label>
          ))}
        </div>
      </DSSubsection>

      <DSSubsection title="Toggles">
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { id: 'notif', label: 'Email notifications' },
            { id: 'dark', label: 'Dark mode' },
            { id: 'auto', label: 'Auto-advance stage' },
          ].map(t => (
            <label key={t.id} className="ds-check-label">
              <div className={`ds-toggle ${toggles[t.id] ? 'on' : ''}`}
                onClick={() => setToggles(p => ({ ...p, [t.id]: !p[t.id] }))}>
                <div className="ds-toggle-thumb"></div>
              </div>
              {t.label}
            </label>
          ))}
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { ButtonsSection, InputsSection, ControlsSection, SelectDropdown });
