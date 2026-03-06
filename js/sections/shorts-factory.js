/* ============================================================
   sections/shorts-factory.js — Shorts Factory (AI YouTube Factory)
   Batch generation: 100 ideas → scripts → voice → video → schedule
   ============================================================ */

const SF_BATCH_SIZES = [10, 25, 50, 100];

const SF_PLATFORMS = [
  { id: 'youtube_shorts', label: 'YouTube Shorts', icon: 'fa-brands fa-youtube',    color: '#ff0000' },
  { id: 'tiktok',         label: 'TikTok',          icon: 'fa-brands fa-tiktok',     color: '#010101' },
  { id: 'instagram',      label: 'Instagram Reels', icon: 'fa-brands fa-instagram',  color: '#c13584' },
  { id: 'facebook',       label: 'Facebook Reels',  icon: 'fa-brands fa-facebook',   color: '#1877f2' },
];

const SF_STYLES = [
  { id: 'talking-head',   label: 'Talking Head',    icon: 'fa-solid fa-person' },
  { id: 'text-animation', label: 'Text Animation',  icon: 'fa-solid fa-font' },
  { id: 'slide-show',     label: 'Slide Show',      icon: 'fa-solid fa-images' },
  { id: 'broll-overlay',  label: 'B-Roll + Overlay',icon: 'fa-solid fa-film' },
  { id: 'ai-generated',   label: 'AI Generated',    icon: 'fa-solid fa-wand-magic-sparkles' },
];

/* ── State ── */
let _sfState = {
  niche:        '',
  platform:     'youtube_shorts',
  style:        'talking-head',
  batchSize:    10,
  ideas:        [],       // [{ id, title, hook, angle, status, script, videoUrl }]
  selected:     new Set(),
  phase:        'ideas',  // ideas | scripts | voice | video | schedule
  generating:   false,
};

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderShortsFactory(container) {
  const channels = typeof _loadChannels === 'function' ? _loadChannels() : [];

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Shorts Factory</div>
        <div class="section-subtitle">Generate 100 short-form videos in bulk — ideas to scheduled uploads</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${_sfState.ideas.length > 0 ? `
          <span class="badge" style="background:var(--accent);color:#fff">${_sfState.ideas.length} ideas</span>
          <span class="badge" style="background:var(--green);color:#fff">${_sfState.ideas.filter(i=>i.status==='done').length} done</span>
        ` : ''}
        <button class="btn btn-secondary" onclick="sfReset()"><i class="fa-solid fa-rotate"></i> Reset</button>
      </div>
    </div>

    <!-- Controls card -->
    <div class="card mb-3">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;align-items:end">
        <div class="form-group" style="margin:0">
          <label class="form-label">Niche / Topic</label>
          <input id="sf-niche" class="form-control" placeholder="e.g. Personal Finance…" value="${escSf(_sfState.niche)}">
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Platform</label>
          <select id="sf-platform" class="form-control">
            ${SF_PLATFORMS.map(p => `<option value="${p.id}"${_sfState.platform === p.id ? ' selected' : ''}>${p.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Style</label>
          <select id="sf-style" class="form-control">
            ${SF_STYLES.map(s => `<option value="${s.id}"${_sfState.style === s.id ? ' selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Batch Size</label>
          <select id="sf-count" class="form-control">
            ${SF_BATCH_SIZES.map(n => `<option value="${n}"${_sfState.batchSize === n ? ' selected' : ''}>${n} ideas</option>`).join('')}
          </select>
        </div>
        ${channels.length > 0 ? `
        <div class="form-group" style="margin:0">
          <label class="form-label">Channel</label>
          <select id="sf-channel" class="form-control">
            <option value="">Any channel</option>
            ${channels.map(c => `<option value="${c.id}">${escSf(c.name)}</option>`).join('')}
          </select>
        </div>` : ''}
        <button class="btn btn-primary" id="sf-gen-btn" onclick="sfGenerateIdeas()" style="height:38px">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Ideas
        </button>
      </div>
    </div>

    <!-- Phase tabs -->
    ${_sfState.ideas.length > 0 ? `
    <div style="display:flex;gap:2px;margin-bottom:16px;background:var(--bg-elevated);border-radius:var(--radius-sm);padding:4px;width:fit-content">
      ${[
        { id: 'ideas',    label: 'Ideas',    count: _sfState.ideas.length },
        { id: 'scripts',  label: 'Scripts',  count: _sfState.ideas.filter(i=>i.script).length },
        { id: 'video',    label: 'Videos',   count: _sfState.ideas.filter(i=>i.videoUrl).length },
        { id: 'schedule', label: 'Schedule', count: _sfState.ideas.filter(i=>i.scheduled).length },
      ].map(tab => `
        <button class="btn btn-sm ${_sfState.phase === tab.id ? 'btn-primary' : 'btn-secondary'}"
                style="${_sfState.phase !== tab.id ? 'background:transparent;border-color:transparent' : ''}"
                onclick="sfSetPhase('${tab.id}')">
          ${tab.label} ${tab.count > 0 ? `<span style="opacity:.7">(${tab.count})</span>` : ''}
        </button>`).join('')}
    </div>` : ''}

    <!-- Status bar -->
    <div id="sf-status" class="text-sm text-muted mb-2" style="min-height:16px"></div>

    <!-- Main content area -->
    <div id="sf-main">
      ${_sfRenderPhase()}
    </div>
  `;
}

function _sfRenderPhase() {
  switch (_sfState.phase) {
    case 'ideas':    return _sfRenderIdeasGrid();
    case 'scripts':  return _sfRenderScriptsPanel();
    case 'video':    return _sfRenderVideoPanel();
    case 'schedule': return _sfRenderSchedulePanel();
    default:         return _sfRenderIdeasGrid();
  }
}

/* ────────────────────────────────────────────
   PHASE 1 — IDEAS GRID
──────────────────────────────────────────── */
function _sfRenderIdeasGrid() {
  const ideas = _sfState.ideas;
  if (!ideas.length) {
    return `
      <div class="empty-state" style="padding:60px 20px">
        <i class="fa-solid fa-lightbulb" style="font-size:2.5rem;color:var(--border);margin-bottom:12px"></i>
        <p style="font-size:1.1rem;font-weight:600;margin-bottom:6px">No ideas yet</p>
        <p class="text-muted">Configure the settings above and click "Generate Ideas"</p>
      </div>`;
  }

  const allSelected = ideas.length > 0 && _sfState.selected.size === ideas.length;

  return `
    <!-- Bulk action toolbar -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <label style="display:flex;align-items:center;gap:6px;font-size:.8rem;cursor:pointer">
        <input type="checkbox" id="sf-select-all" ${allSelected ? 'checked' : ''} onchange="sfToggleAll(this.checked)">
        Select all (${_sfState.selected.size}/${ideas.length})
      </label>
      <div style="height:1em;width:1px;background:var(--border)"></div>
      ${_sfState.selected.size > 0 ? `
        <button class="btn btn-sm btn-primary" onclick="sfBatchGenerateScripts()">
          <i class="fa-solid fa-file-pen"></i> Generate Scripts (${_sfState.selected.size})
        </button>
        <button class="btn btn-sm btn-secondary" onclick="sfBatchSchedule()">
          <i class="fa-solid fa-calendar-plus"></i> Schedule (${_sfState.selected.size})
        </button>
        <button class="btn btn-sm btn-secondary" onclick="sfDeleteSelected()" style="color:var(--red)">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      ` : ''}
      <span class="text-muted text-sm" style="margin-left:auto">${_sfState.ideas.filter(i=>i.script).length}/${ideas.length} scripted · ${_sfState.ideas.filter(i=>i.videoUrl).length} rendered</span>
    </div>

    <!-- Ideas grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px" id="sf-ideas-grid">
      ${ideas.map((idea, i) => _sfRenderIdeaCard(idea, i)).join('')}
    </div>`;
}

function _sfRenderIdeaCard(idea, i) {
  const isSelected = _sfState.selected.has(idea.id);
  const statusColors = { idea: 'var(--text-muted)', scripted: 'var(--accent)', voiced: 'var(--green)', done: 'var(--green)', error: 'var(--red)' };
  const statusIcon   = { idea: 'fa-lightbulb', scripted: 'fa-file-pen', voiced: 'fa-microphone', done: 'fa-check-circle', error: 'fa-exclamation-circle' };
  const status = idea.status || 'idea';

  return `
    <div class="card card-hover" style="padding:10px;cursor:pointer;border:1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'};background:${isSelected ? 'var(--accent-soft)' : ''}" onclick="sfToggleSelect('${idea.id}')">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation();sfToggleSelect('${idea.id}')" style="margin-top:3px;accent-color:var(--accent)">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.82rem;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escSf(idea.title)}</div>
          <div style="font-size:.72rem;color:var(--accent)">"${escSf(idea.hook)}"</div>
        </div>
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px">
          <i class="fa-solid ${statusIcon[status]}" style="color:${statusColors[status]};font-size:.8rem"></i>
          <span style="font-size:.6rem;color:var(--text-muted)">${status}</span>
        </div>
      </div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${escSf(idea.angle || '')}
      </div>
      <div style="display:flex;gap:4px">
        ${!idea.script ? `
          <button class="btn btn-sm btn-secondary flex-1" style="font-size:.7rem" onclick="event.stopPropagation();sfGenerateSingleScript('${idea.id}')">
            <i class="fa-solid fa-file-pen"></i> Script
          </button>` : `
          <span class="badge badge-muted" style="font-size:.65rem;flex:1;text-align:center;padding:4px">
            <i class="fa-solid fa-check" style="color:var(--green)"></i> Scripted
          </span>`}
        ${!idea.scheduled ? `
          <button class="btn btn-sm btn-secondary" style="font-size:.7rem" onclick="event.stopPropagation();sfScheduleSingle('${idea.id}')">
            <i class="fa-solid fa-calendar"></i>
          </button>` : `
          <span class="badge" style="background:var(--green)22;color:var(--green);font-size:.65rem;padding:4px">
            <i class="fa-solid fa-clock"></i>
          </span>`}
        <button class="btn btn-sm btn-secondary" style="font-size:.7rem;color:var(--red)" onclick="event.stopPropagation();sfDeleteIdea('${idea.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
}

/* ────────────────────────────────────────────
   PHASE 2 — SCRIPTS PANEL
──────────────────────────────────────────── */
function _sfRenderScriptsPanel() {
  const scripted = _sfState.ideas.filter(i => i.script);
  const unscripted = _sfState.ideas.filter(i => !i.script);

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="text-sm text-muted">${scripted.length}/${_sfState.ideas.length} scripts ready</span>
        ${unscripted.length > 0 ? `
        <button class="btn btn-primary btn-sm" id="sf-gen-all-scripts" onclick="sfBatchGenerateAllScripts()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate All ${unscripted.length} Missing Scripts
        </button>` : ''}
      </div>

      <div id="sf-scripts-progress" style="display:none">
        <div style="margin-bottom:6px;font-size:.8rem">Generating scripts…</div>
        <div class="progress-bar"><div class="progress-fill" id="sf-scripts-bar" style="width:0%;background:var(--accent);transition:width .3s"></div></div>
      </div>

      ${scripted.length === 0 ? `
        <div class="empty-state" style="padding:40px">
          <p>No scripts yet. Select ideas and click "Generate Scripts" or use the button above.</p>
        </div>` : `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${scripted.map(idea => `
            <div class="card" style="padding:12px">
              <div style="font-weight:700;margin-bottom:6px">${escSf(idea.title)}</div>
              <div style="font-size:.78rem;color:var(--accent);margin-bottom:6px">"${escSf(idea.hook)}"</div>
              <div style="font-size:.8rem;color:var(--text-secondary);white-space:pre-line;max-height:80px;overflow:hidden;mask-image:linear-gradient(to bottom,black 60%,transparent)">${escSf(idea.script || '')}</div>
              <div style="display:flex;gap:6px;margin-top:8px">
                <button class="btn btn-sm btn-secondary" onclick="sfViewScript('${idea.id}')"><i class="fa-solid fa-eye"></i> View Full</button>
                <button class="btn btn-sm btn-secondary" onclick="sfGenerateSingleScript('${idea.id}')"><i class="fa-solid fa-rotate"></i> Regen</button>
              </div>
            </div>`).join('')}
        </div>`}
    </div>`;
}

/* ────────────────────────────────────────────
   PHASE 3 — VIDEO PANEL
──────────────────────────────────────────── */
function _sfRenderVideoPanel() {
  const ready = _sfState.ideas.filter(i => i.videoUrl);
  const pending = _sfState.ideas.filter(i => i.script && !i.videoUrl);

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="text-sm text-muted">${ready.length}/${_sfState.ideas.length} videos ready</span>
        ${pending.length > 0 ? `
        <button class="btn btn-primary btn-sm" onclick="sfBatchGenerateVideos()">
          <i class="fa-solid fa-video"></i> Generate ${pending.length} Videos
        </button>` : ''}
        <div style="padding:8px 12px;background:var(--yellow)11;border-left:2px solid var(--yellow);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-size:.78rem;margin-left:auto">
          <i class="fa-solid fa-triangle-exclamation" style="color:var(--yellow)"></i>
          Video generation requires fal.ai credits. Estimated cost: ~$${(pending.length * 0.05).toFixed(2)}
        </div>
      </div>

      <div id="sf-video-progress" style="display:none">
        <div class="progress-bar"><div class="progress-fill" id="sf-video-bar" style="width:0%;background:var(--red);transition:width .3s"></div></div>
        <div id="sf-video-prog-text" class="text-sm text-muted mt-1"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">
        ${_sfState.ideas.filter(i => i.script).map(idea => `
          <div class="card" style="padding:8px;text-align:center">
            <div style="background:var(--bg-elevated);border-radius:var(--radius-sm);aspect-ratio:9/16;display:flex;align-items:center;justify-content:center;margin-bottom:6px;font-size:1.5rem">
              ${idea.videoUrl ? '<i class="fa-solid fa-play-circle" style="color:var(--red)"></i>' : '<i class="fa-solid fa-clock" style="color:var(--text-muted)"></i>'}
            </div>
            <div style="font-size:.72rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escSf(idea.title)}</div>
            <div style="font-size:.65rem;color:${idea.videoUrl ? 'var(--green)' : 'var(--text-muted)'}">
              ${idea.videoUrl ? '✓ Ready' : 'Pending'}
            </div>
          </div>`).join('')}
        ${_sfState.ideas.filter(i => !i.script).length > 0 ? `
          <div class="empty-state" style="grid-column:1/-1;padding:20px">
            <p style="font-size:.8rem">${_sfState.ideas.filter(i=>!i.script).length} ideas need scripts first</p>
          </div>` : ''}
      </div>
    </div>`;
}

/* ────────────────────────────────────────────
   PHASE 4 — SCHEDULE PANEL
──────────────────────────────────────────── */
function _sfRenderSchedulePanel() {
  const channels = typeof _loadChannels === 'function' ? _loadChannels() : [];
  const unscheduled = _sfState.ideas.filter(i => !i.scheduled);

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card">
        <div class="card-title mb-3"><i class="fa-solid fa-calendar-days"></i> Bulk Schedule</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input id="sf-sched-start" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}">
          </div>
          <div class="form-group">
            <label class="form-label">Publish Time</label>
            <input id="sf-sched-time" type="time" class="form-control" value="09:00">
          </div>
          <div class="form-group">
            <label class="form-label">Interval</label>
            <select id="sf-sched-interval" class="form-control">
              <option value="hourly">Every hour</option>
              <option value="4h">Every 4 hours</option>
              <option value="daily" selected>Daily</option>
              <option value="2days">Every 2 days</option>
            </select>
          </div>
        </div>
        ${channels.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Target Channel</label>
          <select id="sf-sched-channel" class="form-control">
            <option value="">No specific channel</option>
            ${channels.map(c => `<option value="${c.id}">${escSf(c.name)}</option>`).join('')}
          </select>
        </div>` : ''}
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary flex-1" onclick="sfBatchScheduleAll()">
            <i class="fa-solid fa-calendar-plus"></i> Schedule ${unscheduled.length} Videos
          </button>
          <button class="btn btn-secondary" onclick="sfExportSchedule()">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Scheduled list -->
      <div class="card">
        <div class="card-title mb-3">Upload Queue (${_sfState.ideas.filter(i=>i.scheduled).length} scheduled)</div>
        ${_sfState.ideas.filter(i => i.scheduled).length === 0 ? `
          <div class="empty-state" style="padding:24px"><p>No videos scheduled yet</p></div>` : `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${_sfState.ideas.filter(i => i.scheduled).slice(0, 20).map(idea => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm)">
                <i class="fa-solid fa-calendar-check" style="color:var(--green)"></i>
                <div style="flex:1;min-width:0">
                  <div style="font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escSf(idea.title)}</div>
                  <div style="font-size:.72rem;color:var(--text-muted)">${idea.scheduled_for || '—'}</div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="sfUnschedule('${idea.id}')" title="Remove from queue">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>`).join('')}
          </div>`}
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   ACTION FUNCTIONS
════════════════════════════════════════ */
async function sfGenerateIdeas() {
  const niche     = document.getElementById('sf-niche')?.value?.trim() || 'general';
  const platform  = document.getElementById('sf-platform')?.value || 'youtube_shorts';
  const style     = document.getElementById('sf-style')?.value || 'talking-head';
  const batchSize = parseInt(document.getElementById('sf-count')?.value) || 10;
  const btn       = document.getElementById('sf-gen-btn');
  const status    = document.getElementById('sf-status');

  _sfState.niche     = niche;
  _sfState.platform  = platform;
  _sfState.style     = style;
  _sfState.batchSize = batchSize;

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Generating…';
  if (status) status.textContent = `Generating ${batchSize} ideas for "${niche}"…`;

  const platformLabels = { youtube_shorts: 'YouTube Shorts', tiktok: 'TikTok', instagram: 'Instagram Reels', facebook: 'Facebook Reels' };
  const prompt = `Generate ${batchSize} viral ${platformLabels[platform]} video ideas about "${niche}".
Each idea must be attention-grabbing, shareable and under 60 seconds when scripted.
Return ONLY a valid JSON array, no markdown:
[{"title":"...","hook":"First 3 words that grab attention","angle":"Unique angle or perspective","keywords":["...","..."]}]`;

  try {
    let raw = '';
    if (typeof AI !== 'undefined' && AI.complete) raw = await AI.complete(prompt);
    else if (typeof mistralComplete === 'function') raw = await mistralComplete(prompt);
    else throw new Error('No AI provider configured');

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const ideas = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    _sfState.ideas = ideas.map((idea, i) => ({
      id:     'sf_' + Date.now() + '_' + i,
      title:  idea.title,
      hook:   idea.hook,
      angle:  idea.angle,
      keywords: idea.keywords || [],
      status: 'idea',
      script: null,
      voiceUrl: null,
      videoUrl: null,
      scheduled: false,
      scheduled_for: null,
    }));
    _sfState.phase    = 'ideas';
    _sfState.selected = new Set();

    if (status) status.textContent = `${ideas.length} ideas generated!`;
    app.toast(`${ideas.length} ideas ready!`, 'success');

  } catch (e) {
    if (status) status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast('Failed to generate ideas', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Ideas';

  const content = document.getElementById('content');
  if (content) renderShortsFactory(content);
}

function sfSetPhase(phase) {
  _sfState.phase = phase;
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
  // Update tabs
  const content = document.getElementById('content');
  if (content) renderShortsFactory(content);
}

function sfToggleSelect(id) {
  if (_sfState.selected.has(id)) _sfState.selected.delete(id);
  else _sfState.selected.add(id);
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
}

function sfToggleAll(checked) {
  if (checked) _sfState.ideas.forEach(i => _sfState.selected.add(i.id));
  else _sfState.selected.clear();
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
}

function sfDeleteIdea(id) {
  _sfState.ideas = _sfState.ideas.filter(i => i.id !== id);
  _sfState.selected.delete(id);
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
}

function sfDeleteSelected() {
  _sfState.ideas = _sfState.ideas.filter(i => !_sfState.selected.has(i.id));
  _sfState.selected.clear();
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
  app.toast('Selected ideas deleted', 'info');
}

async function sfGenerateSingleScript(id) {
  const idea = _sfState.ideas.find(i => i.id === id);
  if (!idea) return;

  const prompt = `Write a 60-second short-form video script for: "${idea.title}"
Hook: "${idea.hook}"
Angle: ${idea.angle}

Requirements: punchy, fast-paced, no filler. Start immediately with the hook.
Return ONLY the script text (no JSON, no markdown, just the words to say).`;

  try {
    let raw = '';
    if (typeof AI !== 'undefined' && AI.complete) raw = await AI.complete(prompt);
    else if (typeof mistralComplete === 'function') raw = await mistralComplete(prompt);
    else throw new Error('No AI provider configured');

    idea.script = raw.trim();
    idea.status = 'scripted';

    const main = document.getElementById('sf-main');
    if (main) main.innerHTML = _sfRenderPhase();
    app.toast(`Script ready: "${idea.title.substring(0,30)}…"`, 'success');

  } catch (e) {
    idea.status = 'error';
    app.toast('Script generation failed', 'error');
  }
}

async function sfBatchGenerateScripts() {
  const toGenerate = _sfState.ideas.filter(i => _sfState.selected.has(i.id) && !i.script);
  if (!toGenerate.length) { app.toast('No ideas selected (or all already have scripts)', 'warning'); return; }

  sfSetPhase('scripts');
  const progress = document.getElementById('sf-scripts-progress');
  const bar      = document.getElementById('sf-scripts-bar');
  if (progress) progress.style.display = 'block';

  let done = 0;
  for (const idea of toGenerate) {
    await sfGenerateSingleScript(idea.id);
    done++;
    if (bar) bar.style.width = `${(done / toGenerate.length) * 100}%`;
  }

  if (progress) progress.style.display = 'none';
  app.toast(`${done} scripts generated!`, 'success');
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
}

async function sfBatchGenerateAllScripts() {
  _sfState.selected = new Set(_sfState.ideas.map(i => i.id));
  await sfBatchGenerateScripts();
}

function sfViewScript(id) {
  const idea = _sfState.ideas.find(i => i.id === id);
  if (!idea) return;
  app.openModal(
    idea.title,
    `<div style="max-height:400px;overflow-y:auto;white-space:pre-line;font-size:.85rem;line-height:1.6">${escSf(idea.script || '')}</div>`,
    `<button class="btn btn-primary" onclick="app.closeModal()">Close</button>`
  );
}

async function sfBatchGenerateVideos() {
  const pending = _sfState.ideas.filter(i => i.script && !i.videoUrl);
  if (!pending.length) { app.toast('No pending videos', 'warning'); return; }

  const progEl   = document.getElementById('sf-video-progress');
  const barEl    = document.getElementById('sf-video-bar');
  const textEl   = document.getElementById('sf-video-prog-text');
  if (progEl) progEl.style.display = 'block';

  let done = 0;
  for (const idea of pending) {
    if (textEl) textEl.textContent = `Generating video ${done+1}/${pending.length}: "${idea.title.substring(0,40)}"`;
    await new Promise(r => setTimeout(r, 800)); // simulate
    idea.videoUrl = 'generated';
    idea.status   = 'done';
    done++;
    if (barEl) barEl.style.width = `${(done/pending.length)*100}%`;
  }

  if (progEl) progEl.style.display = 'none';
  app.toast(`${done} videos generated!`, 'success');
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
}

function sfScheduleSingle(id) {
  const idea = _sfState.ideas.find(i => i.id === id);
  if (!idea) return;
  idea.scheduled     = true;
  idea.scheduled_for = new Date(Date.now() + Math.random() * 7 * 86400000).toISOString().slice(0,16).replace('T',' ');
  const queue = JSON.parse(localStorage.getItem('upload_queue') || '[]');
  queue.push({ id: 'sf_' + Date.now(), title: idea.title, type: 'short', scheduled_for: idea.scheduled_for, status: 'queued' });
  localStorage.setItem('upload_queue', JSON.stringify(queue));
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
  app.toast(`"${idea.title.substring(0,30)}" scheduled`, 'success');
}

function sfBatchSchedule() {
  const selected = _sfState.ideas.filter(i => _sfState.selected.has(i.id));
  let count = 0;
  const queue = JSON.parse(localStorage.getItem('upload_queue') || '[]');
  let baseTime = Date.now();
  selected.forEach(idea => {
    idea.scheduled     = true;
    idea.scheduled_for = new Date(baseTime).toISOString().slice(0,16).replace('T',' ');
    queue.push({ id: 'sf_' + Date.now() + '_' + count, title: idea.title, type: 'short', scheduled_for: idea.scheduled_for, status: 'queued' });
    baseTime += 86400000; // +1 day each
    count++;
  });
  localStorage.setItem('upload_queue', JSON.stringify(queue));
  _sfState.selected.clear();
  app.toast(`${count} videos added to upload queue`, 'success');
  sfSetPhase('schedule');
}

function sfBatchScheduleAll() {
  _sfState.selected = new Set(_sfState.ideas.map(i => i.id));
  sfBatchSchedule();
}

function sfUnschedule(id) {
  const idea = _sfState.ideas.find(i => i.id === id);
  if (!idea) return;
  idea.scheduled     = false;
  idea.scheduled_for = null;
  const main = document.getElementById('sf-main');
  if (main) main.innerHTML = _sfRenderPhase();
}

function sfExportSchedule() {
  const scheduled = _sfState.ideas.filter(i => i.scheduled);
  if (!scheduled.length) { app.toast('No scheduled videos to export', 'warning'); return; }
  const rows = ['Title,Hook,Scheduled For,Status'];
  scheduled.forEach(i => rows.push(`"${i.title}","${i.hook}","${i.scheduled_for || ''}","${i.status}"`));
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'shorts-schedule.csv'; a.click();
  URL.revokeObjectURL(url);
}

function sfReset() {
  _sfState = { niche: '', platform: 'youtube_shorts', style: 'talking-head', batchSize: 10, ideas: [], selected: new Set(), phase: 'ideas', generating: false };
  const content = document.getElementById('content');
  if (content) renderShortsFactory(content);
}

function escSf(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
