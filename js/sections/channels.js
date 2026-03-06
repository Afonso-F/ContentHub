/* ============================================================
   sections/channels.js — Channel Management (AI YouTube Factory)
   Up to 50 automated channels with per-channel pipeline config
   ============================================================ */

const CHANNEL_NICHES = [
  'Finance & Investing','Health & Wellness','Technology','Gaming','Education',
  'Travel','Food & Cooking','Fitness','Beauty & Fashion','Entertainment',
  'Business & Marketing','Productivity','Science','History','Sports',
  'Self-Improvement','Parenting','Pets','DIY & Crafts','Music',
  'Comedy','True Crime','Politics','Spirituality','Language Learning',
];

const CHANNEL_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
];

const MONETIZATION_TYPES = [
  { id: 'adsense',     label: 'AdSense',          icon: 'fa-dollar-sign',  color: 'var(--green)' },
  { id: 'sponsorship', label: 'Sponsorships',      icon: 'fa-handshake',   color: 'var(--accent)' },
  { id: 'affiliate',   label: 'Affiliate Links',   icon: 'fa-link',        color: 'var(--blue)' },
  { id: 'products',    label: 'Own Products',       icon: 'fa-bag-shopping',color: 'var(--pink)' },
  { id: 'memberships', label: 'Memberships',        icon: 'fa-crown',       color: 'var(--yellow)' },
  { id: 'mixed',       label: 'Mixed Strategy',     icon: 'fa-layer-group', color: 'var(--purple)' },
];

const UPLOAD_FREQUENCIES = [
  { id: '1d',  label: '1 video/day' },
  { id: '3w',  label: '3 videos/week' },
  { id: '1w',  label: '1 video/week' },
  { id: '2m',  label: '2 videos/month' },
  { id: '1m',  label: '1 video/month' },
];

// In-memory channel store (backed by localStorage for persistence)
const CHANNELS_KEY = 'yt_factory_channels';

function _loadChannels() {
  try {
    const raw = localStorage.getItem(CHANNELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _saveChannels(channels) {
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
}

function _genId() {
  return 'ch_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderChannels(container) {
  const channels = _loadChannels();
  const totalRevenue = channels.reduce((s, c) => s + (parseFloat(c.monthly_revenue) || 0), 0);
  const totalViews   = channels.reduce((s, c) => s + (parseInt(c.total_views) || 0), 0);
  const activeCount  = channels.filter(c => c.status === 'active').length;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Channels</div>
        <div class="section-subtitle">AI YouTube Factory — manage up to 50 automated channels</div>
      </div>
      <button class="btn btn-primary" onclick="openChannelModal(null)">
        <i class="fa-solid fa-plus"></i> New Channel
      </button>
    </div>

    ${channels.length > 0 ? `
    <!-- KPIs -->
    <div class="grid-4 mb-3">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--red-soft)"><i class="fa-brands fa-youtube" style="color:var(--red)"></i></div>
        <div class="stat-value">${channels.length}<span style="font-size:.8rem;color:var(--text-muted)">/50</span></div>
        <div class="stat-label">Total Channels</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--green-soft)"><i class="fa-solid fa-circle-play" style="color:var(--green)"></i></div>
        <div class="stat-value">${activeCount}</div>
        <div class="stat-label">Active Channels</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-eye" style="color:var(--accent)"></i></div>
        <div class="stat-value">${app.formatNumber(totalViews)}</div>
        <div class="stat-label">Total Views</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--yellow-soft)"><i class="fa-solid fa-dollar-sign" style="color:var(--yellow)"></i></div>
        <div class="stat-value">$${totalRevenue.toFixed(0)}</div>
        <div class="stat-label">Est. Monthly Revenue</div>
      </div>
    </div>

    <!-- Channel Grid -->
    <div class="grid-auto" id="channels-grid">
      ${channels.map(ch => _renderChannelCard(ch)).join('')}
    </div>

    <!-- Capacity bar -->
    <div class="card mt-3" style="padding:12px 16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:.85rem;font-weight:600">Factory Capacity</span>
        <span style="font-size:.8rem;color:var(--text-muted)">${channels.length} / 50 channels</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${(channels.length/50)*100}%;background:${channels.length >= 45 ? 'var(--red)' : channels.length >= 30 ? 'var(--yellow)' : 'var(--green)'}"></div>
      </div>
    </div>
    ` : `
    <div class="empty-state" style="padding:80px 20px">
      <i class="fa-brands fa-youtube" style="font-size:3rem;color:var(--border);margin-bottom:16px"></i>
      <p style="font-size:1.2rem;font-weight:700;margin-bottom:8px">No channels yet</p>
      <p class="text-muted" style="margin-bottom:24px">Create your first automated YouTube channel to start the AI content factory</p>
      <button class="btn btn-primary" onclick="openChannelModal(null)">
        <i class="fa-solid fa-plus"></i> Create First Channel
      </button>
    </div>`}
  `;
}

function _renderChannelCard(ch) {
  const mon  = MONETIZATION_TYPES.find(m => m.id === ch.monetization_type) || MONETIZATION_TYPES[0];
  const freq = UPLOAD_FREQUENCIES.find(f => f.id === ch.upload_frequency) || { label: ch.upload_frequency };
  const statusColor = ch.status === 'active' ? 'var(--green)' : ch.status === 'paused' ? 'var(--yellow)' : 'var(--text-muted)';
  const statusLabel = ch.status === 'active' ? 'Active' : ch.status === 'paused' ? 'Paused' : 'Setup';

  return `
    <div class="card card-hover" style="position:relative;overflow:hidden">
      <!-- Status ribbon -->
      <div style="position:absolute;top:0;right:0;background:${statusColor};color:#fff;font-size:.65rem;font-weight:700;padding:2px 10px;border-radius:0 var(--radius-sm) 0 var(--radius-sm);text-transform:uppercase;letter-spacing:.05em">${statusLabel}</div>

      <!-- Channel header -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-right:48px">
        <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--accent));display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fa-brands fa-youtube" style="color:#fff;font-size:1.1rem"></i>
        </div>
        <div style="min-width:0">
          <div style="font-weight:700;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escCh(ch.name)}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${escCh(ch.niche)}</div>
        </div>
      </div>

      <!-- Meta row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="font-size:.75rem">
          <div style="color:var(--text-muted);margin-bottom:2px">Language</div>
          <div style="font-weight:600">${_langLabel(ch.language)}</div>
        </div>
        <div style="font-size:.75rem">
          <div style="color:var(--text-muted);margin-bottom:2px">Upload Freq.</div>
          <div style="font-weight:600">${freq.label}</div>
        </div>
        <div style="font-size:.75rem">
          <div style="color:var(--text-muted);margin-bottom:2px">Shorts/day</div>
          <div style="font-weight:600">${ch.shorts_per_day || 0}/day</div>
        </div>
        <div style="font-size:.75rem">
          <div style="color:var(--text-muted);margin-bottom:2px">Monetization</div>
          <div style="font-weight:600;color:${mon.color}"><i class="fa-solid ${mon.icon}"></i> ${mon.label}</div>
        </div>
      </div>

      <!-- Avatar host -->
      ${ch.avatar_host_name ? `
        <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--bg-elevated);border-radius:var(--radius-sm);margin-bottom:10px;font-size:.75rem">
          <i class="fa-solid fa-masks-theater" style="color:var(--accent)"></i>
          <span style="color:var(--text-muted)">Host:</span>
          <span style="font-weight:600">${escCh(ch.avatar_host_name)}</span>
        </div>` : ''}

      <!-- Stats row -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:12px">
        <div style="text-align:center;padding:6px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
          <div style="font-size:.8rem;font-weight:700;color:var(--red)">${app.formatNumber(ch.total_views || 0)}</div>
          <div style="font-size:.65rem;color:var(--text-muted)">Views</div>
        </div>
        <div style="text-align:center;padding:6px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
          <div style="font-size:.8rem;font-weight:700;color:var(--green)">$${parseFloat(ch.monthly_revenue || 0).toFixed(0)}</div>
          <div style="font-size:.65rem;color:var(--text-muted)">Revenue/mo</div>
        </div>
        <div style="text-align:center;padding:6px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
          <div style="font-size:.8rem;font-weight:700;color:var(--accent)">${ch.videos_generated || 0}</div>
          <div style="font-size:.65rem;color:var(--text-muted)">Videos</div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm btn-primary flex-1" onclick="openChannelPipeline('${ch.id}')">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate
        </button>
        <button class="btn btn-sm btn-secondary" onclick="openChannelModal('${ch.id}')" title="Edit">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-secondary" onclick="toggleChannelStatus('${ch.id}')" title="${ch.status === 'active' ? 'Pause' : 'Activate'}">
          <i class="fa-solid fa-${ch.status === 'active' ? 'pause' : 'play'}"></i>
        </button>
        <button class="btn btn-sm btn-secondary" onclick="deleteChannel('${ch.id}')" title="Delete" style="color:var(--red)">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
}

function _langLabel(code) {
  const l = CHANNEL_LANGUAGES.find(l => l.code === code);
  return l ? l.label : (code || '—');
}

function escCh(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ══════════════════════════════════════════════════════════════
   MODAL — Create / Edit Channel
══════════════════════════════════════════════════════════════ */
function openChannelModal(id) {
  const channels = _loadChannels();
  const ch = id ? channels.find(c => c.id === id) : null;

  // Load avatars for host selection
  const avatares = app.getAvatares ? app.getAvatares() : [];

  const isEdit = !!ch;

  const body = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group">
        <label class="form-label">Channel Name *</label>
        <input id="ch-name" class="form-control" placeholder="e.g. Finance Mastery Daily" value="${escCh(ch?.name || '')}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Niche *</label>
          <select id="ch-niche" class="form-control">
            ${CHANNEL_NICHES.map(n => `<option value="${escCh(n)}"${ch?.niche === n ? ' selected' : ''}>${escCh(n)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Language</label>
          <select id="ch-lang" class="form-control">
            ${CHANNEL_LANGUAGES.map(l => `<option value="${l.code}"${ch?.language === l.code ? ' selected' : ''}>${l.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">AI Avatar Host</label>
        <select id="ch-avatar" class="form-control">
          <option value="">No host (text-only)</option>
          ${avatares.map(a => `<option value="${a.id}"${ch?.avatar_host === String(a.id) ? ' selected' : ''}>${escCh(a.nome || a.name || 'Avatar')}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Upload Frequency</label>
          <select id="ch-freq" class="form-control">
            ${UPLOAD_FREQUENCIES.map(f => `<option value="${f.id}"${ch?.upload_frequency === f.id ? ' selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Shorts Per Day</label>
          <input id="ch-shorts" class="form-control" type="number" min="0" max="20" placeholder="0" value="${ch?.shorts_per_day || 0}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Monetization Strategy</label>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px" id="ch-mon-grid">
          ${MONETIZATION_TYPES.map(m => `
            <label style="display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.8rem;${ch?.monetization_type === m.id ? 'border-color:'+m.color+';background:'+m.color+'11' : ''}">
              <input type="radio" name="ch-mon" value="${m.id}" ${ch?.monetization_type === m.id || (!ch && m.id === 'adsense') ? 'checked' : ''} style="accent-color:${m.color}">
              <i class="fa-solid ${m.icon}" style="color:${m.color}"></i> ${m.label}
            </label>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Total Views (current)</label>
          <input id="ch-views" class="form-control" type="number" min="0" placeholder="0" value="${ch?.total_views || 0}">
        </div>
        <div class="form-group">
          <label class="form-label">Monthly Revenue ($)</label>
          <input id="ch-revenue" class="form-control" type="number" min="0" step="0.01" placeholder="0.00" value="${ch?.monthly_revenue || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">YouTube Channel URL</label>
        <input id="ch-url" class="form-control" type="url" placeholder="https://youtube.com/@channel" value="${escCh(ch?.url || '')}">
      </div>
    </div>`;

  const footer = `
    ${isEdit ? `<button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>` : ''}
    <button class="btn btn-primary" onclick="saveChannel('${id || ''}')">
      <i class="fa-solid fa-${isEdit ? 'floppy-disk' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Create Channel'}
    </button>`;

  app.openModal(isEdit ? `Edit Channel — ${ch.name}` : 'New Channel', body, footer);
}

function saveChannel(id) {
  const name   = document.getElementById('ch-name')?.value?.trim();
  const niche  = document.getElementById('ch-niche')?.value;
  const lang   = document.getElementById('ch-lang')?.value;
  const avatar = document.getElementById('ch-avatar')?.value;
  const freq   = document.getElementById('ch-freq')?.value;
  const shorts = parseInt(document.getElementById('ch-shorts')?.value) || 0;
  const mon    = document.querySelector('input[name="ch-mon"]:checked')?.value || 'adsense';
  const views  = parseInt(document.getElementById('ch-views')?.value) || 0;
  const rev    = parseFloat(document.getElementById('ch-revenue')?.value) || 0;
  const url    = document.getElementById('ch-url')?.value?.trim();

  if (!name) { app.toast('Channel name is required', 'error'); return; }

  const channels = _loadChannels();
  const avatares = app.getAvatares ? app.getAvatares() : [];
  const avatarObj = avatares.find(a => String(a.id) === String(avatar));

  if (id) {
    const idx = channels.findIndex(c => c.id === id);
    if (idx >= 0) {
      channels[idx] = { ...channels[idx], name, niche, language: lang, avatar_host: avatar, avatar_host_name: avatarObj?.nome || avatarObj?.name || '', upload_frequency: freq, shorts_per_day: shorts, monetization_type: mon, total_views: views, monthly_revenue: rev, url, updated_at: new Date().toISOString() };
    }
  } else {
    if (channels.length >= 50) { app.toast('Factory limit: 50 channels maximum', 'error'); return; }
    channels.push({ id: _genId(), name, niche, language: lang, avatar_host: avatar, avatar_host_name: avatarObj?.nome || avatarObj?.name || '', upload_frequency: freq, shorts_per_day: shorts, monetization_type: mon, total_views: views, monthly_revenue: rev, url, status: 'setup', videos_generated: 0, created_at: new Date().toISOString() });
  }

  _saveChannels(channels);
  app.closeModal();
  app.toast(id ? 'Channel updated!' : 'Channel created!', 'success');

  const content = document.getElementById('content');
  if (content) renderChannels(content);
}

function toggleChannelStatus(id) {
  const channels = _loadChannels();
  const idx = channels.findIndex(c => c.id === id);
  if (idx < 0) return;
  const next = channels[idx].status === 'active' ? 'paused' : 'active';
  channels[idx].status = next;
  _saveChannels(channels);
  app.toast(`Channel ${next}`, 'success');
  const content = document.getElementById('content');
  if (content) renderChannels(content);
}

function deleteChannel(id) {
  const channels = _loadChannels();
  const ch = channels.find(c => c.id === id);
  if (!ch) return;
  app.openModal(
    'Delete Channel',
    `<p>Delete <strong>${escCh(ch.name)}</strong>? This cannot be undone.</p>`,
    `<button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
     <button class="btn btn-primary" style="background:var(--red);border-color:var(--red)" onclick="confirmDeleteChannel('${id}')">Delete</button>`
  );
}

function confirmDeleteChannel(id) {
  const channels = _loadChannels().filter(c => c.id !== id);
  _saveChannels(channels);
  app.closeModal();
  app.toast('Channel deleted', 'info');
  const content = document.getElementById('content');
  if (content) renderChannels(content);
}

function openChannelPipeline(id) {
  const channels = _loadChannels();
  const ch = channels.find(c => c.id === id);
  if (!ch) return;
  // Store selected channel and navigate to pipeline
  sessionStorage.setItem('pipeline_channel_id', id);
  sessionStorage.setItem('pipeline_channel_name', ch.name);
  sessionStorage.setItem('pipeline_channel_niche', ch.niche);
  app.navigate('pipeline');
}

// Expose channels loader globally so other sections can use it
window._loadChannels = _loadChannels;
