/* ═══ DESIGN TOKENS SECTION ═══ */

const TOKEN_COLORS = [
  { name: 'Ink', var: '--ink', hex: '#292524', desc: 'Primary text, dark surfaces' },
  { name: 'Ink 2', var: '--ink-2', hex: '#57534e', desc: 'Secondary text' },
  { name: 'Ink 3', var: '--ink-3', hex: '#78716c', desc: 'Muted text, labels' },
  { name: 'Ink 4', var: '--ink-4', hex: '#a8a29e', desc: 'Placeholder, disabled' },
  { name: 'Ink 5', var: '--ink-5', hex: '#d6d3d1', desc: 'Borders, dividers' },
  { name: 'Cream', var: '--cream', hex: '#f5f3f0', desc: 'Surface / background' },
  { name: 'Cream 2', var: '--cream-2', hex: '#ece8e3', desc: 'Hover / subtle bg' },
  { name: 'Cream 3', var: '--cream-3', hex: '#e7e2dc', desc: 'Active / pressed bg' },
];
const TOKEN_ACCENTS = [
  { name: 'Amber', var: '--amber', hex: '#f59e0b', desc: 'Brand accent' },
  { name: 'Amber Deep', var: '--amber-d', hex: '#d97706', desc: 'Hover / active' },
  { name: 'Amber Light', var: '--amber-l', hex: '#fef3c7', desc: 'Highlight bg' },
  { name: 'Blue', var: '--blue', hex: '#3b82f6', desc: 'Applied status' },
  { name: 'Purple', var: '--purple', hex: '#8b5cf6', desc: 'Screening status' },
  { name: 'Green', var: '--green', hex: '#22c55e', desc: 'Offer / success' },
  { name: 'Red', var: '--red', hex: '#ef4444', desc: 'Error / closed' },
];

const DARK_COLORS = [
  { name: 'Ink', hex: '#f5f3f0' },
  { name: 'Ink 2', hex: '#d6d3d1' },
  { name: 'Ink 3', hex: '#a8a29e' },
  { name: 'Ink 4', hex: '#78716c' },
  { name: 'Cream', hex: '#1c1917' },
  { name: 'Cream 2', hex: '#292524' },
  { name: 'Cream 3', hex: '#44403c' },
];

const TYPE_SCALE = [
  { name: 'Display', family: 'Archivo', weight: 800, size: '40px', tracking: '-0.03em', sample: 'Track your next chapter.' },
  { name: 'Heading 1', family: 'Archivo', weight: 700, size: '28px', tracking: '-0.025em', sample: 'Application Overview' },
  { name: 'Heading 2', family: 'Archivo', weight: 700, size: '20px', tracking: '-0.015em', sample: 'Interview Schedule' },
  { name: 'Heading 3', family: 'Archivo', weight: 700, size: '15px', tracking: '-0.01em', sample: 'Upcoming Events' },
  { name: 'Body', family: 'System sans', weight: 400, size: '14px', tracking: '0', sample: 'Body copy uses the platform\'s default sans-serif.' },
  { name: 'Small', family: 'System sans', weight: 500, size: '12px', tracking: '0', sample: 'Secondary descriptions and metadata' },
  { name: 'Mono Label', family: 'JetBrains Mono', weight: 600, size: '10px', tracking: '0.08em', sample: 'APPLIED · 12 DAYS AGO', transform: 'uppercase' },
  { name: 'Mono Data', family: 'JetBrains Mono', weight: 500, size: '13px', tracking: '0.04em', sample: '$70K – $170K USD' },
];

const SPACING = [4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 72];

const RADII = [
  { name: 'sm', val: '4px' }, { name: 'md', val: '7px' }, { name: 'lg', val: '10px' },
  { name: 'xl', val: '14px' }, { name: '2xl', val: '18px' }, { name: 'full', val: '999px' },
];

const SHADOWS = [
  { name: 'Subtle', val: '0 1px 2px rgba(0,0,0,.04)' },
  { name: 'Card', val: '0 2px 12px rgba(0,0,0,.07)' },
  { name: 'Elevated', val: '0 8px 28px rgba(0,0,0,.12)' },
  { name: 'Overlay', val: '0 12px 40px rgba(0,0,0,.18)' },
];

function ColorSwatch({ name, hex, desc, isAccent }) {
  const isDark = ['#292524','#57534e','#78716c','#1c1917'].includes(hex);
  return (
    <div style={{
      background: hex, borderRadius: 12, padding: '14px 16px', minHeight: 100,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      color: isDark || isAccent ? '#fff' : 'var(--ink)',
      border: hex === '#f5f3f0' || hex === '#ece8e3' || hex === '#e7e2dc' || hex === '#fef3c7' ? '1px solid var(--rule)' : 'none'
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 13 }}>{name}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .75, marginTop: 2 }}>{hex}</div>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, opacity: .7, marginTop: 8 }}>{desc}</div>
    </div>
  );
}

function TokensSection() {
  return (
    <div>
      {/* Colors */}
      <DSSubsection title="Core Palette">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {TOKEN_COLORS.map(c => <ColorSwatch key={c.var} {...c} />)}
        </div>
      </DSSubsection>

      <DSSubsection title="Accent & Status">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {TOKEN_ACCENTS.map(c => <ColorSwatch key={c.var} {...c} isAccent />)}
        </div>
      </DSSubsection>

      <DSSubsection title="Dark Mode Mapping">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {DARK_COLORS.map(c => <ColorSwatch key={c.name + 'dk'} name={c.name} hex={c.hex} desc="Dark variant" />)}
        </div>
      </DSSubsection>

      {/* Typography */}
      <DSSubsection title="Type Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TYPE_SCALE.map(t => (
            <div key={t.name} className="glass" style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '16px 20px', borderRadius: 10 }}>
              <div style={{ minWidth: 140, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                {t.name}<br /><span style={{ textTransform: 'none', letterSpacing: 0, fontSize: 9 }}>{t.family} · {t.weight} · {t.size}</span>
              </div>
              <div style={{
                fontFamily: t.family === 'JetBrains Mono' ? 'var(--mono)' : t.family === 'Archivo' ? 'var(--display)' : 'var(--font)',
                fontWeight: t.weight, fontSize: t.size, letterSpacing: t.tracking,
                textTransform: t.transform || 'none', color: 'var(--ink)', flex: 1
              }}>{t.sample}</div>
            </div>
          ))}
        </div>
      </DSSubsection>

      {/* Spacing */}
      <DSSubsection title="Spacing Scale">
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {SPACING.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: s, height: s, background: 'var(--amber)', borderRadius: Math.min(s / 4, 6), opacity: .7 }}></div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)' }}>{s}</span>
            </div>
          ))}
        </div>
      </DSSubsection>

      {/* Radii */}
      <DSSubsection title="Border Radii">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {RADII.map(r => (
            <div key={r.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 56, height: 56, background: 'var(--cream-2)', border: '2px solid var(--amber)', borderRadius: r.val }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)' }}>{r.val}</div>
              </div>
            </div>
          ))}
        </div>
      </DSSubsection>

      {/* Shadows */}
      <DSSubsection title="Shadows">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {SHADOWS.map(s => (
            <div key={s.name} style={{ padding: 24, borderRadius: 14, background: 'var(--g-bg)', boxShadow: s.val, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', textAlign: 'center', wordBreak: 'break-all' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </DSSubsection>

      {/* Glass */}
      <DSSubsection title="Glass Effect">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {['Subtle', 'Default', 'Heavy'].map((g, i) => (
            <div key={g} style={{
              padding: 24, borderRadius: 14, textAlign: 'center',
              background: ['rgba(255,255,255,.85)', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.4)'][i],
              backdropFilter: `blur(${[6, 14, 22][i]}px)`,
              border: `1px solid ${['rgba(0,0,0,.05)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)'][i]}`
            }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>{g}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-3)', marginTop: 4 }}>
                blur({[6, 14, 22][i]}px) · bg {[85, 55, 40][i]}%
              </div>
            </div>
          ))}
        </div>
      </DSSubsection>
    </div>
  );
}

Object.assign(window, { TokensSection });
