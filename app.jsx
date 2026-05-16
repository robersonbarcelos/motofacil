// app.jsx — Moto Fácil landing
const { useState, useEffect, useRef, useMemo } = React;

// ─── TWEAK DEFAULTS ──────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "motofacil",
  "accent": "#C9A84C",
  "accent2": "#C0392B",
  "displayFont": "Bricolage Grotesque",
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
  "address": "Sertãozinho · SP",
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
        if (r.top < vh * 0.95) reveal(el);
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
    const t3 = setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach(reveal);
    }, 2500);
    const onScroll = () => flush();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", flush);
    return () => {
      if (io) io.disconnect();
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
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
          <span className="mono topbar__sep">·</span>
          <span className="mono">{t.hours}</span>
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
          <img src="assets/logo-motofacil.png" alt="Moto Fácil" className="nav__logo" />
        </a>
        <nav className="nav__links" aria-label="Principal">
          {links.map((x) => (<a key={x.l} href={x.h}>{x.l}</a>))}
        </nav>
        <div className="nav__right">
          <a className="btn btn--wa btn--sm" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">
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

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero({ t, p }) {
  const blobRef = useRef(null);
  useEffect(() => {
    const on = () => {
      if (!blobRef.current) return;
      const y = scrollY;
      blobRef.current.style.transform = `translate3d(0, ${y * 0.25}px, 0) rotate(${y * 0.02}deg)`;
    };
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <section className="hero" id="top">
      <div className="hero__blob hero__blob--a" ref={blobRef} style={{ background: `radial-gradient(closest-side, ${t.accent}40, transparent 70%)` }} />
      <div className="hero__blob hero__blob--b" style={{ background: `radial-gradient(closest-side, ${t.accent2}40, transparent 70%)` }} />
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="eyebrow" data-reveal>
            <span className="dot" style={{ background: t.accent2 }} />
            <span className="mono">VENDA · LOCAÇÃO · SEM CONSULTA AO SPC/SERASA</span>
          </div>
          <h1 className="hero__title" data-reveal>{t.headline}</h1>
          <p className="hero__sub" data-reveal>{t.subhead}</p>
          <div className="hero__ctas" data-reveal>
            <a className="btn btn--wa btn--lg" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">
              <SocialIcon kind="whatsapp" size={18} /> {t.ctaPrimary}
            </a>
            <a className="btn btn--outline btn--lg" href="#venda">{t.ctaSecondary}</a>
          </div>
          <div className="hero__badges" data-reveal>
            <span className="badge"><span className="badge__check" style={{ background: t.accent }}>✓</span> Sem consulta</span>
            <span className="badge"><span className="badge__check" style={{ background: t.accent }}>✓</span> Sai no mesmo dia</span>
            <span className="badge"><span className="badge__check" style={{ background: t.accent }}>✓</span> Venda e locação</span>
          </div>
        </div>
        <div className="hero__art" data-reveal>
          <div className="hero__frame" style={{ borderRadius: t.radius * 1.4 }}>
            <div className="hero__placeholder">
              <span className="mono">[ HERO_IMG · moto + cliente saindo da loja · 1600×1800 ]</span>
            </div>
            <div className="hero__chip hero__chip--1">
              <span className="mono">— estoque atualizado</span>
              <strong>Motos prontas pra sair</strong>
            </div>
            <div className="hero__chip hero__chip--2" style={{ background: t.accent2, color: "#fff" }}>
              <strong>Aluguel também</strong>
              <span className="mono">começa usando, depois decide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee({ accent2 }) {
  const items = ["Sem consulta ao SPC", "Sem consulta ao Serasa", "Venda no crédito facilitado", "Locação disponível", "Sai no mesmo dia", "Sertãozinho · SP"];
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

// ─── PROCESS ─────────────────────────────────────────────────────────────────
function Process({ t }) {
  const steps = [
    { n: "01", t: "Você escolhe a moto", d: "Olha o catálogo aqui no site ou chama a gente no WhatsApp. A gente te ajuda a achar a moto certa pro seu dia.", emoji: "🏍️" },
    { n: "02", t: "A gente conversa, sem consulta", d: "Sem consulta ao SPC. Sem Serasa. Sem juridiquês. A gente te conhece de verdade e mostra o valor que cabe no seu dia.", emoji: "💬" },
    { n: "03", t: "Você sai daqui de moto", d: "Documentação resolvida na hora. Foto na saída da loja — tradição Moto Fácil. Você começa a usar hoje mesmo.", emoji: "🔑" },
  ];
  return (
    <section className="proc" id="como-funciona">
      <div className="section__head" data-reveal>
        <span className="mono section__tag" style={{ color: t.accent }}>// COMO FUNCIONA</span>
        <h2 className="section__title">3 passos pra sair daqui<br/>com sua moto hoje.</h2>
        <p className="section__sub">Sem consulta significa exatamente isso: a gente <strong>não consulta</strong>. Não tem letra miúda, não tem pegadinha. Você é a pessoa — não um CPF.</p>
      </div>
      <div className="proc__grid">
        {steps.map((s, i) => (
          <div key={s.n} className="step" data-reveal style={{ "--d": `${i * 100}ms`, borderRadius: t.radius }}>
            <div className="step__head">
              <span className="step__n" style={{ color: t.accent }}>{s.n}</span>
              <span className="step__emoji" aria-hidden>{s.emoji}</span>
            </div>
            <h3 className="step__t">{s.t}</h3>
            <p className="step__d">{s.d}</p>
            {i < 2 && <div className="step__arrow"><svg viewBox="0 0 32 12" width="32" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6h28m-6-5l6 5-6 5"/></svg></div>}
          </div>
        ))}
      </div>
      <div className="proc__cta" data-reveal>
        <a className="btn btn--wa btn--lg" href={wa(t.whatsappNumber, "Olá! Quero entender melhor como funciona a compra/aluguel sem consulta.")} target="_blank" rel="noreferrer">
          <SocialIcon kind="whatsapp" size={18} /> Quero saber se posso
        </a>
        <span className="mono proc__small">Uma mensagem no WhatsApp separa você da sua moto.</span>
      </div>
    </section>
  );
}

function ProcIcon() { return null; }

// ─── QUICK FILTERS ───────────────────────────────────────────────────────────
const MODELS_SALE = [
  { name: "Honda Biz 110i", brand: "Honda", year: 2024, km: 0, price: 12990, color: "Vermelha", cat: "Urbana", pop: true },
  { name: "Honda CG 160 Start", brand: "Honda", year: 2023, km: 8500, price: 14500, color: "Preta", cat: "Urbana" },
  { name: "Honda Fan 160", brand: "Honda", year: 2024, km: 0, price: 16900, color: "Cinza", cat: "Urbana" },
  { name: "Yamaha Factor 150", brand: "Yamaha", year: 2023, km: 12000, price: 14200, color: "Vermelha", cat: "Urbana" },
  { name: "Yamaha Fazer 250", brand: "Yamaha", year: 2024, km: 0, price: 21900, color: "Azul", cat: "Sport", pop: true },
  { name: "Honda XRE 190 ABS", brand: "Honda", year: 2023, km: 15000, price: 19800, color: "Vermelha", cat: "Adventure" },
];
const MODELS_RENT = [
  { name: "Honda Biz 110i", brand: "Honda", week: 220, day: 45, cat: "Trabalho urbano", pop: true },
  { name: "Honda CG 160 Cargo", brand: "Honda", week: 280, day: 55, cat: "Delivery", pop: true },
  { name: "Yamaha Factor 150", brand: "Yamaha", week: 260, day: 50, cat: "Trabalho urbano" },
  { name: "Honda Pop 110i", brand: "Honda", week: 180, day: 38, cat: "Econômica" },
];

function QuickFilters({ filters, setFilters, t, motoCount }) {
  const allBrands = useMemo(() => ["Todas", ...new Set(MODELS_SALE.map(m => m.brand))], []);
  const allYears = useMemo(() => ["Todos", ...new Set(MODELS_SALE.map(m => String(m.year)))], []);
  const allColors = useMemo(() => ["Todas", ...new Set(MODELS_SALE.map(m => m.color))], []);
  const allCats = useMemo(() => ["Todas", ...new Set(MODELS_SALE.map(m => m.cat))], []);

  const set = (k, v) => setFilters({ ...filters, [k]: v });

  return (
    <section className="filters" id="filtros">
      <div className="section__head" data-reveal>
        <span className="mono section__tag" style={{ color: t.accent }}>// FILTRO RÁPIDO</span>
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
function Sale({ t, p, filters }) {
  const filtered = useMemo(() => MODELS_SALE.filter((m) => {
    if (filters.cat !== "Todas" && m.cat !== filters.cat) return false;
    if (filters.brand !== "Todas" && m.brand !== filters.brand) return false;
    if (filters.year !== "Todos" && String(m.year) !== filters.year) return false;
    if (filters.color !== "Todas" && m.color !== filters.color) return false;
    if (filters.km && m.km > Number(filters.km)) return false;
    if (filters.price && m.price > Number(filters.price)) return false;
    return true;
  }), [filters]);
  return (
    <section className="catalog" id="venda">
      <div className="section__head section__head--row" data-reveal>
        <div>
          <span className="mono section__tag" style={{ color: t.accent }}>// MOTOS À VENDA</span>
          <h2 className="section__title">Estoque do dia.<br/>Pronto pra sair.</h2>
        </div>
        <a className="btn btn--outline" href={wa(t.whatsappNumber, "Olá! Quero ver o catálogo completo de motos à venda.")} target="_blank" rel="noreferrer">Ver catálogo completo</a>
      </div>
      <div className="catalog__grid">
        {filtered.map((c, i) => <MotoCard key={c.name + i} c={c} t={t} p={p} mode="sale" idx={i} />)}
        {filtered.length === 0 && (
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

function MotoCard({ c, t, p, mode, idx }) {
  const priceLabel = mode === "sale" ? `R$ ${c.price.toLocaleString("pt-BR")}` : `R$ ${c.week}/sem`;
  const priceSmall = mode === "sale" ? "ou parcelas que cabem no seu dia" : `ou R$ ${c.day}/dia`;
  return (
    <article className="card" data-reveal style={{ "--d": `${idx * 60}ms`, borderRadius: t.radius }} data-cursor="hover">
      <div className="card__img">
        <span className="mono">[ {c.name.toLowerCase()} ]</span>
        {c.pop && <span className="card__badge" style={{ background: t.accent, color: "#111" }}>POPULAR</span>}
        {mode === "rent" && <span className="card__badge card__badge--rent" style={{ background: t.accent2, color: "#fff" }}>ALUGUEL</span>}
      </div>
      <div className="card__body">
        <div className="card__top">
          <span className="card__brand mono">{c.brand}</span>
          {mode === "sale" && c.km === 0 && <span className="card__zero mono" style={{ color: t.accent }}>0 KM</span>}
        </div>
        <h3 className="card__name">{c.name}</h3>
        <div className="card__meta mono">
          {mode === "sale" ? (<>
            <span>{c.year}</span><span>·</span><span>{c.km === 0 ? "0 km" : `${c.km.toLocaleString("pt-BR")} km`}</span><span>·</span><span>{c.color}</span>
          </>) : (<>
            <span>{c.cat}</span>
          </>)}
        </div>
        <div className="card__price">
          <span className="card__price-big" style={{ color: t.accent }}>{priceLabel}</span>
          <span className="card__price-small">{priceSmall}</span>
        </div>
        <a className="card__cta btn btn--wa btn--full" href={wa(t.whatsappNumber, `Olá! Quero saber sobre a ${c.name} (${mode === "sale" ? "compra" : "aluguel"}).`)} target="_blank" rel="noreferrer">
          <SocialIcon kind="whatsapp" size={15} /> Tenho interesse
        </a>
      </div>
    </article>
  );
}

// ─── MOTOS PARA ALUGUEL ──────────────────────────────────────────────────────
function Rental({ t, p }) {
  return (
    <section className="catalog catalog--rent" id="aluguel">
      <div className="section__head section__head--row" data-reveal>
        <div>
          <span className="mono section__tag" style={{ color: t.accent2 }}>// MOTOS PARA ALUGUEL</span>
          <h2 className="section__title">Começa usando.<br/>Depois decide se compra.</h2>
          <p className="section__sub">Aluguel ideal pra motoboy, delivery e quem precisa rodar agora. Sem consulta, sem fiador, com manutenção inclusa.</p>
        </div>
        <a className="btn btn--outline" href={wa(t.whatsappNumber, "Olá! Quero alugar uma moto. Quais estão disponíveis?")} target="_blank" rel="noreferrer">Falar sobre aluguel</a>
      </div>
      <div className="catalog__grid">
        {MODELS_RENT.map((c, i) => <MotoCard key={c.name + i} c={c} t={t} p={p} mode="rent" idx={i} />)}
      </div>
      <div className="rent__incl" data-reveal style={{ borderRadius: t.radius }}>
        <span className="mono rent__incl-tag">// INCLUSO NO ALUGUEL</span>
        <div className="rent__incl-grid">
          {[
            ["Manutenção", "preventiva e corretiva"],
            ["Documentação", "em dia e regularizada"],
            ["Troca de moto", "se der problema, troca na hora"],
            ["Sem fiador", "sem consulta, sem burocracia"],
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
    { k: "01", t: "Sem consulta", d: "A gente não consulta SPC nem Serasa. Aqui você não é um CPF, você é uma pessoa com um sonho.", icon: "shield" },
    { k: "02", t: "Sai no mesmo dia", d: "Processo simples, sem juridiquês. Documentação resolvida na hora — foto na saída da loja é tradição.", icon: "clock" },
    { k: "03", t: "Valor que cabe", d: "Sem letra miúda. A gente mostra o valor real que cabe no seu dia, não no script do banco.", icon: "wallet" },
    { k: "04", t: "Venda e locação", d: "Compra com crédito facilitado ou aluguel pra começar usando. Você decide o que faz mais sentido.", icon: "swap" },
  ];
  return (
    <section className="features">
      <div className="section__head" data-reveal>
        <span className="mono section__tag" style={{ color: t.accent }}>// POR QUE A GENTE</span>
        <h2 className="section__title">O banco disse não.<br/>A Moto Fácil diz: vem cá.</h2>
      </div>
      <div className="features__grid">
        {items.map((f, i) => (
          <article key={f.k} className="feat" data-reveal style={{ "--d": `${i * 80}ms` }}>
            <div className="feat__top">
              <span className="feat__k mono">{f.k}</span>
              <FeatIcon name={f.icon} color={t.accent} />
            </div>
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
  if (name === "shield") return <svg viewBox="0 0 32 32" width="32" height="32"><path {...s} d="M16 4l11 4v8c0 7-5 11-11 12-6-1-11-5-11-12V8l11-4z"/><path {...s} d="M11 16l4 4 7-7"/></svg>;
  if (name === "clock")  return <svg viewBox="0 0 32 32" width="32" height="32"><circle {...s} cx="16" cy="16" r="12"/><path {...s} d="M16 8v8l5 3"/></svg>;
  if (name === "wallet") return <svg viewBox="0 0 32 32" width="32" height="32"><rect {...s} x="4" y="9" width="24" height="17" rx="3"/><path {...s} d="M4 13h24M22 18h3"/></svg>;
  if (name === "swap")   return <svg viewBox="0 0 32 32" width="32" height="32"><path {...s} d="M6 11h18l-4-4M26 21H8l4 4"/></svg>;
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
        <span className="mono section__tag" style={{ color: t.accent }}>// QUEM JÁ SAIU DAQUI DE MOTO</span>
        <h2 className="section__title">Cada história aqui<br/>começou com um "não" lá fora.</h2>
      </div>
      <div className="test__grid">
        {items.map((it, i) => (
          <figure key={i} className="quote" data-reveal style={{ "--d": `${i * 70}ms`, borderRadius: t.radius }}>
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
        <span className="mono section__tag" style={{ color: t.accent }}>// PERGUNTAS FREQUENTES</span>
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
      <div className="cta__box" data-reveal style={{ background: t.accent2, borderRadius: t.radius * 1.5 }}>
        <div className="cta__copy">
          <span className="mono cta__tag">// PRÓXIMO PASSO</span>
          <h2 className="cta__title">Uma mensagem<br/>separa você<br/>da sua moto.</h2>
          <p className="cta__sub">Chama a gente no WhatsApp. Sem compromisso, sem consulta, sem julgamento. A gente entende seu momento e mostra o que dá pra fazer hoje.</p>
          <div className="cta__socials">
            <a href={t.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="cta__soc"><SocialIcon kind="instagram" size={20} /></a>
            <a href={t.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="cta__soc"><SocialIcon kind="facebook" size={20} /></a>
          </div>
        </div>
        <div className="cta__card" style={{ borderRadius: t.radius }}>
          <span className="mono cta__card-tag">Atendimento via WhatsApp</span>
          <div className="cta__card-num">{t.whatsappDisplay}</div>
          <div className="cta__card-hrs mono">{t.hours}</div>
          <a className="btn btn--dark btn--full btn--lg" href={wa(t.whatsappNumber)} target="_blank" rel="noreferrer">
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
  // Sertãozinho/SP centro — coords aproximadas
  const lat = -21.1376, lon = -47.9905;
  const delta = 0.012;
  const bbox = `${lon - delta},${lat - delta * 0.6},${lon + delta},${lat + delta * 0.6}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  return (
    <section className="stores" id="loja">
      <div className="section__head" data-reveal>
        <span className="mono section__tag" style={{ color: t.accent }}>// NOSSA LOJA</span>
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
                <strong>{t.address}</strong>
                <span className="mono">Bairro · Sertãozinho/SP</span>
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
              <SocialIcon kind="whatsapp" size={16} /> Avisa que tô indo
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
          <img src="assets/logo-motofacil.png" alt={t.brandName} className="ftr__logo" />
          <p className="ftr__desc">Venda e locação de motos sem consulta ao SPC ou Serasa. Em Sertãozinho/SP.</p>
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
        <span>Moto Fácil. Porque difícil já foi demais.</span>
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

// ─── APP ─────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [filters, setFilters] = useState({ cat: "Todas", brand: "Todas", year: "Todos", color: "Todas", km: "", price: "" });
  const p = PALETTES[t.palette] || PALETTES.motofacil;
  useReveal();

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

  const filtered = useMemo(() => MODELS_SALE.filter((m) => {
    if (filters.cat !== "Todas" && m.cat !== filters.cat) return false;
    if (filters.brand !== "Todas" && m.brand !== filters.brand) return false;
    if (filters.year !== "Todos" && String(m.year) !== filters.year) return false;
    if (filters.color !== "Todas" && m.color !== filters.color) return false;
    if (filters.km && m.km > Number(filters.km)) return false;
    if (filters.price && m.price > Number(filters.price)) return false;
    return true;
  }), [filters]);

  return (
    <>
      <TopBar t={t} />
      <Nav t={t} />
      <main>
        <Hero t={t} p={p} />
        {t.marquee && <Marquee accent2={t.accent2} />}
        {t.showProcess && <Process t={t} />}
        {t.showFilters && <QuickFilters filters={filters} setFilters={setFilters} t={t} motoCount={filtered.length} />}
        {t.showSale && <Sale t={t} p={p} filters={filters} />}
        {t.showRental && <Rental t={t} p={p} />}
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
        <TweakSelect label="Corpo" value={t.bodyFont} options={["Manrope", "Inter", "DM Sans"]} onChange={(v) => setTweak("bodyFont", v)} />

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
