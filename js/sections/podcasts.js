/* ============================================================
   sections/podcasts.js — Gestão de Podcasts e Episódios
   ============================================================ */

const PODCAST_PLATAFORMAS = ['spotify','youtube','apple','amazon','google','deezer','pocket_casts','overcast'];
const PODCAST_PLATAFORMA_LABELS = {
  spotify:      'Spotify',
  youtube:      'YouTube Podcasts',
  apple:        'Apple Podcasts',
  amazon:       'Amazon Music',
  google:       'Google Podcasts',
  deezer:       'Deezer',
  pocket_casts: 'Pocket Casts',
  overcast:     'Overcast',
};
const PODCAST_CATEGORIAS = ['Tecnologia','Negócios','Entretenimento','Educação','Saúde','Desporto','Arte','Música','Notícias','Sociedade','Ciência','Humor'];

let _podState = {
  podcasts:        [],
  selectedPodcast: null,
  episodios:       [],
  audioFile:       null,       // File object pendente
  audioDataUrl:    null,       // preview local
  coverDataUrl:    null,       // capa pendente
};

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderPodcasts(container) {
  if (DB.ready()) {
    const { data } = await DB.getPodcasts();
    _podState.podcasts = data || [];
  }

  const hasPodcasts = _podState.podcasts.length > 0;
  const sel = _podState.selectedPodcast
    || (_podState.podcasts.length ? _podState.podcasts[0] : null);

  if (sel && (!_podState.selectedPodcast || _podState.selectedPodcast.id !== sel.id)) {
    _podState.selectedPodcast = sel;
    if (DB.ready()) {
      const { data } = await DB.getEpisodios(sel.id);
      _podState.episodios = data || [];
    }
  }

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Podcasts</div>
        <div class="section-subtitle">Gere episódios, publica em múltiplas plataformas e gera vídeos com IA</div>
      </div>
      <button class="btn btn-primary" onclick="openPodcastModal(null)">
        <i class="fa-solid fa-plus"></i> Novo Podcast
      </button>
    </div>

    <div class="two-col-layout" style="gap:20px">

      <!-- ── Coluna esquerda: lista de podcasts ── -->
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">

        ${!hasPodcasts ? `
          <div class="card" style="text-align:center;padding:48px 24px">
            <i class="fa-solid fa-microphone" style="font-size:3rem;color:var(--border);margin-bottom:16px"></i>
            <p style="font-size:1.1rem;font-weight:600;margin-bottom:8px">Sem podcasts criados</p>
            <p class="text-muted" style="margin-bottom:20px">Cria o teu primeiro podcast para começar a gerir episódios</p>
            <button class="btn btn-primary" onclick="openPodcastModal(null)">
              <i class="fa-solid fa-plus"></i> Criar podcast
            </button>
          </div>
        ` : `
          <div id="pod-list" style="display:flex;flex-direction:column;gap:10px">
            ${_podState.podcasts.map(p => _renderPodcastCard(p, p.id === _podState.selectedPodcast?.id)).join('')}
          </div>
        `}
      </div>

      <!-- ── Coluna direita: episódios do podcast seleccionado ── -->
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0" id="pod-episodes-col">
        ${_podState.selectedPodcast ? _renderEpisodesPanel() : `
          <div class="card" style="text-align:center;padding:48px 24px;color:var(--text-muted)">
            <i class="fa-solid fa-headphones" style="font-size:2rem;margin-bottom:12px"></i>
            <p>Selecciona um podcast para ver os episódios</p>
          </div>
        `}
      </div>
    </div>`;
}

function _renderPodcastCard(p, isSelected) {
  const cats = (p.categorias || []).slice(0, 2).map(c => `<span class="badge badge-muted">${escPod(c)}</span>`).join('');
  const plats = (p.plataformas || []).map(pl => `<span title="${PODCAST_PLATAFORMA_LABELS[pl] || pl}">${_podPlatIcon(pl)}</span>`).join('');
  const coverStyle = p.cover_url
    ? `background-image:url('${escPod(p.cover_url)}');background-size:cover;background-position:center`
    : 'background:var(--bg-elevated)';

  return `
    <div class="card${isSelected ? ' card-selected' : ''}" style="cursor:pointer;padding:12px;display:flex;gap:12px;align-items:center"
         onclick="podSelectPodcast('${p.id}')">
      <div style="width:56px;height:56px;border-radius:8px;flex-shrink:0;${coverStyle};display:flex;align-items:center;justify-content:center">
        ${!p.cover_url ? '<i class="fa-solid fa-microphone" style="color:var(--text-muted);font-size:1.3rem"></i>' : ''}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escPod(p.nome)}</div>
        <div class="flex gap-1 flex-wrap mt-1">${cats}</div>
        <div class="flex gap-1 mt-1" style="font-size:1rem">${plats}</div>
      </div>
      <div class="flex gap-1" onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-ghost" onclick="openPodcastModal('${p.id}')" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-ghost" style="color:var(--red)" onclick="podDeletePodcast('${p.id}')" title="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
}

function _renderEpisodesPanel() {
  const p = _podState.selectedPodcast;
  const eps = _podState.episodios;

  return `
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="card-title" style="margin:0">${escPod(p.nome)}</div>
          <div class="text-muted" style="font-size:0.8rem">${eps.length} episódio(s)</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openEpisodioModal(null,'${p.id}')">
          <i class="fa-solid fa-plus"></i> Novo episódio
        </button>
      </div>

      ${eps.length === 0 ? `
        <div style="text-align:center;padding:40px 24px;color:var(--text-muted)">
          <i class="fa-solid fa-podcast" style="font-size:2rem;margin-bottom:12px"></i>
          <p>Sem episódios — cria o primeiro!</p>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column">
          ${eps.map((ep, i) => _renderEpisodioRow(ep, i)).join('')}
        </div>
      `}
    </div>`;
}

function _renderEpisodioRow(ep, idx) {
  const hasAudio = !!ep.audio_url;
  const hasVideo = !!ep.video_url;
  const num = ep.numero ? `EP ${ep.numero}` : `#${idx + 1}`;
  const dur = ep.duracao ? _fmtDuration(ep.duracao) : '—';

  return `
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center">
      ${ep.thumbnail_url
        ? `<img src="${escPod(ep.thumbnail_url)}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;flex-shrink:0">`
        : `<div style="width:48px;height:48px;border-radius:6px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;flex-shrink:0">
             <i class="fa-solid fa-headphones" style="color:var(--text-muted)"></i>
           </div>`}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
          <span class="badge badge-muted" style="font-size:0.7rem">${escPod(num)}</span>
          ${app.statusBadge(ep.status)}
          ${hasAudio ? '<span title="Tem áudio"><i class="fa-solid fa-microphone" style="color:var(--accent);font-size:0.8rem"></i></span>' : ''}
          ${hasVideo ? '<span title="Tem vídeo"><i class="fa-solid fa-video" style="color:var(--green);font-size:0.8rem"></i></span>' : ''}
        </div>
        <div style="font-weight:500;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escPod(ep.titulo)}</div>
        <div class="text-muted" style="font-size:0.78rem">${dur}${ep.agendado_para ? ' · ' + app.formatDate(ep.agendado_para) : ''}</div>
      </div>
      <div class="flex gap-1" style="flex-shrink:0">
        ${hasAudio && !hasVideo ? `
          <button class="btn btn-sm btn-secondary" onclick="openGenerateVideoModal('${ep.id}')" title="Gerar vídeo a partir do áudio">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </button>
        ` : ''}
        ${hasAudio ? `
          <a class="btn btn-sm btn-ghost" href="${escPod(ep.audio_url)}" target="_blank" title="Ouvir áudio">
            <i class="fa-solid fa-play"></i>
          </a>
        ` : ''}
        ${hasVideo ? `
          <a class="btn btn-sm btn-ghost" href="${escPod(ep.video_url)}" target="_blank" title="Ver vídeo" style="color:var(--green)">
            <i class="fa-solid fa-film"></i>
          </a>
        ` : ''}
        <button class="btn btn-sm btn-ghost" onclick="openEpisodioModal('${ep.id}','${ep.podcast_id}')" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-ghost" style="color:var(--red)" onclick="podDeleteEpisodio('${ep.id}')" title="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════════
   SELECCIONAR PODCAST
══════════════════════════════════════════════════════════════ */
async function podSelectPodcast(id) {
  const p = _podState.podcasts.find(x => x.id === id);
  if (!p) return;
  _podState.selectedPodcast = p;

  // Actualizar card highlight
  document.querySelectorAll('#pod-list .card').forEach(el => el.classList.remove('card-selected'));
  event?.currentTarget?.closest('.card')?.classList.add('card-selected');

  if (DB.ready()) {
    const { data } = await DB.getEpisodios(id);
    _podState.episodios = data || [];
  }

  const col = document.getElementById('pod-episodes-col');
  if (col) col.innerHTML = _renderEpisodesPanel();
}

/* ══════════════════════════════════════════════════════════════
   MODAL: PODCAST
══════════════════════════════════════════════════════════════ */
function openPodcastModal(id) {
  const p = id ? _podState.podcasts.find(x => x.id === id) : null;
  const avatares = app.getAvatares();

  const coverPreview = p?.cover_url
    ? `<img id="pod-cover-preview" src="${escPod(p.cover_url)}" style="width:80px;height:80px;border-radius:8px;object-fit:cover">`
    : `<div id="pod-cover-preview" style="width:80px;height:80px;border-radius:8px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center">
         <i class="fa-solid fa-image" style="color:var(--text-muted);font-size:1.5rem"></i>
       </div>`;

  const body = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Concept panel IA -->
      <div class="concept-toolbar" style="margin-bottom:0">
        <button id="concept-toggle-btn-podcast" class="btn btn-sm btn-ghost" onclick="_toggleConceptBar('podcast')">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Descrever com IA
        </button>
      </div>
      <div class="concept-panel" id="concept-panel-podcast">
        <div class="concept-panel-label"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent)"></i> Descreve o teu podcast — a IA preenche tudo</div>
        <textarea id="concept-text-podcast" class="form-control" rows="3"
          placeholder="Ex: podcast de entrevistas com empreendedores portugueses, foco em startups tech e inovação, episódios semanais de 45 min…"></textarea>
        <div class="flex items-center gap-2 mt-2">
          <button class="btn btn-sm btn-primary" onclick="gerarPodcastDeConceito()">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar com IA
          </button>
          <span id="concept-progress-podcast" class="text-sm" style="color:var(--accent)"></span>
        </div>
      </div>

      <!-- Capa -->
      <div style="display:flex;gap:16px;align-items:center">
        ${coverPreview}
        <div>
          <label class="form-label">Capa do podcast</label>
          <div class="flex gap-1">
            <label class="btn btn-sm btn-secondary" style="cursor:pointer">
              <i class="fa-solid fa-upload"></i> Escolher imagem
              <input type="file" accept="image/*" style="display:none" onchange="podHandleCoverUpload(this)">
            </label>
            <button class="btn btn-sm btn-secondary" onclick="podGenerateCover()">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar com IA
            </button>
          </div>
          <div class="form-hint">Mínimo 1400×1400px recomendado</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group mb-0">
          <label class="form-label">Nome do podcast *</label>
          <input id="pod-nome" class="form-control" placeholder="Ex: Tech Talk Portugal" value="${escPod(p?.nome || '')}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Avatar associado</label>
          <select id="pod-avatar" class="form-control">
            <option value="">— Nenhum —</option>
            ${avatares.map(a => `<option value="${a.id}" ${p?.avatar_id === a.id ? 'selected' : ''}>${escPod(a.nome)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Descrição</label>
        <textarea id="pod-descricao" class="form-control" rows="3" placeholder="Descreve o teu podcast…">${escPod(p?.descricao || '')}</textarea>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Categorias</label>
        <div class="flex gap-1 flex-wrap" id="pod-cats">
          ${PODCAST_CATEGORIAS.map(c => `
            <label style="cursor:pointer">
              <input type="checkbox" style="display:none" value="${c}" onchange="this.parentElement.classList.toggle('platform-toggle',true);this.parentElement.classList.toggle('active',this.checked)"
                ${(p?.categorias||[]).includes(c) ? 'checked' : ''}>
              <span class="platform-toggle${(p?.categorias||[]).includes(c) ? ' active' : ''}">${escPod(c)}</span>
            </label>`).join('')}
        </div>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Plataformas</label>
        <div class="flex gap-1 flex-wrap" id="pod-plats">
          ${PODCAST_PLATAFORMAS.map(pl => `
            <label style="cursor:pointer">
              <input type="checkbox" style="display:none" value="${pl}"
                ${(p?.plataformas||[]).includes(pl) ? 'checked' : ''}>
              <span class="platform-toggle${(p?.plataformas||[]).includes(pl) ? ' active' : ''}" onclick="this.previousElementSibling.click();this.classList.toggle('active')">
                ${_podPlatIcon(pl)} ${escPod(PODCAST_PLATAFORMA_LABELS[pl] || pl)}
              </span>
            </label>`).join('')}
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group mb-0">
          <label class="form-label">URL do RSS</label>
          <input id="pod-rss" class="form-control" type="url" placeholder="https://…" value="${escPod(p?.rss_url || '')}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Website</label>
          <input id="pod-site" class="form-control" type="url" placeholder="https://…" value="${escPod(p?.site_url || '')}">
        </div>
      </div>
    </div>`;

  app.openModal(
    id ? 'Editar Podcast' : 'Novo Podcast',
    body,
    `<button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="podSavePodcast(${id ? `'${id}'` : 'null'})">
       <i class="fa-solid fa-floppy-disk"></i> Guardar
     </button>`
  );

  _podState.coverDataUrl = null;
}

async function podSavePodcast(id) {
  const nome = document.getElementById('pod-nome')?.value.trim();
  if (!nome) { app.toast('O nome é obrigatório', 'warning'); return; }

  const cats  = [...document.querySelectorAll('#pod-cats input:checked')].map(el => el.value);
  const plats = [...document.querySelectorAll('#pod-plats input[type=checkbox]:checked')].map(el => el.value);

  const btn = document.querySelector('#modalFooter .btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;display:inline-block"></div> A guardar…'; }

  const podId = id || crypto.randomUUID();
  let cover_url = _podState.podcasts.find(p => p.id === id)?.cover_url || null;

  // Upload capa se houver uma nova
  if (_podState.coverDataUrl && DB.ready()) {
    const { url, error } = await DB.uploadPodcastCover(_podState.coverDataUrl, podId);
    if (error) app.toast('Erro ao fazer upload da capa: ' + app.fmtErr(error), 'error');
    else cover_url = url;
  }

  const payload = {
    id:          podId,
    nome,
    descricao:   document.getElementById('pod-descricao')?.value.trim() || null,
    avatar_id:   document.getElementById('pod-avatar')?.value || null,
    categorias:  cats,
    plataformas: plats,
    rss_url:     document.getElementById('pod-rss')?.value.trim() || null,
    site_url:    document.getElementById('pod-site')?.value.trim() || null,
    cover_url,
  };

  if (!DB.ready()) {
    // Guardar só localmente
    const idx = _podState.podcasts.findIndex(p => p.id === podId);
    if (idx >= 0) _podState.podcasts[idx] = { ..._podState.podcasts[idx], ...payload };
    else _podState.podcasts.unshift(payload);
    _podState.selectedPodcast = payload;
    app.closeModal();
    app.toast('Podcast guardado localmente', 'success');
    renderPodcasts(document.getElementById('content'));
    return;
  }

  const { data, error } = await DB.upsertPodcast(payload);
  if (error) {
    app.toast('Erro ao guardar: ' + app.fmtErr(error), 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar'; }
    return;
  }

  const idx = _podState.podcasts.findIndex(p => p.id === data.id);
  if (idx >= 0) _podState.podcasts[idx] = data;
  else _podState.podcasts.unshift(data);
  _podState.selectedPodcast = data;

  app.closeModal();
  app.toast('Podcast guardado!', 'success');
  renderPodcasts(document.getElementById('content'));
}

async function podDeletePodcast(id) {
  if (!confirm('Eliminar podcast e todos os episódios? Esta acção é irreversível.')) return;
  if (DB.ready()) {
    const { error } = await DB.deletePodcast(id);
    if (error) { app.toast('Erro: ' + app.fmtErr(error), 'error'); return; }
  }
  _podState.podcasts = _podState.podcasts.filter(p => p.id !== id);
  if (_podState.selectedPodcast?.id === id) {
    _podState.selectedPodcast = _podState.podcasts[0] || null;
    _podState.episodios = [];
  }
  app.toast('Podcast eliminado', 'success');
  renderPodcasts(document.getElementById('content'));
}

/* ══════════════════════════════════════════════════════════════
   CONCEITO COM IA
══════════════════════════════════════════════════════════════ */
async function gerarPodcastDeConceito() {
  const conceito = document.getElementById('concept-text-podcast')?.value.trim();
  if (!conceito) { app.toast('Escreve primeiro o teu conceito', 'warning'); return; }

  await _runConceptGen('podcast', `Cria um perfil completo de podcast baseado nesta descrição: "${conceito}"

Responde APENAS com JSON válido, sem markdown, sem backticks:
{
  "nome": "Nome criativo e memorável para o podcast (2-5 palavras)",
  "categorias": ["categoria1", "categoria2"],
  "plataformas": ["spotify", "youtube", "apple", "amazon", "google", "deezer"],
  "descricao": "Descrição apelativa do podcast em português, 2-3 frases que expliquem o tema, audiência e formato"
}
Categorias disponíveis: Tecnologia, Negócios, Entretenimento, Educação, Saúde, Desporto, Arte, Música, Notícias, Sociedade, Ciência, Humor.
Plataformas: inclui apenas as mais relevantes (máximo 4).`, data => {
    _setField('pod-nome',      data.nome);
    _setField('pod-descricao', data.descricao || '');
    if (Array.isArray(data.categorias)) {
      document.querySelectorAll('#pod-cats input[type=checkbox]').forEach(cb => {
        const active = data.categorias.includes(cb.value);
        cb.checked = active;
        const span = cb.nextElementSibling;
        if (span) span.classList.toggle('active', active);
      });
    }
    if (Array.isArray(data.plataformas)) {
      document.querySelectorAll('#pod-plats input[type=checkbox]').forEach(cb => {
        const active = data.plataformas.includes(cb.value);
        cb.checked = active;
        const span = cb.nextElementSibling;
        if (span) span.classList.toggle('active', active);
      });
    }
    return `Podcast "${data.nome}" gerado a partir do conceito!`;
  }, { temperature: 0.8 });
}

/* ══════════════════════════════════════════════════════════════
   CAPA: upload / geração IA
══════════════════════════════════════════════════════════════ */
function podHandleCoverUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _podState.coverDataUrl = e.target.result;
    const preview = document.getElementById('pod-cover-preview');
    if (preview) {
      preview.outerHTML = `<img id="pod-cover-preview" src="${e.target.result}" style="width:80px;height:80px;border-radius:8px;object-fit:cover">`;
    }
  };
  reader.readAsDataURL(file);
}

async function podGenerateCover() {
  const nome = document.getElementById('pod-nome')?.value.trim() || 'podcast';
  const desc = document.getElementById('pod-descricao')?.value.trim() || '';
  app.toast('A gerar capa com IA…', 'info');
  try {
    const url = await AI.generateImage(`Podcast cover art for "${nome}". ${desc}. Professional, vibrant, square format.`, { aspectRatio: '1:1' });
    _podState.coverDataUrl = url;
    const preview = document.getElementById('pod-cover-preview');
    if (preview) {
      preview.outerHTML = `<img id="pod-cover-preview" src="${url}" style="width:80px;height:80px;border-radius:8px;object-fit:cover">`;
    }
    app.toast('Capa gerada!', 'success');
  } catch (e) {
    app.toast('Erro ao gerar capa: ' + e.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════════════
   MODAL: EPISÓDIO
══════════════════════════════════════════════════════════════ */
function openEpisodioModal(epId, podcastId) {
  const ep = epId ? _podState.episodios.find(e => e.id === epId) : null;
  _podState.audioFile    = null;
  _podState.audioDataUrl = null;

  const nextNum = ep?.numero
    || (Math.max(0, ..._podState.episodios.map(e => e.numero || 0)) + 1);

  const agendado = ep?.agendado_para
    ? new Date(ep.agendado_para).toISOString().slice(0, 16)
    : '';

  const body = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <div class="grid-2">
        <div class="form-group mb-0">
          <label class="form-label">Título do episódio *</label>
          <input id="ep-titulo" class="form-control" placeholder="Ex: Como começar um podcast" value="${escPod(ep?.titulo || '')}">
        </div>
        <div class="grid-2" style="gap:8px">
          <div class="form-group mb-0">
            <label class="form-label">Nº episódio</label>
            <input id="ep-numero" class="form-control" type="number" min="1" value="${ep?.numero || nextNum}">
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Temporada</label>
            <input id="ep-temporada" class="form-control" type="number" min="1" value="${ep?.temporada || 1}">
          </div>
        </div>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Descrição / Notas do episódio</label>
        <textarea id="ep-descricao" class="form-control" rows="3" placeholder="De que trata este episódio…">${escPod(ep?.descricao || '')}</textarea>
      </div>

      <!-- Áudio -->
      <div class="card" style="background:var(--bg-elevated);padding:14px">
        <label class="form-label"><i class="fa-solid fa-microphone" style="color:var(--accent)"></i> Ficheiro de áudio</label>
        ${ep?.audio_url ? `
          <div class="flex gap-1 align-center mb-2">
            <audio controls style="flex:1;height:36px"><source src="${escPod(ep.audio_url)}"></audio>
            <button class="btn btn-sm btn-ghost" style="color:var(--red)" onclick="podClearAudio()">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>` : ''}
        <div id="ep-audio-zone">
          <label class="btn btn-secondary" style="cursor:pointer;width:100%;justify-content:center">
            <i class="fa-solid fa-upload"></i> ${ep?.audio_url ? 'Substituir áudio' : 'Escolher ficheiro de áudio'}
            <input type="file" accept="audio/*" style="display:none" onchange="podHandleAudioUpload(this)">
          </label>
          <div id="ep-audio-preview"></div>
        </div>
        <div class="form-hint">MP3, WAV, M4A, OGG — máx. 500 MB</div>
      </div>

      <!-- Vídeo -->
      <div class="card" style="background:var(--bg-elevated);padding:14px">
        <label class="form-label"><i class="fa-solid fa-video" style="color:var(--green)"></i> Vídeo (opcional)</label>
        ${ep?.video_url ? `
          <div class="flex gap-1 align-center mb-2">
            <a href="${escPod(ep.video_url)}" target="_blank" class="btn btn-sm btn-ghost" style="color:var(--green)">
              <i class="fa-solid fa-film"></i> Ver vídeo actual
            </a>
            <button class="btn btn-sm btn-ghost" style="color:var(--red)" onclick="document.getElementById('ep-video-url-hidden').value=''">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>` : ''}
        <input type="hidden" id="ep-video-url-hidden" value="${escPod(ep?.video_url || '')}">
        <div class="flex gap-1 flex-wrap">
          <label class="btn btn-sm btn-secondary" style="cursor:pointer">
            <i class="fa-solid fa-upload"></i> Upload de vídeo
            <input type="file" accept="video/*" style="display:none" onchange="podHandleVideoUpload(this)">
          </label>
          <div class="form-hint" style="align-self:center">ou gera após guardar (botão <i class="fa-solid fa-wand-magic-sparkles"></i>)</div>
        </div>
        <div id="ep-video-upload-status" class="text-sm mt-1"></div>
      </div>

      <!-- Thumbnail -->
      <div class="form-group mb-0">
        <label class="form-label">Thumbnail do episódio</label>
        <div class="flex gap-1 align-center">
          <div id="ep-thumb-preview" style="width:60px;height:60px;border-radius:6px;background:var(--bg-elevated);overflow:hidden;flex-shrink:0">
            ${ep?.thumbnail_url ? `<img src="${escPod(ep.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover">` : ''}
          </div>
          <div>
            <label class="btn btn-sm btn-secondary" style="cursor:pointer">
              <i class="fa-solid fa-upload"></i> Escolher
              <input type="file" accept="image/*" style="display:none" onchange="podHandleThumbUpload(this)">
            </label>
            <button class="btn btn-sm btn-secondary ml-1" onclick="podGenerateThumb()">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar com IA
            </button>
          </div>
        </div>
        <input type="hidden" id="ep-thumb-url" value="${escPod(ep?.thumbnail_url || '')}">
      </div>

      <div class="grid-2">
        <div class="form-group mb-0">
          <label class="form-label">Estado</label>
          <select id="ep-status" class="form-control">
            <option value="rascunho" ${(ep?.status||'rascunho')==='rascunho'?'selected':''}>Rascunho</option>
            <option value="agendado" ${ep?.status==='agendado'?'selected':''}>Agendado</option>
            <option value="publicado" ${ep?.status==='publicado'?'selected':''}>Publicado</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Agendar para</label>
          <input id="ep-agendado" class="form-control" type="datetime-local" value="${agendado}">
        </div>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Plataformas</label>
        <div class="flex gap-1 flex-wrap" id="ep-plats">
          ${PODCAST_PLATAFORMAS.map(pl => `
            <label style="cursor:pointer">
              <input type="checkbox" style="display:none" value="${pl}"
                ${(ep?.plataformas||[]).includes(pl) ? 'checked' : ''}>
              <span class="platform-toggle${(ep?.plataformas||[]).includes(pl) ? ' active' : ''}"
                    onclick="this.previousElementSibling.click();this.classList.toggle('active')">
                ${_podPlatIcon(pl)} ${escPod(PODCAST_PLATAFORMA_LABELS[pl] || pl)}
              </span>
            </label>`).join('')}
        </div>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Notas internas</label>
        <textarea id="ep-notas" class="form-control" rows="2" placeholder="Notas para edição, convidados, links…">${escPod(ep?.notas || '')}</textarea>
      </div>
    </div>`;

  app.openModal(
    epId ? 'Editar Episódio' : 'Novo Episódio',
    body,
    `<button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
     <button class="btn btn-primary" onclick="podSaveEpisodio(${epId ? `'${epId}'` : 'null'},'${podcastId}')">
       <i class="fa-solid fa-floppy-disk"></i> Guardar
     </button>`
  );
}

/* ── Áudio: upload local ── */
function podHandleAudioUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  _podState.audioFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    _podState.audioDataUrl = e.target.result;
    const preview = document.getElementById('ep-audio-preview');
    if (preview) preview.innerHTML = `
      <audio controls style="width:100%;height:36px;margin-top:8px"><source src="${e.target.result}"></audio>
      <div class="text-muted" style="font-size:0.8rem;margin-top:4px">${escPod(file.name)} (${(file.size/1024/1024).toFixed(1)} MB)</div>`;
  };
  reader.readAsDataURL(file);
}

function podClearAudio() {
  _podState.audioFile    = null;
  _podState.audioDataUrl = null;
}

/* ── Thumbnail: upload local ── */
function podHandleThumbUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('ep-thumb-preview');
    if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover">`;
    const hidden = document.getElementById('ep-thumb-url');
    if (hidden) hidden.value = e.target.result; // será upload no save
  };
  reader.readAsDataURL(file);
}

/* ── Thumbnail: gerar com IA ── */
async function podGenerateThumb() {
  const titulo = document.getElementById('ep-titulo')?.value.trim() || 'podcast episode';
  app.toast('A gerar thumbnail com IA…', 'info');
  try {
    const url = await AI.generateImage(`Podcast episode thumbnail for: "${titulo}". Clean, modern, eye-catching.`, { aspectRatio: '16:9' });
    const preview = document.getElementById('ep-thumb-preview');
    if (preview) preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover">`;
    const hidden = document.getElementById('ep-thumb-url');
    if (hidden) hidden.value = url;
    app.toast('Thumbnail gerada!', 'success');
  } catch (e) {
    app.toast('Erro ao gerar thumbnail: ' + e.message, 'error');
  }
}

/* ── Vídeo: upload directo ── */
async function podHandleVideoUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  const statusEl = document.getElementById('ep-video-upload-status');
  if (statusEl) statusEl.innerHTML = '<div class="spinner" style="width:14px;height:14px;display:inline-block"></div> A fazer upload…';

  if (!DB.ready()) {
    // guardar como dataUrl temporariamente
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('ep-video-url-hidden').value = e.target.result;
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--green)"><i class="fa-solid fa-circle-check"></i> Vídeo pronto (local)</span>';
    };
    reader.readAsDataURL(file);
    return;
  }

  try {
    const path = `ep-${Date.now()}.${file.name.split('.').pop() || 'mp4'}`;
    const { error } = await DB.client().storage.from('post-videos').upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw new Error(app.fmtErr(error));
    const { data: urlData } = DB.client().storage.from('post-videos').getPublicUrl(path);
    document.getElementById('ep-video-url-hidden').value = urlData?.publicUrl || '';
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--green)"><i class="fa-solid fa-circle-check"></i> Vídeo carregado!</span>';
  } catch (e) {
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--red)">Erro: ${escPod(e.message)}</span>`;
  }
}

/* ── Guardar episódio ── */
async function podSaveEpisodio(epId, podcastId) {
  const titulo = document.getElementById('ep-titulo')?.value.trim();
  if (!titulo) { app.toast('O título é obrigatório', 'warning'); return; }

  const btn = document.querySelector('#modalFooter .btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;display:inline-block"></div> A guardar…'; }

  const id = epId || crypto.randomUUID();

  // Upload áudio se houver ficheiro novo
  let audio_url = _podState.episodios.find(e => e.id === epId)?.audio_url || null;
  if (_podState.audioFile && DB.ready()) {
    const { url, error } = await DB.uploadPodcastAudio(_podState.audioFile, id);
    if (error) {
      app.toast('Erro no upload do áudio: ' + app.fmtErr(error), 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar'; }
      return;
    }
    audio_url = url;
  }

  // Thumbnail — pode ser dataUrl ou URL remota
  let thumbnail_url = document.getElementById('ep-thumb-url')?.value || null;
  if (thumbnail_url?.startsWith('data:') && DB.ready()) {
    const { url, error } = await DB.uploadPostImage(thumbnail_url, `ep-thumb-${id}`);
    if (!error) thumbnail_url = url;
  }

  const plats = [...document.querySelectorAll('#ep-plats input:checked')].map(el => el.value);
  const video_url = document.getElementById('ep-video-url-hidden')?.value || null;

  const payload = {
    id,
    podcast_id:   podcastId,
    titulo,
    descricao:    document.getElementById('ep-descricao')?.value.trim() || null,
    numero:       parseInt(document.getElementById('ep-numero')?.value) || null,
    temporada:    parseInt(document.getElementById('ep-temporada')?.value) || 1,
    status:       document.getElementById('ep-status')?.value || 'rascunho',
    agendado_para: document.getElementById('ep-agendado')?.value || null,
    plataformas:  plats,
    notas:        document.getElementById('ep-notas')?.value.trim() || null,
    audio_url,
    video_url:    video_url || null,
    thumbnail_url,
  };

  if (!DB.ready()) {
    const idx = _podState.episodios.findIndex(e => e.id === id);
    if (idx >= 0) _podState.episodios[idx] = { ..._podState.episodios[idx], ...payload };
    else _podState.episodios.unshift(payload);
    app.closeModal();
    app.toast('Episódio guardado localmente', 'success');
    const col = document.getElementById('pod-episodes-col');
    if (col) col.innerHTML = _renderEpisodesPanel();
    return;
  }

  const { data, error } = await DB.upsertEpisodio(payload);
  if (error) {
    app.toast('Erro ao guardar: ' + app.fmtErr(error), 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar'; }
    return;
  }

  const idx = _podState.episodios.findIndex(e => e.id === data.id);
  if (idx >= 0) _podState.episodios[idx] = data;
  else _podState.episodios.unshift(data);

  app.closeModal();
  app.toast('Episódio guardado!', 'success');
  const col = document.getElementById('pod-episodes-col');
  if (col) col.innerHTML = _renderEpisodesPanel();
}

async function podDeleteEpisodio(id) {
  if (!confirm('Eliminar episódio?')) return;
  if (DB.ready()) {
    const { error } = await DB.deleteEpisodio(id);
    if (error) { app.toast('Erro: ' + app.fmtErr(error), 'error'); return; }
  }
  _podState.episodios = _podState.episodios.filter(e => e.id !== id);
  app.toast('Episódio eliminado', 'success');
  const col = document.getElementById('pod-episodes-col');
  if (col) col.innerHTML = _renderEpisodesPanel();
}

/* ══════════════════════════════════════════════════════════════
   GERAR VÍDEO A PARTIR DO ÁUDIO
══════════════════════════════════════════════════════════════ */
function openGenerateVideoModal(epId) {
  const ep = _podState.episodios.find(e => e.id === epId);
  if (!ep) return;

  const hasFalAi = !!Config.get('FAL_AI');

  const body = `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card" style="background:var(--bg-elevated);padding:14px">
        <div style="font-weight:600;margin-bottom:4px">${escPod(ep.titulo)}</div>
        ${ep.audio_url ? `<audio controls style="width:100%;height:36px"><source src="${escPod(ep.audio_url)}"></audio>` : ''}
      </div>

      <p class="text-muted" style="font-size:0.9rem;line-height:1.6">
        Será gerada uma imagem de capa com IA e depois um vídeo curto de fundo.
        Podes usar o resultado no YouTube, Instagram e outras plataformas.
      </p>

      <div class="form-group mb-0">
        <label class="form-label">Prompt para a imagem / vídeo</label>
        <textarea id="gen-vid-prompt" class="form-control" rows="3"
          placeholder="Descreve o visual que queres…">${escPod(ep.descricao || ep.titulo)}</textarea>
      </div>

      <div class="form-group mb-0">
        <label class="form-label">Tipo de geração</label>
        <select id="gen-vid-type" class="form-control">
          <option value="image">Só imagem de capa (Pollinations.ai — grátis)</option>
          ${hasFalAi ? '<option value="video">Imagem + vídeo loop com IA (fal.ai)</option>' : ''}
        </select>
        ${!hasFalAi ? '<div class="form-hint">Para gerar vídeo, configura a chave fal.ai em Configurações.</div>' : ''}
      </div>

      <div id="gen-vid-status" style="display:none" class="card" style="background:var(--bg-elevated);padding:12px;text-align:center">
        <div class="spinner" style="width:20px;height:20px;margin:0 auto 8px"></div>
        <div id="gen-vid-status-text">A gerar…</div>
      </div>

      <div id="gen-vid-result" style="display:none">
        <label class="form-label">Resultado</label>
        <div id="gen-vid-preview"></div>
      </div>
    </div>`;

  app.openModal(
    'Gerar Vídeo a partir do Áudio',
    body,
    `<button class="btn btn-ghost" onclick="app.closeModal()">Fechar</button>
     <button class="btn btn-primary" onclick="podRunGenerateVideo('${epId}')">
       <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar
     </button>
     <button class="btn btn-secondary" id="gen-vid-save-btn" style="display:none" onclick="podSaveGeneratedVideo('${epId}')">
       <i class="fa-solid fa-floppy-disk"></i> Usar este vídeo
     </button>`
  );
}

let _genVidResult = null; // { imageUrl, videoUrl }

async function podRunGenerateVideo(epId) {
  const ep     = _podState.episodios.find(e => e.id === epId);
  const prompt = document.getElementById('gen-vid-prompt')?.value.trim()
    || ep?.titulo || 'podcast episode visual';
  const type   = document.getElementById('gen-vid-type')?.value || 'image';

  const statusBox  = document.getElementById('gen-vid-status');
  const statusText = document.getElementById('gen-vid-status-text');
  const resultBox  = document.getElementById('gen-vid-result');
  const preview    = document.getElementById('gen-vid-preview');
  const genBtn     = document.querySelector('#modalFooter .btn-primary');
  const saveBtn    = document.getElementById('gen-vid-save-btn');

  statusBox.style.display = 'block';
  resultBox.style.display = 'none';
  if (saveBtn) saveBtn.style.display = 'none';
  if (genBtn) genBtn.disabled = true;
  _genVidResult = null;

  try {
    // 1. Gerar imagem
    statusText.textContent = 'A gerar imagem de capa…';
    const imageUrl = await AI.generateImage(
      `Podcast cover art, cinematic, for episode: "${prompt}". Dark moody background, microphone, sound waves.`,
      { aspectRatio: '16:9' }
    );
    _genVidResult = { imageUrl, videoUrl: null };

    if (type === 'image') {
      preview.innerHTML = `
        <img src="${imageUrl}" style="width:100%;border-radius:8px;margin-bottom:8px">
        <div class="text-muted" style="font-size:0.8rem">Imagem gerada. Clica em "Usar este vídeo" para associar ao episódio.</div>`;
      resultBox.style.display = 'block';
      if (saveBtn) saveBtn.style.display = '';
      statusBox.style.display = 'none';
      app.toast('Imagem gerada!', 'success');
    } else {
      // 2. Gerar vídeo com fal.ai
      statusText.textContent = 'A gerar vídeo com IA (pode demorar 1-2 min)…';
      let lastProg = 0;
      const result = await AI.generateVideo(
        `Atmospheric podcast background for: "${prompt}". Slow motion, sound waves, microphone, studio atmosphere.`,
        {
          aspectRatio: '16:9',
          onProgress: (step, total) => {
            const pct = Math.round((step / total) * 100);
            if (pct > lastProg) {
              lastProg = pct;
              statusText.textContent = `A gerar vídeo… ${pct}%`;
            }
          },
        }
      );
      _genVidResult.videoUrl = result.url;

      preview.innerHTML = `
        <video controls style="width:100%;border-radius:8px;margin-bottom:8px">
          <source src="${result.url}">
        </video>
        <div class="text-muted" style="font-size:0.8rem">Vídeo gerado. Clica em "Usar este vídeo" para associar ao episódio.</div>`;
      resultBox.style.display = 'block';
      if (saveBtn) saveBtn.style.display = '';
      statusBox.style.display = 'none';
      app.toast('Vídeo gerado com sucesso!', 'success');
    }
  } catch (e) {
    statusBox.style.display = 'none';
    app.toast('Erro ao gerar: ' + e.message, 'error');
  } finally {
    if (genBtn) genBtn.disabled = false;
  }
}

async function podSaveGeneratedVideo(epId) {
  if (!_genVidResult) return;
  const ep = _podState.episodios.find(e => e.id === epId);
  if (!ep) return;

  const saveBtn = document.getElementById('gen-vid-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;display:inline-block"></div> A guardar…'; }

  const videoUrl   = _genVidResult.videoUrl || _genVidResult.imageUrl;
  const thumbUrl   = _genVidResult.imageUrl;
  const isExternal = true;

  const updates = { id: epId, video_url: videoUrl, thumbnail_url: thumbUrl };

  if (DB.ready()) {
    const { data, error } = await DB.upsertEpisodio({ ...ep, ...updates });
    if (error) {
      app.toast('Erro ao guardar: ' + app.fmtErr(error), 'error');
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Usar este vídeo'; }
      return;
    }
    const idx = _podState.episodios.findIndex(e => e.id === epId);
    if (idx >= 0) _podState.episodios[idx] = data;
  } else {
    const idx = _podState.episodios.findIndex(e => e.id === epId);
    if (idx >= 0) _podState.episodios[idx] = { ..._podState.episodios[idx], ...updates };
  }

  app.closeModal();
  app.toast('Vídeo associado ao episódio!', 'success');
  const col = document.getElementById('pod-episodes-col');
  if (col) col.innerHTML = _renderEpisodesPanel();
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function escPod(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function _fmtDuration(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}h ${String(m).padStart(2, '0')}m`
    : `${m}m ${String(s).padStart(2, '0')}s`;
}

function _podPlatIcon(pl) {
  const icons = {
    spotify:      '<i class="fa-brands fa-spotify" style="color:#1db954"></i>',
    youtube:      '<i class="fa-brands fa-youtube" style="color:#ff0000"></i>',
    apple:        '<i class="fa-brands fa-apple" style="color:#555"></i>',
    amazon:       '<i class="fa-brands fa-amazon" style="color:#ff9900"></i>',
    google:       '<i class="fa-brands fa-google" style="color:#4285f4"></i>',
    deezer:       '<i class="fa-solid fa-music" style="color:#a238ff"></i>',
    pocket_casts: '<i class="fa-solid fa-podcast" style="color:#f43e37"></i>',
    overcast:     '<i class="fa-solid fa-headphones" style="color:#fc7e0f"></i>',
  };
  return icons[pl] || '<i class="fa-solid fa-broadcast-tower"></i>';
}
