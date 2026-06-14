// admin.jsx — Moto Fácil · Painel administrativo
const { useState, useEffect, useRef } = React;

const CATEGORIAS = ["urbana", "trail", "esportiva", "scooter", "elétrica", "custom", "outra"];
const MARCAS     = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW", "Ducati", "Triumph", "Outra"];

// ── API helper ────────────────────────────────────────────────────────────────
const api = {
  get: (url, tok) =>
    fetch(url, tok ? { headers: { "X-Session": tok } } : {}).then(r => r.json()),

  post: (url, data, tok) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(tok ? { "X-Session": tok } : {}) },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  put: (url, data, tok) =>
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Session": tok },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  del: (url, tok) =>
    fetch(url, { method: "DELETE", headers: { "X-Session": tok } }).then(r => r.json()),

  upload: (file, tok) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch("/api/upload", {
      method: "POST",
      headers: { "X-Session": tok },
      body: fd,
    }).then(r => r.json());
  },
};

// ── Tela de login ─────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser]       = useState("admin");
  const [pw,   setPw]         = useState("");
  const [err,  setErr]        = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await api.post("/api/login", { username: user, password: pw });
    setBusy(false);
    if (res.token) onLogin(res.token);
    else setErr(res.error || "Usuário ou senha incorretos.");
  };

  return (
    <div className="login">
      <div className="login__box">
        <div className="login__logo">MOTO<span>FÁCIL</span></div>
        <p className="login__sub">Painel administrativo</p>
        <form onSubmit={submit} className="login__form">
          <div className="f-field">
            <label>Usuário</label>
            <input value={user} onChange={e => setUser(e.target.value)} autoFocus required />
          </div>
          <div className="f-field">
            <label>Senha</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required />
          </div>
          {err && <p className="f-err">{err}</p>}
          <button className="a-btn a-btn--primary" disabled={busy}>
            {busy ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Upload de fotos ───────────────────────────────────────────────────────────
function PhotoUploader({ fotos, onChange, token }) {
  const fileRef  = useRef();
  const [busy, setBusy] = useState(false);

  const upload = async (e) => {
    const files = [...e.target.files].slice(0, 4 - fotos.length);
    setBusy(true);
    for (const f of files) {
      const res = await api.upload(f, token);
      if (res.url) onChange(prev => [...prev, res.url].slice(0, 4));
    }
    setBusy(false);
    e.target.value = "";
  };

  const remove = (i) => onChange(prev => prev.filter((_, j) => j !== i));

  return (
    <div className="photos">
      <label className="f-label">Fotos (até 4)</label>
      <div className="photos__grid">
        {fotos.map((url, i) => (
          <div className="photos__thumb" key={i}>
            <img src={url} alt={`Foto ${i + 1}`} />
            <button type="button" className="photos__rm" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
        {fotos.length < 4 && (
          <button
            type="button"
            className="photos__add"
            onClick={() => fileRef.current.click()}
            disabled={busy}
          >
            <span className="photos__add-icon">{busy ? "…" : "+"}</span>
            <span className="photos__add-label">Foto {fotos.length + 1}/4</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />
    </div>
  );
}

// ── Modal: formulário de moto ─────────────────────────────────────────────────
function MotoForm({ moto, tipo, token, onSave, onCancel }) {
  const isNew = !moto;
  const isVenda = tipo === "venda";

  const blank = {
    tipo, marca: "", modelo: "", ano: new Date().getFullYear(),
    cor: "", categoria: "urbana", km: "", fotos: [],
    disponivel: true, destaque: false, observacoes: "",
    preco: "", entrada: "", parcela: "",
    preco_diaria: "", preco_mensal: "",
  };

  const [form, setForm] = useState(moto || blank);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.marca.trim() || !form.modelo.trim()) {
      setErr("Marca e modelo são obrigatórios.");
      return;
    }
    setBusy(true); setErr("");
    const res = isNew
      ? await api.post("/api/motos", { ...form, tipo }, token)
      : await api.put(`/api/motos/${form.id}`, form, token);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    onSave(res);
  };

  return (
    <div className="a-overlay">
      <div className="a-modal">
        <div className="a-modal__head">
          <h2>{isNew ? "Nova moto" : "Editar moto"} · {tipo}</h2>
          <button type="button" className="a-modal__close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={save} className="a-modal__body">
          <PhotoUploader
            fotos={form.fotos || []}
            onChange={v => set("fotos", typeof v === "function" ? v(form.fotos || []) : v)}
            token={token}
          />

          <div className="f-row">
            <div className="f-field">
              <label>Marca *</label>
              <input
                list="marcas-dl" value={form.marca}
                onChange={e => set("marca", e.target.value)}
                placeholder="Honda" required
              />
              <datalist id="marcas-dl">
                {MARCAS.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div className="f-field">
              <label>Modelo *</label>
              <input
                value={form.modelo}
                onChange={e => set("modelo", e.target.value)}
                placeholder="CG 160 Start" required
              />
            </div>
          </div>

          <div className="f-row">
            <div className="f-field">
              <label>Ano</label>
              <input
                type="number" value={form.ano}
                onChange={e => set("ano", Number(e.target.value))}
                min={1990} max={2030}
              />
            </div>
            <div className="f-field">
              <label>Cor</label>
              <input
                value={form.cor}
                onChange={e => set("cor", e.target.value)}
                placeholder="Vermelho"
              />
            </div>
            <div className="f-field">
              <label>Categoria</label>
              <select value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {isVenda && (
            <>
              <div className="f-row">
                <div className="f-field">
                  <label>Quilometragem</label>
                  <input
                    type="number" value={form.km}
                    onChange={e => set("km", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="15000" min={0}
                  />
                </div>
                <div className="f-field">
                  <label>Preço (R$)</label>
                  <input
                    type="number" value={form.preco}
                    onChange={e => set("preco", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="10500" min={0}
                  />
                </div>
              </div>
              <div className="f-row">
                <div className="f-field">
                  <label>Entrada (R$)</label>
                  <input
                    type="number" value={form.entrada}
                    onChange={e => set("entrada", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="2500" min={0}
                  />
                </div>
                <div className="f-field">
                  <label>Parcela/mês (R$)</label>
                  <input
                    type="number" value={form.parcela}
                    onChange={e => set("parcela", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="380" min={0}
                  />
                </div>
              </div>
            </>
          )}

          {!isVenda && (
            <div className="f-row">
              <div className="f-field">
                <label>Valor mensal (R$)</label>
                <input
                  type="number" value={form.preco_mensal}
                  onChange={e => set("preco_mensal", e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="900" min={0}
                />
              </div>
              <div className="f-field">
                <label>Valor diária (R$)</label>
                <input
                  type="number" value={form.preco_diaria}
                  onChange={e => set("preco_diaria", e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="60" min={0}
                />
              </div>
            </div>
          )}

          <div className="f-field">
            <label>Observações</label>
            <textarea
              value={form.observacoes || ""}
              onChange={e => set("observacoes", e.target.value)}
              rows={2}
              placeholder="IPVA pago, revisão em dia, manutenção inclusa…"
            />
          </div>

          <div className="f-checks">
            <label className="f-check">
              <input type="checkbox" checked={!!form.disponivel} onChange={e => set("disponivel", e.target.checked)} />
              Disponível (aparece no catálogo público)
            </label>
            <label className="f-check">
              <input type="checkbox" checked={!!form.destaque} onChange={e => set("destaque", e.target.checked)} />
              Destaque (badge no card)
            </label>
          </div>

          {err && <p className="f-err">{err}</p>}

          <div className="a-modal__foot">
            <button type="button" className="a-btn a-btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="a-btn a-btn--primary" disabled={busy}>
              {busy ? "Salvando…" : isNew ? "Adicionar moto" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: configuração de campos ──────────────────────────────────────────────
function ConfigPanel({ config, token, onClose }) {
  const [cfg,  setCfg]  = useState(JSON.parse(JSON.stringify(config)));
  const [busy, setBusy] = useState(false);
  const [ok,   setOk]   = useState(false);

  const toggle = (tipo, field) =>
    setCfg(c => ({ ...c, [tipo]: { ...c[tipo], [field]: !c[tipo]?.[field] } }));

  const save = async () => {
    setBusy(true);
    await api.post("/api/config", cfg, token);
    setBusy(false); setOk(true);
    setTimeout(() => setOk(false), 2500);
  };

  const LABELS = {
    venda: {
      preco:      "Preço total",
      entrada:    "Entrada",
      parcela:    "Parcela/mês",
      km:         "Quilometragem",
      ano:        "Ano",
      cor:        "Cor",
      categoria:  "Categoria",
    },
    aluguel: {
      preco_mensal: "Valor mensal",
      preco_diaria: "Valor diária",
      km:           "Quilometragem",
      ano:          "Ano",
      cor:          "Cor",
      categoria:    "Categoria",
    },
  };

  return (
    <div className="a-overlay">
      <div className="a-modal a-modal--sm">
        <div className="a-modal__head">
          <h2>Campos visíveis nos cards</h2>
          <button type="button" className="a-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal__body">
          {["venda", "aluguel"].map(tipo => (
            <div key={tipo} className="cfg-section">
              <h3 className="cfg-h3">Motos {tipo === "venda" ? "à Venda" : "para Aluguel"}</h3>
              {Object.entries(LABELS[tipo]).map(([k, label]) => (
                <label key={k} className="f-check cfg-check">
                  <input
                    type="checkbox"
                    checked={cfg[tipo]?.[k] ?? true}
                    onChange={() => toggle(tipo, k)}
                  />
                  {label}
                </label>
              ))}
            </div>
          ))}
        </div>
        <div className="a-modal__foot">
          <button type="button" className="a-btn a-btn--ghost" onClick={onClose}>Fechar</button>
          <button type="button" className="a-btn a-btn--primary" onClick={save} disabled={busy}>
            {busy ? "Salvando…" : ok ? "✓ Salvo!" : "Salvar configuração"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lista de motos (por tipo) ──────────────────────────────────────────────────
function MotoList({ tipo, token, config }) {
  const [motos,    setMotos]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(null); // null=fechado false=novo {obj}=editar
  const [showCfg,  setShowCfg]  = useState(false);

  const isVenda = tipo === "venda";
  const fmt = (n) => n ? `R$ ${Number(n).toLocaleString("pt-BR")}` : "–";

  const load = () => {
    setLoading(true);
    api.get(`/api/motos?tipo=${tipo}`, token)
      .then(m => { setMotos(Array.isArray(m) ? m : []); setLoading(false); });
  };

  useEffect(load, [tipo]);

  const del = async (id, nome) => {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    await api.del(`/api/motos/${id}`, token);
    load();
  };

  const toggleDisp = async (moto) => {
    await api.put(`/api/motos/${moto.id}`, { ...moto, disponivel: !moto.disponivel }, token);
    load();
  };

  return (
    <div className="adm-list">
      <div className="adm-list__top">
        <div>
          <h2 className="adm-list__title">
            {isVenda ? "Motos à Venda" : "Motos para Aluguel"}
          </h2>
          <p className="adm-list__count">
            {motos.length} moto{motos.length !== 1 ? "s" : ""} cadastrada{motos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="adm-list__acts">
          <button className="a-btn a-btn--ghost" onClick={() => setShowCfg(true)}>⚙ Campos</button>
          <button className="a-btn a-btn--primary" onClick={() => setForm(false)}>+ Nova moto</button>
        </div>
      </div>

      {loading && <div className="adm-loading">Carregando…</div>}

      {!loading && motos.length === 0 && (
        <div className="adm-empty">
          <p>Nenhuma moto cadastrada ainda.</p>
          <button className="a-btn a-btn--primary" onClick={() => setForm(false)}>
            Cadastrar primeira moto
          </button>
        </div>
      )}

      {!loading && motos.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Moto</th>
                <th>Ano · Cor{isVenda ? " · KM" : ""}</th>
                {isVenda
                  ? <><th>Preço</th><th>Entrada · Parcela</th></>
                  : <><th>Mensal</th><th>Diária</th></>
                }
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {motos.map(m => (
                <tr key={m.id} className={m.disponivel ? "" : "adm-tr--off"}>
                  <td>
                    {m.fotos?.[0]
                      ? <img src={m.fotos[0]} className="adm-thumb" alt="" />
                      : <div className="adm-thumb adm-thumb--empty">sem foto</div>
                    }
                  </td>
                  <td>
                    <strong>{m.marca} {m.modelo}</strong>
                    {m.categoria && <div className="adm-tag">{m.categoria}</div>}
                    {m.destaque  && <div className="adm-tag adm-tag--gold">★ Destaque</div>}
                  </td>
                  <td className="adm-muted">
                    {[
                      m.ano,
                      m.cor,
                      isVenda && m.km != null ? `${Number(m.km).toLocaleString("pt-BR")} km` : null
                    ].filter(Boolean).join(" · ")}
                  </td>
                  {isVenda ? (
                    <>
                      <td>{fmt(m.preco)}</td>
                      <td className="adm-muted">{fmt(m.entrada)} · {fmt(m.parcela)}/mês</td>
                    </>
                  ) : (
                    <>
                      <td>{fmt(m.preco_mensal)}/mês</td>
                      <td className="adm-muted">{fmt(m.preco_diaria)}/dia</td>
                    </>
                  )}
                  <td>
                    <button
                      className={`adm-status${m.disponivel ? " adm-status--on" : ""}`}
                      onClick={() => toggleDisp(m)}
                      title={m.disponivel ? "Ocultar do catálogo" : "Tornar disponível"}
                    >
                      {m.disponivel ? "Disponível" : "Oculto"}
                    </button>
                  </td>
                  <td>
                    <div className="adm-acts">
                      <button
                        className="adm-act" title="Editar"
                        onClick={() => setForm(m)}
                      >✏</button>
                      <button
                        className="adm-act adm-act--del" title="Excluir"
                        onClick={() => del(m.id, `${m.marca} ${m.modelo}`)}
                      >✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form !== null && (
        <MotoForm
          moto={form || null}
          tipo={tipo}
          token={token}
          onSave={() => { setForm(null); load(); }}
          onCancel={() => setForm(null)}
        />
      )}

      {showCfg && (
        <ConfigPanel config={config} token={token} onClose={() => setShowCfg(false)} />
      )}
    </div>
  );
}

// ── App admin ─────────────────────────────────────────────────────────────────
function AdminApp() {
  const [token,  setToken]  = useState(() => sessionStorage.getItem("mf_tok") || null);
  const [tab,    setTab]    = useState("venda");
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (!token) return;
    // Valida sessão
    fetch("/api/auth", { headers: { "X-Session": token } })
      .then(r => r.json())
      .then(d => { if (!d.authed) logout(); });
    // Carrega config
    fetch("/api/config").then(r => r.json()).then(setConfig);
  }, [token]);

  const login  = (tok) => { setToken(tok); sessionStorage.setItem("mf_tok", tok); };
  const logout = () => {
    api.post("/api/logout", {}, token).catch(() => {});
    setToken(null);
    sessionStorage.removeItem("mf_tok");
  };

  if (!token) return <Login onLogin={login} />;

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-side__logo">MOTO<span>FÁCIL</span></div>

        <nav className="adm-nav">
          {[
            { id: "venda",   label: "🏷 Venda"   },
            { id: "aluguel", label: "🔑 Aluguel" },
          ].map(({ id, label }) => (
            <button
              key={id}
              className={`adm-nav__item${tab === id ? " adm-nav__item--on" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="adm-side__links">
          <a href="/catalogo.html?tipo=venda"   target="_blank" className="adm-side__link">
            Ver catálogo venda ↗
          </a>
          <a href="/catalogo.html?tipo=aluguel" target="_blank" className="adm-side__link">
            Ver catálogo aluguel ↗
          </a>
          <a href="/" target="_blank" className="adm-side__link">
            Ver site ↗
          </a>
        </div>

        <button className="adm-logout" onClick={logout}>Sair</button>
      </aside>

      <main className="adm-content">
        <MotoList key={tab} tipo={tab} token={token} config={config} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
