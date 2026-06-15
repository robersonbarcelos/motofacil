// catalogo.jsx — Moto Fácil · Catálogo público (venda e aluguel)
const { useState, useEffect, useMemo } = React;

const SB_URL = "https://hxafbnhqvzgjyxhkpxxb.supabase.co";
const SB_KEY = "sb_publishable_wmBhcq00_rhSujycjPoGfw_shkalHY5";
const sb     = supabase.createClient(SB_URL, SB_KEY);

const WA_NUM  = "5516991471592";
const wa = (msg) => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;

const TIPO     = new URLSearchParams(window.location.search).get("tipo") || "venda";
const IS_VENDA = TIPO === "venda";

// ── Fallback seed (exibido enquanto Supabase carrega) ─────────────────────────
const SEED_VENDA = [
  { id:"s1", tipo:"venda", marca:"Honda",  modelo:"Biz 110i",     ano:2024, km:0,     preco:12990, entrada:2000, parcela:350, cor:"Vermelha", categoria:"urbana",   fotos:[], disponivel:true, destaque:true,  observacoes:"0 km · IPVA 2025 pago" },
  { id:"s2", tipo:"venda", marca:"Honda",  modelo:"CG 160 Start", ano:2023, km:8500,  preco:14500, entrada:2500, parcela:380, cor:"Preta",    categoria:"urbana",   fotos:[], disponivel:true, destaque:false, observacoes:"Revisão em dia" },
  { id:"s3", tipo:"venda", marca:"Honda",  modelo:"Fan 160",      ano:2024, km:0,     preco:16900, entrada:3000, parcela:450, cor:"Cinza",    categoria:"urbana",   fotos:[], disponivel:true, destaque:false, observacoes:"0 km" },
  { id:"s4", tipo:"venda", marca:"Yamaha", modelo:"Factor 150",   ano:2023, km:12000, preco:14200, entrada:2500, parcela:375, cor:"Vermelha", categoria:"urbana",   fotos:[], disponivel:true, destaque:false, observacoes:"" },
  { id:"s5", tipo:"venda", marca:"Yamaha", modelo:"Fazer 250",    ano:2024, km:0,     preco:21900, entrada:4000, parcela:580, cor:"Azul",     categoria:"esportiva",fotos:[], disponivel:true, destaque:true,  observacoes:"0 km · ABS incluso" },
  { id:"s6", tipo:"venda", marca:"Honda",  modelo:"XRE 190 ABS",  ano:2023, km:15000, preco:19800, entrada:3500, parcela:520, cor:"Vermelha", categoria:"trail",    fotos:[], disponivel:true, destaque:false, observacoes:"ABS · Revisão em dia" },
];
const SEED_ALUGUEL = [
  { id:"a1", tipo:"aluguel", marca:"Honda",  modelo:"Biz 110i",    ano:2024, preco_diaria:45, preco_semanal:270, preco_mensal:900,  cor:"Vermelha", categoria:"urbana", fotos:[], disponivel:true, destaque:true,  observacoes:"Manutenção inclusa · Sem fiador" },
  { id:"a2", tipo:"aluguel", marca:"Honda",  modelo:"CG 160 Cargo",ano:2023, preco_diaria:55, preco_semanal:330, preco_mensal:1100, cor:"Preta",    categoria:"urbana", fotos:[], disponivel:true, destaque:false, observacoes:"Ideal para delivery · Manutenção inclusa" },
  { id:"a3", tipo:"aluguel", marca:"Yamaha", modelo:"Factor 150",  ano:2023, preco_diaria:50, preco_semanal:300, preco_mensal:1000, cor:"Vermelha", categoria:"urbana", fotos:[], disponivel:true, destaque:false, observacoes:"Manutenção inclusa" },
  { id:"a4", tipo:"aluguel", marca:"Honda",  modelo:"Pop 110i",    ano:2024, preco_diaria:38, preco_semanal:220, preco_mensal:700,  cor:"Branca",   categoria:"urbana", fotos:[], disponivel:true, destaque:false, observacoes:"Econômica · Ideal para começar" },
];
const SEED = IS_VENDA ? SEED_VENDA : SEED_ALUGUEL;

// Config padrão enquanto carrega
const CFG_DEFAULT = {
  venda:   { preco: true, entrada: true, parcela: true, simulacao: false, ano: true, cor: true, km: true, categoria: true },
  aluguel: { preco_diaria: true, preco_semanal: false, preco_mensal: true, ano: true, cor: true, categoria: true },
};

function transformConfig(row) {
  if (!row) return CFG_DEFAULT;
  return {
    venda: {
      preco:      row.venda_preco,
      entrada:    row.venda_entrada,
      parcela:    row.venda_parcela,
      simulacao:  row.venda_simulacao,
      ano:        true,
      cor:        true,
      km:         true,
      categoria:  true,
    },
    aluguel: {
      preco_diaria:  row.aluguel_diaria,
      preco_semanal: row.aluguel_semanal,
      preco_mensal:  row.aluguel_mensal,
      ano:           true,
      cor:           true,
      categoria:     true,
    },
  };
}

const fmt   = (n) => n ? `R$ ${Number(n).toLocaleString("pt-BR")}` : "";
const fmtKm = (n) => n != null ? `${Number(n).toLocaleString("pt-BR")} km` : "";

// ── Carrossel de fotos ────────────────────────────────────────────────────────
function Carousel({ moto, onClose }) {
  const fotos = moto.fotos || [];
  const [idx, setIdx] = useState(0);
  const total = fotos.length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % total);
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [total]);

  return (
    <div className="car-overlay" onClick={onClose}>
      <div className="car-box" onClick={e => e.stopPropagation()}>
        <button className="car-close" onClick={onClose} aria-label="Fechar">✕</button>
        <div className="car-stage">
          {fotos[idx]
            ? <img src={fotos[idx]} alt={`${moto.marca} ${moto.modelo} · foto ${idx + 1}`} className="car-img" />
            : <div className="car-no">Sem foto</div>
          }
        </div>
        {total > 1 && (
          <>
            <button className="car-nav car-nav--prev" onClick={() => setIdx(i => (i - 1 + total) % total)}>‹</button>
            <button className="car-nav car-nav--next" onClick={() => setIdx(i => (i + 1) % total)}>›</button>
            <div className="car-dots">
              {fotos.map((_, i) => (
                <button key={i} className={`car-dot${i === idx ? " car-dot--on" : ""}`} onClick={() => setIdx(i)} />
              ))}
            </div>
          </>
        )}
        <div className="car-info">
          <strong>{moto.marca} {moto.modelo}</strong>
          {moto.ano && <span> · {moto.ano}</span>}
          <span className="car-counter"> {idx + 1}/{total}</span>
        </div>
      </div>
    </div>
  );
}

// ── Card de moto ──────────────────────────────────────────────────────────────
function MotoCard({ moto, config, onPhoto }) {
  const cfg   = config[TIPO] || {};
  const fotos = moto.fotos || [];
  const thumb = fotos[0] || null;

  const waMsg = IS_VENDA
    ? `Olá! Tenho interesse na ${moto.marca} ${moto.modelo} (${moto.ano}). Vi no catálogo de vendas.`
    : `Olá! Tenho interesse no aluguel da ${moto.marca} ${moto.modelo}. Vi no catálogo de locação.`;

  return (
    <article className={`mc${moto.destaque ? " mc--destaque" : ""}`}>
      <div
        className="mc__photo"
        onClick={() => fotos.length > 0 && onPhoto(moto)}
        role={fotos.length > 0 ? "button" : undefined}
        tabIndex={fotos.length > 0 ? 0 : undefined}
        onKeyDown={e => e.key === "Enter" && fotos.length > 0 && onPhoto(moto)}
      >
        {thumb
          ? <img src={thumb} alt={`${moto.marca} ${moto.modelo}`} loading="lazy" />
          : <div className="mc__nophoto">Sem foto</div>
        }
        {fotos.length > 1 && <span className="mc__count">📷 {fotos.length}</span>}
        {moto.destaque   && <span className="mc__badge mc__badge--dest">Destaque</span>}
        {cfg.categoria && moto.categoria && (
          <span className="mc__badge mc__badge--cat">{moto.categoria}</span>
        )}
      </div>

      <div className="mc__body">
        <h3 className="mc__name">{moto.marca} <span>{moto.modelo}</span></h3>

        <div className="mc__tags">
          {cfg.ano && moto.ano      && <span className="mc__tag">{moto.ano}</span>}
          {cfg.cor && moto.cor      && <span className="mc__tag">{moto.cor}</span>}
          {cfg.km  && moto.km != null && IS_VENDA && (
            <span className="mc__tag">{moto.km === 0 ? "0 km" : fmtKm(moto.km)}</span>
          )}
        </div>

        <div className="mc__price">
          {IS_VENDA ? (
            <>
              {cfg.preco   && moto.preco   && <div className="mc__preco">{fmt(moto.preco)}</div>}
              <div className="mc__parcelas">
                {cfg.entrada && moto.entrada && <span>Entrada: <strong>{fmt(moto.entrada)}</strong></span>}
                {cfg.parcela && moto.parcela && <span> · <strong>{fmt(moto.parcela)}/mês</strong></span>}
              </div>
              {cfg.simulacao && (
                <a className="mc__simulacao" href={wa(`Olá! Quero simular a promissória da ${moto.marca} ${moto.modelo}.`)} target="_blank" rel="noreferrer">
                  Simular promissória →
                </a>
              )}
            </>
          ) : (
            <>
              {cfg.preco_mensal  && moto.preco_mensal  && (
                <div className="mc__preco">{fmt(moto.preco_mensal)}<span className="mc__unit">/mês</span></div>
              )}
              {cfg.preco_semanal && moto.preco_semanal && (
                <div className="mc__diaria">{fmt(moto.preco_semanal)}/semana</div>
              )}
              {cfg.preco_diaria  && moto.preco_diaria  && (
                <div className="mc__diaria">{fmt(moto.preco_diaria)}/dia</div>
              )}
            </>
          )}
        </div>

        {moto.observacoes && <p className="mc__obs">{moto.observacoes}</p>}

        <a className="mc__cta" href={wa(waMsg)} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {IS_VENDA ? "Tenho interesse" : "Quero alugar"}
        </a>
      </div>
    </article>
  );
}

// ── Filtros ───────────────────────────────────────────────────────────────────
function Filters({ motos, filters, setFilters }) {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
  const marcas     = uniq(motos.map(m => m.marca));
  const categorias = uniq(motos.map(m => m.categoria));
  const cores      = uniq(motos.map(m => m.cor));
  const maxPreco   = IS_VENDA
    ? Math.max(...motos.map(m => Number(m.preco      || 0)), 50000)
    : Math.max(...motos.map(m => Number(m.preco_mensal || 0)), 5000);
  const maxKm = Math.max(...motos.map(m => Number(m.km || 0)), 100000);
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <aside className="fil">
      <div className="fil__head">
        <span className="fil__title">Filtros</span>
        <button className="fil__clear" onClick={() => setFilters({})}>Limpar</button>
      </div>
      {marcas.length > 0 && (
        <div className="fil__group">
          <label className="fil__label">Marca</label>
          <select className="fil__sel" value={filters.marca || ""} onChange={e => set("marca", e.target.value)}>
            <option value="">Todas</option>
            {marcas.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      )}
      {categorias.length > 0 && (
        <div className="fil__group">
          <label className="fil__label">Categoria</label>
          <select className="fil__sel" value={filters.categoria || ""} onChange={e => set("categoria", e.target.value)}>
            <option value="">Todas</option>
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}
      {cores.length > 0 && (
        <div className="fil__group">
          <label className="fil__label">Cor</label>
          <select className="fil__sel" value={filters.cor || ""} onChange={e => set("cor", e.target.value)}>
            <option value="">Todas</option>
            {cores.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}
      {IS_VENDA && (
        <div className="fil__group">
          <label className="fil__label">Preço máximo · <strong>{fmt(filters.preco_max || maxPreco)}</strong></label>
          <input className="fil__range" type="range" min={0} max={maxPreco} step={500}
            value={filters.preco_max ?? maxPreco}
            onChange={e => set("preco_max", Number(e.target.value))} />
        </div>
      )}
      {IS_VENDA && maxKm > 0 && (
        <div className="fil__group">
          <label className="fil__label">KM máximo · <strong>{fmtKm(filters.km_max ?? maxKm)}</strong></label>
          <input className="fil__range" type="range" min={0} max={maxKm} step={1000}
            value={filters.km_max ?? maxKm}
            onChange={e => set("km_max", Number(e.target.value))} />
        </div>
      )}
    </aside>
  );
}

// ── App principal ─────────────────────────────────────────────────────────────
function CatalogApp() {
  const [motos,    setMotos]    = useState(SEED);
  const [config,   setConfig]   = useState(CFG_DEFAULT);
  const [filters,  setFilters]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [carousel, setCarousel] = useState(null);

  useEffect(() => {
    document.body.classList.toggle("aluguel", !IS_VENDA);
    document.title = IS_VENDA
      ? "Motos à Venda · Moto Fácil Sertãozinho"
      : "Motos para Aluguel · Moto Fácil Sertãozinho";

    Promise.all([
      sb.from("motos").select("*").eq("tipo", TIPO).eq("disponivel", true).order("destaque", { ascending: false }).order("created_at", { ascending: false }),
      sb.from("config").select("*").eq("id", "global").single(),
    ]).then(([{ data: motosData }, { data: cfgData }]) => {
      if (motosData && motosData.length > 0) setMotos(motosData);
      if (cfgData) setConfig(transformConfig(cfgData));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => motos.filter(m => {
    if (filters.marca     && m.marca     !== filters.marca)     return false;
    if (filters.categoria && m.categoria !== filters.categoria) return false;
    if (filters.cor       && m.cor       !== filters.cor)       return false;
    if (IS_VENDA) {
      if (filters.preco_max != null && m.preco > filters.preco_max) return false;
      if (filters.km_max    != null && m.km    > filters.km_max)    return false;
    }
    return true;
  }), [motos, filters]);

  const titulo    = IS_VENDA ? "Motos à Venda" : "Motos para Aluguel";
  const subtitulo = IS_VENDA
    ? "Crédito facilitado · Sem consulta ao SPC/Serasa · Sertãozinho/SP"
    : "Sem fiador · Manutenção inclusa · Sai no mesmo dia · Sertãozinho/SP";

  return (
    <>
      <header className="cat-nav">
        <a href="/" className="cat-back">← Voltar ao site</a>
        <a href="/" className="cat-brand">MOTO<span>FÁCIL</span></a>
        <a href={wa("Olá! Vim pelo site e quero saber sobre as motos disponíveis.")} className="cat-wa" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>

      <div className="cat-hero">
        <span className="cat-tag">{IS_VENDA ? "VENDA" : "ALUGUEL"}</span>
        <h1 className="cat-h1">{titulo}</h1>
        <p className="cat-sub">{subtitulo}</p>
      </div>

      <div className="cat-layout">
        <Filters motos={motos} filters={filters} setFilters={setFilters} />
        <main className="cat-main">
          <p className="cat-count">
            {loading
              ? "Carregando catálogo..."
              : `${filtered.length} moto${filtered.length !== 1 ? "s" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`
            }
          </p>
          {!loading && filtered.length === 0 && (
            <div className="cat-empty">
              <p>Nenhuma moto encontrada com esses filtros.</p>
              <button onClick={() => setFilters({})}>Limpar filtros</button>
            </div>
          )}
          <div className="cat-grid">
            {filtered.map(m => (
              <MotoCard key={m.id} moto={m} config={config} onPhoto={setCarousel} />
            ))}
          </div>
        </main>
      </div>

      {carousel && <Carousel moto={carousel} onClose={() => setCarousel(null)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CatalogApp />);
