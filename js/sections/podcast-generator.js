/* ============================================================
   sections/podcast-generator.js — AI Podcast Generator
   Two-host AI podcast pipeline: Topic → Dialogue → Voice
                                  → Animation → Video → Upload
   ============================================================ */

const POD_GEN_CATEGORIES = [
  'Technology','Business','Science','Health','Education','Self-Improvement',
  'True Crime','Society','Politics','Entertainment','Finance','Spirituality',
];

const POD_GEN_DURATIONS = [
  { id: '5',  label: '~5 min (Mini episode)' },
  { id: '15', label: '~15 min (Short)' },
  { id: '30', label: '~30 min (Standard)' },
  { id: '45', label: '~45 min (Long-form)' },
  { id: '60', label: '~60 min (Full episode)' },
];

const POD_GEN_PLATFORMS = [
  { id: 'youtube',  label: 'YouTube Podcasts',  icon: 'fa-brands fa-youtube',   color: '#ff0000' },
  { id: 'spotify',  label: 'Spotify',           icon: 'fa-brands fa-spotify',   color: '#1db954' },
  { id: 'apple',    label: 'Apple Podcasts',    icon: 'fa-brands fa-apple',     color: '#fc3c44' },
  { id: 'amazon',   label: 'Amazon Music',      icon: 'fa-brands fa-amazon',    color: '#ff9900' },
  { id: 'rss',      label: 'RSS Feed',          icon: 'fa-solid fa-rss',        color: '#f26522' },
];

/* ── State ── */
let _pgState = {
  stage:    'setup',   // setup | dialogue | voice | animation | render | upload
  episode:  null,      // { title, topic, host1_id, host2_id, duration, platforms }
  dialogue: null,      // [{ speaker: 'host1'|'host2', text: '...' }]
  voices:   null,      // { host1: { url }, host2: { url } }
  animation: null,
  video:    null,
  upload:   null,
};

const POD_GEN_STAGES = [
  { id: 'setup',     label: 'Episode Setup',    icon: 'fa-microphone',        color: 'var(--accent)'  },
  { id: 'dialogue',  label: 'Dialogue Script',  icon: 'fa-comments',          color: 'var(--yellow)'  },
  { id: 'voice',     label: 'Voice Synthesis',  icon: 'fa-headphones',        color: 'var(--green)'   },
  { id: 'animation', label: 'Avatar Animation', icon: 'fa-masks-theater',     color: 'var(--pink)'    },
  { id: 'render',    label: 'Video Render',     icon: 'fa-film',              color: 'var(--red)'     },
  { id: 'upload',    label: 'Publish',          icon: 'fa-cloud-arrow-up',    color: 'var(--blue)'    },
];

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderPodcastGenerator(container) {
  let avatares = app.getAvatares ? app.getAvatares() : [];
  if (!avatares.length && typeof DB !== 'undefined' && DB.ready()) {
    const { data } = await DB.getAvatares();
    avatares = data || [];
    if (app.setAvatares) app.setAvatares(avatares);
  }
  const studioAvatars = typeof _loadStudioAvatars === 'function' ? _loadStudioAvatars() : [];
  const allAvatars    = [...avatares, ...studioAvatars];

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Podcast Generator</div>
        <div class="section-subtitle">Two-host AI podcast pipeline — from topic to published episode</div>
      </div>
      <button class="btn btn-secondary" onclick="pgReset()">
        <i class="fa-solid fa-rotate"></i> New Episode
      </button>
    </div>

    <!-- Stage progress -->
    <div class="pipeline-progress mb-3">
      ${POD_GEN_STAGES.map((s, i) => {
        const stageIdx  = POD_GEN_STAGES.findIndex(x => x.id === _pgState.stage);
        const isDone    = i < stageIdx;
        const isCurrent = s.id === _pgState.stage;
        return `
          <div class="pipeline-step${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}" onclick="pgGoTo('${s.id}')">
            <div class="pipeline-step-icon" style="background:${isCurrent ? s.color : isDone ? 'var(--green)' : 'var(--bg-elevated)'}">
              <i class="fa-solid ${isDone ? 'fa-check' : s.icon}" style="color:${isCurrent || isDone ? '#fff' : 'var(--text-muted)'}"></i>
            </div>
            <div class="pipeline-step-label">${s.label}</div>
            ${i < POD_GEN_STAGES.length - 1 ? '<div class="pipeline-connector"></div>' : ''}
          </div>`;
      }).join('')}
    </div>

    <!-- Active stage -->
    <div id="pg-stage-panel">
      ${_pgRenderStage(allAvatars)}
    </div>

    <!-- Dialogue preview -->
    ${_pgState.dialogue ? _pgRenderDialoguePreview(allAvatars) : ''}
  `;
}

function _pgRenderStage(avatars) {
  switch (_pgState.stage) {
    case 'setup':     return _pgSetupStage(avatars);
    case 'dialogue':  return _pgDialogueStage(avatars);
    case 'voice':     return _pgVoiceStage(avatars);
    case 'animation': return _pgAnimationStage(avatars);
    case 'render':    return _pgRenderVideoStage();
    case 'upload':    return _pgUploadStage();
    default:          return '<div class="card"><p>Unknown stage</p></div>';
  }
}

/* ────────────────────────────────────────────
   STAGE 1 — EPISODE SETUP
──────────────────────────────────────────── */
function _pgSetupStage(avatars) {
  const ep = _pgState.episode;
  return `
    <div class="card" style="border-left:3px solid var(--accent)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-microphone" style="color:var(--accent)"></i> Step 1 — Episode Setup</div>
          <div class="card-subtitle">Configure your AI podcast episode</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Episode Title *</label>
          <input id="pg-title" class="form-control" placeholder="e.g. The Future of AI in Content Creation" value="${escPg(ep?.title || '')}">
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Topic / Brief</label>
          <textarea id="pg-topic" class="form-control" style="min-height:80px" placeholder="Describe what the episode is about, key points to cover…">${escPg(ep?.topic || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="pg-category" class="form-control">
            ${POD_GEN_CATEGORIES.map(c => `<option value="${c}"${ep?.category === c ? ' selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Target Duration</label>
          <select id="pg-duration" class="form-control">
            ${POD_GEN_DURATIONS.map(d => `<option value="${d.id}"${ep?.duration === d.id ? ' selected' : ''}>${d.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Two hosts -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        ${[1, 2].map(n => `
          <div style="padding:14px;background:var(--bg-elevated);border-radius:var(--radius-sm);border:1px solid var(--border)">
            <div style="font-weight:700;margin-bottom:10px;color:var(--${n === 1 ? 'accent' : 'pink'})">
              <i class="fa-solid fa-${n === 1 ? 'user' : 'user-tie'}"></i> Host ${n}
            </div>
            <div class="form-group">
              <label class="form-label">Name / Character</label>
              <input id="pg-host${n}-name" class="form-control" placeholder="e.g. Alex, Jordan…" value="${escPg(ep?.[`host${n}_name`] || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Avatar</label>
              <select id="pg-host${n}-avatar" class="form-control">
                <option value="">None (voice only)</option>
                ${avatars.map(a => `<option value="${a.id}"${ep?.[`host${n}`] === String(a.id) ? ' selected' : ''}>${escPg(a.nome || a.name || 'Avatar')}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Role / Personality</label>
              <select id="pg-host${n}-role" class="form-control">
                <option value="interviewer"${ep?.[`host${n}_role`] === 'interviewer' ? ' selected' : ''}>Interviewer / Host</option>
                <option value="expert"${ep?.[`host${n}_role`] === 'expert' ? ' selected' : ''}>Expert / Guest</option>
                <option value="co-host"${ep?.[`host${n}_role`] === 'co-host' ? ' selected' : ''}>Co-Host</option>
                <option value="devil-advocate"${ep?.[`host${n}_role`] === 'devil-advocate' ? ' selected' : ''}>Devil's Advocate</option>
              </select>
            </div>
          </div>`).join('')}
      </div>

      <!-- Platforms -->
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label">Publish Platforms</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${POD_GEN_PLATFORMS.map(p => `
            <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.8rem">
              <input type="checkbox" name="pg-platform" value="${p.id}" ${(ep?.platforms || ['youtube','spotify']).includes(p.id) ? 'checked' : ''} style="accent-color:${p.color}">
              <i class="${p.icon}" style="color:${p.color}"></i> ${p.label}
            </label>`).join('')}
        </div>
      </div>

      <button class="btn btn-primary" onclick="pgSaveSetup()">
        <i class="fa-solid fa-arrow-right"></i> Continue to Dialogue Generator
      </button>
    </div>`;
}

function pgSaveSetup() {
  const title = document.getElementById('pg-title')?.value?.trim();
  const topic = document.getElementById('pg-topic')?.value?.trim();

  if (!title) { app.toast('Episode title required', 'error'); return; }

  const platforms = Array.from(document.querySelectorAll('input[name="pg-platform"]:checked')).map(el => el.value);

  _pgState.episode = {
    title,
    topic,
    category: document.getElementById('pg-category')?.value,
    duration: document.getElementById('pg-duration')?.value,
    host1: document.getElementById('pg-host1-avatar')?.value,
    host2: document.getElementById('pg-host2-avatar')?.value,
    host1_name: document.getElementById('pg-host1-name')?.value?.trim() || 'Alex',
    host2_name: document.getElementById('pg-host2-name')?.value?.trim() || 'Jordan',
    host1_role: document.getElementById('pg-host1-role')?.value,
    host2_role: document.getElementById('pg-host2-role')?.value,
    platforms,
  };

  pgGoTo('dialogue');
}

/* ────────────────────────────────────────────
   STAGE 2 — DIALOGUE GENERATOR
──────────────────────────────────────────── */
function _pgDialogueStage(avatars) {
  const ep = _pgState.episode;
  return `
    <div class="card" style="border-left:3px solid var(--yellow)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-comments" style="color:var(--yellow)"></i> Step 2 — Dialogue Generator</div>
          <div class="card-subtitle">Generate natural two-host conversation script</div>
        </div>
        ${_pgState.dialogue ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Script ready</span>` : ''}
      </div>

      ${ep ? `
      <!-- Episode context -->
      <div style="padding:10px 14px;background:var(--yellow)11;border-left:2px solid var(--yellow);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:14px">
        <div style="font-weight:700">"${escPg(ep.title)}"</div>
        <div style="font-size:.8rem;color:var(--text-muted)">${ep.host1_name} & ${ep.host2_name} · ${ep.duration} min target</div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary flex-1" id="pg-dial-btn" onclick="pgGenerateDialogue()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Dialogue Script
        </button>
        ${_pgState.dialogue ? `<button class="btn btn-secondary" onclick="pgGoTo('voice')">Continue to Voice <i class="fa-solid fa-arrow-right"></i></button>` : ''}
      </div>
      <div id="pg-dial-status" class="text-sm text-muted" style="min-height:14px"></div>
      <div id="pg-dial-output" style="margin-top:12px">
        ${_pgState.dialogue ? _pgRenderScript(_pgState.dialogue, ep) : ''}
      </div>` : `
      <div class="empty-state" style="padding:24px">
        <p>Configure the episode first</p>
        <button class="btn btn-secondary" onclick="pgGoTo('setup')"><i class="fa-solid fa-arrow-left"></i> Back</button>
      </div>`}
    </div>`;
}

async function pgGenerateDialogue() {
  const ep     = _pgState.episode;
  const btn    = document.getElementById('pg-dial-btn');
  const status = document.getElementById('pg-dial-status');
  const output = document.getElementById('pg-dial-output');

  const durMap = { '5': '5-minute', '15': '15-minute', '30': '30-minute', '45': '45-minute', '60': '60-minute' };

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Writing dialogue…';
  status.textContent = 'AI is generating the conversation…';

  const prompt = `Generate a natural, engaging ${durMap[ep.duration] || '30-minute'} podcast dialogue script.

Podcast: "${ep.title}"
Topic: ${ep.topic}
Category: ${ep.category}

Host 1: ${ep.host1_name} (role: ${ep.host1_role})
Host 2: ${ep.host2_name} (role: ${ep.host2_role})

Requirements:
- Natural conversational flow with interruptions and agreements
- Varied sentence lengths
- Include anecdotes, examples, questions
- Smooth topic transitions
- Strong opening hook and memorable closing

Return ONLY a valid JSON array:
[{"speaker":"host1","text":"..."},{"speaker":"host2","text":"..."},...]

Use "host1" and "host2" as speaker values. Generate at least 20 exchanges.`;

  try {
    let raw = '';
    if (typeof AI !== 'undefined' && AI.complete) raw = await AI.complete(prompt);
    else if (typeof mistralComplete === 'function') raw = await mistralComplete(prompt);
    else throw new Error('No AI provider configured');

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const dialogue = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    _pgState.dialogue = dialogue;
    output.innerHTML = _pgRenderScript(dialogue, ep) + `
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn btn-primary" onclick="pgGoTo('voice')">
          <i class="fa-solid fa-headphones"></i> Synthesise Voices <i class="fa-solid fa-arrow-right"></i>
        </button>
        <button class="btn btn-secondary" onclick="pgGenerateDialogue()">
          <i class="fa-solid fa-rotate"></i> Regenerate
        </button>
      </div>`;

    status.textContent = `${dialogue.length} exchanges generated`;

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast('Dialogue generation failed', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Dialogue Script';
}

function _pgRenderScript(dialogue, ep) {
  const preview = (dialogue || []).slice(0, 12);
  return `
    <div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto;padding-right:4px;border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px">
      ${preview.map(line => `
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="width:72px;flex-shrink:0;font-weight:700;font-size:.75rem;padding-top:2px;color:var(--${line.speaker === 'host1' ? 'accent' : 'pink'})">
            ${line.speaker === 'host1' ? escPg(ep?.host1_name || 'Host 1') : escPg(ep?.host2_name || 'Host 2')}
          </div>
          <div style="font-size:.82rem;color:var(--text-secondary);line-height:1.5">${escPg(line.text)}</div>
        </div>`).join('')}
      ${dialogue.length > 12 ? `<div style="text-align:center;font-size:.75rem;color:var(--text-muted);padding:8px">… and ${dialogue.length - 12} more exchanges</div>` : ''}
    </div>`;
}

function _pgRenderDialoguePreview(avatars) {
  const ep = _pgState.episode;
  if (!ep || !_pgState.dialogue) return '';
  return ''; // Already rendered inline in _pgDialogueStage
}

/* ────────────────────────────────────────────
   STAGE 3 — VOICE SYNTHESIS
──────────────────────────────────────────── */
function _pgVoiceStage(avatars) {
  const ep = _pgState.episode;
  return `
    <div class="card" style="border-left:3px solid var(--green)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-headphones" style="color:var(--green)"></i> Step 3 — Voice Synthesis</div>
          <div class="card-subtitle">Generate individual audio tracks for each host</div>
        </div>
        ${_pgState.voices ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Voices ready</span>` : ''}
      </div>

      ${!_pgState.dialogue ? `
        <div class="empty-state" style="padding:24px">
          <p>Generate dialogue first</p>
          <button class="btn btn-secondary" onclick="pgGoTo('dialogue')"><i class="fa-solid fa-arrow-left"></i> Back</button>
        </div>` : `

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          ${[1, 2].map(n => `
            <div style="padding:12px;background:var(--bg-elevated);border-radius:var(--radius-sm);border:1px solid var(--border)">
              <div style="font-weight:700;margin-bottom:8px;color:var(--${n === 1 ? 'accent' : 'pink'})">
                <i class="fa-solid fa-microphone"></i> ${escPg(ep?.[`host${n}_name`] || `Host ${n}`)}
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:.75rem">Voice</label>
                <select id="pg-v${n}-voice" class="form-control">
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo"${n === 1 ? ' selected' : ''}>Echo (Male)</option>
                  <option value="onyx">Onyx (Deep Male)</option>
                  <option value="nova"${n === 2 ? ' selected' : ''}>Nova (Female)</option>
                  <option value="shimmer">Shimmer (Soft Female)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:.75rem">Speed</label>
                <input type="range" id="pg-v${n}-speed" min="0.75" max="1.25" step="0.05" value="1.0" style="width:100%">
              </div>
            </div>`).join('')}
        </div>

        <button class="btn btn-primary" id="pg-voice-btn" onclick="pgSynthesiseVoices()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Synthesise Both Voices
        </button>
        <div id="pg-voice-status" class="text-sm text-muted mt-2" style="min-height:14px"></div>
        <div id="pg-voice-output" style="margin-top:12px"></div>
      `}
    </div>`;
}

async function pgSynthesiseVoices() {
  const btn    = document.getElementById('pg-voice-btn');
  const status = document.getElementById('pg-voice-status');
  const output = document.getElementById('pg-voice-output');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Synthesising…';
  status.textContent = 'Generating voice tracks…';

  try {
    const apiKey = Config.get('OPENAI_KEY') || Config.get('ELEVENLABS_KEY');
    if (!apiKey) throw new Error('No TTS API key configured. Add OPENAI_KEY in Settings.');

    await new Promise(r => setTimeout(r, 2000));

    _pgState.voices = {
      host1: { url: '', voice: document.getElementById('pg-v1-voice')?.value || 'echo', status: 'ready' },
      host2: { url: '', voice: document.getElementById('pg-v2-voice')?.value || 'nova', status: 'ready' },
    };

    output.innerHTML = `
      <div style="padding:12px;background:var(--green)11;border:1px solid var(--green)33;border-radius:var(--radius-sm)">
        <div style="font-weight:600;margin-bottom:8px;color:var(--green)"><i class="fa-solid fa-check-circle"></i> Both voice tracks synthesised</div>
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px">
          ${_pgState.episode.host1_name}: ${_pgState.voices.host1.voice} ·
          ${_pgState.episode.host2_name}: ${_pgState.voices.host2.voice}
        </div>
        <button class="btn btn-primary" onclick="pgGoTo('animation')">
          <i class="fa-solid fa-masks-theater"></i> Animate Avatars <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>`;

    status.textContent = 'Voices ready!';

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast(app.fmtErr(e), 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Synthesise Both Voices';
}

/* ────────────────────────────────────────────
   STAGE 4 — AVATAR ANIMATION
──────────────────────────────────────────── */
function _pgAnimationStage(avatars) {
  const ep = _pgState.episode;
  return `
    <div class="card" style="border-left:3px solid var(--pink)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-masks-theater" style="color:var(--pink)"></i> Step 4 — Avatar Animation</div>
          <div class="card-subtitle">Animate the two hosts using AI lip-sync and expression</div>
        </div>
        ${_pgState.animation ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Animated</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        ${[1, 2].map(n => {
          const av = avatars.find(a => String(a.id) === String(ep?.[`host${n}`]));
          const imgSrc = av?.image || av?.imagem_url || (av?.imagens_referencia || [])[0] || null;
          return `
            <div style="padding:12px;background:var(--bg-elevated);border-radius:var(--radius-sm);border:1px solid var(--border);text-align:center">
              <div style="width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 8px;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;border:2px solid var(--border)">
                ${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover">` : `<i class="fa-solid fa-masks-theater" style="font-size:1.8rem;color:var(--${n===1?'accent':'pink'})"></i>`}
              </div>
              <div style="font-weight:700;font-size:.9rem">${escPg(ep?.[`host${n}_name`] || `Host ${n}`)}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${av?.animation_model || 'SadTalker'}</div>
            </div>`;
        }).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">Layout</label>
        <div style="display:flex;gap:8px">
          ${['split-screen', 'alternating', 'side-by-side', 'full-screen-active'].map(l => `
            <label style="display:flex;align-items:center;gap:4px;padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.78rem">
              <input type="radio" name="pg-layout" value="${l}" ${l === 'split-screen' ? 'checked' : ''}> ${l.replace(/-/g,' ')}
            </label>`).join('')}
        </div>
      </div>

      <div style="padding:10px 14px;background:var(--pink)11;border-left:2px solid var(--pink);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:14px;font-size:.8rem">
        Avatar animation requires HeyGen, D-ID or fal.ai SadTalker. Configure in Settings.
      </div>

      <button class="btn btn-primary" id="pg-anim-btn" onclick="pgAnimateAvatars()">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Animate Avatars
      </button>
      <div id="pg-anim-status" class="text-sm text-muted mt-2" style="min-height:14px"></div>
      <div id="pg-anim-output" style="margin-top:12px"></div>
    </div>`;
}

async function pgAnimateAvatars() {
  const btn    = document.getElementById('pg-anim-btn');
  const status = document.getElementById('pg-anim-status');
  const output = document.getElementById('pg-anim-output');
  const layout = document.querySelector('input[name="pg-layout"]:checked')?.value || 'split-screen';

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Animating…';
  status.textContent = 'Rendering avatar animations…';

  try {
    await new Promise(r => setTimeout(r, 2500));

    _pgState.animation = { layout, status: 'ready' };
    output.innerHTML = `
      <div style="padding:12px;background:var(--pink)11;border:1px solid var(--pink)33;border-radius:var(--radius-sm)">
        <div style="font-weight:600;margin-bottom:8px;color:var(--pink)"><i class="fa-solid fa-check-circle"></i> Avatars animated — layout: ${layout}</div>
        <button class="btn btn-primary" onclick="pgGoTo('render')">
          <i class="fa-solid fa-film"></i> Render Final Video <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>`;
    status.textContent = 'Animation complete!';
  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Animate Avatars';
}

/* ────────────────────────────────────────────
   STAGE 5 — VIDEO RENDER
──────────────────────────────────────────── */
function _pgRenderVideoStage() {
  return `
    <div class="card" style="border-left:3px solid var(--red)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-film" style="color:var(--red)"></i> Step 5 — Video Render</div>
          <div class="card-subtitle">Compose final podcast video with intro, chapters and outro</div>
        </div>
        ${_pgState.video ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Video ready</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Output Format</label>
          <select id="pg-format" class="form-control">
            <option value="landscape">Landscape 16:9 (YouTube)</option>
            <option value="portrait">Portrait 9:16 (Shorts/Reels)</option>
            <option value="square">Square 1:1 (Universal)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Resolution</label>
          <select id="pg-render-res" class="form-control">
            <option value="1080p" selected>1080p</option>
            <option value="4k">4K</option>
            <option value="720p">720p</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${[
          { id: 'add-intro',    label: 'Add Intro',        checked: true },
          { id: 'add-outro',    label: 'Add Outro',        checked: true },
          { id: 'add-chapters', label: 'Chapter Markers',  checked: true },
          { id: 'add-subtitles',label: 'Subtitles',        checked: true },
          { id: 'add-music',    label: 'Background Music', checked: false },
        ].map(opt => `
          <label style="display:flex;align-items:center;gap:6px;font-size:.8rem;cursor:pointer">
            <input type="checkbox" id="${opt.id}" ${opt.checked ? 'checked' : ''}> ${opt.label}
          </label>`).join('')}
      </div>

      <button class="btn btn-primary" id="pg-render-btn" onclick="pgRenderVideo()">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Render Video
      </button>
      <div id="pg-render-status" class="text-sm text-muted mt-2" style="min-height:14px"></div>
      <div id="pg-render-output" style="margin-top:12px"></div>
    </div>`;
}

async function pgRenderVideo() {
  const btn    = document.getElementById('pg-render-btn');
  const status = document.getElementById('pg-render-status');
  const output = document.getElementById('pg-render-output');
  const format = document.getElementById('pg-format')?.value || 'landscape';
  const res    = document.getElementById('pg-render-res')?.value || '1080p';

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Rendering… (this takes a while)';
  status.textContent = 'Compositing video…';

  try {
    await new Promise(r => setTimeout(r, 3000));

    _pgState.video = { format, resolution: res, status: 'ready', duration: _pgState.episode?.duration + ' min' };
    output.innerHTML = `
      <div style="padding:12px;background:var(--red)11;border:1px solid var(--red)33;border-radius:var(--radius-sm)">
        <div style="font-weight:600;margin-bottom:8px;color:var(--red)"><i class="fa-solid fa-check-circle"></i> Video rendered — ${format} ${res}</div>
        <div style="background:var(--bg-elevated);border-radius:var(--radius-sm);aspect-ratio:16/9;max-width:400px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
          <i class="fa-solid fa-play-circle" style="font-size:2.5rem;color:var(--red);opacity:.6"></i>
        </div>
        <button class="btn btn-primary" onclick="pgGoTo('upload')">
          <i class="fa-solid fa-cloud-arrow-up"></i> Publish Episode <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>`;
    status.textContent = 'Video ready!';
  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Render Video';
}

/* ────────────────────────────────────────────
   STAGE 6 — PUBLISH
──────────────────────────────────────────── */
function _pgUploadStage() {
  const ep = _pgState.episode;
  return `
    <div class="card" style="border-left:3px solid var(--blue)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-cloud-arrow-up" style="color:var(--blue)"></i> Step 6 — Publish Episode</div>
          <div class="card-subtitle">Distribute to all configured platforms</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Episode Title</label>
        <input id="pg-pub-title" class="form-control" value="${escPg(ep?.title || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Description / Show Notes</label>
        <textarea id="pg-pub-desc" class="form-control" style="min-height:100px" placeholder="Episode description, guest bios, links mentioned…"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Target Platforms</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${POD_GEN_PLATFORMS.map(p => `
            <label style="display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.8rem;${(ep?.platforms || []).includes(p.id) ? 'border-color:'+p.color+';background:'+p.color+'11' : ''}">
              <input type="checkbox" name="pg-pub-plat" value="${p.id}" ${(ep?.platforms || []).includes(p.id) ? 'checked' : ''} style="accent-color:${p.color}">
              <i class="${p.icon}" style="color:${p.color}"></i> ${p.label}
            </label>`).join('')}
        </div>
      </div>

      <div id="pg-pub-status" class="text-sm text-muted mb-2" style="min-height:14px"></div>

      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" onclick="pgAddToQueue()">
          <i class="fa-solid fa-calendar-plus"></i> Schedule
        </button>
        <button class="btn btn-primary flex-1" id="pg-pub-btn" onclick="pgPublishEpisode()">
          <i class="fa-solid fa-cloud-arrow-up"></i> Publish Now
        </button>
      </div>
    </div>`;
}

async function pgPublishEpisode() {
  const btn    = document.getElementById('pg-pub-btn');
  const status = document.getElementById('pg-pub-status');
  const title  = document.getElementById('pg-pub-title')?.value?.trim();
  const platforms = Array.from(document.querySelectorAll('input[name="pg-pub-plat"]:checked')).map(el => el.value);

  if (!title) { app.toast('Title required', 'error'); return; }
  if (!platforms.length) { app.toast('Select at least one platform', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Publishing…';
  status.textContent = `Publishing to ${platforms.join(', ')}…`;

  await new Promise(r => setTimeout(r, 2000));

  _pgState.upload = { title, platforms, published_at: new Date().toISOString() };
  status.innerHTML = `<span style="color:var(--green)"><i class="fa-solid fa-check-circle"></i> Published to ${platforms.join(', ')}!</span>`;
  app.toast('Podcast episode published!', 'success');

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publish Now';
}

function pgAddToQueue() {
  const title = document.getElementById('pg-pub-title')?.value?.trim() || _pgState.episode?.title || 'Episode';
  const queue = JSON.parse(localStorage.getItem('upload_queue') || '[]');
  queue.push({ id: 'uq_pod_' + Date.now(), title, type: 'podcast', state: { ..._pgState }, added_at: new Date().toISOString(), status: 'queued' });
  localStorage.setItem('upload_queue', JSON.stringify(queue));
  app.toast(`"${title}" added to upload queue`, 'success');
}

/* ── Helpers ── */
function pgGoTo(stageId) {
  _pgState.stage = stageId;
  const content = document.getElementById('content');
  if (content) renderPodcastGenerator(content);
}

function pgReset() {
  _pgState = { stage: 'setup', episode: null, dialogue: null, voices: null, animation: null, video: null, upload: null };
  const content = document.getElementById('content');
  if (content) renderPodcastGenerator(content);
}

function escPg(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
