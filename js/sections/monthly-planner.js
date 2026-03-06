/* ============================================================
   sections/monthly-planner.js — Monthly Content Planner
   Bulk-schedule an entire month of posts for an avatar
   ============================================================ */

const MP_FREQUENCIES = [
  { id: 'daily',   label: '1 post/dia',         days: [0,1,2,3,4,5,6] },
  { id: 'weekday', label: 'Dias úteis (Seg-Sex)', days: [1,2,3,4,5] },
  { id: '3w',      label: '3x/semana (Seg, Qua, Sex)', days: [1,3,5] },
  { id: '2w',      label: '2x/semana (Ter, Qui)', days: [2,4] },
  { id: '1w',      label: '1x/semana (Segunda)', days: [1] },
];

// Wizard state
let _mp = {
  step: 1,
  avatarId: null,
  avatar: null,
  month: null,   // 0-based
  year: null,
  freq: 'daily',
  platforms: [],
  time: '10:00',
  topics: [],    // string[]
  posts: [],     // generated preview [{date, topic, legenda, hashtags}]
};

/* ══════════════════════════════════════════════════════════════
   ENTRY POINT
══════════════════════════════════════════════════════════════ */
function openMonthlyPlannerModal(avatarId) {
  const avatares = app.getAvatares ? app.getAvatares() : [];
  const avatar   = avatares.find(a => String(a.id) === String(avatarId));
  if (!avatar) { app.toast('Avatar não encontrado', 'error'); return; }

  const next = new Date();
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);

  _mp = {
    step: 1,
    avatarId: String(avatarId),
    avatar,
    month: next.getMonth(),
    year: next.getFullYear(),
    freq: 'daily',
    platforms: avatar.plataformas?.slice(0, 2) || ['instagram'],
    time: '10:00',
    topics: [],
    posts: [],
  };

  _mpRender();
}

/* ══════════════════════════════════════════════════════════════
   MODAL RENDER — dispatches to step
══════════════════════════════════════════════════════════════ */
function _mpRender() {
  const stepLabels = ['Configurar', 'Temas', 'Confirmar'];
  const progress = stepLabels.map((l, i) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
      <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;
        ${_mp.step > i+1 ? 'background:var(--green);color:#fff' :
          _mp.step === i+1 ? 'background:var(--accent);color:#fff' :
          'background:var(--border);color:var(--text-muted)'}">
        ${_mp.step > i+1 ? '<i class="fa-solid fa-check"></i>' : i+1}
      </div>
      <div style="font-size:.7rem;${_mp.step === i+1 ? 'color:var(--accent);font-weight:600' : 'color:var(--text-muted)'}">${l}</div>
    </div>
    ${i < 2 ? `<div style="flex:0 0 32px;height:2px;background:${_mp.step > i+1 ? 'var(--green)' : 'var(--border)'};margin-top:14px"></div>` : ''}`
  ).join('');

  const header = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:10px 14px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">
        ${_mp.avatar.emoji || '🎭'}
      </div>
      <div>
        <div style="font-weight:700;font-size:.9rem">${escMp(_mp.avatar.nome)}</div>
        <div style="font-size:.75rem;color:var(--text-muted)">${escMp(_mp.avatar.nicho)}</div>
      </div>
      <div style="margin-left:auto;font-size:.75rem;color:var(--text-muted)">Passo ${_mp.step} de 3</div>
    </div>
    <div style="display:flex;align-items:flex-start;margin-bottom:20px">${progress}</div>`;

  let body, footer;
  if (_mp.step === 1) { ({ body, footer } = _mpStep1(header)); }
  else if (_mp.step === 2) { ({ body, footer } = _mpStep2(header)); }
  else { ({ body, footer } = _mpStep3(header)); }

  app.openModal('Plano Mensal de Conteúdo', body, footer);
}

/* ══════════════════════════════════════════════════════════════
   STEP 1 — Configurar mês, frequência, plataformas, hora
══════════════════════════════════════════════════════════════ */
function _mpStep1(header) {
  const now   = new Date();
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // Build month/year options: current + next 11 months
  let monthOpts = '';
  for (let i = 0; i <= 11; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${d.getMonth()}`;
    const sel = _mp.year === d.getFullYear() && _mp.month === d.getMonth() ? ' selected' : '';
    monthOpts += `<option value="${val}"${sel}>${months[d.getMonth()]} ${d.getFullYear()}</option>`;
  }

  // Platforms from avatar
  const avatarPlatforms = _mp.avatar.plataformas || ['instagram'];
  const platOptions = avatarPlatforms.map(p => `
    <label style="display:flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid ${_mp.platforms.includes(p) ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius-sm);cursor:pointer;font-size:.8rem;background:${_mp.platforms.includes(p) ? 'var(--accent-soft)' : 'transparent'}">
      <input type="checkbox" value="${p}" ${_mp.platforms.includes(p) ? 'checked' : ''} style="accent-color:var(--accent)" onchange="mpTogglePlatform('${p}',this.checked)">
      ${app.platformIcon(p)} ${app.platformLabel(p)}
    </label>`).join('');

  const countPreview = _mpCountDays(_mp.month, _mp.year, _mp.freq);

  const body = header + `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Mês</label>
          <select id="mp-month" class="form-control" onchange="mpSetMonth(this.value)">
            ${monthOpts}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Hora de publicação</label>
          <input id="mp-time" type="time" class="form-control" value="${_mp.time}" onchange="_mp.time=this.value">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Frequência</label>
        <div style="display:flex;flex-direction:column;gap:6px" id="mp-freq-grid">
          ${MP_FREQUENCIES.map(f => `
            <label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid ${_mp.freq === f.id ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius-sm);cursor:pointer;font-size:.84rem;background:${_mp.freq === f.id ? 'var(--accent-soft)' : 'transparent'}">
              <input type="radio" name="mp-freq" value="${f.id}" ${_mp.freq === f.id ? 'checked' : ''} style="accent-color:var(--accent)" onchange="mpSetFreq('${f.id}')">
              ${f.label}
            </label>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Plataformas</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${platOptions}</div>
      </div>

      <div id="mp-count-preview" style="padding:10px 14px;border-radius:var(--radius-sm);background:var(--accent)15;border:1px solid var(--accent)44;font-size:.84rem">
        <i class="fa-solid fa-calendar-days" style="color:var(--accent)"></i>
        Este plano vai gerar <strong>${countPreview} posts</strong> para o mês selecionado.
      </div>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="mpGoStep2()">
      Próximo: Temas <i class="fa-solid fa-arrow-right"></i>
    </button>`;

  return { body, footer };
}

function mpTogglePlatform(p, checked) {
  _mp.platforms = checked
    ? [...new Set([..._mp.platforms, p])]
    : _mp.platforms.filter(x => x !== p);
}

function mpSetMonth(val) {
  const [y, m] = val.split('-').map(Number);
  _mp.year  = y;
  _mp.month = m;
  const n = _mpCountDays(m, y, _mp.freq);
  const el = document.getElementById('mp-count-preview');
  if (el) el.innerHTML = `<i class="fa-solid fa-calendar-days" style="color:var(--accent)"></i> Este plano vai gerar <strong>${n} posts</strong> para o mês selecionado.`;
}

function mpSetFreq(id) {
  _mp.freq = id;
  const n = _mpCountDays(_mp.month, _mp.year, _mp.freq);
  const el = document.getElementById('mp-count-preview');
  if (el) el.innerHTML = `<i class="fa-solid fa-calendar-days" style="color:var(--accent)"></i> Este plano vai gerar <strong>${n} posts</strong> para o mês selecionado.`;
}

function mpGoStep2() {
  _mp.time = document.getElementById('mp-time')?.value || '10:00';
  if (!_mp.platforms.length) { app.toast('Seleciona pelo menos uma plataforma', 'error'); return; }
  _mp.step = 2;
  if (!_mp.topics.length) {
    // Pre-fill with empty slots
    const n = _mpCountDays(_mp.month, _mp.year, _mp.freq);
    _mp.topics = Array(n).fill('');
  }
  _mpRender();
}

/* ══════════════════════════════════════════════════════════════
   STEP 2 — Temas (IA ou manual)
══════════════════════════════════════════════════════════════ */
function _mpStep2(header) {
  const n = _mpCountDays(_mp.month, _mp.year, _mp.freq);
  const topics = _mp.topics.length === n ? _mp.topics : Array(n).fill('');

  const body = header + `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:600;font-size:.9rem">${n} posts para planear</div>
          <div style="font-size:.78rem;color:var(--text-muted)">Escreve um tema por linha, ou usa a IA para gerar automaticamente</div>
        </div>
        <button class="btn btn-secondary" onclick="mpGenerateTopicsAI()" id="mp-gen-btn">
          <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent)"></i> Gerar com IA
        </button>
      </div>

      <div id="mp-topics-container" style="display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;padding-right:4px">
        ${topics.map((t, i) => `
          <div style="display:flex;align-items:center;gap:8px">
            <div style="font-size:.72rem;color:var(--text-muted);width:22px;flex-shrink:0;text-align:right">${i+1}</div>
            <input class="form-control mp-topic-input" data-idx="${i}" value="${escMp(t)}"
              placeholder="Ex: Dicas de produtividade para ${_mp.avatar.nicho}" style="font-size:.82rem">
          </div>`).join('')}
      </div>

      <div style="font-size:.75rem;color:var(--text-muted);padding:8px 12px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
        <i class="fa-solid fa-circle-info" style="color:var(--accent)"></i>
        Podes deixar campos em branco — a IA gerará legendas baseadas no nicho do avatar no próximo passo.
      </div>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="_mp.step=1;_mpRender()"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
    <button class="btn btn-primary" onclick="mpGoStep3()">
      Próximo: Pré-visualizar <i class="fa-solid fa-arrow-right"></i>
    </button>`;

  return { body, footer };
}

async function mpGenerateTopicsAI() {
  const btn = document.getElementById('mp-gen-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A gerar…'; }

  const n = _mpCountDays(_mp.month, _mp.year, _mp.freq);
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const monthLabel = months[_mp.month];

  const prompt = `Gera ${n} ideias de temas/tópicos únicos para posts de redes sociais para um criador de conteúdo com o seguinte perfil:
- Nome: ${_mp.avatar.nome}
- Nicho: ${_mp.avatar.nicho}
- Plataformas: ${_mp.platforms.join(', ')}
- Mês: ${monthLabel} ${_mp.year}
${_mp.avatar.prompt_base ? `- Estilo: ${_mp.avatar.prompt_base}` : ''}

Responde APENAS com uma lista numerada de ${n} temas, um por linha, sem explicações adicionais. Ex:
1. Como poupar tempo nas tarefas diárias
2. 5 erros comuns que todos cometem`;

  try {
    const res = await Mistral.generateText(prompt, { maxTokens: 800, temperature: 0.85 });
    if (!res) throw new Error('sem resposta');

    const lines = res.split('\n')
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(l => l.length > 0)
      .slice(0, n);

    // Pad if needed
    while (lines.length < n) lines.push('');

    _mp.topics = lines;

    // Update inputs without re-rendering the full modal
    document.querySelectorAll('.mp-topic-input').forEach((inp, i) => {
      inp.value = lines[i] || '';
    });

    app.toast(`${lines.filter(Boolean).length} temas gerados!`, 'success');
  } catch(e) {
    app.toast('Erro ao gerar temas. Verifica a chave Mistral.', 'error');
  }

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent)"></i> Gerar com IA'; }
}

function mpGoStep3() {
  // Read topics from inputs
  _mp.topics = Array.from(document.querySelectorAll('.mp-topic-input')).map(i => i.value.trim());

  const dates = _mpBuildDates(_mp.month, _mp.year, _mp.freq, _mp.time);

  _mp.posts = dates.map((date, i) => ({
    date,
    topic: _mp.topics[i] || `Post ${i+1} — ${_mp.avatar.nicho}`,
    legenda: '',
    hashtags: '',
    _generated: false,
  }));

  _mp.step = 3;
  _mpRender();
}

/* ══════════════════════════════════════════════════════════════
   STEP 3 — Preview + Confirmar
══════════════════════════════════════════════════════════════ */
function _mpStep3(header) {
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  const rows = _mp.posts.map((p, i) => {
    const d = new Date(p.date);
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius-sm);background:var(--bg-elevated);border:1px solid var(--border)">
        <div style="flex-shrink:0;text-align:center;width:44px">
          <div style="font-size:.65rem;color:var(--text-muted)">${weekdays[d.getDay()]}</div>
          <div style="font-size:1rem;font-weight:700;line-height:1">${d.getDate()}</div>
          <div style="font-size:.65rem;color:var(--text-muted)">${d.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escMp(p.topic)}</div>
          <div style="font-size:.72rem;color:var(--text-muted)">
            ${_mp.platforms.map(pl => app.platformIcon(pl)).join(' ')}
            · Post agendado
          </div>
        </div>
        <div style="font-size:.65rem;color:var(--green);font-weight:600">#${i+1}</div>
      </div>`;
  }).join('');

  const body = header + `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <div style="padding:10px;background:var(--bg-elevated);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:1.2rem;font-weight:700;color:var(--accent)">${_mp.posts.length}</div>
          <div style="font-size:.72rem;color:var(--text-muted)">Posts a criar</div>
        </div>
        <div style="padding:10px;background:var(--bg-elevated);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:1.2rem;font-weight:700;color:var(--green)">${months[_mp.month]} ${_mp.year}</div>
          <div style="font-size:.72rem;color:var(--text-muted)">Mês</div>
        </div>
        <div style="padding:10px;background:var(--bg-elevated);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:1.2rem;font-weight:700;color:var(--pink)">${_mp.platforms.length}</div>
          <div style="font-size:.72rem;color:var(--text-muted)">Plataformas</div>
        </div>
      </div>

      <div style="max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px">
        ${rows}
      </div>

      <div style="padding:10px 14px;border-radius:var(--radius-sm);background:var(--yellow)15;border:1px solid var(--yellow)44;font-size:.8rem;color:var(--text-muted)">
        <i class="fa-solid fa-circle-info" style="color:var(--yellow)"></i>
        Os posts serão criados como <strong>rascunhos agendados</strong>. Podes editar a legenda individual de cada um na secção <em>Fila</em>.
      </div>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="_mp.step=2;_mpRender()"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
    <button class="btn btn-primary" id="mp-confirm-btn" onclick="mpConfirm()">
      <i class="fa-solid fa-calendar-check"></i> Criar ${_mp.posts.length} posts agendados
    </button>`;

  return { body, footer };
}

/* ══════════════════════════════════════════════════════════════
   CONFIRM — Save posts to Supabase
══════════════════════════════════════════════════════════════ */
async function mpConfirm() {
  const btn = document.getElementById('mp-confirm-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A criar posts…'; }

  let ok = 0, fail = 0;

  for (const p of _mp.posts) {
    const legenda = p.topic || `Post de ${_mp.avatar.nicho}`;
    const post = {
      avatar_id:     _mp.avatarId,
      legenda,
      hashtags:      '',
      imagem_url:    null,
      plataformas:   _mp.platforms,
      status:        'agendado',
      agendado_para: p.date,
    };

    try {
      const { error } = await DB.upsertPost(post);
      if (error) throw error;
      ok++;
    } catch {
      fail++;
    }
  }

  app.closeModal();

  if (ok > 0) app.toast(`✓ ${ok} posts criados e agendados!`, 'success');
  if (fail > 0) app.toast(`${fail} posts falharam — verifica a ligação Supabase`, 'error');

  // Navigate to queue
  if (ok > 0) setTimeout(() => app.navigate('fila'), 800);
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function _mpBuildDates(month, year, freqId, time) {
  const freq = MP_FREQUENCIES.find(f => f.id === freqId) || MP_FREQUENCIES[0];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const [h, m] = (time || '10:00').split(':').map(Number);
  const dates = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d, h, m, 0);
    if (freq.days.includes(date.getDay())) {
      dates.push(date.toISOString());
    }
  }
  return dates;
}

function _mpCountDays(month, year, freqId) {
  return _mpBuildDates(month, year, freqId, '10:00').length;
}

function escMp(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
