/* ============================================================
   TideOS — Tweaks island (React) driving CSS vars on the vanilla OS
   ============================================================ */
const TIDE_TWEAKS = /*EDITMODE-BEGIN*/{
  "mood": "day",
  "accent": "#38bdf8",
  "parallax": 1,
  "bubbles": true,
  "glass": 22
}/*EDITMODE-END*/;

const ACCENT2 = {
  "#38bdf8": "#0ea5e9",
  "#22d3ee": "#0891b2",
  "#60a5fa": "#2563eb",
  "#34d399": "#059669",
  "#f59e0b": "#d97706"
};

function TideTweaks() {
  const [t, setTweak] = useTweaks(TIDE_TWEAKS);
  const root = document.documentElement;

  React.useEffect(() => {
    root.dataset.mood = t.mood === 'day' ? '' : t.mood;
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-2', ACCENT2[t.accent] || '#0ea5e9');
    root.style.setProperty('--parallax', String(t.parallax));
    root.dataset.bubbles = t.bubbles ? 'on' : 'off';
    // glass blur tweak — rewrite backdrop on widgets/dock
    document.querySelectorAll('.widget, .dock').forEach(el => {
      el.style.backdropFilter = `blur(${t.glass}px) saturate(165%)`;
      el.style.webkitBackdropFilter = `blur(${t.glass}px) saturate(165%)`;
    });
  }, [t.mood, t.accent, t.parallax, t.bubbles, t.glass]);

  // dock "Personalize" button opens the panel even outside host edit mode
  React.useEffect(() => {
    const open = () => window.dispatchEvent(new MessageEvent('message', { data: { type: '__activate_edit_mode' } }));
    window.addEventListener('tide-open-tweaks', open);
    return () => window.removeEventListener('tide-open-tweaks', open);
  }, []);

  return (
    <TweaksPanel title="Personalize ZICTAOS">
      <TweakSection label="Ocean mood" />
      <TweakRadio label="Scene" value={t.mood} options={['day', 'dusk', 'deep']}
        onChange={(v) => setTweak('mood', v)} />
      <TweakSection label="Accent" />
      <TweakColor label="Primary" value={t.accent}
        options={['#38bdf8', '#22d3ee', '#60a5fa', '#34d399', '#f59e0b']}
        onChange={(v) => setTweak('accent', v)} />
      <TweakSection label="Atmosphere" />
      <TweakSlider label="Parallax depth" value={t.parallax} min={0} max={2} step={0.1}
        onChange={(v) => setTweak('parallax', v)} />
      <TweakSlider label="Glass blur" value={t.glass} min={6} max={40} step={1} unit="px"
        onChange={(v) => setTweak('glass', v)} />
      <TweakToggle label="Floating bubbles" value={t.bubbles}
        onChange={(v) => setTweak('bubbles', v)} />
      <TweakSection label="System" />
      <TweakButton label="Replay boot-up" onClick={() => {
        const b = document.getElementById('boot');
        document.body.classList.remove('os-ready');
        b.classList.remove('done');
        document.getElementById('bootBar').style.width = '0%';
        if (window.__tideBoot) window.__tideBoot();
      }} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TideTweaks />);
