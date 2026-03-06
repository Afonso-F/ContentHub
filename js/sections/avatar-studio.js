/* ============================================================
   sections/avatar-studio.js — Avatar Studio (AI YouTube Factory)
   Manage AI hosts with voice, animation and personality config
   ============================================================ */

const STUDIO_GENDERS = ['Male', 'Female', 'Non-binary', 'Undefined'];

const STUDIO_VOICES = [
  { id: 'alloy',   label: 'Alloy (OpenAI)',    gender: 'Neutral',  preview: 'Neutral, balanced tone' },
  { id: 'echo',    label: 'Echo (OpenAI)',     gender: 'Male',     preview: 'Warm, conversational' },
  { id: 'fable',   label: 'Fable (OpenAI)',    gender: 'Male',     preview: 'British, expressive' },
  { id: 'onyx',    label: 'Onyx (OpenAI)',     gender: 'Male',     preview: 'Deep, authoritative' },
  { id: 'nova',    label: 'Nova (OpenAI)',     gender: 'Female',   preview: 'Energetic, friendly' },
  { id: 'shimmer', label: 'Shimmer (OpenAI)',  gender: 'Female',   preview: 'Soft, expressive' },
  { id: 'eleven_multilingual_v2', label: 'ElevenLabs Multilingual v2', gender: 'Custom', preview: 'Best multilingual quality' },
  { id: 'eleven_turbo_v2',        label: 'ElevenLabs Turbo v2',        gender: 'Custom', preview: 'Low-latency, English' },
  { id: 'custom', label: 'Custom Voice ID', gender: 'Custom', preview: 'Enter your own voice ID' },
];

const ANIMATION_MODELS = [
  { id: 'sadtalker',      label: 'SadTalker',        desc: 'Realistic head movement, fast' },
  { id: 'wav2lip',        label: 'Wav2Lip',           desc: 'Precise lip-sync, any face' },
  { id: 'dreamtalk',      label: 'DreamTalk',         desc: 'Expressive emotional animation' },
  { id: 'musetalk',       label: 'MuseTalk',          desc: 'Real-time streaming capable' },
  { id: 'heygen',         label: 'HeyGen Avatar',     desc: 'Professional studio quality' },
  { id: 'd-id',           label: 'D-ID Studio',       desc: 'Enterprise-grade avatars' },
  { id: 'synthesia',      label: 'Synthesia',         desc: 'Corporate presenters' },
  { id: 'none',           label: 'Voice-Only (No Animation)', desc: 'Audio only, no video face' },
];

const PERSONALITIES = [
  { id: 'educator',    label: 'The Educator',    icon: '🎓', desc: 'Explains complex topics clearly and patiently' },
  { id: 'entertainer', label: 'The Entertainer', icon: '🎭', desc: 'Energetic, funny, keeps viewers hooked' },
  { id: 'authority',   label: 'The Authority',   icon: '💼', desc: 'Expert tone, builds trust and credibility' },
  { id: 'storyteller', label: 'The Storyteller', icon: '📖', desc: 'Narrative-driven, emotionally engaging' },
  { id: 'motivator',   label: 'The Motivator',   icon: '🔥', desc: 'Inspiring, energetic, calls to action' },
  { id: 'analyst',     label: 'The Analyst',     icon: '📊', desc: 'Data-driven, objective, precise' },
  { id: 'friend',      label: 'The Friend',      icon: '👋', desc: 'Casual, relatable, conversational' },
  { id: 'interviewer', label: 'The Interviewer', icon: '🎙️', desc: 'Curious, probing, great for podcasts' },
];

const STUDIO_AVATARS_KEY = 'yt_studio_avatars';

function _loadStudioAvatars() {
  try {
    const raw = localStorage.getItem(STUDIO_AVATARS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _saveStudioAvatars(list) {
  localStorage.setItem(STUDIO_AVATARS_KEY, JSON.stringify(list));
}

function _studioGenId() {
  return 'av_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderAvatarStudio(container) {
  // Merge DB avatars with studio avatars
  let dbAvatars = [];
  if (typeof DB !== 'undefined' && DB.ready()) {
    const { data } = await DB.getAvatares();
    dbAvatars = (data || []).map(a => ({ ...a, _source: 'db' }));
  }

  const studioAvatars = _loadStudioAvatars();
  const allAvatars = [...dbAvatars, ...studioAvatars];

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Avatar Studio</div>
        <div class="section-subtitle">Create and manage AI hosts for your channels and podcasts</div>
      </div>
      <button class="btn btn-primary" onclick="openStudioAvatarModal(null)">
        <i class="fa-solid fa-plus"></i> New Avatar
      </button>
    </div>

    ${allAvatars.length === 0 ? `
    <div class="empty-state" style="padding:80px 20px">
      <i class="fa-solid fa-person-rays" style="font-size:3rem;color:var(--border);margin-bottom:16px"></i>
      <p style="font-size:1.2rem;font-weight:700;margin-bottom:8px">No avatars yet</p>
      <p class="text-muted" style="margin-bottom:24px">Create AI hosts to anchor your channels, narrate videos and host podcasts</p>
      <button class="btn btn-primary" onclick="openStudioAvatarModal(null)">
        <i class="fa-solid fa-plus"></i> Create First Avatar
      </button>
    </div>` : `

    <!-- Stats row -->
    <div class="grid-4 mb-3">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-masks-theater" style="color:var(--accent)"></i></div>
        <div class="stat-value">${allAvatars.length}</div>
        <div class="stat-label">Total Avatars</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--green-soft)"><i class="fa-solid fa-microphone" style="color:var(--green)"></i></div>
        <div class="stat-value">${allAvatars.filter(a => a.voice_id).length}</div>
        <div class="stat-label">With Voice</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--pink-soft)"><i class="fa-solid fa-film" style="color:var(--pink)"></i></div>
        <div class="stat-value">${allAvatars.filter(a => a.animation_model && a.animation_model !== 'none').length}</div>
        <div class="stat-label">Animated</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--yellow-soft)"><i class="fa-solid fa-star" style="color:var(--yellow)"></i></div>
        <div class="stat-value">${allAvatars.filter(a => a.personality).length}</div>
        <div class="stat-label">With Personality</div>
      </div>
    </div>

    <!-- Avatar grid -->
    <div class="grid-auto" id="studio-avatar-grid">
      ${allAvatars.map(a => _renderStudioCard(a)).join('')}
    </div>`}
  `;
}

function _renderStudioCard(a) {
  const voice  = STUDIO_VOICES.find(v => v.id === a.voice_id);
  const anim   = ANIMATION_MODELS.find(m => m.id === a.animation_model);
  const pers   = PERSONALITIES.find(p => p.id === a.personality);
  const imgSrc = a.image || a.imagem_url || (a.imagens_referencia || [])[0] || null;
  const isDb   = a._source === 'db';

  const genderColor = { Male: 'var(--blue)', Female: 'var(--pink)', 'Non-binary': 'var(--purple)', Undefined: 'var(--text-muted)' };

  return `
    <div class="card card-hover" style="position:relative;overflow:hidden">
      <!-- Header with avatar image -->
      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px">
        <div style="width:56px;height:56px;border-radius:var(--radius-sm);overflow:hidden;flex-shrink:0;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;border:2px solid var(--border)">
          ${imgSrc
            ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`
            : `<i class="fa-solid fa-masks-theater" style="font-size:1.5rem;color:var(--accent)"></i>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.95rem;margin-bottom:2px">${escSt(a.nome || a.name || 'Unnamed')}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${a.gender ? `<span class="badge" style="background:${genderColor[a.gender]||'var(--border)'}22;color:${genderColor[a.gender]||'var(--text-muted)'};font-size:.65rem">${a.gender}</span>` : ''}
            ${isDb ? `<span class="badge badge-muted" style="font-size:.65rem">DB</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Specs -->
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:6px;font-size:.78rem">
          <i class="fa-solid fa-microphone" style="color:var(--green);width:14px;text-align:center"></i>
          <span style="color:var(--text-muted)">Voice:</span>
          <span style="font-weight:600">${voice ? voice.label : (a.voice_id || '—')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:.78rem">
          <i class="fa-solid fa-film" style="color:var(--pink);width:14px;text-align:center"></i>
          <span style="color:var(--text-muted)">Animation:</span>
          <span style="font-weight:600">${anim ? anim.label : (a.animation_model || '—')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:.78rem">
          <i class="fa-solid fa-star" style="color:var(--yellow);width:14px;text-align:center"></i>
          <span style="color:var(--text-muted)">Personality:</span>
          <span style="font-weight:600">${pers ? `${pers.icon} ${pers.label}` : (a.personality || '—')}</span>
        </div>
      </div>

      <!-- Personality description -->
      ${pers ? `
        <div style="padding:6px 10px;background:var(--yellow)11;border-left:2px solid var(--yellow);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-size:.75rem;color:var(--text-secondary);margin-bottom:12px">
          ${pers.desc}
        </div>` : ''}

      <!-- Actions -->
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm btn-secondary flex-1" onclick="openStudioAvatarModal('${a.id}','${isDb ? 'db' : 'local'}')">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="btn btn-sm btn-primary" onclick="studioSelectHost('${a.id}','${escSt(a.nome || a.name || '')}')">
          <i class="fa-solid fa-check"></i> Use as Host
        </button>
        ${!isDb ? `
        <button class="btn btn-sm btn-secondary" onclick="deleteStudioAvatar('${a.id}')" style="color:var(--red)">
          <i class="fa-solid fa-trash"></i>
        </button>` : ''}
      </div>
    </div>`;
}

function escSt(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — Create / Edit Studio Avatar
══════════════════════════════════════════════════════════════ */
function openStudioAvatarModal(id, source) {
  let av = null;
  if (id) {
    if (source === 'db') {
      av = (app.getAvatares ? app.getAvatares() : []).find(a => String(a.id) === String(id));
    } else {
      av = _loadStudioAvatars().find(a => a.id === id);
    }
  }

  const isEdit = !!av;

  const body = `
    <div style="display:flex;flex-direction:column;gap:14px;max-height:60vh;overflow-y:auto;padding-right:4px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Name *</label>
          <input id="st-name" class="form-control" placeholder="e.g. Alex the Educator" value="${escSt(av?.nome || av?.name || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Gender</label>
          <select id="st-gender" class="form-control">
            <option value="">Select…</option>
            ${STUDIO_GENDERS.map(g => `<option value="${g}"${av?.gender === g ? ' selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Avatar Image URL</label>
        <input id="st-image" class="form-control" type="url" placeholder="https://…/avatar.jpg" value="${escSt(av?.image || av?.imagem_url || '')}">
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">Use a portrait photo or AI-generated face</div>
      </div>

      <div class="form-group">
        <label class="form-label">Voice</label>
        <select id="st-voice" class="form-control" onchange="studioVoiceChange()">
          <option value="">No voice selected</option>
          ${STUDIO_VOICES.map(v => `<option value="${v.id}"${av?.voice_id === v.id ? ' selected' : ''}>${v.label} — ${v.preview}</option>`).join('')}
        </select>
      </div>
      <div id="st-voice-custom-row" style="display:${av?.voice_id === 'custom' ? 'block' : 'none'}">
        <div class="form-group">
          <label class="form-label">Custom Voice ID</label>
          <input id="st-voice-custom" class="form-control" placeholder="ElevenLabs or other voice ID" value="${escSt(av?.custom_voice_id || '')}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Animation Model</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${ANIMATION_MODELS.map(m => `
            <label style="display:flex;align-items:flex-start;gap:6px;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.78rem;${av?.animation_model === m.id ? 'border-color:var(--accent);background:var(--accent-soft)' : ''}">
              <input type="radio" name="st-anim" value="${m.id}" ${av?.animation_model === m.id ? 'checked' : ''} style="margin-top:2px;accent-color:var(--accent)">
              <div><div style="font-weight:600">${escSt(m.label)}</div><div style="color:var(--text-muted);font-size:.72rem">${escSt(m.desc)}</div></div>
            </label>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Personality Archetype</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${PERSONALITIES.map(p => `
            <label style="display:flex;align-items:flex-start;gap:6px;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.78rem;${av?.personality === p.id ? 'border-color:var(--yellow);background:var(--yellow-soft)' : ''}">
              <input type="radio" name="st-pers" value="${p.id}" ${av?.personality === p.id ? 'checked' : ''} style="margin-top:2px;accent-color:var(--yellow)">
              <div><div style="font-weight:600">${p.icon} ${escSt(p.label)}</div><div style="color:var(--text-muted);font-size:.72rem">${escSt(p.desc)}</div></div>
            </label>`).join('')}
        </div>
      </div>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveStudioAvatar('${id || ''}','${source || 'local'}')">
      <i class="fa-solid fa-${isEdit ? 'floppy-disk' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Create Avatar'}
    </button>`;

  app.openModal(isEdit ? `Edit Avatar` : 'New Avatar', body, footer);
}

function studioVoiceChange() {
  const val = document.getElementById('st-voice')?.value;
  const row = document.getElementById('st-voice-custom-row');
  if (row) row.style.display = val === 'custom' ? 'block' : 'none';
}

function saveStudioAvatar(id, source) {
  const name     = document.getElementById('st-name')?.value?.trim();
  const gender   = document.getElementById('st-gender')?.value;
  const image    = document.getElementById('st-image')?.value?.trim();
  const voiceId  = document.getElementById('st-voice')?.value;
  const customV  = document.getElementById('st-voice-custom')?.value?.trim();
  const animId   = document.querySelector('input[name="st-anim"]:checked')?.value || 'none';
  const persId   = document.querySelector('input[name="st-pers"]:checked')?.value || '';

  if (!name) { app.toast('Name is required', 'error'); return; }

  const avatarData = { name, gender, image, voice_id: voiceId, custom_voice_id: voiceId === 'custom' ? customV : '', animation_model: animId, personality: persId, updated_at: new Date().toISOString() };

  if (source === 'db') {
    // DB avatars: we store extra metadata in localStorage
    const extras = JSON.parse(localStorage.getItem('db_avatar_extras') || '{}');
    extras[id] = avatarData;
    localStorage.setItem('db_avatar_extras', JSON.stringify(extras));
    app.toast('Avatar studio config saved!', 'success');
  } else {
    const list = _loadStudioAvatars();
    if (id) {
      const idx = list.findIndex(a => a.id === id);
      if (idx >= 0) list[idx] = { ...list[idx], ...avatarData };
      else list.push({ id, ...avatarData, created_at: new Date().toISOString() });
    } else {
      list.push({ id: _studioGenId(), ...avatarData, created_at: new Date().toISOString() });
    }
    _saveStudioAvatars(list);
    app.toast(id ? 'Avatar updated!' : 'Avatar created!', 'success');
  }

  app.closeModal();
  const content = document.getElementById('content');
  if (content) renderAvatarStudio(content);
}

function deleteStudioAvatar(id) {
  const list = _loadStudioAvatars().filter(a => a.id !== id);
  _saveStudioAvatars(list);
  app.toast('Avatar deleted', 'info');
  const content = document.getElementById('content');
  if (content) renderAvatarStudio(content);
}

function studioSelectHost(id, name) {
  // Store as the active host for pipeline and scheduler
  sessionStorage.setItem('selected_host_id', id);
  sessionStorage.setItem('selected_host_name', name);
  app.toast(`${name} set as active host`, 'success');

  // Update visual selection
  document.querySelectorAll('#studio-avatar-grid .card').forEach(c => c.style.borderColor = '');
}

// Expose globally for other modules
window._loadStudioAvatars = _loadStudioAvatars;
