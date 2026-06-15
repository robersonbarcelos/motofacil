// admin.jsx — Moto Fácil · Painel administrativo
const { useState, useEffect, useRef, useCallback } = React;

const SB_URL = "https://hxafbnhqvzgjyxhkpxxb.supabase.co";
const SB_KEY = "sb_publishable_wmBhcq00_rhSujycjPoGfw_shkalHY5";
const sb     = supabase.createClient(SB_URL, SB_KEY);

const CATEGORIAS = ["urbana","trail","esportiva","scooter","elétrica","custom","outra"];
const MARCAS     = ["Honda","Yamaha","Suzuki","Kawasaki","BMW","Ducati","Triumph","Outra"];
const fmt        = (n) => n ? `R$ ${Number(n).toLocaleString("pt-BR")}` : "—";

// ── Utilitários ───────────────────────────────────────────────────────────────
async function toWebP(file, maxW = 1200, quality = 0.82) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.naturalWidth);
      const w = Math.round(img.naturalWidth * ratio);
      const h = Math.round(img.naturalHeight * ratio);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      c.toBlob(b => resolve(b), "image/webp", quality);
    };
    img.src = url;
  });
}

async function uploadFoto(file, motoId, idx) {
  const blob = await toWebP(file);
  const name = `${motoId}-${idx}-${Date.now()}.webp`;
  const { error } = await sb.storage.from("fotos-motos").upload(name, blob, {
    contentType: "image/webp", upsert: true,
  });
  if (error) throw error;
  return sb.storage.from("fotos-motos").getPublicUrl(name).data.publicUrl;
}

async function logAudit(action, entity, entityId, details) {
  const { data: { user } } = await sb.auth.getUser();
  await sb.from("audit_log").insert({
    action, entity, entity_id: String(entityId),
    user_email: user?.email || "unknown",
    details: details || {},
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail]   = useState("");
  const [pw,    setPw]      = useState("");
  const [err,   setErr]     = useState("");
  const [busy,  setBusy]    = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr("E-mail ou senha incorretos.");
    else onLogin();
  };

  return (
    <div className="login">
      <div className="login__box">
        <div className="login__logo">MOTO<span>FÁCIL</span></div>
        <p className="login__sub">Painel administrativo</p>
        <form className="login__form" onSubmit={submit}>
          <div className="login__field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required autoFocus />
          </div>
          <div className="login__field">
            <label>Senha</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••" required />
          </div>
          {err && <p className="login__err">{err}</p>}
          <button className="login__btn" type="submit" disabled={busy}>
            {busy ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Formulário de moto (adicionar / editar) ────────────────────────────────────
function MotoForm({ moto: initial, onSave, onCancel }) {
  const isEdit = !!initial?.id;
  const blank = {
    tipo:"venda", marca:"Honda", modelo:"", ano: new Date().getFullYear(),
    km:0, preco:"", entrada:"", parcela:"",
    preco_diaria:"", preco_semanal:"", preco_mensal:"",
    cor:"", categoria:"urbana", fotos:[], disponivel:true,
    destaque:false, observacoes:"",
  };
  const [form,       setForm]       = useState(initial || blank);
  const [uploading,  setUploading]  = useState(false);
  const [uploadProg, setUploadProg] = useState("");
  const [busy,       setBusy]       = useState(false);
  const [err,        setErr]        = useState("");
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = async (files) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    if ((form.fotos.length + arr.length) > 4) { setErr("Máximo 4 fotos por moto."); return; }
    setUploading(true); setErr("");
    try {
      const id = isEdit ? form.id : `tmp-${Date.now()}`;
      const urls = [];
      for (let i = 0; i < arr.length; i++) {
        setUploadProg(`Convertendo e enviando ${i + 1}/${arr.length}...`);
        const url = await uploadFoto(arr[i], id, form.fotos.length + i);
        urls.push(url);
      }
      setForm(f => ({ ...f, fotos: [...f.fotos, ...urls] }));
    } catch (e) {
      setErr("Erro no upload: " + e.message);
    }
    setUploading(false); setUploadProg("");
  };

  const removePhoto = (idx) => setForm(f => ({ ...f, fotos: f.fotos.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.modelo.trim()) { setErr("Modelo é obrigatório."); return; }
    setBusy(true); setErr("");
    const payload = {
      tipo: form.tipo, marca: form.marca, modelo: form.modelo.trim(),
      ano: Number(form.ano) || null, km: Number(form.km) || 0,
      preco: form.tipo === "venda"    ? (Number(form.preco)    || null) : null,
      entrada: form.tipo === "venda"  ? (Number(form.entrada)  || null) : null,
      parcela: form.tipo === "venda"  ? (Number(form.parcela)  || null) : null,
      preco_diaria:  form.tipo === "aluguel" ? (Number(form.preco_diaria)  || null) : null,
      preco_semanal: form.tipo === "aluguel" ? (Number(form.preco_semanal) || null) : null,
      preco_mensal:  form.tipo === "aluguel" ? (Number(form.preco_mensal)  || null) : null,
      cor: form.cor.trim(), categoria: form.categoria,
      fotos: form.fotos, disponivel: form.disponivel,
      destaque: form.destaque, observacoes: form.observacoes.trim(),
    };
    let result, error;
    if (isEdit) {
      ({ data: result, error } = await sb.from("motos").update({ ...payload, updated_by: (await sb.auth.getUser()).data.user?.email }).eq("id", form.id).select().single());
      if (!error) await logAudit("update_moto", "moto", form.id, { modelo: form.modelo });
    } else {
      ({ data: result, error } = await sb.from("motos").insert(payload).select().single());
      if (!error) await logAudit("create_moto", "moto", result.id, { modelo: form.modelo });
    }
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSave(result);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <h2>{isEdit ? "Editar moto" : "Adicionar moto"}</h2>
          <button className="modal__close" onClick={onCancel}>✕</button>
        </div>

        <form className="moto-form" onSubmit={submit}>
          {/* Tipo */}
          <div className="mf-row">
            <div className="mf-field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>
            </div>
            <div className="mf-field">
              <label>Marca</label>
              <select value={form.marca} onChange={e => set("marca", e.target.value)}>
                {MARCAS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="mf-field mf-field--wide">
              <label>Modelo *</label>
              <input value={form.modelo} onChange={e => set("modelo", e.target.value)}
                placeholder="Ex: Biz 110i" required />
            </div>
          </div>

          {/* Básico */}
          <div className="mf-row">
            <div className="mf-field">
              <label>Ano</label>
              <input type="number" value={form.ano} onChange={e => set("ano", e.target.value)} min="1990" max="2030" />
            </div>
            <div className="mf-field">
              <label>KM</label>
              <input type="number" value={form.km} onChange={e => set("km", e.target.value)} min="0" />
            </div>
            <div className="mf-field">
              <label>Cor</label>
              <input value={form.cor} onChange={e => set("cor", e.target.value)} placeholder="Ex: Vermelha" />
            </div>
            <div className="mf-field">
              <label>Categoria</label>
              <select value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Preços venda */}
          {form.tipo === "venda" && (
            <div className="mf-row">
              <div className="mf-field">
                <label>Preço (R$)</label>
                <input type="number" value={form.preco} onChange={e => set("preco", e.target.value)} min="0" placeholder="12990" />
              </div>
              <div className="mf-field">
                <label>Entrada (R$)</label>
                <input type="number" value={form.entrada} onChange={e => set("entrada", e.target.value)} min="0" placeholder="2000" />
              </div>
              <div className="mf-field">
                <label>Parcela/mês (R$)</label>
                <input type="number" value={form.parcela} onChange={e => set("parcela", e.target.value)} min="0" placeholder="350" />
              </div>
            </div>
          )}

          {/* Preços aluguel */}
          {form.tipo === "aluguel" && (
            <div className="mf-row">
              <div className="mf-field">
                <label>Diária (R$)</label>
                <input type="number" value={form.preco_diaria} onChange={e => set("preco_diaria", e.target.value)} min="0" placeholder="45" />
              </div>
              <div className="mf-field">
                <label>Semanal (R$)</label>
                <input type="number" value={form.preco_semanal} onChange={e => set("preco_semanal", e.target.value)} min="0" placeholder="270" />
              </div>
              <div className="mf-field">
                <label>Mensal (R$)</label>
                <input type="number" value={form.preco_mensal} onChange={e => set("preco_mensal", e.target.value)} min="0" placeholder="900" />
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="mf-row">
            <div className="mf-field mf-field--wide">
              <label>Observações</label>
              <input value={form.observacoes} onChange={e => set("observacoes", e.target.value)}
                placeholder="Ex: 0 km · IPVA 2025 pago" maxLength={120} />
            </div>
          </div>

          {/* Flags */}
          <div className="mf-flags">
            <label className="mf-check">
              <input type="checkbox" checked={form.disponivel} onChange={e => set("disponivel", e.target.checked)} />
              Disponível (visível no catálogo)
            </label>
            <label className="mf-check">
              <input type="checkbox" checked={form.destaque} onChange={e => set("destaque", e.target.checked)} />
              Destaque
            </label>
          </div>

          {/* Fotos */}
          <div className="mf-photos">
            <div className="mf-photos__head">
              <label>Fotos ({form.fotos.length}/4)</label>
              {form.fotos.length < 4 && (
                <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
                  {uploading ? uploadProg : "+ Adicionar fotos"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                onChange={e => handleFiles(e.target.files)} />
            </div>
            <p className="mf-photos__hint">PNG, JPG ou HEIC · convertido automaticamente para WebP · máx. 4 fotos</p>
            {form.fotos.length > 0 && (
              <div className="mf-photos__grid">
                {form.fotos.map((url, i) => (
                  <div key={i} className="mf-photo">
                    <img src={url} alt={`Foto ${i + 1}`} />
                    <button type="button" className="mf-photo__del" onClick={() => removePhoto(i)} title="Remover">✕</button>
                    {i === 0 && <span className="mf-photo__main">Principal</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {err && <p className="mf-err">{err}</p>}

          <div className="mf-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={busy || uploading}>
              {busy ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar moto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Lista de motos ────────────────────────────────────────────────────────────
function MotosList({ motos, loading, onEdit, onToggle, onDelete }) {
  if (loading) return <div className="adm-empty">Carregando...</div>;
  if (!motos.length) return (
    <div className="adm-empty">
      <p>Nenhuma moto cadastrada.</p>
      <p>Clique em <strong>+ Nova moto</strong> para começar.</p>
    </div>
  );

  return (
    <div className="motos-table-wrap">
      <table className="motos-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Moto</th>
            <th>Tipo</th>
            <th>Preço</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {motos.map(m => (
            <tr key={m.id} className={!m.disponivel ? "row--off" : ""}>
              <td>
                <div className="tbl-thumb">
                  {m.fotos?.[0]
                    ? <img src={m.fotos[0]} alt="" />
                    : <span className="tbl-nophoto">📷</span>
                  }
                  {m.fotos?.length > 1 && <span className="tbl-count">+{m.fotos.length - 1}</span>}
                </div>
              </td>
              <td>
                <strong className="tbl-name">{m.marca} {m.modelo}</strong>
                <span className="tbl-meta">{m.ano}{m.cor ? ` · ${m.cor}` : ""}{m.km != null && m.tipo === "venda" ? ` · ${m.km.toLocaleString("pt-BR")} km` : ""}</span>
              </td>
              <td><span className={`badge badge--${m.tipo}`}>{m.tipo === "venda" ? "Venda" : "Aluguel"}</span></td>
              <td className="tbl-price">
                {m.tipo === "venda"
                  ? <>{fmt(m.preco)}{m.entrada ? <small>Entrada: {fmt(m.entrada)}</small> : null}</>
                  : <>{m.preco_mensal ? <>{fmt(m.preco_mensal)}<small>/mês</small></> : null}{m.preco_diaria ? <small>{fmt(m.preco_diaria)}/dia</small> : null}</>
                }
              </td>
              <td>
                <div className="tbl-status">
                  <button
                    className={`toggle ${m.disponivel ? "toggle--on" : "toggle--off"}`}
                    onClick={() => onToggle(m)}
                    title={m.disponivel ? "Clique para despublicar" : "Clique para publicar"}
                  >
                    {m.disponivel ? "Publicado" : "Oculto"}
                  </button>
                  {m.destaque && <span className="badge badge--dest">★ Destaque</span>}
                </div>
              </td>
              <td>
                <div className="tbl-actions">
                  <button className="btn-icon" onClick={() => onEdit(m)} title="Editar">✏️</button>
                  <button className="btn-icon btn-icon--del" onClick={() => onDelete(m)} title="Excluir">🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Painel de Configuração de Preços ──────────────────────────────────────────
function ConfigPanel({ onMsg }) {
  const [cfg,  setCfg]  = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.from("config").select("*").eq("id", "global").single()
      .then(({ data }) => data && setCfg(data));
  }, []);

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  const save = async () => {
    setBusy(true);
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("config").update({ ...cfg, updated_by: user?.email }).eq("id", "global");
    setBusy(false);
    if (!error) {
      await logAudit("update_config", "config", "global", cfg);
      onMsg("Configuração salva com sucesso.");
    }
  };

  if (!cfg) return <div className="adm-empty">Carregando configuração...</div>;

  return (
    <div className="cfg-panel">
      <p className="cfg-desc">Define globalmente quais informações são exibidas no catálogo público. Aplicado a todas as motos automaticamente.</p>

      <div className="cfg-cols">
        <div className="cfg-group">
          <h3 className="cfg-group__title">🏍️ Motos à Venda</h3>
          {[
            ["venda_preco",     "Valor de venda (R$)"],
            ["venda_entrada",   "Valor de entrada"],
            ["venda_parcela",   "Valor da parcela/mês"],
            ["venda_simulacao", "Botão: Simular Promissória"],
          ].map(([key, label]) => (
            <label key={key} className="cfg-check">
              <input type="checkbox" checked={!!cfg[key]} onChange={e => set(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <div className="cfg-group">
          <h3 className="cfg-group__title">📋 Motos para Aluguel</h3>
          {[
            ["aluguel_diaria",  "Valor da diária"],
            ["aluguel_semanal", "Valor semanal"],
            ["aluguel_mensal",  "Valor mensal"],
          ].map(([key, label]) => (
            <label key={key} className="cfg-check">
              <input type="checkbox" checked={!!cfg[key]} onChange={e => set(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="cfg-rules">
        <p>⚠️ Desmarcar todas as opções de preço oculta os preços do catálogo público.</p>
        <p>✅ Alterações entram em vigor imediatamente no site.</p>
      </div>

      <button className="btn-primary" onClick={save} disabled={busy}>
        {busy ? "Salvando..." : "Salvar configuração"}
      </button>
    </div>
  );
}

// ── Log de Auditoria ──────────────────────────────────────────────────────────
function AuditLog() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, []);

  const actionLabel = (a) => ({
    create_moto:   "Adicionou moto",
    update_moto:   "Editou moto",
    delete_moto:   "Excluiu moto",
    toggle_moto:   "Alterou status",
    update_config: "Alterou config",
  }[a] || a);

  if (loading) return <div className="adm-empty">Carregando log...</div>;
  if (!logs.length) return <div className="adm-empty">Nenhuma ação registrada ainda.</div>;

  return (
    <div className="audit-wrap">
      <table className="audit-table">
        <thead>
          <tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Detalhe</th></tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td className="audit-date">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
              <td className="audit-user">{l.user_email}</td>
              <td><span className="audit-action">{actionLabel(l.action)}</span></td>
              <td className="audit-detail">{l.details?.modelo || l.entity_id || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Admin App principal ───────────────────────────────────────────────────────
function AdminApp() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("motos");
  const [motos,   setMotos]   = useState([]);
  const [mLoading,setMLoading]= useState(true);
  const [form,    setForm]    = useState(null); // null | "new" | moto object
  const [msg,     setMsg]     = useState("");
  const [confirm, setConfirm] = useState(null);

  // Auth state
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load motos
  const loadMotos = useCallback(async () => {
    setMLoading(true);
    const { data } = await sb.from("motos").select("*").order("created_at", { ascending: false });
    setMotos(data || []);
    setMLoading(false);
  }, []);

  useEffect(() => { if (user) loadMotos(); }, [user]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  const handleLogout = async () => {
    await sb.auth.signOut();
  };

  const handleSave = (result) => {
    loadMotos();
    setForm(null);
    showMsg(form?.id ? "Moto atualizada." : "Moto adicionada.");
  };

  const handleToggle = async (moto) => {
    const novoStatus = !moto.disponivel;
    const { data: { user: u } } = await sb.auth.getUser();
    await sb.from("motos").update({ disponivel: novoStatus, updated_by: u?.email }).eq("id", moto.id);
    await logAudit("toggle_moto", "moto", moto.id, { disponivel: novoStatus, modelo: moto.modelo });
    setMotos(ms => ms.map(m => m.id === moto.id ? { ...m, disponivel: novoStatus } : m));
    showMsg(`${moto.modelo} ${novoStatus ? "publicado" : "ocultado"}.`);
  };

  const handleDelete = (moto) => {
    setConfirm({
      msg: `Excluir "${moto.marca} ${moto.modelo}"? Esta ação não pode ser desfeita.`,
      onOk: async () => {
        await sb.from("motos").delete().eq("id", moto.id);
        await logAudit("delete_moto", "moto", moto.id, { modelo: moto.modelo });
        setMotos(ms => ms.filter(m => m.id !== moto.id));
        setConfirm(null);
        showMsg("Moto excluída.");
      },
    });
  };

  if (loading) return <div className="adm-splash">Carregando...</div>;
  if (!user)   return <Login onLogin={() => {}} />;

  const counts = {
    venda:   motos.filter(m => m.tipo === "venda"   && m.disponivel).length,
    aluguel: motos.filter(m => m.tipo === "aluguel" && m.disponivel).length,
    ocultas: motos.filter(m => !m.disponivel).length,
  };

  return (
    <div className="adm">
      {/* Header */}
      <header className="adm-header">
        <div className="adm-header__brand">MOTO<span>FÁCIL</span></div>
        <div className="adm-header__right">
          <span className="adm-header__user">{user.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {/* Stats */}
      <div className="adm-stats">
        <div className="stat"><span className="stat__n">{counts.venda}</span><span className="stat__l">À venda</span></div>
        <div className="stat"><span className="stat__n">{counts.aluguel}</span><span className="stat__l">Aluguel</span></div>
        <div className="stat stat--off"><span className="stat__n">{counts.ocultas}</span><span className="stat__l">Ocultas</span></div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {[["motos","🏍️ Motos"],["config","⚙️ Configuração"],["log","📋 Log"]].map(([k, l]) => (
          <button key={k} className={`adm-tab${tab === k ? " adm-tab--on" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
        {tab === "motos" && (
          <button className="btn-primary adm-tab-cta" onClick={() => setForm({ tipo:"venda" })}>+ Nova moto</button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="adm-body">
        {tab === "motos"  && <MotosList motos={motos} loading={mLoading} onEdit={setForm} onToggle={handleToggle} onDelete={handleDelete} />}
        {tab === "config" && <ConfigPanel onMsg={showMsg} />}
        {tab === "log"    && <AuditLog />}
      </div>

      {/* Modal form */}
      {form && (
        <MotoForm
          moto={form?.id ? form : null}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <p className="confirm__msg">{confirm.msg}</p>
            <div className="confirm__actions">
              <button className="btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={confirm.onOk}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
