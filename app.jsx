// app.jsx — Moto Fácil landing
const { useState, useEffect, useRef, useMemo } = React;

const SB_URL = "https://hxafbnhqvzgjyxhkpxxb.supabase.co";
const SB_KEY = "sb_publishable_wmBhcq00_rhSujycjPoGfw_shkalHY5";
const sb     = supabase.createClient(SB_URL, SB_KEY);

// Production stubs — tweaks-panel.js only loads on localhost
if (typeof useTweaks === 'undefined') {
  window.useTweaks   = (defaults) => [defaults, () => {}];
  window.TweaksPanel = () => null;
  window.TweakSection = () => null;
  window.TweakText   = () => null;
  window.TweakColor  = () => null;
  window.TweakRadio  = () => null;
  window.TweakSlider = () => null;
  window.TweakToggle = () => null;
  window.TweakSelect = () => null;
  window.TweakNumber = () => null;
  window.TweakButton = () => null;
  window.TweakRow    = () => null;
}

// ─── TWEAK DEFAULTS ──────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "motofacil",
  "accent": "#C9A84C",
  "accent2": "#C0392B",
  "displayFont": "Barlow Condensed",
  "bodyFont": "Manrope",
  "radius": 12,
  "brandName": "Moto Fácil",
  "headline": "O banco fechou a porta. A Moto Fácil abriu a garagem.",
  "subhead": "Venda e locação de motos sem consulta ao SPC ou Serasa. Aqui você não é um CPF. Você é uma pessoa com um sonho.",
  "ctaPrimary": "Chamar no WhatsApp",
  "ctaSecondary": "Ver motos disponíveis",
  "whatsappNumber": "5516991471592",
  "whatsappDisplay": "(16) 99147-1592",
  "instagram": "https://instagram.com/motoo_facil",
  "facebook": "https://facebook.com/motoofacil",
  "address": "Av. N. Sra. Aparecida, 540 · Sertãozinho/SP",
  "hours": "Seg–Sex 8h–18h · Sáb 8h–12h",
  "cursor": false,
  "marquee": true,
  "showProcess": true,
  "showFilters": true,
  "showSale": true,
  "showRental": true,
  "showFeatures": true,
  "showTestimonials": true,
  "showFAQ": true,
  "showCTA": true,
  "showStores": true
}/*EDITMODE-END*/;

// ─── PALETTES ────────────────────────────────────────────────────────────────
const PALETTES = {
  motofacil: { bg: "#0A0A0A", surface: "#141414", surface2: "#1E1E1E", line: "#2a2620", fg: "#FFFFFF", muted: "#9E9E9E", isDark: true },
  fogoeouro: { bg: "#0A0A0A", surface: "#171411", surface2: "#221d17", line: "#2e2820", fg: "#FFFFFF", muted: "#BDBDBD", isDark: true },
  vermelho:  { bg: "#B71C1C", surface: "#9a1616", surface2: "#7a1010", line: "#cc3a3a", fg: "#FFFFFF", muted: "#F5F5F5", isDark: true },
  noir:      { bg: "#0d0c0a", surface: "#161410", surface2: "#1f1c16", line: "#26231d", fg: "#f4f0e8", muted: "#a6a094", isDark: true },
};

const wa = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg || "Olá! Vim pelo site e quero saber sobre as motos disponíveis.")}`;

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
const REVEAL_DEPS = [];
function useReveal() {
  useEffect(() => {
    const reveal = (el) => el.setAttribute("data-revealed", "true");
    const flush = () => {
      const vh = window.innerHeight;
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.88 && r.bottom > 0) reveal(el);
      });
    };
    flush();
    let io;
    try {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => io.observe(el));
    } catch (_) {}
    const t1 = setTimeout(flush, 60);
    const t2 = setTimeout(flush, 400);
    const onScroll = () => flush();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", flush);
    return () => {
      if (io) io.disconnect();
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", flush);
    };
  }, REVEAL_DEPS);
}

// ─── CUSTOM CURSOR ───────────────────────────────────────────────────────────
function CustomCursor({ enabled, accent }) {
  const ref = useRef(null), ringRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const dot = ref.current, ring = ringRef.current;
    if (!dot || !ring) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x-3}px,${y-3}px,0)`;
      ring.style.transform = `translate3d(${rx-18}px,${ry-18}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    const over = (e) => {
      const t = e.target.closest("a,button,[data-cursor='hover']");
      ring.classList.toggle("cur-ring--hover", !!t);
    };
    addEventListener("mousemove", move);
    addEventListener("mouseover", over);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", move);
      removeEventListener("mouseover", over);
    };
  }, [enabled]);
  if (!enabled) return null;
  return (<>
    <div ref={ref} className="cur-dot" style={{ background: accent }} />
    <div ref={ringRef} className="cur-ring" style={{ borderColor: accent }} />
  </>);
}

// ─── SOCIAL ICONS ────────────────────────────────────────────────────────────
function SocialIcon({ kind, size = 18 }) {
  const s = { width: size, height: size, fill: "currentColor" };
  if (kind === "instagram") return (
    <svg viewBox="0 0 24 24" {...s}><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.06-1.07.05-1.65.22-2.04.37-.51.2-.88.44-1.26.83-.39.38-.63.75-.83 1.26-.15.39-.32.97-.37 2.04C2.7 8.5 2.7 8.85 2.7 12s0 3.5.06 4.74c.05 1.07.22 1.65.37 2.04.2.51.44.88.83 1.26.38.39.75.63 1.26.83.39.15.97.32 2.04.37 1.24.06 1.59.06 4.74.06s3.5 0 4.74-.06c1.07-.05 1.65-.22 2.04-.37.51-.2.88-.44 1.26-.83.39-.38.63-.75.83-1.26.15-.39.32-.97.37-2.04.06-1.24.06-1.59.06-4.74s0-3.5-.06-4.74c-.05-1.07-.22-1.65-.37-2.04a3.4 3.4 0 0 0-.83-1.26 3.4 3.4 0 0 0-1.26-.83c-.39-.15-.97-.32-2.04-.37C15.5 4 15.15 4 12 4zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2.5a1.17 1.17 0 1 1 0 2.34 1.17 1.17 0 0 1 0-2.34z"/></svg>
  );
  if (kind === "facebook") return (
    <svg viewBox="0 0 24 24" {...s}><path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.75 8.43-4.91 8.43-9.93z"/></svg>
  );
  if (kind === "whatsapp") return (
    <svg viewBox="0 0 24 24" {...s}><path d="M17.5 14.4c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15s-.77.98-.94 1.18c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.27.5 1.71.64.72.23 1.37.2 1.88.12.57-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35zM12.05 21.4h-.04c-1.7 0-3.37-.46-4.83-1.33l-.34-.2-3.6.94.96-3.5-.22-.36a9.55 9.55 0 0 1-1.46-5.07c0-5.27 4.29-9.56 9.57-9.56 2.55 0 4.95.99 6.76 2.8a9.5 9.5 0 0 1 2.8 6.77 9.57 9.57 0 0 1-9.6 9.51zm8.14-17.67A11.34 11.34 0 0 0 12.05.4C5.81.4.74 5.46.74 11.7c0 2 .52 3.95 1.51 5.67l-1.6 5.86 6-1.57c1.66.91 3.53 1.39 5.42 1.39h.01c6.24 0 11.31-5.07 11.31-11.3 0-3.02-1.18-5.86-3.3-7.99z"/></svg>
  );
  return null;
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
function TopBar({ t }) {
  return (
    <div className="topbar">
      <div className="topbar__inner">
        <div className="topbar__left">
          <span className="mono"><span className="topbar__pin" /> {t.address}</span>
        </div>
        <div className="topbar__right">
          <a href={t.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="topbar__soc"><SocialIcon kind="instagram" size={15} /></a>
          <a href={t.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="topbar__soc"><SocialIcon kind="facebook" size={15} /></a>
          <a href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="topbar__soc topbar__soc--wa">
            <SocialIcon kind="whatsapp" size={15} /> {t.whatsappDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ t }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on(); addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  const links = [
    { l: "Motos à venda", h: "#venda" },
    { l: "Motos para aluguel", h: "#aluguel" },
    { l: "Como funciona", h: "#como-funciona" },
    { l: "Depoimentos", h: "#depoimentos" },
    { l: "Contato", h: "#contato" },
  ];
  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__brand" aria-label={t.brandName}>
          <span className="nav__brandname">
            MOTO<span style={{ color: t.accent2 }}>FÁCIL</span>
          </span>
        </a>
        <nav className="nav__links" aria-label="Principal">
          {links.map((x) => (<a key={x.l} href={x.h}>{x.l}</a>))}
        </nav>
        <div className="nav__right">
          <a className="btn btn--wa btn--sm" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="Chamar no WhatsApp pelo menu">
            <SocialIcon kind="whatsapp" size={16} /> {t.ctaPrimary}
          </a>
        </div>
        <button className="nav__burger" aria-label="Menu" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <div className="nav__mobile">
          {links.map((x) => (<a key={x.l} href={x.h} onClick={() => setOpen(false)}>{x.l}</a>))}
          <a className="btn btn--wa" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">
            <SocialIcon kind="whatsapp" size={16} /> {t.ctaPrimary}
          </a>
        </div>
      )}
    </header>
  );
}

// ─── HERO CAROUSEL ───────────────────────────────────────────────────────────
function HeroCarousel({ motos, t, p, priceCfg }) {
  const featured = useMemo(() => {
    const pop = motos.filter(m => m.pop);
    return (pop.length >= 2 ? pop : motos).slice(0, 3);
  }, [motos]);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => go((idx - 1 + featured.length) % featured.length);
  const next = () => go((idx + 1) % featured.length);

  useEffect(() => {
    if (featured.length < 2) return;
    const id = setInterval(() => {
      setDir(1);
      setIdx(i => (i + 1) % featured.length);
    }, 5000);
    return () => clearInterval(id);
  }, [featured.length]);

  if (!featured.length) return null;
  const moto = featured[idx];
  const imgSrc = (moto.fotos && moto.fotos.length > 0)
    ? moto.fotos[0]
    : MOTO_IMGS[idx % MOTO_IMGS.length];

  return (
    <div className="hcar" style={{ borderRadius: t.radius * 1.4 }}>
      <div className="hcar__slide" key={idx}>
        <img className="hcar__img" src={imgSrc} alt={moto.name} loading="eager" />
        <div className="hcar__overlay" />
        <div className="hcar__info">
          <span className="hcar__tag" style={{ background: t.accent2 }}>EM DESTAQUE</span>
          <p className="hcar__name">{moto.name}</p>
          <div className="hcar__price">
            {priceCfg?.preco !== false && moto.price > 0 && <span className="hcar__val">{moto.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span>}
            {moto.year && <span className="hcar__year">{moto.year}</span>}
          </div>
          <a className="btn btn--primary hcar__cta" href="#venda" style={{ background: t.accent, color: "#0A0A0A" }}>Ver moto</a>
        </div>
      </div>
      {featured.length > 1 && (
        <>
          <button className="hcar__arrow hcar__arrow--prev" onClick={prev} aria-label="Anterior">
            <svg viewBox="0 0 10 16" width="10" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2L2 8l6 6"/></svg>
          </button>
          <button className="hcar__arrow hcar__arrow--next" onClick={next} aria-label="Próxima">
            <svg viewBox="0 0 10 16" width="10" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l6 6-6 6"/></svg>
          </button>
          <div className="hcar__dots">
            {featured.map((_, i) => (
              <button key={i} className={`hcar__dot${i === idx ? " hcar__dot--active" : ""}`} onClick={() => go(i)} aria-label={`Moto ${i + 1}`} style={i === idx ? { background: t.accent } : {}} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero({ t, p, motos, priceCfg }) {
  return (
    <section className="hero" id="top">
      <div className="hero__blob hero__blob--a" style={{ background: `radial-gradient(closest-side, ${t.accent}40, transparent 70%)` }} />
      <div className="hero__blob hero__blob--b" style={{ background: `radial-gradient(closest-side, ${t.accent2}40, transparent 70%)` }} />
      <div className="hero__grid">
        <div className="hero__copy">
          <img src="assets/logo-motofacil.webp" alt="Moto Fácil" className="hero__logo" width="600" height="447" fetchpriority="high" data-reveal />
          <span className="section__tag hero__tag" style={{ color: t.accent }} data-reveal>
            VENDA · LOCAÇÃO · SEM CONSULTA AO SPC/SERASA
          </span>
          <h1 className="hero__title" data-reveal>{t.headline}</h1>
          <p className="hero__sub" data-reveal>{t.subhead}</p>
          <div className="hero__ctas" data-reveal>
            <a className="btn btn--wa btn--lg" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="Chamar no WhatsApp agora">
              <SocialIcon kind="whatsapp" size={18} /> {t.ctaPrimary}
            </a>
            <a className="btn btn--outline btn--lg" href="#venda">{t.ctaSecondary}</a>
          </div>
          <div className="hero__badges" data-reveal>
            <span className="badge"><span className="badge__check" style={{ background: t.accent }}>✓</span> Crédito facilitado</span>
            <span className="badge"><span className="badge__check" style={{ background: t.accent }}>✓</span> Sai no mesmo dia</span>
            <span className="badge"><span className="badge__check" style={{ background: t.accent }}>✓</span> Venda e locação</span>
          </div>
        </div>
        <div className="hero__art" data-reveal style={{ "--ry": "0px", "--rx": "32px" }}>
          <HeroCarousel motos={motos} t={t} p={p} priceCfg={priceCfg} />
        </div>
      </div>
    </section>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee({ accent2 }) {
  const items = ["Sertãozinho · SP", "Venda no crédito facilitado", "Locação disponível", "Sai no mesmo dia", "Sem consulta ao SPC ou Serasa", "Foto na saída da loja"];
  const row = [...items, ...items, ...items];
  return (
    <div className="marq" aria-hidden>
      <div className="marq__track">
        {row.map((m, i) => (
          <span key={i} className="marq__item">
            <span className="marq__diamond" style={{ background: accent2 }} />
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── FEATURE BELTS ───────────────────────────────────────────────────────────
function FeatureBelts({ t }) {
  const items = [
    { num: "0", label: "Consultas ao SPC", desc: "Não verificamos seu histórico de crédito. Aqui você é uma pessoa, não um CPF." },
    { num: "1", label: "Dia pra sair de moto", desc: "Converse hoje, assine hoje, saia de moto hoje mesmo. Foto na saída é tradição." },
    { num: "2", label: "Opções: venda ou locação", desc: "Começa alugando e decide se compra depois. Sem pressão, sem fiador." },
  ];
  return (
    <section className="feat-belts">
      <div className="feat-belts__grid">
        {items.map((it, i) => (
          <div key={i} className="feat-belt" data-reveal style={{ "--d": `${i * 90}ms` }}>
            <span className="feat-belt__ghost" style={{ color: t.accent2 }} aria-hidden="true">{it.num}</span>
            <div className="feat-belt__num" style={{ color: t.accent2 }}>{it.num}</div>
            <p className="feat-belt__title">{it.label}</p>
            <p>{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PROCESS ─────────────────────────────────────────────────────────────────
function StepIcon({ step, color }) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (step === 1) return (
    <svg viewBox="0 0 32 32" width="26" height="26">
      <ellipse {...s} cx="16" cy="22" rx="12" ry="4"/>
      <path {...s} d="M4 22c0-4 2-7 5-9l2-6h10l2 6c3 2 5 5 5 9"/>
      <path {...s} d="M10 13h12M13 10l-1 3M19 10l1 3"/>
    </svg>
  );
  if (step === 2) return (
    <svg viewBox="0 0 32 32" width="26" height="26">
      <path {...s} d="M4 8h18a2 2 0 012 2v9a2 2 0 01-2 2H10l-4 4V10a2 2 0 012-2z"/>
      <path {...s} d="M10 14h8M10 18h5"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 32 32" width="26" height="26">
      <circle {...s} cx="12" cy="20" r="6"/>
      <path {...s} d="M18 20h2l6-8-2-2-8 6"/>
      <circle {...s} cx="12" cy="20" r="2"/>
    </svg>
  );
}

function Process({ t }) {
  const steps = [
    { n: "01", t: "Compra ou aluguel — você decide.", d: "Tem as duas opções: compra no crédito facilitado ou começa alugando e decide depois. Olha o catálogo ou chama no WhatsApp — a gente te ajuda a achar o que faz mais sentido pro seu bolso.", step: 1 },
    { n: "02", t: "A gente conversa. Sem consulta ao SPC.", d: "Aqui não tem formulário de banco, não tem aprovação de crédito, não tem Serasa. A gente te escuta de verdade e mostra o valor que cabe no que você ganha hoje.", step: 2 },
    { n: "03", t: "Você sai de moto. Hoje mesmo.", d: "Documentação resolvida na hora, no mesmo dia. Foto na saída da loja — tradição da casa. Você começa a usar antes de anoitecer.", step: 3 },
  ];
  return (
    <section className="proc" id="como-funciona">
      <div className="section__head" data-reveal>
        <span className="section__tag" style={{ color: t.accent }}>COMO FUNCIONA</span>
        <h2 className="section__title">3 passos pra sair daqui<br/>com sua moto hoje.</h2>
        <p className="section__sub">Sem burocracia, sem surpresa, sem consulta ao banco. Em qualquer etapa você pode chamar no WhatsApp.</p>
      </div>
      <div className="proc__grid">
        {steps.map((s, i) => (
          <div key={s.n} className="step" data-reveal style={{ "--d": `${i * 120}ms`, borderRadius: t.radius }}>
            <span className="step__wm" aria-hidden>{s.n}</span>
            <div className="step__head">
              <span className="step__n" style={{ color: t.accent }}>{s.n}</span>
            </div>
            <h3 className="step__t">{s.t}</h3>
            <p className="step__d">{s.d}</p>
            {i < 2 && <div className="step__arrow"><svg viewBox="0 0 10 16" width="10" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l6 6-6 6"/></svg></div>}
          </div>
        ))}
      </div>
      <div className="proc__cta" data-reveal>
        <a className="btn btn--wa btn--lg" href={wa(t.whatsappNumber, "Olá! Quero entender melhor como funciona a compra/aluguel sem consulta.")} target="_blank" rel="noreferrer">
          <SocialIcon kind="whatsapp" size={18} /> Quero saber mais
        </a>
        <span className="mono proc__small">Uma mensagem no WhatsApp separa você da sua moto.</span>
      </div>
    </section>
  );
}


// ─── QUICK FILTERS ───────────────────────────────────────────────────────────
const MOTO_IMGS = ["assets/moto-placeholder.webp"];
const MODELS_SALE = [
  { name: "Honda Biz 110i", brand: "Honda", year: 2024, km: 0, price: 12990, color: "Vermelha", cat: "Urbana", pop: true },
  { name: "Honda CG 160 Start", brand: "Honda", year: 2023, km: 8500, price: 14500, color: "Preta", cat: "Urbana" },
  { name: "Honda Fan 160", brand: "Honda", year: 2024, km: 0, price: 16900, color: "Cinza", cat: "Urbana" },
  { name: "Yamaha Factor 150", brand: "Yamaha", year: 2023, km: 12000, price: 14200, color: "Vermelha", cat: "Urbana" },
  { name: "Yamaha Fazer 250", brand: "Yamaha", year: 2024, km: 0, price: 21900, color: "Azul", cat: "Sport", pop: true },
  { name: "Honda XRE 190 ABS", brand: "Honda", year: 2023, km: 15000, price: 19800, color: "Vermelha", cat: "Adventure", pop: true },
];
const MODELS_RENT = [
  { name: "Honda Biz 110i", brand: "Honda", week: 220, day: 45, cat: "Trabalho urbano", pop: true },
  { name: "Honda CG 160 Cargo", brand: "Honda", week: 280, day: 55, cat: "Delivery", pop: true },
  { name: "Yamaha Factor 150", brand: "Yamaha", week: 260, day: 50, cat: "Trabalho urbano" },
  { name: "Honda Pop 110i", brand: "Honda", week: 180, day: 38, cat: "Econômica" },
];

function QuickFilters({ filters, setFilters, t, motoCount, motos }) {
  const src = motos && motos.length ? motos : MODELS_SALE;
  const allBrands = useMemo(() => ["Todas", ...new Set(src.map(m => m.brand))], [src]);
  const allYears = useMemo(() => ["Todos", ...new Set(src.map(m => String(m.year)).filter(Boolean))], [src]);
  const allColors = useMemo(() => ["Todas", ...new Set(src.map(m => m.color).filter(Boolean))], [src]);
  const allCats = useMemo(() => ["Todas", ...new Set(src.map(m => m.cat).filter(Boolean))], [src]);

  const set = (k, v) => setFilters({ ...filters, [k]: v });

  return (
    <section className="filters" id="filtros">
      <div className="section__head" data-reveal>
        <span className="section__tag" style={{ color: t.accent }}>FILTRO RÁPIDO</span>
        <h2 className="section__title">Acha a moto certa<br/>em 30 segundos.</h2>
      </div>
      <div className="filters__bar" data-reveal style={{ borderRadius: t.radius }}>
        <Field label="Categoria"><Select value={filters.cat} onChange={(v) => set("cat", v)} options={allCats} /></Field>
        <Field label="Marca"><Select value={filters.brand} onChange={(v) => set("brand", v)} options={allBrands} /></Field>
        <Field label="Ano"><Select value={filters.year} onChange={(v) => set("year", v)} options={allYears} /></Field>
        <Field label="Cor"><Select value={filters.color} onChange={(v) => set("color", v)} options={allColors} /></Field>
        <Field label="KM máx.">
          <input className="ff__input" type="number" placeholder="Ex: 20000" value={filters.km} onChange={(e) => set("km", e.target.value)} />
        </Field>
        <Field label="Preço máx.">
          <div className="ff__priced">
            <span>R$</span>
            <input className="ff__input" type="number" placeholder="20000" value={filters.price} onChange={(e) => set("price", e.target.value)} />
          </div>
        </Field>
        <div className="filters__count">
          <strong style={{ color: t.accent }}>{motoCount}</strong>
          <span className="mono">moto{motoCount === 1 ? "" : "s"} encontrada{motoCount === 1 ? "" : "s"}</span>
        </div>
        <button className="ff__reset mono" onClick={() => setFilters({ cat: "Todas", brand: "Todas", year: "Todos", color: "Todas", km: "", price: "" })}>limpar</button>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="ff">
      <span className="ff__lbl mono">{label}</span>
      {children}
    </label>
  );
}
function Select({ value, onChange, options }) {
  return (
    <div className="ff__select">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg viewBox="0 0 12 8" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l5 5 5-5"/></svg>
    </div>
  );
}

// ─── MOTOS À VENDA ───────────────────────────────────────────────────────────
function Sale({ t, p, filters, motos, priceCfg }) {
  const list = motos || [];
  return (
    <section className="catalog" id="venda">
      <div className="section__head section__head--row" data-reveal>
        <div>
          <span className="section__tag" style={{ color: t.accent }}>MOTOS À VENDA</span>
          <h2 className="section__title">Estoque do dia.<br/>Pronto pra sair.</h2>
        </div>
        <a className="btn btn--outline" href="/catalogo.html?tipo=venda">Ver catálogo completo</a>
      </div>
      <div className="catalog__grid">
        {list.map((c, i) => <MotoCard key={c.name + i} c={c} t={t} p={p} mode="sale" idx={i} priceCfg={priceCfg} />)}
        {list.length === 0 && (
          <div className="catalog__empty" data-reveal>
            <span className="mono">Nenhuma moto bate com esses filtros.</span>
            <p>Chama no WhatsApp que a gente encontra a moto certa pra você.</p>
            <a className="btn btn--wa" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">
              <SocialIcon kind="whatsapp" size={16} /> Falar com a gente
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function CardPhotoCarousel({ fotos, name, radius }) {
  const [fi, setFi] = useState(0);
  const imgs = fotos && fotos.length > 0 ? fotos : MOTO_IMGS;
  const total = imgs.length;
  const prev = (e) => { e.stopPropagation(); setFi(i => (i - 1 + total) % total); };
  const next = (e) => { e.stopPropagation(); setFi(i => (i + 1) % total); };
  return (
    <div className="card__img" style={{ borderRadius: `${radius}px ${radius}px 0 0` }}>
      <img src={imgs[fi]} alt={name} loading="lazy" />
      {total > 1 && (<>
        <button className="card__carr-btn card__carr-btn--prev" onClick={prev} aria-label="Foto anterior">‹</button>
        <button className="card__carr-btn card__carr-btn--next" onClick={next} aria-label="Próxima foto">›</button>
        <div className="card__carr-dots">
          {imgs.map((_, i) => <span key={i} className={`card__carr-dot${i === fi ? " card__carr-dot--on" : ""}`} />)}
        </div>
      </>)}
    </div>
  );
}

function MotoCard({ c, t, p, mode, idx, priceCfg }) {
  const cfg = priceCfg || {};
  const showPreco   = mode === "sale"   ? cfg.preco   !== false : cfg.preco_mensal !== false;
  const showEntrada = mode === "sale"   && cfg.entrada !== false && c.entrada;
  const showParcela = mode === "sale"   && cfg.parcela !== false && c.parcela;
  const showDiaria  = mode === "rent"   && cfg.preco_diaria !== false && c.day;
  const priceLabel  = mode === "sale"
    ? (showPreco && c.price ? `R$ ${c.price.toLocaleString("pt-BR")}` : null)
    : (showPreco && c.month ? `R$ ${c.month.toLocaleString("pt-BR")}/mês` : (showDiaria ? `R$ ${c.day}/dia` : null));
  return (
    <article className="card" data-reveal style={{ "--d": `${idx * 80}ms`, borderRadius: t.radius }} data-cursor="hover">
      <div style={{ position: "relative" }}>
        <CardPhotoCarousel fotos={c.fotos} name={c.name} radius={t.radius} />
        {c.pop && <span className="card__badge" style={{ background: t.accent, color: "#111" }}>POPULAR</span>}
        {mode === "rent" && <span className="card__badge card__badge--rent" style={{ background: t.accent2, color: "#fff" }}>ALUGUEL</span>}
      </div>
      <div className="card__body">
        <div className="card__top">
          <span className="card__brand mono">{c.brand}</span>
          {mode === "sale" && c.km === 0 && <span className="card__zero mono" style={{ color: "#7A5A10" }}>0 KM</span>}
        </div>
        <h3 className="card__name">{c.name}</h3>
        <div className="card__meta mono">
          {mode === "sale" ? (<>
            <span>{c.year}</span><span>·</span><span>{c.km === 0 ? "0 km" : `${c.km.toLocaleString("pt-BR")} km`}</span><span>·</span><span>{c.color}</span>
          </>) : (<>
            <span>{c.cat}</span>
          </>)}
        </div>
        {(priceLabel || showEntrada || showParcela) && (
        <div className="card__price">
          {priceLabel && <span className="card__price-big" style={{ color: mode === "sale" ? "#7A5A10" : t.accent }}>{priceLabel}</span>}
          {(showEntrada || showParcela) && (
            <span className="card__price-small">
              {showEntrada ? `Entrada: R$ ${c.entrada.toLocaleString("pt-BR")}` : ""}
              {showEntrada && showParcela ? " · " : ""}
              {showParcela ? `R$ ${c.parcela.toLocaleString("pt-BR")}/mês` : ""}
              {!showEntrada && !showParcela ? "ou parcelas que cabem no seu dia" : ""}
            </span>
          )}
          {!showEntrada && !showParcela && priceLabel && mode === "sale" && (
            <span className="card__price-small">ou parcelas que cabem no seu dia</span>
          )}
        </div>
        )}
        <a className="card__cta btn btn--wa btn--full" href={wa(t.whatsappNumber, `Olá! Quero saber sobre a ${c.name} (${mode === "sale" ? "compra" : "aluguel"}).`)} target="_blank" rel="noreferrer" aria-label={`Tenho interesse: ${c.name}`}>
          <SocialIcon kind="whatsapp" size={15} /> Tenho interesse
        </a>
      </div>
    </article>
  );
}

// ─── MOTOS PARA ALUGUEL ──────────────────────────────────────────────────────
function Rental({ t, p, motos, priceCfg }) {
  const list = motos || [];
  return (
    <section className="catalog catalog--rent" id="aluguel">
      <div className="section__head section__head--row" data-reveal>
        <div>
          <span className="section__tag" style={{ color: t.accent2 }}>ALUGUEL</span>
          <h2 className="section__title">Começa usando.<br/>Depois decide se compra.</h2>
          <p className="section__sub">Aluguel ideal pra motoboy, delivery e quem precisa rodar agora. Sem fiador, com manutenção inclusa.</p>
        </div>
        <a className="btn btn--outline" href="/catalogo.html?tipo=aluguel">Ver motos para aluguel</a>
      </div>
      <div className="catalog__grid">
        {list.map((c, i) => <MotoCard key={c.name + i} c={c} t={t} p={p} mode="rent" idx={i} priceCfg={priceCfg} />)}
      </div>
      <div className="rent__incl" data-reveal style={{ borderRadius: t.radius }}>
        <span className="section__tag rent__incl-tag" style={{ color: "var(--accent2)" }}>INCLUSO NO ALUGUEL</span>
        <div className="rent__incl-grid">
          {[
            ["Manutenção", "preventiva e corretiva"],
            ["Documentação", "em dia e regularizada"],
            ["Troca de moto", "se der problema, troca na hora"],
            ["Sem fiador", "sem papelada, sem burocracia"],
          ].map(([h, d]) => (
            <div key={h} className="rent__incl-item">
              <span className="rent__incl-check" style={{ background: t.accent }}>✓</span>
              <div>
                <strong>{h}</strong>
                <span className="mono">{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function Features({ t }) {
  const items = [
    {
      k: "01",
      t: "Loja em Sertãozinho. Vem conhecer.",
      d: "Av. Nossa Senhora Aparecida, 540. Vem ver a moto de perto, tomar um café, fazer sua pergunta olho no olho.",
      icon: "store",
    },
    {
      k: "02",
      t: "Quem teve o crédito negado no banco é bem-vindo.",
      d: "Se você trabalha e tem renda, a gente conversa. A gente ouve a situação e vê o que cabe no seu bolso.",
      icon: "handshake",
    },
    {
      k: "03",
      t: "O que você viu é o que você leva.",
      d: "Nenhuma sai da loja sem revisão. Você não leva surpresa.",
      icon: "wrench",
    },
    {
      k: "04",
      t: "Pós-venda no WhatsApp.",
      d: "Qualquer dúvida depois da compra ou do aluguel — chama. A gente responde.",
      icon: "chat",
    },
  ];
  return (
    <section className="features">
      <div className="section__head" data-reveal>
        <span className="section__tag" style={{ color: t.accent }}>POR QUE A MOTO FÁCIL</span>
        <h2 className="section__title">Empresa de bairro.<br/>Compromisso real.</h2>
      </div>
      <div className="features__grid">
        {items.map((f, i) => (
          <article key={f.k} className="feat" data-reveal style={{ "--d": `${i * 100}ms` }}>
            <span className="feat__k mono" style={{ color: t.accent }}>{f.k}</span>
            <h3 className="feat__t">{f.t}</h3>
            <p className="feat__d">{f.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function FeatIcon({ name, color }) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "store")     return <svg viewBox="0 0 32 32" width="32" height="32"><path {...s} d="M4 13V28h24V13"/><path {...s} d="M2 13h28M10 28V20h12v8"/><path {...s} d="M6 13V8l4-4h12l4 4v5"/></svg>;
  if (name === "handshake") return <svg viewBox="0 0 32 32" width="32" height="32"><path {...s} d="M2 18l6 6 5-5 4 2 5-1 8-8"/><path {...s} d="M21 10l-5 5-4-2-4 4"/><path {...s} d="M26 4l4 4-4 4-4-4 4-4z"/><path {...s} d="M6 20l-4 4 4 4 4-4-4-4z"/></svg>;
  if (name === "wrench")    return <svg viewBox="0 0 32 32" width="32" height="32"><path {...s} d="M20 4a8 8 0 0 1 2 13L9 30a3 3 0 0 1-4-4L18 13A8 8 0 0 1 20 4z"/><path {...s} d="M20 4l4 4-2 2-4-4 2-2z"/></svg>;
  if (name === "chat")      return <svg viewBox="0 0 32 32" width="32" height="32"><path {...s} d="M28 6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6l4 5 4-5h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/><path {...s} d="M10 14h12M10 19h7"/></svg>;
  return null;
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
function Testimonials({ t }) {
  const items = [
    { q: "Trabalhei 3 anos de entrega na bicicleta. Aqui saí daqui de moto — e a parcela cabe no que eu ganho no app.", n: "Anderson R.", c: "Motoboy · 24 anos", initial: "A" },
    { q: "Nome sujo de uma dívida antiga. Nenhum banco aprovava. Aqui foi sem julgamento, sem vergonha. Tô rodando até hoje.", n: "Rodrigo M.", c: "Trabalhador autônomo · 28 anos", initial: "R" },
    { q: "Nunca achei que ia ter minha própria moto. Hoje não dependo mais de ninguém pra ir trabalhar. É outra liberdade.", n: "Camila S.", c: "Autônoma · 32 anos", initial: "C" },
    { q: "Primeira moto da minha vida. Não tinha histórico de nada — e eles não pediram fiador. Saí dirigindo no mesmo dia.", n: "Lucas P.", c: "Primeira moto · 19 anos", initial: "L" },
  ];
  return (
    <section className="test" id="depoimentos">
      <div className="section__head" data-reveal>
        <span className="section__tag" style={{ color: t.accent }}>DEPOIMENTOS</span>
        <h2 className="section__title">Cada história aqui<br/>começou com um "não" lá fora.</h2>
      </div>
      <div className="test__grid">
        {items.map((it, i) => (
          <figure key={i} className="quote" data-reveal style={{ "--d": `${i * 90}ms`, borderRadius: t.radius }}>
            <div className="quote__stars">
              {Array.from({ length: 5 }).map((_, k) => (
                <svg key={k} viewBox="0 0 24 24" width="14" height="14" fill={t.accent}><path d="M12 2l2.9 7.1L22 10l-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.3L2 10l7.1-.9z"/></svg>
              ))}
            </div>
            <blockquote className="quote__q">"{it.q}"</blockquote>
            <figcaption className="quote__c">
              <div className="quote__av" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}>{it.initial}</div>
              <div>
                <div className="quote__n">{it.n}</div>
                <div className="quote__r mono">{it.c}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ({ t }) {
  const [open, setOpen] = useState(0);
  const items = [
    { q: "Vocês consultam SPC ou Serasa?", a: "Não. A gente não consulta SPC nem Serasa. Sem consulta significa exatamente isso: a gente não consulta. Aqui o que importa é você, não seu CPF." },
    { q: "Posso comprar com nome sujo?", a: "Pode. CPF negativado não é o fim — é onde a gente começa. Você merece sua moto independente do que seu CPF diz." },
    { q: "Qual a diferença entre comprar e alugar?", a: "Compra: você fica com a moto e paga em parcelas que cabem no seu dia. Aluguel: você começa usando agora, com manutenção inclusa, e decide depois se compra. Ideal pra motoboy começar a rodar hoje." },
    { q: "Preciso de fiador ou comprovante de renda?", a: "Não precisa de fiador. A gente conversa com você de pessoa pra pessoa pra entender o que cabe — sem juridiquês, sem papelada infinita." },
    { q: "Quanto tempo demora pra sair de moto?", a: "Você pode sair com a moto no mesmo dia. Foto na saída da loja é tradição Moto Fácil 🏍️." },
    { q: "Tem moto pra delivery / motoboy?", a: "Tem. A maior parte do nosso aluguel é pra quem trabalha de delivery (iFood, Rappi, 99, Uber Eats). Manutenção e documentação inclusas." },
  ];
  return (
    <section className="faq">
      <div className="section__head" data-reveal>
        <span className="section__tag" style={{ color: t.accent }}>PERGUNTAS FREQUENTES</span>
        <h2 className="section__title">Sem juridiquês.<br/>Sem letra miúda.</h2>
      </div>
      <div className="faq__list">
        {items.map((it, i) => (
          <div key={i} className={`q ${open === i ? "q--open" : ""}`} data-reveal style={{ "--d": `${i * 50}ms` }}>
            <button className="q__btn" onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="q__t">{it.q}</span>
              <span className="q__plus" style={{ background: t.accent }}>
                <span /><span />
              </span>
            </button>
            <div className="q__a"><p>{it.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA({ t }) {
  return (
    <section className="cta" id="contato">
      <div className="cta__box" data-reveal>
        <div className="cta__copy">
          <span className="section__tag cta__tag" style={{ color: "rgba(255,255,255,0.7)" }}>PRÓXIMO PASSO</span>
          <h2 className="cta__title">Uma mensagem<br/>separa você<br/>da sua moto.</h2>
          <p className="cta__sub">Chama a gente no WhatsApp. Sem compromisso, sem julgamento. A gente entende seu momento e mostra o que dá pra fazer hoje.</p>
          <div className="cta__socials">
            <a href={t.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="cta__soc"><SocialIcon kind="instagram" size={20} /></a>
            <a href={t.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="cta__soc"><SocialIcon kind="facebook" size={20} /></a>
          </div>
        </div>
        <div className="cta__card" style={{ borderRadius: t.radius }}>
          <span className="mono cta__card-tag">Atendimento via WhatsApp</span>
          <div className="cta__card-num">{t.whatsappDisplay}</div>
          <a className="btn btn--wa btn--full btn--lg" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">
            <SocialIcon kind="whatsapp" size={18} /> {t.ctaPrimary}
          </a>
          <span className="cta__card-small mono">Moto Fácil. Porque difícil já foi demais.</span>
        </div>
      </div>
    </section>
  );
}

// ─── STORES / MAP ────────────────────────────────────────────────────────────
function Stores({ t }) {
  const addr = "Av. Nossa Senhora Aparecida, 540, Sertãozinho, SP, Brasil";
  const addrQ = encodeURIComponent(addr);
  const mapSrc = `https://maps.google.com/maps?q=${addrQ}&output=embed&z=17`;
  const directions = `https://maps.google.com/?q=${addrQ}`;
  return (
    <section className="stores" id="loja">
      <div className="section__head" data-reveal>
        <span className="section__tag" style={{ color: t.accent }}>NOSSA LOJA</span>
        <h2 className="section__title">Vem tomar um café<br/>e olhar de perto.</h2>
      </div>
      <div className="stores__grid" data-reveal style={{ borderRadius: t.radius }}>
        <div className="stores__info">
          <div className="stores__name">
            <span className="stores__pin" style={{ background: t.accent2 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M12 2a8 8 0 00-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
            </span>
            <h3>Matriz · Sertãozinho</h3>
          </div>
          <ul className="stores__list">
            <li className="stores__row">
              <span className="stores__ico" style={{ color: t.accent2 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a8 8 0 00-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 00-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div>
                <strong>Av. Nossa Senhora Aparecida, 540</strong>
                <span className="mono">Sertãozinho · SP</span>
              </div>
            </li>
            <li className="stores__row">
              <span className="stores__ico" style={{ color: t.accent2 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0122 16.92z"/></svg>
              </span>
              <div>
                <strong>{t.whatsappDisplay}</strong>
                <span className="mono">WhatsApp · ligações e mensagens</span>
              </div>
            </li>
            <li className="stores__row">
              <span className="stores__ico" style={{ color: t.accent2 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </span>
              <div>
                <strong>{t.hours}</strong>
                <span className="mono">Domingos · fechado</span>
              </div>
            </li>
          </ul>
          <div className="stores__ctas">
            <a className="btn btn--wa btn--full" href={wa(t.whatsappNumber, "Olá! Quero passar na loja. Estão atendendo agora?")} target="_blank" rel="noreferrer">
              <SocialIcon kind="whatsapp" size={16} /> Chamar no WhatsApp
            </a>
            <a className="btn btn--outline btn--full" href={directions} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              Como chegar
            </a>
          </div>
        </div>
        <div className="stores__map" style={{ borderRadius: t.radius }}>
          <iframe
            title="Mapa Moto Fácil"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="stores__map-overlay">
            <a href={directions} target="_blank" rel="noreferrer" className="btn btn--solid btn--sm" style={{ background: t.accent, color: "#111" }}>
              Abrir no Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
function Footer({ t }) {
  return (
    <footer className="ftr">
      <div className="ftr__top">
        <div className="ftr__brand">
          <img src="assets/logo-motofacil.webp" alt={t.brandName} className="ftr__logo" width="600" height="447" loading="lazy" />
          <p className="ftr__desc">Realizando o sonho de quem merecia mais. Sertãozinho/SP.</p>
          <div className="ftr__socials">
            <a href={t.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="ftr__soc"><SocialIcon kind="instagram" size={18} /></a>
            <a href={t.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="ftr__soc"><SocialIcon kind="facebook" size={18} /></a>
            <a href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="ftr__soc"><SocialIcon kind="whatsapp" size={18} /></a>
          </div>
        </div>
        <div className="ftr__cols">
          <div className="ftr__col">
            <h4>Loja</h4>
            <ul>
              <li><a href="#venda">Motos à venda</a></li>
              <li><a href="#aluguel">Motos para aluguel</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#depoimentos">Depoimentos</a></li>
            </ul>
          </div>
          <div className="ftr__col">
            <h4>Contato</h4>
            <ul>
              <li><a href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">{t.whatsappDisplay}</a></li>
              <li><span>{t.address}</span></li>
              <li><span>{t.hours}</span></li>
            </ul>
          </div>
          <div className="ftr__col">
            <h4>Siga</h4>
            <ul>
              <li><a href={t.instagram} target="_blank" rel="noreferrer">@motoo_facil</a></li>
              <li><a href={t.facebook} target="_blank" rel="noreferrer">Facebook</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="ftr__bot mono">
        <span>© 2026 Moto Fácil Sertãozinho · todos os direitos reservados</span>
        <span>(16) 99147-1592 · WhatsApp</span>
      </div>
    </footer>
  );
}

// ─── FLOATING WHATSAPP ───────────────────────────────────────────────────────
function FloatingWhats({ t }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(scrollY > 400);
    on(); addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <a className={`fw ${show ? "fw--show" : ""}`} href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
      <span className="fw__pulse" />
      <SocialIcon kind="whatsapp" size={28} />
      <span className="fw__label">Chama no WhatsApp</span>
    </a>
  );
}

// ─── Mapear moto da API para o formato dos cards da landing ─────────────────
function apiToSale(m) {
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  return {
    name:  `${m.marca} ${m.modelo}`,
    brand: m.marca,
    year:  m.ano,
    km:    m.km || 0,
    price: m.preco || 0,
    color: m.cor || "",
    cat:   cap(m.categoria || ""),
    pop:   !!m.capa,
    fotos: m.fotos || [],
    obs:   m.observacoes || "",
    entrada: m.entrada,
    parcela: m.parcela,
  };
}
function apiToRent(m) {
  return {
    name:  `${m.marca} ${m.modelo}`,
    brand: m.marca,
    day:   m.preco_diaria || 0,
    week:  m.preco_mensal ? Math.round(m.preco_mensal / 4) : 0,
    month: m.preco_mensal || 0,
    cat:   m.observacoes || m.categoria || "",
    pop:   !!m.capa,
    fotos: m.fotos || [],
  };
}

// ─── APP ─────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [filters, setFilters] = useState({ cat: "Todas", brand: "Todas", year: "Todos", color: "Todas", km: "", price: "" });
  const [saleMotos, setSaleMotos] = useState([]);
  const [rentMotos, setRentMotos] = useState([]);
  const [priceCfg,  setPriceCfg]  = useState({ venda: { preco: true, entrada: true, parcela: true }, aluguel: { preco_mensal: true, preco_diaria: true } });
  const p = PALETTES[t.palette] || PALETTES.motofacil;
  useReveal();

  // Busca config e motos do Supabase
  useEffect(() => {
    sb.from("config").select("*").eq("id", "global").single()
      .then(({ data }) => {
        if (!data) return;
        setPriceCfg({
          venda:   { preco: data.venda_preco, entrada: data.venda_entrada, parcela: data.venda_parcela },
          aluguel: { preco_mensal: data.aluguel_mensal, preco_diaria: data.aluguel_diaria },
        });
      }).catch(() => {});

    sb.from("motos").select("*").eq("disponivel", true)
      .order("capa",     { ascending: false })
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data || !data.length) return;
        setSaleMotos(data.filter(m => m.tipo === "venda").map(apiToSale));
        setRentMotos(data.filter(m => m.tipo === "aluguel").map(apiToRent));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--bg", p.bg);
    r.style.setProperty("--surface", p.surface);
    r.style.setProperty("--surface2", p.surface2);
    r.style.setProperty("--line", p.line);
    r.style.setProperty("--fg", p.fg);
    r.style.setProperty("--muted", p.muted);
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--accent2", t.accent2);
    r.style.setProperty("--radius", `${t.radius}px`);
    r.style.setProperty("--font-display", `"${t.displayFont}"`);
    r.style.setProperty("--font-body", `"${t.bodyFont}"`);
    document.body.classList.toggle("dark", p.isDark);
    document.body.classList.toggle("cursor-on", !!t.cursor);
  }, [t, p]);

  const filtered = useMemo(() => saleMotos.filter((m) => {
    if (filters.cat !== "Todas" && m.cat !== filters.cat) return false;
    if (filters.brand !== "Todas" && m.brand !== filters.brand) return false;
    if (filters.year !== "Todos" && String(m.year) !== filters.year) return false;
    if (filters.color !== "Todas" && m.color !== filters.color) return false;
    if (filters.km && m.km > Number(filters.km)) return false;
    if (filters.price && m.price > Number(filters.price)) return false;
    return true;
  }), [filters, saleMotos]);

  return (
    <>
      <TopBar t={t} />
      <Nav t={t} />
      <main>
        <Hero t={t} p={p} motos={saleMotos} priceCfg={priceCfg.venda} />
        <FeatureBelts t={t} />
        {t.marquee && <Marquee accent2={t.accent2} />}
        {t.showFilters && <QuickFilters filters={filters} setFilters={setFilters} t={t} motoCount={filtered.length} motos={saleMotos} />}
        {t.showSale && <Sale t={t} p={p} filters={filters} motos={filtered} priceCfg={priceCfg.venda} />}
        {t.showRental && <Rental t={t} p={p} motos={rentMotos} priceCfg={priceCfg.aluguel} />}
        {t.showProcess && <Process t={t} />}
        {t.showFeatures && <Features t={t} />}
        {t.showTestimonials && <Testimonials t={t} />}
        {t.showFAQ && <FAQ t={t} />}
        {t.showCTA && <CTA t={t} />}
        {t.showStores && <Stores t={t} />}
      </main>
      <Footer t={t} />
      <FloatingWhats t={t} />
      <CustomCursor enabled={t.cursor} accent={t.accent} />

      <TweaksPanel>
        <TweakSection label="Marca" />
        <TweakText label="Nome" value={t.brandName} onChange={(v) => setTweak("brandName", v)} />
        <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak("headline", v)} />
        <TweakText label="Subhead" value={t.subhead} onChange={(v) => setTweak("subhead", v)} />
        <TweakText label="CTA primário" value={t.ctaPrimary} onChange={(v) => setTweak("ctaPrimary", v)} />

        <TweakSection label="Contato" />
        <TweakText label="WhatsApp (número)" value={t.whatsappNumber} onChange={(v) => setTweak("whatsappNumber", v)} />
        <TweakText label="WhatsApp (display)" value={t.whatsappDisplay} onChange={(v) => setTweak("whatsappDisplay", v)} />
        <TweakText label="Instagram URL" value={t.instagram} onChange={(v) => setTweak("instagram", v)} />
        <TweakText label="Facebook URL" value={t.facebook} onChange={(v) => setTweak("facebook", v)} />
        <TweakText label="Endereço" value={t.address} onChange={(v) => setTweak("address", v)} />
        <TweakText label="Horário" value={t.hours} onChange={(v) => setTweak("hours", v)} />

        <TweakSection label="Cores" />
        <TweakRadio label="Palette" value={t.palette} options={["motofacil", "fogoeouro", "vermelho", "noir"]} onChange={(v) => setTweak("palette", v)} />
        <TweakColor label="Accent (dourado)" value={t.accent} options={["#C9A84C", "#d6ff3a", "#3aa8ff", "#22c55e", "#FFB400"]} onChange={(v) => setTweak("accent", v)} />
        <TweakColor label="Accent 2 (vermelho)" value={t.accent2} options={["#C0392B", "#B71C1C", "#ef4444", "#FF5A1F", "#7A1010"]} onChange={(v) => setTweak("accent2", v)} />

        <TweakSection label="Tipografia" />
        <TweakSelect label="Display" value={t.displayFont} options={["Bricolage Grotesque", "Space Grotesk", "Archivo Black", "Anton"]} onChange={(v) => setTweak("displayFont", v)} />
        <TweakSelect label="Corpo" value={t.bodyFont} options={["Manrope", "Inter", "DM Sans", "Space Grotesk"]} onChange={(v) => setTweak("bodyFont", v)} />

        <TweakSection label="Forma" />
        <TweakSlider label="Radius" value={t.radius} min={0} max={28} step={2} unit="px" onChange={(v) => setTweak("radius", v)} />

        <TweakSection label="Efeitos" />
        <TweakToggle label="Cursor custom" value={t.cursor} onChange={(v) => setTweak("cursor", v)} />
        <TweakToggle label="Marquee" value={t.marquee} onChange={(v) => setTweak("marquee", v)} />

        <TweakSection label="Seções" />
        <TweakToggle label="Como funciona" value={t.showProcess} onChange={(v) => setTweak("showProcess", v)} />
        <TweakToggle label="Filtros" value={t.showFilters} onChange={(v) => setTweak("showFilters", v)} />
        <TweakToggle label="Motos à venda" value={t.showSale} onChange={(v) => setTweak("showSale", v)} />
        <TweakToggle label="Motos para aluguel" value={t.showRental} onChange={(v) => setTweak("showRental", v)} />
        <TweakToggle label="Diferenciais" value={t.showFeatures} onChange={(v) => setTweak("showFeatures", v)} />
        <TweakToggle label="Depoimentos" value={t.showTestimonials} onChange={(v) => setTweak("showTestimonials", v)} />
        <TweakToggle label="FAQ" value={t.showFAQ} onChange={(v) => setTweak("showFAQ", v)} />
        <TweakToggle label="CTA" value={t.showCTA} onChange={(v) => setTweak("showCTA", v)} />
        <TweakToggle label="Nossa Loja" value={t.showStores} onChange={(v) => setTweak("showStores", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
