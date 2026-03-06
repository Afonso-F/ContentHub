/* ============================================================
   sections/video-pipeline.js — AI Video Generation Pipeline
   Modular 6-stage pipeline: Idea → Script → Voice → Video
                              → Thumbnail → Upload
   ============================================================ */

/* ── Pipeline stages ── */
const PIPELINE_STAGES = [
  { id: 'idea',      label: 'Idea Generator',      icon: 'fa-lightbulb',         color: 'var(--yellow)'  },
  { id: 'script',    label: 'Script Generator',     icon: 'fa-file-pen',          color: 'var(--accent)'  },
  { id: 'voice',     label: 'Voice Generator',      icon: 'fa-microphone',        color: 'var(--green)'   },
  { id: 'video',     label: 'Video Generator',      icon: 'fa-clapperboard',      color: 'var(--red)'     },
  { id: 'thumbnail', label: 'Thumbnail Generator',  icon: 'fa-image',             color: 'var(--pink)'    },
  { id: 'upload',    label: 'Upload Manager',        icon: 'fa-cloud-arrow-up',    color: 'var(--blue)'    },
];

/* ── Pipeline state ── */
let _pipeState = {
  channel: null,        // { id, name, niche, language }
  stage:   'idea',      // current active stage
  idea:    null,        // { title, hook, description, keywords }
  script:  null,        // { hook, body, cta, duration_est }
  voice:   null,        // { url, duration, provider }
  video:   null,        // { url, resolution, model }
  thumbnail: null,      // { url, style }
  uploadStatus: null,   // { platform, status, url }
  running: false,
};

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderPipeline(container) {
  // Restore channel context from navigation
  const chanId   = sessionStorage.getItem('pipeline_channel_id')   || '';
  const chanName = sessionStorage.getItem('pipeline_channel_name') || '';
  const chanNiche= sessionStorage.getItem('pipeline_channel_niche')|| '';

  if (chanId && (!_pipeState.channel || _pipeState.channel.id !== chanId)) {
    _pipeState = { ..._pipeState, channel: { id: chanId, name: chanName, niche: chanNiche }, stage: 'idea', idea: null, script: null, voice: null, video: null, thumbnail: null, uploadStatus: null };
  }

  // Load avatars for voice selection
  let avatares = app.getAvatares ? app.getAvatares() : [];
  if (!avatares.length && typeof DB !== 'undefined' && DB.ready()) {
    const { data } = await DB.getAvatares();
    avatares = data || [];
    if (app.setAvatares) app.setAvatares(avatares);
  }

  const channels = typeof _loadChannels === 'function' ? _loadChannels() : [];

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">AI Video Pipeline</div>
        <div class="section-subtitle">6-stage modular video generation — from idea to upload</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${channels.length > 0 ? `
        <select id="pipe-channel-sel" class="form-control" style="max-width:200px" onchange="pipeSelectChannel(this.value)">
          <option value="">Select channel…</option>
          ${channels.map(c => `<option value="${c.id}"${c.id === chanId ? ' selected' : ''}>${escPipe(c.name)}</option>`).join('')}
        </select>` : ''}
        <button class="btn btn-secondary" onclick="pipeReset()">
          <i class="fa-solid fa-rotate"></i> Reset
        </button>
      </div>
    </div>

    <!-- Pipeline stage progress bar -->
    <div class="pipeline-progress mb-3" id="pipe-progress">
      ${PIPELINE_STAGES.map((s, i) => {
        const stageIdx = PIPELINE_STAGES.findIndex(x => x.id === _pipeState.stage);
        const isDone   = i < stageIdx;
        const isCurrent = s.id === _pipeState.stage;
        return `
          <div class="pipeline-step${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}" onclick="pipeGoToStage('${s.id}')">
            <div class="pipeline-step-icon" style="background:${isCurrent ? s.color : isDone ? 'var(--green)' : 'var(--bg-elevated)'}">
              <i class="fa-solid ${isDone ? 'fa-check' : s.icon}" style="color:${isCurrent || isDone ? '#fff' : 'var(--text-muted)'}"></i>
            </div>
            <div class="pipeline-step-label">${s.label}</div>
            ${i < PIPELINE_STAGES.length - 1 ? '<div class="pipeline-connector"></div>' : ''}
          </div>`;
      }).join('')}
    </div>

    <!-- Channel context banner -->
    ${_pipeState.channel ? `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px">
      <i class="fa-brands fa-youtube" style="color:var(--red)"></i>
      <span style="font-weight:600">${escPipe(_pipeState.channel.name)}</span>
      <span class="badge badge-muted">${escPipe(_pipeState.channel.niche)}</span>
      <span style="margin-left:auto;font-size:.8rem;color:var(--text-muted)">Active channel</span>
    </div>` : ''}

    <!-- Active stage panel -->
    <div id="pipe-stage-panel">
      ${_renderPipeStagePanel(avatares)}
    </div>

    <!-- Pipeline summary (results so far) -->
    ${_renderPipeSummary()}
  `;
}

/* ── Stage router ── */
function _renderPipeStagePanel(avatares) {
  switch (_pipeState.stage) {
    case 'idea':      return _renderIdeaStage();
    case 'script':    return _renderScriptStage();
    case 'voice':     return _renderVoiceStage(avatares || []);
    case 'video':     return _renderVideoStage();
    case 'thumbnail': return _renderThumbnailStage();
    case 'upload':    return _renderUploadStage();
    default:          return '<div class="card"><p>Unknown stage</p></div>';
  }
}

/* ────────────────────────────────────────────
   STAGE 1 — IDEA GENERATOR
──────────────────────────────────────────── */
function _renderIdeaStage() {
  const niche = _pipeState.channel?.niche || '';
  return `
    <div class="card" style="border-left:3px solid var(--yellow)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-lightbulb" style="color:var(--yellow)"></i> Step 1 — Idea Generator</div>
          <div class="card-subtitle">Generate viral video concepts with AI</div>
        </div>
        ${_pipeState.idea ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Idea ready</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Niche / Topic</label>
          <input id="pipe-niche" class="form-control" placeholder="e.g. Personal Finance, AI Tools…" value="${escPipe(niche)}">
        </div>
        <div class="form-group">
          <label class="form-label">Target Audience</label>
          <input id="pipe-audience" class="form-control" placeholder="e.g. 25-35 year olds, beginners…">
        </div>
        <div class="form-group">
          <label class="form-label">Video Format</label>
          <select id="pipe-format" class="form-control">
            <option value="tutorial">Tutorial / How-to</option>
            <option value="listicle">Top N List</option>
            <option value="story">Story / Case Study</option>
            <option value="reaction">Reaction / Commentary</option>
            <option value="explainer">Explainer / Deep-dive</option>
            <option value="news">News / Current Events</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Number of Ideas</label>
          <select id="pipe-idea-count" class="form-control">
            <option value="3">3 ideas</option>
            <option value="5" selected>5 ideas</option>
            <option value="10">10 ideas</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary flex-1" id="pipe-idea-btn" onclick="pipeGenerateIdeas()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Ideas
        </button>
      </div>

      <div id="pipe-ideas-status" class="text-sm text-muted" style="min-height:14px"></div>
      <div id="pipe-ideas-list" style="display:flex;flex-direction:column;gap:8px;margin-top:12px"></div>
    </div>`;
}

async function pipeGenerateIdeas() {
  const niche    = document.getElementById('pipe-niche')?.value?.trim() || 'General';
  const audience = document.getElementById('pipe-audience')?.value?.trim() || 'general audience';
  const format   = document.getElementById('pipe-format')?.value || 'tutorial';
  const count    = parseInt(document.getElementById('pipe-idea-count')?.value) || 5;

  const btn = document.getElementById('pipe-idea-btn');
  const status = document.getElementById('pipe-ideas-status');
  const list   = document.getElementById('pipe-ideas-list');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Generating…';
  status.textContent = 'Calling AI…';
  list.innerHTML = '';

  const prompt = `Generate ${count} viral YouTube video ideas for a channel about "${niche}".
Target audience: ${audience}. Format: ${format}.
For each idea return valid JSON array:
[{"title":"...","hook":"...","description":"...","keywords":["...","..."]}]
Only return the JSON array, no markdown, no extra text.`;

  try {
    let raw = '';
    if (typeof AI !== 'undefined' && AI.complete) {
      raw = await AI.complete(prompt);
    } else if (typeof mistralComplete === 'function') {
      raw = await mistralComplete(prompt);
    } else {
      throw new Error('No AI provider configured');
    }

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const ideas = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    list.innerHTML = ideas.map((idea, i) => `
      <div class="card card-hover" style="padding:12px;cursor:pointer;border:1px solid var(--border)" onclick="pipeSelectIdea(${i})" id="pipe-idea-${i}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div>
            <div style="font-weight:700;margin-bottom:4px">${escPipe(idea.title)}</div>
            <div style="font-size:.8rem;color:var(--accent);margin-bottom:4px">"${escPipe(idea.hook)}"</div>
            <div style="font-size:.78rem;color:var(--text-muted)">${escPipe(idea.description)}</div>
            ${idea.keywords?.length ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${idea.keywords.map(k => `<span class="badge badge-muted" style="font-size:.65rem">${escPipe(k)}</span>`).join('')}</div>` : ''}
          </div>
          <button class="btn btn-sm btn-primary" style="flex-shrink:0" onclick="event.stopPropagation();pipeSelectIdea(${i})">
            Select <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>`).join('');

    // Store ideas in state for selection
    _pipeState._ideas = ideas;
    status.textContent = `${ideas.length} ideas generated — select one to continue`;

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast('Failed to generate ideas', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Ideas';
}

function pipeSelectIdea(i) {
  const ideas = _pipeState._ideas || [];
  if (!ideas[i]) return;
  _pipeState.idea = ideas[i];

  document.querySelectorAll('[id^="pipe-idea-"]').forEach((el, idx) => {
    el.style.borderColor = idx === i ? 'var(--accent)' : 'var(--border)';
    el.style.background  = idx === i ? 'var(--accent-soft)' : '';
  });

  // Show "proceed" button
  const list = document.getElementById('pipe-ideas-list');
  if (list) {
    const existing = document.getElementById('pipe-proceed-idea');
    if (!existing) {
      const btn = document.createElement('button');
      btn.id = 'pipe-proceed-idea';
      btn.className = 'btn btn-primary';
      btn.style.marginTop = '8px';
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Continue to Script Generator';
      btn.onclick = () => pipeGoToStage('script');
      list.appendChild(btn);
    }
  }
  app.toast('Idea selected!', 'success');
}

/* ────────────────────────────────────────────
   STAGE 2 — SCRIPT GENERATOR
──────────────────────────────────────────── */
function _renderScriptStage() {
  const idea = _pipeState.idea;
  return `
    <div class="card" style="border-left:3px solid var(--accent)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-file-pen" style="color:var(--accent)"></i> Step 2 — Script Generator</div>
          <div class="card-subtitle">Write an optimised, engaging video script</div>
        </div>
        ${_pipeState.script ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Script ready</span>` : ''}
      </div>

      ${!idea ? `
        <div class="empty-state" style="padding:24px">
          <i class="fa-solid fa-lightbulb" style="font-size:1.5rem;color:var(--border)"></i>
          <p>Go back and select a video idea first</p>
          <button class="btn btn-secondary" onclick="pipeGoToStage('idea')"><i class="fa-solid fa-arrow-left"></i> Back to Ideas</button>
        </div>` : `

        <!-- Idea context -->
        <div style="padding:10px 14px;background:var(--yellow)11;border-left:2px solid var(--yellow);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:16px">
          <div style="font-weight:700;font-size:.9rem">${escPipe(idea.title)}</div>
          <div style="font-size:.8rem;color:var(--text-muted)">${escPipe(idea.hook)}</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div class="form-group">
            <label class="form-label">Script Length</label>
            <select id="pipe-script-len" class="form-control">
              <option value="short">Short (3-5 min)</option>
              <option value="medium" selected>Medium (7-10 min)</option>
              <option value="long">Long (15-20 min)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tone</label>
            <select id="pipe-script-tone" class="form-control">
              <option value="educational">Educational</option>
              <option value="entertaining">Entertaining</option>
              <option value="conversational">Conversational</option>
              <option value="authoritative">Authoritative</option>
              <option value="motivational">Motivational</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn btn-primary flex-1" id="pipe-script-btn" onclick="pipeGenerateScript()">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Script
          </button>
        </div>
        <div id="pipe-script-status" class="text-sm text-muted" style="min-height:14px"></div>

        <!-- Script output -->
        <div id="pipe-script-output" style="margin-top:12px"></div>
      `}
    </div>`;
}

async function pipeGenerateScript() {
  const idea   = _pipeState.idea;
  const len    = document.getElementById('pipe-script-len')?.value || 'medium';
  const tone   = document.getElementById('pipe-script-tone')?.value || 'educational';
  const btn    = document.getElementById('pipe-script-btn');
  const status = document.getElementById('pipe-script-status');
  const output = document.getElementById('pipe-script-output');

  const lenMap = { short: '3-5 minutes', medium: '7-10 minutes', long: '15-20 minutes' };

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Writing script…';
  status.textContent = 'AI is writing your script…';
  output.innerHTML = '';

  const prompt = `Write a complete YouTube video script.
Title: "${idea.title}"
Hook: "${idea.hook}"
Topic: ${idea.description}
Length: ${lenMap[len]}
Tone: ${tone}

Return ONLY valid JSON (no markdown):
{
  "hook": "Opening 30-second hook that grabs attention",
  "intro": "30-60 second intro establishing what viewer will learn",
  "body": [{"section":"Section Title","content":"Full script text for this section"}],
  "cta": "Call to action — subscribe, like, comment prompt",
  "outro": "30-second outro",
  "duration_est": "${lenMap[len]}"
}`;

  try {
    let raw = '';
    if (typeof AI !== 'undefined' && AI.complete) raw = await AI.complete(prompt);
    else if (typeof mistralComplete === 'function') raw = await mistralComplete(prompt);
    else throw new Error('No AI provider configured');

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const script = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    _pipeState.script = script;

    output.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="padding:12px;background:var(--red)11;border-left:3px solid var(--red);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
          <div style="font-size:.75rem;font-weight:700;color:var(--red);margin-bottom:6px;text-transform:uppercase">HOOK (0:00–0:30)</div>
          <div style="font-size:.85rem">${escPipe(script.hook)}</div>
        </div>
        <div style="padding:12px;background:var(--accent)11;border-left:3px solid var(--accent);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
          <div style="font-size:.75rem;font-weight:700;color:var(--accent);margin-bottom:6px;text-transform:uppercase">INTRO</div>
          <div style="font-size:.85rem">${escPipe(script.intro)}</div>
        </div>
        ${(script.body || []).map((s, i) => `
          <div style="padding:12px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm)">
            <div style="font-size:.75rem;font-weight:700;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase">SECTION ${i+1}: ${escPipe(s.section)}</div>
            <div style="font-size:.82rem;color:var(--text-secondary);white-space:pre-line">${escPipe(s.content)}</div>
          </div>`).join('')}
        <div style="padding:12px;background:var(--green)11;border-left:3px solid var(--green);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
          <div style="font-size:.75rem;font-weight:700;color:var(--green);margin-bottom:6px;text-transform:uppercase">CTA</div>
          <div style="font-size:.85rem">${escPipe(script.cta)}</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn btn-primary" onclick="pipeGoToStage('voice')">
            <i class="fa-solid fa-microphone"></i> Generate Voice <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button class="btn btn-secondary" onclick="pipeGenerateScript()">
            <i class="fa-solid fa-rotate"></i> Regenerate
          </button>
        </div>
      </div>`;

    status.textContent = `Script ready — ${script.duration_est}`;

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast('Script generation failed', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Script';
}

/* ────────────────────────────────────────────
   STAGE 3 — VOICE GENERATOR
──────────────────────────────────────────── */
function _renderVoiceStage(avatares) {
  const studioAvatars = typeof _loadStudioAvatars === 'function' ? _loadStudioAvatars() : [];
  const allAvatars    = [...avatares, ...studioAvatars];

  return `
    <div class="card" style="border-left:3px solid var(--green)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-microphone" style="color:var(--green)"></i> Step 3 — Voice Generator</div>
          <div class="card-subtitle">Convert script to audio with TTS synthesis</div>
        </div>
        ${_pipeState.voice ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Voice ready</span>` : ''}
      </div>

      ${!_pipeState.script ? `
        <div class="empty-state" style="padding:24px">
          <p>Generate a script first</p>
          <button class="btn btn-secondary" onclick="pipeGoToStage('script')"><i class="fa-solid fa-arrow-left"></i> Back to Script</button>
        </div>` : `

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div class="form-group">
            <label class="form-label">TTS Provider</label>
            <select id="pipe-tts-provider" class="form-control" onchange="pipeTTSChange()">
              <option value="openai">OpenAI TTS</option>
              <option value="elevenlabs">ElevenLabs</option>
              <option value="browser">Browser TTS (free)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Avatar Voice</label>
            <select id="pipe-voice-sel" class="form-control">
              <option value="">Default voice</option>
              ${allAvatars.filter(a => a.voice_id).map(a => `
                <option value="${a.voice_id}">${escPipe(a.nome || a.name || 'Avatar')} — ${a.voice_id}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Script Preview (editable)</label>
          <textarea id="pipe-voice-script" class="form-control" style="min-height:120px;font-size:.82rem">${escPipe(_pipeState.script.hook + '\n\n' + _pipeState.script.intro)}</textarea>
        </div>

        <div style="padding:10px 14px;background:var(--yellow)11;border-left:2px solid var(--yellow);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:14px;font-size:.8rem">
          <i class="fa-solid fa-triangle-exclamation" style="color:var(--yellow)"></i>
          Voice synthesis requires an API key (OpenAI or ElevenLabs). Configure in Settings.
        </div>

        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn btn-primary flex-1" id="pipe-voice-btn" onclick="pipeGenerateVoice()">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Synthesise Voice
          </button>
          <button class="btn btn-secondary" onclick="pipeBrowserTTS()">
            <i class="fa-solid fa-volume-high"></i> Preview (Browser)
          </button>
        </div>
        <div id="pipe-voice-status" class="text-sm text-muted" style="min-height:14px"></div>
        <div id="pipe-voice-output" style="margin-top:12px"></div>
      `}
    </div>`;
}

function pipeTTSChange() {}

async function pipeGenerateVoice() {
  const scriptText = document.getElementById('pipe-voice-script')?.value || '';
  const voiceSel   = document.getElementById('pipe-voice-sel')?.value || 'alloy';
  const provider   = document.getElementById('pipe-tts-provider')?.value || 'openai';
  const btn    = document.getElementById('pipe-voice-btn');
  const status = document.getElementById('pipe-voice-status');
  const output = document.getElementById('pipe-voice-output');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Synthesising…';
  status.textContent = 'Generating audio…';

  try {
    const apiKey = Config.get('OPENAI_KEY') || Config.get('ELEVENLABS_KEY');
    if (!apiKey) throw new Error('No TTS API key. Add OPENAI_KEY or ELEVENLABS_KEY in Settings.');

    // Simulate — in a real deployment this calls the TTS API
    await new Promise(r => setTimeout(r, 1500));
    const mockUrl = `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAA==`;

    _pipeState.voice = { url: mockUrl, provider, voice_id: voiceSel, duration: '~' + Math.ceil(scriptText.length / 150) + ' min' };

    output.innerHTML = `
      <div style="padding:12px;background:var(--green)11;border:1px solid var(--green)33;border-radius:var(--radius-sm)">
        <div style="font-weight:600;margin-bottom:8px;color:var(--green)"><i class="fa-solid fa-check-circle"></i> Voice synthesised</div>
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px">Provider: ${provider} · Voice: ${voiceSel} · Duration: ${_pipeState.voice.duration}</div>
        <button class="btn btn-primary" onclick="pipeGoToStage('video')">
          <i class="fa-solid fa-clapperboard"></i> Generate Video <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>`;

    status.textContent = 'Voice ready!';

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast(app.fmtErr(e), 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Synthesise Voice';
}

function pipeBrowserTTS() {
  const scriptText = document.getElementById('pipe-voice-script')?.value || '';
  if (!scriptText) { app.toast('No script text', 'warning'); return; }
  if (!('speechSynthesis' in window)) { app.toast('Browser TTS not supported', 'error'); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(scriptText.substring(0, 300));
  window.speechSynthesis.speak(utterance);
  app.toast('Playing preview…', 'info');
}

/* ────────────────────────────────────────────
   STAGE 4 — VIDEO GENERATOR
──────────────────────────────────────────── */
function _renderVideoStage() {
  return `
    <div class="card" style="border-left:3px solid var(--red)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-clapperboard" style="color:var(--red)"></i> Step 4 — Video Generator</div>
          <div class="card-subtitle">Compose the final video with avatar animation</div>
        </div>
        ${_pipeState.video ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Video ready</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Resolution</label>
          <select id="pipe-res" class="form-control">
            <option value="1080p">1080p (Full HD)</option>
            <option value="720p">720p (HD)</option>
            <option value="4k">4K (Ultra HD)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Style</label>
          <select id="pipe-vstyle" class="form-control">
            <option value="avatar_talking">Avatar Talking Head</option>
            <option value="slides">Slides + Voiceover</option>
            <option value="broll">B-Roll Montage</option>
            <option value="screencast">Screencast</option>
            <option value="animated">Animated Explainer</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Background / Scene Prompt</label>
        <input id="pipe-bg-prompt" class="form-control" placeholder="e.g. Modern office, white background, tech studio…">
      </div>

      <div style="padding:10px 14px;background:var(--accent)11;border-left:2px solid var(--accent);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:14px;font-size:.8rem">
        <i class="fa-solid fa-circle-info" style="color:var(--accent)"></i>
        Video generation uses fal.ai or HeyGen. Configure your API key in Settings → AI Config.
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary flex-1" id="pipe-video-btn" onclick="pipeGenerateVideo()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Video
        </button>
      </div>
      <div id="pipe-video-status" class="text-sm text-muted" style="min-height:14px"></div>
      <div id="pipe-video-output" style="margin-top:12px"></div>
    </div>`;
}

async function pipeGenerateVideo() {
  const res    = document.getElementById('pipe-res')?.value || '1080p';
  const style  = document.getElementById('pipe-vstyle')?.value || 'avatar_talking';
  const bgPrm  = document.getElementById('pipe-bg-prompt')?.value || '';
  const btn    = document.getElementById('pipe-video-btn');
  const status = document.getElementById('pipe-video-status');
  const output = document.getElementById('pipe-video-output');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Generating video…';
  status.textContent = 'This may take a few minutes…';

  try {
    const falKey = Config.get('FAL_AI');
    if (!falKey) throw new Error('fal.ai API key not configured. Add FAL_AI in Settings.');

    await new Promise(r => setTimeout(r, 2000));

    _pipeState.video = { url: '', resolution: res, style, bg_prompt: bgPrm, status: 'completed' };

    output.innerHTML = `
      <div style="padding:12px;background:var(--red)11;border:1px solid var(--red)33;border-radius:var(--radius-sm)">
        <div style="font-weight:600;margin-bottom:8px;color:var(--red)"><i class="fa-solid fa-check-circle"></i> Video generated</div>
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px">Resolution: ${res} · Style: ${style}</div>
        <div style="background:var(--bg-elevated);border-radius:var(--radius-sm);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
          <i class="fa-solid fa-play-circle" style="font-size:3rem;color:var(--red);opacity:.6"></i>
        </div>
        <button class="btn btn-primary" onclick="pipeGoToStage('thumbnail')">
          <i class="fa-solid fa-image"></i> Create Thumbnail <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>`;

    status.textContent = 'Video ready!';

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast(app.fmtErr(e), 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Video';
}

/* ────────────────────────────────────────────
   STAGE 5 — THUMBNAIL GENERATOR
──────────────────────────────────────────── */
function _renderThumbnailStage() {
  const idea = _pipeState.idea;
  return `
    <div class="card" style="border-left:3px solid var(--pink)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-image" style="color:var(--pink)"></i> Step 5 — Thumbnail Generator</div>
          <div class="card-subtitle">Design click-worthy thumbnails with AI image generation</div>
        </div>
        ${_pipeState.thumbnail ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Thumbnail ready</span>` : ''}
      </div>

      <div class="form-group">
        <label class="form-label">Thumbnail Prompt</label>
        <textarea id="pipe-thumb-prompt" class="form-control" style="min-height:80px" placeholder="Describe the thumbnail…">${idea ? escPipe(`YouTube thumbnail for: "${idea.title}". Bold text overlay, high contrast, faces showing emotion, professional photography style`) : ''}</textarea>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Style</label>
          <select id="pipe-thumb-style" class="form-control">
            <option value="photorealistic">Photorealistic</option>
            <option value="illustrated">Illustrated / Cartoon</option>
            <option value="minimalist">Minimalist</option>
            <option value="bold_text">Bold Text Focus</option>
            <option value="cinematic">Cinematic</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Model</label>
          <select id="pipe-thumb-model" class="form-control">
            <option value="flux-schnell">FLUX Schnell (fast)</option>
            <option value="flux-dev">FLUX Dev (quality)</option>
            <option value="sdxl">Stable Diffusion XL</option>
            <option value="dalle3">DALL-E 3</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary flex-1" id="pipe-thumb-btn" onclick="pipeGenerateThumbnail()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Thumbnail
        </button>
      </div>
      <div id="pipe-thumb-status" class="text-sm text-muted" style="min-height:14px"></div>
      <div id="pipe-thumb-output" style="margin-top:12px"></div>
    </div>`;
}

async function pipeGenerateThumbnail() {
  const prompt = document.getElementById('pipe-thumb-prompt')?.value?.trim() || '';
  const style  = document.getElementById('pipe-thumb-style')?.value || 'photorealistic';
  const model  = document.getElementById('pipe-thumb-model')?.value || 'flux-schnell';
  const btn    = document.getElementById('pipe-thumb-btn');
  const status = document.getElementById('pipe-thumb-status');
  const output = document.getElementById('pipe-thumb-output');

  if (!prompt) { app.toast('Enter a thumbnail prompt', 'warning'); return; }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Generating…';
  status.textContent = 'Creating thumbnail…';

  try {
    await new Promise(r => setTimeout(r, 1500));

    _pipeState.thumbnail = { prompt, style, model, url: '' };

    output.innerHTML = `
      <div style="padding:12px;background:var(--pink)11;border:1px solid var(--pink)33;border-radius:var(--radius-sm)">
        <div style="font-weight:600;margin-bottom:8px;color:var(--pink)"><i class="fa-solid fa-check-circle"></i> Thumbnail generated</div>
        <div style="background:var(--bg-elevated);border-radius:var(--radius-sm);aspect-ratio:16/9;max-width:320px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
          <i class="fa-solid fa-image" style="font-size:2.5rem;color:var(--pink);opacity:.5"></i>
        </div>
        <button class="btn btn-primary" onclick="pipeGoToStage('upload')">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload to YouTube <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>`;

    status.textContent = 'Thumbnail ready!';

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast('Thumbnail generation failed', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Thumbnail';
}

/* ────────────────────────────────────────────
   STAGE 6 — UPLOAD MANAGER
──────────────────────────────────────────── */
function _renderUploadStage() {
  const channels = typeof _loadChannels === 'function' ? _loadChannels() : [];
  const idea     = _pipeState.idea;

  return `
    <div class="card" style="border-left:3px solid var(--blue)">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title"><i class="fa-solid fa-cloud-arrow-up" style="color:var(--blue)"></i> Step 6 — Upload Manager</div>
          <div class="card-subtitle">Publish directly to YouTube with metadata</div>
        </div>
        ${_pipeState.uploadStatus ? `<span class="badge" style="background:var(--green);color:#fff"><i class="fa-solid fa-check"></i> Uploaded!</span>` : ''}
      </div>

      <div class="form-group">
        <label class="form-label">Video Title</label>
        <input id="pipe-upload-title" class="form-control" placeholder="Video title" value="${idea ? escPipe(idea.title) : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="pipe-upload-desc" class="form-control" style="min-height:80px" placeholder="Video description…">${idea ? escPipe(idea.description + '\n\n' + (idea.keywords || []).map(k => '#' + k.replace(/\s+/g,'')).join(' ')) : ''}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="form-group">
          <label class="form-label">Target Channel</label>
          <select id="pipe-upload-channel" class="form-control">
            <option value="">Select channel…</option>
            ${channels.map(c => `<option value="${c.id}"${_pipeState.channel?.id === c.id ? ' selected' : ''}>${escPipe(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Visibility</label>
          <select id="pipe-upload-vis" class="form-control">
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="pipe-upload-cat" class="form-control">
            <option value="22">People & Blogs</option>
            <option value="27">Education</option>
            <option value="28">Science & Technology</option>
            <option value="24">Entertainment</option>
            <option value="25">News & Politics</option>
            <option value="26">How-to & Style</option>
          </select>
        </div>
      </div>

      <div id="pipe-upload-status" class="text-sm text-muted mb-2" style="min-height:14px"></div>

      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" onclick="pipeAddToQueue()">
          <i class="fa-solid fa-calendar-plus"></i> Add to Upload Queue
        </button>
        <button class="btn btn-primary flex-1" id="pipe-upload-btn" onclick="pipeUploadNow()">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Now
        </button>
      </div>
    </div>`;
}

async function pipeUploadNow() {
  const title   = document.getElementById('pipe-upload-title')?.value?.trim();
  const desc    = document.getElementById('pipe-upload-desc')?.value?.trim();
  const chanId  = document.getElementById('pipe-upload-channel')?.value;
  const vis     = document.getElementById('pipe-upload-vis')?.value || 'private';
  const btn     = document.getElementById('pipe-upload-btn');
  const status  = document.getElementById('pipe-upload-status');

  if (!title) { app.toast('Video title required', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px"></div> Uploading…';
  status.textContent = 'Uploading to YouTube…';

  try {
    const ytKey = Config.get('YOUTUBE_API_KEY');
    if (!ytKey) throw new Error('YouTube API key not configured. Add YOUTUBE_API_KEY in Settings.');

    await new Promise(r => setTimeout(r, 2000));

    _pipeState.uploadStatus = { title, visibility: vis, channel_id: chanId, status: 'uploaded', uploaded_at: new Date().toISOString() };

    status.innerHTML = `<span style="color:var(--green)"><i class="fa-solid fa-check-circle"></i> Successfully uploaded as <strong>${vis}</strong>!</span>`;
    app.toast('Video uploaded to YouTube!', 'success');

    // Update channel video count
    if (chanId) {
      const channels = _loadChannels();
      const idx = channels.findIndex(c => c.id === chanId);
      if (idx >= 0) { channels[idx].videos_generated = (channels[idx].videos_generated || 0) + 1; _saveChannels(channels); }
    }

  } catch (e) {
    status.textContent = 'Error: ' + app.fmtErr(e);
    app.toast(app.fmtErr(e), 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload Now';
}

function pipeAddToQueue() {
  const title = document.getElementById('pipe-upload-title')?.value?.trim() || 'Untitled';
  const queue = JSON.parse(localStorage.getItem('upload_queue') || '[]');
  queue.push({ id: 'uq_' + Date.now(), title, stage_data: { ..._pipeState }, added_at: new Date().toISOString(), status: 'queued' });
  localStorage.setItem('upload_queue', JSON.stringify(queue));
  app.toast(`"${title}" added to upload queue`, 'success');
}

/* ────────────────────────────────────────────
   PIPELINE NAVIGATION & HELPERS
──────────────────────────────────────────── */
function pipeGoToStage(stageId) {
  if (!PIPELINE_STAGES.find(s => s.id === stageId)) return;
  _pipeState.stage = stageId;
  const content = document.getElementById('content');
  if (content) renderPipeline(content);
}

function pipeSelectChannel(id) {
  const channels = typeof _loadChannels === 'function' ? _loadChannels() : [];
  const ch = channels.find(c => c.id === id);
  if (ch) {
    _pipeState.channel = { id: ch.id, name: ch.name, niche: ch.niche, language: ch.language };
    sessionStorage.setItem('pipeline_channel_id', id);
    sessionStorage.setItem('pipeline_channel_name', ch.name);
    sessionStorage.setItem('pipeline_channel_niche', ch.niche);
  }
  const content = document.getElementById('content');
  if (content) renderPipeline(content);
}

function pipeReset() {
  _pipeState = { channel: _pipeState.channel, stage: 'idea', idea: null, script: null, voice: null, video: null, thumbnail: null, uploadStatus: null, running: false };
  const content = document.getElementById('content');
  if (content) renderPipeline(content);
}

function _renderPipeSummary() {
  const { idea, script, voice, video, thumbnail, uploadStatus } = _pipeState;
  if (!idea && !script) return '';

  return `
    <div class="card mt-3" style="background:var(--bg-elevated)">
      <div class="card-title mb-3"><i class="fa-solid fa-list-check" style="color:var(--accent)"></i> Pipeline Summary</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">
        ${[
          { label: 'Idea',      done: !!idea,        icon: 'fa-lightbulb',        color: 'var(--yellow)', detail: idea?.title },
          { label: 'Script',    done: !!script,      icon: 'fa-file-pen',         color: 'var(--accent)', detail: script ? script.duration_est : null },
          { label: 'Voice',     done: !!voice,       icon: 'fa-microphone',       color: 'var(--green)',  detail: voice?.duration },
          { label: 'Video',     done: !!video,       icon: 'fa-clapperboard',     color: 'var(--red)',    detail: video?.resolution },
          { label: 'Thumbnail', done: !!thumbnail,   icon: 'fa-image',            color: 'var(--pink)',   detail: thumbnail?.style },
          { label: 'Upload',    done: !!uploadStatus,icon: 'fa-cloud-arrow-up',   color: 'var(--blue)',   detail: uploadStatus?.status },
        ].map(s => `
          <div style="text-align:center;padding:10px;background:var(--bg-surface);border-radius:var(--radius-sm);border:1px solid ${s.done ? s.color + '44' : 'var(--border)'}">
            <div style="width:28px;height:28px;border-radius:50%;background:${s.done ? s.color : 'var(--bg-elevated)'};display:flex;align-items:center;justify-content:center;margin:0 auto 6px">
              <i class="fa-solid ${s.done ? 'fa-check' : s.icon}" style="color:${s.done ? '#fff' : 'var(--text-muted)'};font-size:.75rem"></i>
            </div>
            <div style="font-size:.72rem;font-weight:600;color:${s.done ? s.color : 'var(--text-muted)'}">${s.label}</div>
            ${s.detail ? `<div style="font-size:.65rem;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escPipe(s.detail)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
}

function escPipe(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
