/* ============================================================
   sections/scheduler.js — Automation Scheduler
   Manage daily_jobs, hourly_jobs, upload_queue per channel
   ============================================================ */

const SCHED_JOB_TYPES = [
  { id: 'generate_video',    label: 'Generate Video',       icon: 'fa-clapperboard',     color: 'var(--red)' },
  { id: 'generate_short',    label: 'Generate Short',       icon: 'fa-mobile-screen',    color: 'var(--pink)' },
  { id: 'generate_podcast',  label: 'Generate Podcast',     icon: 'fa-microphone',       color: 'var(--green)' },
  { id: 'upload_video',      label: 'Upload Video',         icon: 'fa-cloud-arrow-up',   color: 'var(--blue)' },
  { id: 'generate_ideas',    label: 'Generate Ideas',       icon: 'fa-lightbulb',        color: 'var(--yellow)' },
  { id: 'generate_script',   label: 'Generate Script',      icon: 'fa-file-pen',         color: 'var(--accent)' },
  { id: 'generate_thumbnail','label': 'Generate Thumbnail', icon: 'fa-image',            color: 'var(--purple)' },
];

const SCHED_FREQUENCIES = [
  { id: 'hourly',  label: 'Every hour',     cron: '0 * * * *'     },
  { id: '4h',      label: 'Every 4 hours',  cron: '0 */4 * * *'   },
  { id: '6h',      label: 'Every 6 hours',  cron: '0 */6 * * *'   },
  { id: '12h',     label: 'Every 12 hours', cron: '0 */12 * * *'  },
  { id: 'daily',   label: 'Daily',          cron: '0 9 * * *'     },
  { id: 'weekly',  label: 'Weekly',         cron: '0 9 * * 1'     },
];

const SCHED_KEY  = 'yt_factory_schedules';
const QUEUE_KEY  = 'upload_queue';

function _loadSchedules() {
  try { return JSON.parse(localStorage.getItem(SCHED_KEY) || '[]'); }
  catch { return []; }
}

function _saveSchedules(list) {
  localStorage.setItem(SCHED_KEY, JSON.stringify(list));
}

function _loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

function _saveQueue(list) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
}

function _schedGenId() {
  return 'sj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderScheduler(container) {
  const schedules = _loadSchedules();
  const queue     = _loadQueue();
  const channels  = typeof _loadChannels === 'function' ? _loadChannels() : [];

  const activeJobs   = schedules.filter(s => s.enabled);
  const dailyJobs    = schedules.filter(s => s.frequency === 'daily' || s.frequency === '12h');
  const hourlyJobs   = schedules.filter(s => s.frequency === 'hourly' || s.frequency === '4h' || s.frequency === '6h');
  const queuePending = queue.filter(q => q.status === 'queued').length;
  const queueDone    = queue.filter(q => q.status === 'done').length;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Automation Scheduler</div>
        <div class="section-subtitle">Configure automatic pipeline execution per channel</div>
      </div>
      <button class="btn btn-primary" onclick="openSchedulerJobModal(null)">
        <i class="fa-solid fa-plus"></i> Add Job
      </button>
    </div>

    <!-- Overview KPIs -->
    <div class="grid-4 mb-3">
      <div class="stat-card" style="cursor:pointer" onclick="schedScrollTo('daily')">
        <div class="stat-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-sun" style="color:var(--accent)"></i></div>
        <div class="stat-value">${dailyJobs.length}</div>
        <div class="stat-label">Daily Jobs</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="schedScrollTo('hourly')">
        <div class="stat-icon" style="background:var(--yellow-soft)"><i class="fa-solid fa-clock" style="color:var(--yellow)"></i></div>
        <div class="stat-value">${hourlyJobs.length}</div>
        <div class="stat-label">Hourly Jobs</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="schedScrollTo('queue')">
        <div class="stat-icon" style="background:var(--blue-soft,var(--accent-soft))"><i class="fa-solid fa-list" style="color:var(--blue)"></i></div>
        <div class="stat-value">${queuePending}</div>
        <div class="stat-label">In Queue</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--green-soft)"><i class="fa-solid fa-circle-check" style="color:var(--green)"></i></div>
        <div class="stat-value">${queueDone}</div>
        <div class="stat-label">Completed</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- LEFT: Job schedules -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Daily Jobs -->
        <div class="card" id="sched-daily">
          <div class="card-header" style="margin-bottom:12px">
            <div>
              <div class="card-title"><i class="fa-solid fa-sun" style="color:var(--accent)"></i> Daily Jobs</div>
              <div class="card-subtitle">Run once a day, auto-generates content</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="openSchedulerJobModal(null,'daily')">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          ${_renderJobList(dailyJobs, channels)}
        </div>

        <!-- Hourly Jobs -->
        <div class="card" id="sched-hourly">
          <div class="card-header" style="margin-bottom:12px">
            <div>
              <div class="card-title"><i class="fa-solid fa-clock" style="color:var(--yellow)"></i> Frequent Jobs</div>
              <div class="card-subtitle">Hourly, 4h or 6h intervals</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="openSchedulerJobModal(null,'hourly')">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          ${_renderJobList(hourlyJobs, channels)}
        </div>

        <!-- Channel schedules -->
        ${channels.length > 0 ? `
        <div class="card">
          <div class="card-header" style="margin-bottom:12px">
            <div>
              <div class="card-title"><i class="fa-brands fa-youtube" style="color:var(--red)"></i> Channel Schedules</div>
              <div class="card-subtitle">Per-channel automation config</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${channels.slice(0, 8).map(ch => {
              const chJobs = schedules.filter(s => s.channel_id === ch.id);
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
                  <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--accent));display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <i class="fa-brands fa-youtube" style="color:#fff;font-size:.75rem"></i>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:600;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escSched(ch.name)}</div>
                    <div style="font-size:.72rem;color:var(--text-muted)">${chJobs.length} jobs · ${ch.upload_frequency || '1/week'}</div>
                  </div>
                  <div style="display:flex;gap:4px;align-items:center">
                    ${chJobs.length > 0 ? `<span class="badge" style="background:var(--green)22;color:var(--green);font-size:.65rem">${chJobs.filter(j=>j.enabled).length} active</span>` : ''}
                    <button class="btn btn-sm btn-secondary" style="font-size:.7rem" onclick="openSchedulerJobModal(null,null,'${ch.id}')">
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- RIGHT: Upload queue -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card" id="sched-queue">
          <div class="card-header" style="margin-bottom:12px">
            <div>
              <div class="card-title"><i class="fa-solid fa-list" style="color:var(--blue)"></i> Upload Queue</div>
              <div class="card-subtitle">${queue.length} total items</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-secondary" onclick="schedClearCompleted()">Clear done</button>
              <button class="btn btn-sm btn-primary" onclick="schedRunQueue()">
                <i class="fa-solid fa-play"></i> Run Now
              </button>
            </div>
          </div>
          ${_renderUploadQueue(queue, channels)}
        </div>

        <!-- Next scheduled actions -->
        <div class="card">
          <div class="card-title mb-3"><i class="fa-solid fa-calendar-check" style="color:var(--green)"></i> Next Scheduled Actions</div>
          ${_renderNextActions(schedules, channels)}
        </div>

        <!-- System status -->
        <div class="card">
          <div class="card-title mb-3"><i class="fa-solid fa-circle-dot" style="color:var(--green)"></i> System Status</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${[
              { label: 'Scheduler',      status: 'running',  icon: 'fa-circle', color: 'var(--green)' },
              { label: 'AI Provider',    status: 'ready',    icon: 'fa-circle', color: 'var(--green)' },
              { label: 'Upload Worker',  status: 'idle',     icon: 'fa-circle', color: 'var(--yellow)' },
              { label: 'Video Renderer', status: 'idle',     icon: 'fa-circle', color: 'var(--yellow)' },
            ].map(s => `
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:.82rem">
                <span>${s.label}</span>
                <span style="color:${s.color};display:flex;align-items:center;gap:4px">
                  <i class="fa-solid ${s.icon}" style="font-size:.5rem"></i> ${s.status}
                </span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function _renderJobList(jobs, channels) {
  if (!jobs.length) {
    return `<div class="empty-state" style="padding:24px"><p class="text-muted text-sm">No jobs configured</p></div>`;
  }

  return `<div style="display:flex;flex-direction:column;gap:6px">
    ${jobs.map(job => {
      const jobType = SCHED_JOB_TYPES.find(t => t.id === job.type);
      const freq    = SCHED_FREQUENCIES.find(f => f.id === job.frequency);
      const ch      = channels.find(c => c.id === job.channel_id);
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid ${job.enabled ? 'var(--border)' : 'var(--border)'};border-radius:var(--radius-sm);opacity:${job.enabled ? '1' : '0.5'}">
          <div style="width:28px;height:28px;border-radius:50%;background:${jobType?.color||'var(--text-muted)'}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fa-solid ${jobType?.icon||'fa-gear'}" style="color:${jobType?.color||'var(--text-muted)'};font-size:.75rem"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.82rem;font-weight:600">${jobType?.label || job.type}</div>
            <div style="font-size:.7rem;color:var(--text-muted)">
              ${freq?.label || job.frequency}
              ${ch ? ` · ${ch.name}` : ''}
              ${job.time ? ` · ${job.time}` : ''}
            </div>
          </div>
          <label class="toggle-switch" title="${job.enabled ? 'Disable' : 'Enable'}">
            <input type="checkbox" ${job.enabled ? 'checked' : ''} onchange="schedToggleJob('${job.id}', this.checked)">
            <span class="toggle-slider"></span>
          </label>
          <button class="btn btn-sm btn-secondary" onclick="schedRunJobNow('${job.id}')" title="Run now">
            <i class="fa-solid fa-play" style="font-size:.7rem"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="schedDeleteJob('${job.id}')" title="Delete" style="color:var(--red)">
            <i class="fa-solid fa-trash" style="font-size:.7rem"></i>
          </button>
        </div>`;
    }).join('')}
  </div>`;
}

function _renderUploadQueue(queue, channels) {
  if (!queue.length) {
    return `<div class="empty-state" style="padding:24px"><p class="text-muted text-sm">Queue is empty</p></div>`;
  }

  const statusIcon  = { queued: 'fa-clock', running: 'fa-spinner fa-spin', done: 'fa-check-circle', failed: 'fa-times-circle' };
  const statusColor = { queued: 'var(--text-muted)', running: 'var(--accent)', done: 'var(--green)', failed: 'var(--red)' };

  return `
    <div style="display:flex;flex-direction:column;gap:4px;max-height:320px;overflow-y:auto">
      ${queue.slice(0, 30).map(item => {
        const ch = channels.find(c => c.id === item.channel_id);
        const st = item.status || 'queued';
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--radius-sm);background:var(--bg-elevated)">
            <i class="fa-solid ${statusIcon[st]}" style="color:${statusColor[st]};font-size:.75rem;flex-shrink:0;width:14px;text-align:center"></i>
            <div style="flex:1;min-width:0">
              <div style="font-size:.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escSched(item.title || 'Untitled')}</div>
              <div style="font-size:.65rem;color:var(--text-muted)">
                ${item.type ? `[${item.type}] ` : ''}
                ${item.scheduled_for || item.added_at ? (item.scheduled_for || item.added_at).substring(0,16) : ''}
                ${ch ? ` · ${ch.name}` : ''}
              </div>
            </div>
            ${st === 'queued' ? `
            <button class="btn btn-sm btn-secondary" style="font-size:.65rem;padding:2px 6px" onclick="schedRunQueueItem('${item.id}')">
              <i class="fa-solid fa-play"></i>
            </button>
            <button class="btn btn-sm btn-secondary" style="font-size:.65rem;padding:2px 6px;color:var(--red)" onclick="schedRemoveFromQueue('${item.id}')">
              <i class="fa-solid fa-xmark"></i>
            </button>` : ''}
          </div>`;
      }).join('')}
      ${queue.length > 30 ? `<div style="text-align:center;font-size:.75rem;color:var(--text-muted);padding:6px">…and ${queue.length - 30} more</div>` : ''}
    </div>`;
}

function _renderNextActions(schedules, channels) {
  const enabled = schedules.filter(s => s.enabled);
  if (!enabled.length) {
    return `<div class="empty-state" style="padding:16px"><p class="text-muted text-sm">No active schedules</p></div>`;
  }

  const now = new Date();
  const actions = enabled.slice(0, 6).map(job => {
    const jobType = SCHED_JOB_TYPES.find(t => t.id === job.type);
    const ch      = channels.find(c => c.id === job.channel_id);
    const next    = _calcNextRun(job, now);
    return { job, jobType, ch, next };
  }).sort((a, b) => a.next - b.next);

  return `
    <div style="display:flex;flex-direction:column;gap:6px">
      ${actions.map(({ job, jobType, ch, next }) => `
        <div style="display:flex;align-items:center;gap:8px;font-size:.78rem">
          <i class="fa-solid ${jobType?.icon||'fa-gear'}" style="color:${jobType?.color||'var(--text-muted)'};width:14px;text-align:center"></i>
          <div style="flex:1">
            <span style="font-weight:600">${jobType?.label || job.type}</span>
            ${ch ? `<span style="color:var(--text-muted)"> · ${escSched(ch.name)}</span>` : ''}
          </div>
          <span style="color:var(--text-muted)">${_formatNextRun(next)}</span>
        </div>`).join('')}
    </div>`;
}

function _calcNextRun(job, now) {
  const intervals = { hourly: 3600000, '4h': 14400000, '6h': 21600000, '12h': 43200000, daily: 86400000, weekly: 604800000 };
  const interval  = intervals[job.frequency] || 86400000;
  const lastRun   = job.last_run ? new Date(job.last_run).getTime() : now.getTime() - interval;
  return new Date(lastRun + interval);
}

function _formatNextRun(date) {
  const diff = date - Date.now();
  if (diff <= 0)    return 'Now';
  if (diff < 3600000) return `in ${Math.round(diff/60000)}m`;
  if (diff < 86400000) return `in ${Math.round(diff/3600000)}h`;
  return `in ${Math.round(diff/86400000)}d`;
}

/* ══════════════════════════════════════════════════════════════
   MODAL — Add/Edit Job
══════════════════════════════════════════════════════════════ */
function openSchedulerJobModal(id, defaultFreq, defaultChannelId) {
  const schedules = _loadSchedules();
  const job = id ? schedules.find(s => s.id === id) : null;
  const channels  = typeof _loadChannels === 'function' ? _loadChannels() : [];

  const body = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group">
        <label class="form-label">Job Type *</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px" id="sched-type-grid">
          ${SCHED_JOB_TYPES.map(t => `
            <label style="display:flex;align-items:center;gap:6px;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:.78rem;${job?.type === t.id ? 'border-color:'+t.color+';background:'+t.color+'11' : ''}">
              <input type="radio" name="sched-type" value="${t.id}" ${job?.type === t.id || (!job && t.id === 'generate_video') ? 'checked' : ''} style="accent-color:${t.color}">
              <i class="fa-solid ${t.icon}" style="color:${t.color}"></i> ${t.label}
            </label>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">Frequency</label>
          <select id="sched-freq" class="form-control">
            ${SCHED_FREQUENCIES.map(f => `<option value="${f.id}"${(job?.frequency || defaultFreq || 'daily') === f.id ? ' selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Time (for daily jobs)</label>
          <input id="sched-time" type="time" class="form-control" value="${job?.time || '09:00'}">
        </div>
      </div>

      ${channels.length > 0 ? `
      <div class="form-group">
        <label class="form-label">Channel (optional)</label>
        <select id="sched-channel" class="form-control">
          <option value="">All channels / Any</option>
          ${channels.map(c => `<option value="${c.id}"${(job?.channel_id || defaultChannelId) === c.id ? ' selected' : ''}>${escSched(c.name)}</option>`).join('')}
        </select>
      </div>` : ''}

      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <input id="sched-notes" class="form-control" placeholder="e.g. Morning content generation…" value="${escSched(job?.notes || '')}">
      </div>

      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="sched-enabled" ${!job || job.enabled ? 'checked' : ''}>
        <span style="font-size:.85rem">Enable immediately</span>
      </label>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveSchedulerJob('${id || ''}')">
      <i class="fa-solid fa-${id ? 'floppy-disk' : 'plus'}"></i> ${id ? 'Save' : 'Add Job'}
    </button>`;

  app.openModal(id ? 'Edit Job' : 'New Scheduled Job', body, footer);
}

function saveSchedulerJob(id) {
  const type    = document.querySelector('input[name="sched-type"]:checked')?.value;
  const freq    = document.getElementById('sched-freq')?.value;
  const time    = document.getElementById('sched-time')?.value;
  const chanId  = document.getElementById('sched-channel')?.value;
  const notes   = document.getElementById('sched-notes')?.value?.trim();
  const enabled = document.getElementById('sched-enabled')?.checked !== false;

  if (!type) { app.toast('Select a job type', 'error'); return; }

  const schedules = _loadSchedules();
  const jobData = { type, frequency: freq, time, channel_id: chanId, notes, enabled, last_run: null };

  if (id) {
    const idx = schedules.findIndex(s => s.id === id);
    if (idx >= 0) schedules[idx] = { ...schedules[idx], ...jobData };
  } else {
    schedules.push({ id: _schedGenId(), ...jobData, created_at: new Date().toISOString() });
  }

  _saveSchedules(schedules);
  app.closeModal();
  app.toast(id ? 'Job updated!' : 'Job added!', 'success');
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

function schedToggleJob(id, enabled) {
  const schedules = _loadSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx >= 0) { schedules[idx].enabled = enabled; _saveSchedules(schedules); }
  app.toast(enabled ? 'Job enabled' : 'Job disabled', 'info');
}

function schedDeleteJob(id) {
  const schedules = _loadSchedules().filter(s => s.id !== id);
  _saveSchedules(schedules);
  app.toast('Job deleted', 'info');
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

async function schedRunJobNow(id) {
  const schedules = _loadSchedules();
  const job = schedules.find(s => s.id === id);
  if (!job) return;

  app.toast(`Running: ${SCHED_JOB_TYPES.find(t=>t.id===job.type)?.label || job.type}…`, 'info');

  await new Promise(r => setTimeout(r, 1500));

  // Mark as last run
  const idx = schedules.findIndex(s => s.id === id);
  if (idx >= 0) { schedules[idx].last_run = new Date().toISOString(); _saveSchedules(schedules); }

  app.toast('Job completed!', 'success');
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

async function schedRunQueue() {
  const queue = _loadQueue();
  const pending = queue.filter(q => q.status === 'queued');
  if (!pending.length) { app.toast('Queue is empty', 'info'); return; }

  app.toast(`Processing ${pending.length} queued items…`, 'info');

  for (const item of pending) {
    await new Promise(r => setTimeout(r, 500));
    item.status    = 'done';
    item.done_at   = new Date().toISOString();
  }

  _saveQueue(queue);
  app.toast(`${pending.length} items processed!`, 'success');
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

function schedRunQueueItem(id) {
  const queue = _loadQueue();
  const item  = queue.find(q => q.id === id);
  if (!item) return;
  item.status  = 'done';
  item.done_at = new Date().toISOString();
  _saveQueue(queue);
  app.toast(`"${item.title}" processed`, 'success');
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

function schedRemoveFromQueue(id) {
  _saveQueue(_loadQueue().filter(q => q.id !== id));
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

function schedClearCompleted() {
  _saveQueue(_loadQueue().filter(q => q.status !== 'done'));
  app.toast('Completed items cleared', 'info');
  const content = document.getElementById('content');
  if (content) renderScheduler(content);
}

function schedScrollTo(id) {
  const el = document.getElementById('sched-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escSched(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
