/* ============================================================
   sections/dashboard.js — AI YouTube Factory Dashboard
   ============================================================ */
async function renderDashboard(container) {
  // Load all data
  let posts = [], publicados = [], avatares = [], dbChannels = [], musicos = [];
  if (typeof DB !== 'undefined' && DB.ready()) {
    const [pr, pp, avRes, ytRes, muRes] = await Promise.all([
      DB.getPosts({ limit: 100 }),
      DB.getPublicados({ limit: 100 }),
      DB.getAvatares(),
      DB.getYoutubeChannels(),
      DB.getMusicos(),
    ]);
    posts      = pr.data    || [];
    publicados = pp.data    || [];
    avatares   = avRes.data || [];
    dbChannels = ytRes.data || [];
    musicos    = muRes.data || [];
  }

  const factoryChannels = typeof _loadChannels === 'function' ? _loadChannels() : [];
  const studioAvatars   = typeof _loadStudioAvatars === 'function' ? _loadStudioAvatars() : [];
  const allChannels     = [...dbChannels, ...factoryChannels];
  const allAvatars      = [...avatares, ...studioAvatars];
  const uploadQueue     = JSON.parse(localStorage.getItem('upload_queue') || '[]');
  const schedules       = JSON.parse(localStorage.getItem('yt_factory_schedules') || '[]');

  // Metrics
  const totalViews     = allChannels.reduce((s, c) => s + (parseInt(c.total_views || c.visualizacoes) || 0), 0);
  const totalRevenue   = allChannels.reduce((s, c) => s + (parseFloat(c.receita_mes || c.monthly_revenue) || 0), 0);
  const totalSubs      = dbChannels.reduce((s, c) => s + (c.seguidores || 0), 0);
  const videosGenerated= factoryChannels.reduce((s, c) => s + (c.videos_generated || 0), 0);
  const queuePending   = uploadQueue.filter(q => q.status === 'queued').length;
  const activeJobs     = schedules.filter(s => s.enabled).length;
  const activeChannels = factoryChannels.filter(c => c.status === 'active').length;
  const agendados      = posts.filter(p => p.status === 'agendado').length;
  const receitaYT      = dbChannels.reduce((s,c) => s+(parseFloat(c.receita_mes)||0), 0);
  const receitaMus     = musicos.reduce((s,m) => s+(parseFloat(m.receita_mes)||0), 0);
  const factoryRevenue = factoryChannels.reduce((s,c) => s+(parseFloat(c.monthly_revenue)||0), 0);

  container.innerHTML = `
    <!-- Factory Header banner -->
    <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;background:linear-gradient(135deg,var(--bg-surface) 0%,var(--bg-elevated) 100%);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:20px">
      <div style="width:48px;height:48px;background:linear-gradient(135deg,var(--red),var(--accent));border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="fa-solid fa-industry" style="color:#fff;font-size:1.3rem"></i>
      </div>
      <div>
        <div style="font-size:1.1rem;font-weight:800;letter-spacing:-.01em">AI YouTube Factory</div>
        <div style="font-size:.82rem;color:var(--text-muted)">${allChannels.length} channels · ${allAvatars.length} avatars · ${activeJobs} active automations</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn btn-sm btn-secondary" onclick="app.navigate('channels')">
          <i class="fa-brands fa-youtube"></i> Channels
        </button>
        <button class="btn btn-sm btn-primary" onclick="app.navigate('pipeline')">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Create Video
        </button>
      </div>
    </div>

    <!-- Factory KPIs -->
    <div class="grid-4 mb-3">
      <div class="stat-card" style="cursor:pointer" onclick="app.navigate('channels')">
        <div class="stat-icon" style="background:var(--red-soft)"><i class="fa-brands fa-youtube" style="color:var(--red)"></i></div>
        <div class="stat-value">${allChannels.length}</div>
        <div class="stat-label">Total Channels</div>
        <div class="stat-change" style="color:var(--${activeChannels>0?'green':'text-muted'})">
          <i class="fa-solid fa-circle" style="font-size:.5rem"></i> ${activeChannels} active
        </div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="app.navigate('analytics')">
        <div class="stat-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-eye" style="color:var(--accent)"></i></div>
        <div class="stat-value">${app.formatNumber(totalViews)}</div>
        <div class="stat-label">Total Views</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="app.navigate('analytics')">
        <div class="stat-icon" style="background:var(--green-soft)"><i class="fa-solid fa-dollar-sign" style="color:var(--green)"></i></div>
        <div class="stat-value">$${totalRevenue.toFixed(0)}</div>
        <div class="stat-label">Est. Revenue/mo</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="app.navigate('scheduler')">
        <div class="stat-icon" style="background:var(--yellow-soft)"><i class="fa-solid fa-robot" style="color:var(--yellow)"></i></div>
        <div class="stat-value">${activeJobs}</div>
        <div class="stat-label">Active Automations</div>
        <div class="stat-change" style="color:var(--${queuePending>0?'accent':'text-muted'})">
          <i class="fa-solid fa-list"></i> ${queuePending} queued
        </div>
      </div>
    </div>

    <!-- Secondary KPIs -->
    <div class="grid-4 mb-3">
      ${dashStatCard('fa-masks-theater','var(--pink-soft)','var(--pink)', allAvatars.length, 'AI Avatars', 'avatar-studio')}
      ${dashStatCard('fa-clapperboard','var(--accent-soft)','var(--accent)', videosGenerated, 'Videos Generated', 'pipeline')}
      ${dashStatCard('fa-calendar-check','var(--yellow-soft)','var(--yellow)', agendados, 'Posts Scheduled', 'fila')}
      ${dashStatCard('fa-users','var(--red-soft)','var(--red)', app.formatNumber(totalSubs), 'Subscribers', 'analytics')}
    </div>

    <!-- Quick Actions -->
    <div class="card mb-3">
      <div class="card-title mb-3"><i class="fa-solid fa-bolt" style="color:var(--yellow)"></i> Quick Actions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
        ${[
          { icon: 'fa-wand-magic-sparkles', label: 'Generate Video',  nav: 'pipeline',       color: 'var(--accent)' },
          { icon: 'fa-microphone',          label: 'New Podcast',     nav: 'podcast-gen',    color: 'var(--green)' },
          { icon: 'fa-mobile-screen',       label: 'Shorts Factory',  nav: 'shorts-factory', color: 'var(--pink)' },
          { icon: 'fa-plus',                label: 'New Channel',     nav: 'channels',       color: 'var(--red)' },
          { icon: 'fa-masks-theater',       label: 'New Avatar',      nav: 'avatar-studio',  color: 'var(--yellow)' },
          { icon: 'fa-calendar-plus',       label: 'Scheduler',       nav: 'scheduler',      color: 'var(--blue)' },
          { icon: 'fa-chart-bar',           label: 'Analytics',       nav: 'analytics',      color: 'var(--accent)' },
          { icon: 'fa-gear',                label: 'Settings',        nav: 'configuracoes',  color: 'var(--text-muted)' },
        ].map(a => `
          <button class="btn btn-secondary" style="justify-content:flex-start;gap:8px;padding:10px 14px;font-size:.82rem" onclick="app.navigate('${a.nav}')">
            <i class="fa-solid ${a.icon}" style="color:${a.color};width:14px;text-align:center"></i>
            ${a.label}
          </button>`).join('')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">

      <!-- Channels overview -->
      <div class="card">
        <div class="card-header" style="margin-bottom:12px">
          <div>
            <div class="card-title"><i class="fa-brands fa-youtube" style="color:var(--red)"></i> Channels</div>
            <div class="card-subtitle">${allChannels.length} / 50 capacity</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="app.navigate('channels')">View all</button>
        </div>
        ${allChannels.length ? `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${allChannels.slice(0, 5).map(ch => {
              const views   = parseInt(ch.total_views || ch.visualizacoes) || 0;
              const revenue = parseFloat(ch.receita_mes || ch.monthly_revenue) || 0;
              const status  = ch.status || (ch.ativo !== false ? 'active' : 'paused');
              return `
                <div style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid var(--border);border-radius:var(--radius-sm)">
                  <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--accent));display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <i class="fa-brands fa-youtube" style="color:#fff;font-size:.65rem"></i>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escDb(ch.nome || ch.name)}</div>
                    <div style="font-size:.7rem;color:var(--text-muted)">${ch.nicho || ch.niche || ''}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div style="font-size:.78rem;color:var(--accent)">${app.formatNumber(views)}</div>
                    ${revenue > 0 ? `<div style="font-size:.7rem;color:var(--green)">$${revenue.toFixed(0)}/mo</div>` : ''}
                  </div>
                  <div style="width:8px;height:8px;border-radius:50%;background:${status === 'active' ? 'var(--green)' : status === 'paused' ? 'var(--yellow)' : 'var(--border)'};flex-shrink:0"></div>
                </div>`;
            }).join('')}
            <div class="progress-bar" style="height:4px;margin-top:4px">
              <div class="progress-fill" style="width:${Math.min((allChannels.length/50)*100,100)}%;background:${allChannels.length>=45?'var(--red)':'var(--green)'}"></div>
            </div>
          </div>
        ` : `
          <div class="empty-state" style="padding:24px">
            <i class="fa-brands fa-youtube" style="font-size:1.8rem;color:var(--border)"></i>
            <p style="font-size:.85rem">No channels yet. <a style="color:var(--accent);cursor:pointer" onclick="app.navigate('channels')">Add one</a></p>
          </div>`}
      </div>

      <!-- Upload queue -->
      <div class="card">
        <div class="card-header" style="margin-bottom:12px">
          <div>
            <div class="card-title"><i class="fa-solid fa-list" style="color:var(--blue)"></i> Upload Queue</div>
            <div class="card-subtitle">${queuePending} pending · ${uploadQueue.filter(q=>q.status==='done').length} done</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="app.navigate('scheduler')">Manage</button>
        </div>
        ${uploadQueue.length ? `
          <div style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto">
            ${uploadQueue.slice(0, 10).map(item => {
              const statusColors = { queued: 'var(--text-muted)', running: 'var(--accent)', done: 'var(--green)', failed: 'var(--red)' };
              const statusIcons  = { queued: 'fa-clock', running: 'fa-circle-notch', done: 'fa-check-circle', failed: 'fa-times-circle' };
              const st = item.status || 'queued';
              return `
                <div style="display:flex;align-items:center;gap:6px;padding:5px;font-size:.75rem">
                  <i class="fa-solid ${statusIcons[st]}" style="color:${statusColors[st]};font-size:.7rem;flex-shrink:0"></i>
                  <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escDb(item.title || 'Untitled')}</span>
                  ${item.type ? `<span class="badge badge-muted" style="font-size:.6rem">${item.type}</span>` : ''}
                </div>`;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding:24px">
            <i class="fa-solid fa-inbox" style="font-size:1.8rem;color:var(--border)"></i>
            <p style="font-size:.85rem">Queue is empty</p>
          </div>`}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">

      <!-- Avatar Studio quick -->
      <div class="card">
        <div class="card-header" style="margin-bottom:10px">
          <div class="card-title"><i class="fa-solid fa-masks-theater" style="color:var(--pink)"></i> Avatars</div>
          <button class="btn btn-sm btn-secondary" onclick="app.navigate('avatar-studio')">Manage</button>
        </div>
        ${allAvatars.slice(0, 4).map(a => {
          const imgSrc = a.image || a.imagem_url || (a.imagens_referencia || [])[0] || null;
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">
              <div style="width:26px;height:26px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center">
                ${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover">` : `<i class="fa-solid fa-masks-theater" style="font-size:.75rem;color:var(--pink)"></i>`}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escDb(a.nome || a.name || 'Avatar')}</div>
                ${a.personality ? `<div style="font-size:.65rem;color:var(--text-muted)">${a.personality}</div>` : ''}
              </div>
            </div>`;
        }).join('')}
        ${allAvatars.length === 0 ? `<div style="text-align:center;padding:12px;font-size:.78rem;color:var(--text-muted)">No avatars. <a style="color:var(--pink);cursor:pointer" onclick="app.navigate('avatar-studio')">Create one</a></div>` : ''}
      </div>

      <!-- Scheduled posts -->
      <div class="card">
        <div class="card-header" style="margin-bottom:10px">
          <div class="card-title"><i class="fa-solid fa-calendar-days" style="color:var(--accent)"></i> Scheduled Posts</div>
          <button class="btn btn-sm btn-secondary" onclick="app.navigate('fila')">View all</button>
        </div>
        ${posts.filter(p=>p.status==='agendado').slice(0,4).map(p => `
          <div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);font-size:.75rem">
            <i class="fa-solid fa-calendar" style="color:var(--accent);flex-shrink:0"></i>
            <div style="flex:1;min-width:0">
              <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escDb(p.legenda || '(no caption)')}</div>
              <div style="color:var(--text-muted)">${app.formatDate(p.agendado_para)}</div>
            </div>
          </div>`).join('')}
        ${posts.filter(p=>p.status==='agendado').length === 0 ? `<div style="text-align:center;padding:12px;font-size:.78rem;color:var(--text-muted)">No posts scheduled</div>` : ''}
      </div>

      <!-- Revenue summary -->
      <div class="card">
        <div class="card-header" style="margin-bottom:10px">
          <div class="card-title"><i class="fa-solid fa-dollar-sign" style="color:var(--green)"></i> Revenue</div>
          <button class="btn btn-sm btn-secondary" onclick="app.navigate('analytics')">Details</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${[
            { label: 'YouTube / Video', value: receitaYT,      color: 'var(--red)',    icon: 'fa-brands fa-youtube' },
            { label: 'Music',           value: receitaMus,     color: 'var(--accent)', icon: 'fa-solid fa-music' },
            { label: 'Factory',         value: factoryRevenue, color: 'var(--green)',  icon: 'fa-solid fa-industry' },
          ].map(r => `
            <div style="display:flex;align-items:center;gap:8px">
              <i class="${r.icon}" style="color:${r.color};width:14px;text-align:center;flex-shrink:0;font-size:.85rem"></i>
              <div style="flex:1;font-size:.78rem">${r.label}</div>
              <div style="font-weight:700;font-size:.85rem;color:${r.value>0?'var(--green)':'var(--text-muted)'}">${r.value>0?'$'+r.value.toFixed(0):'—'}</div>
            </div>`).join('')}
          <div style="border-top:1px solid var(--border);padding-top:8px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:.8rem;font-weight:700">Total / month</span>
            <span style="font-size:.95rem;font-weight:800;color:var(--green)">$${(receitaYT + receitaMus + factoryRevenue).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function dashStatCard(icon, bgSoft, color, value, nav) {
  return `
    <div class="stat-card" style="cursor:pointer" onclick="app.navigate('${nav}')">
      <div class="stat-icon" style="background:${bgSoft}"><i class="fa-solid ${icon}" style="color:${color}"></i></div>
      <div class="stat-value">${value}</div>
    </div>`;
}

// Keep helpers used by other parts
function statCard(icon, bgSoft, color, value, label, trend) {
  return `
    <div class="stat-card">
      <div class="stat-icon" style="background:${bgSoft}"><i class="fa-solid ${icon}" style="color:${color}"></i></div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      ${trend ? `<div class="stat-change ${trend}"><i class="fa-solid fa-arrow-${trend === 'up' ? 'up' : 'down'}"></i> —</div>` : ''}
    </div>`;
}

function renderUpcoming(posts) {
  const upcoming = posts.filter(p => p.status === 'agendado' && p.agendado_para)
    .sort((a, b) => new Date(a.agendado_para) - new Date(b.agendado_para)).slice(0, 5);
  if (!upcoming.length) return '<div class="empty-state" style="padding:30px"><i class="fa-regular fa-calendar"></i><p>No scheduled posts</p></div>';
  return upcoming.map(p => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="width:48px;height:48px;font-size:1.2rem;background:var(--bg-elevated);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${p.imagem_url ? `<img src="${p.imagem_url}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)">` : '<i class="fa-regular fa-image" style="color:var(--text-muted)"></i>'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.82rem;font-weight:600">${escDb(p.legenda || '(no caption)')}</div>
        <div style="color:var(--text-muted);font-size:.75rem">${app.formatDate(p.agendado_para)}</div>
      </div>
      ${app.statusBadge(p.status)}
    </div>`).join('');
}

function renderPlatformPerf(publicados) {
  const platforms = ['instagram', 'tiktok', 'facebook', 'youtube'];
  const stats = {};
  platforms.forEach(p => { stats[p] = { posts: 0, likes: 0, comentarios: 0, visualizacoes: 0 }; });
  publicados.forEach(p => {
    const pl = p.plataforma;
    if (stats[pl]) { stats[pl].posts++; stats[pl].likes += p.likes||0; stats[pl].comentarios += p.comentarios||0; stats[pl].visualizacoes += p.visualizacoes||0; }
  });
  const maxLikes = Math.max(1, ...platforms.map(p => stats[p].likes));
  return `<div style="display:flex;flex-direction:column;gap:14px">
    ${platforms.map(pl => {
      const s = stats[pl]; const pct = Math.round((s.likes / maxLikes) * 100);
      const colors = { instagram: 'var(--pink)', tiktok: '#ccc', facebook: 'var(--blue)', youtube: 'var(--red)' };
      return `<div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${app.platformIcon(pl)} ${pl.charAt(0).toUpperCase()+pl.slice(1)}</span><span style="font-size:.8rem;color:var(--text-muted)">${s.posts} posts · ${app.formatNumber(s.likes)} likes</span></div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${colors[pl]}"></div></div></div>`;
    }).join('')}</div>`;
}

function buildCalendar(hoje, scheduledDays) {
  const year = hoje.getFullYear(); const month = hoje.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['S','M','T','W','T','F','S'];
  const first = new Date(year,month,1); const lastDay = new Date(year,month+1,0).getDate(); const startDow = first.getDay();
  let cells = '';
  for (let i = 0; i < startDow; i++) { const d = new Date(year,month,-startDow+i+1); cells += `<div class="cal-day other-month">${d.getDate()}</div>`; }
  for (let d = 1; d <= lastDay; d++) { const date = new Date(year,month,d); const isToday = date.toDateString()===hoje.toDateString(); const hasPost = scheduledDays.has(date.toDateString()); cells += `<div class="cal-day${isToday?' today':''}${hasPost?' has-post':''}">${d}</div>`; }
  return `<div class="cal-header"><span>${monthNames[month]} ${year}</span></div><div class="cal-grid">${dayNames.map(d=>`<div class="cal-day-name">${d}</div>`).join('')}${cells}</div>`;
}

function escDb(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
