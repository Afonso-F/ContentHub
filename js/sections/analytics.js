/* ============================================================
   sections/analytics.js — Global Analytics Dashboard
   Aggregates data from all channels: views, revenue, growth
   ============================================================ */

/* ── Analytics state ── */
let _analyticsChart = null;

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
async function renderAnalytics(container) {
  // Load all data sources
  let dbChannels = [], publicados = [], avatares = [];
  if (typeof DB !== 'undefined' && DB.ready()) {
    const [ytRes, pubRes, avRes] = await Promise.all([
      DB.getYoutubeChannels(),
      DB.getPublicados({ limit: 500 }),
      DB.getAvatares(),
    ]);
    dbChannels = ytRes.data  || [];
    publicados = pubRes.data || [];
    avatares   = avRes.data  || [];
  }

  const factoryChannels = typeof _loadChannels === 'function' ? _loadChannels() : [];
  const allChannels     = [
    ...dbChannels.map(c => ({ ...c, _src: 'db' })),
    ...factoryChannels.map(c => ({ ...c, _src: 'factory' })),
  ];

  // Aggregate metrics
  const totalViews   = allChannels.reduce((s, c) => s + (parseInt(c.total_views || c.visualizacoes) || 0), 0);
  const totalRevenue = allChannels.reduce((s, c) => s + (parseFloat(c.receita_mes || c.monthly_revenue) || 0), 0);
  const totalSubs    = dbChannels.reduce((s, c) => s + (c.seguidores || 0), 0);
  const totalVideos  = dbChannels.reduce((s, c) => s + (c.videos_count || 0), 0) + factoryChannels.reduce((s, c) => s + (c.videos_generated || 0), 0);

  const totalLikes   = publicados.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComm    = publicados.reduce((s, p) => s + (p.comentarios || 0), 0);
  const avgEngagement = publicados.length ? ((totalLikes + totalComm) / publicados.length).toFixed(1) : 0;

  // Best performing channels
  const topChannels = [...allChannels].sort((a, b) => (parseInt(b.total_views || b.visualizacoes) || 0) - (parseInt(a.total_views || a.visualizacoes) || 0)).slice(0, 5);

  // Platform breakdown from publicados
  const platStats = {};
  publicados.forEach(p => {
    if (!platStats[p.plataforma]) platStats[p.plataforma] = { views: 0, likes: 0, posts: 0 };
    platStats[p.plataforma].views += p.visualizacoes || 0;
    platStats[p.plataforma].likes += p.likes || 0;
    platStats[p.plataforma].posts++;
  });
  const platsSorted = Object.entries(platStats).sort((a, b) => b[1].views - a[1].views);

  // Weekly data simulation (in production this comes from YouTube API)
  const weeklyViews = _generateWeeklyData(totalViews);

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Analytics</div>
        <div class="section-subtitle">Global performance across all ${allChannels.length} channels</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <select id="analytics-period" class="form-control" style="max-width:140px" onchange="refreshAnalytics()">
          <option value="7">Last 7 days</option>
          <option value="28" selected>Last 28 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
        <button class="btn btn-secondary" onclick="exportAnalytics()">
          <i class="fa-solid fa-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Global KPIs -->
    <div class="grid-4 mb-3">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--red-soft)"><i class="fa-solid fa-eye" style="color:var(--red)"></i></div>
        <div class="stat-value">${app.formatNumber(totalViews)}</div>
        <div class="stat-label">Total Views</div>
        <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> all channels</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--green-soft)"><i class="fa-solid fa-dollar-sign" style="color:var(--green)"></i></div>
        <div class="stat-value">$${totalRevenue.toFixed(0)}</div>
        <div class="stat-label">Est. Monthly Revenue</div>
        <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> from ${allChannels.filter(c=>parseFloat(c.receita_mes||c.monthly_revenue)>0).length} channels</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-users" style="color:var(--accent)"></i></div>
        <div class="stat-value">${app.formatNumber(totalSubs)}</div>
        <div class="stat-label">Total Subscribers</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--yellow-soft)"><i class="fa-solid fa-film" style="color:var(--yellow)"></i></div>
        <div class="stat-value">${totalVideos}</div>
        <div class="stat-label">Videos Published</div>
      </div>
    </div>

    <!-- Secondary KPIs -->
    <div class="grid-4 mb-3">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--pink-soft)"><i class="fa-solid fa-heart" style="color:var(--pink)"></i></div>
        <div class="stat-value">${app.formatNumber(totalLikes)}</div>
        <div class="stat-label">Total Likes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--purple-soft,var(--accent-soft))"><i class="fa-solid fa-comments" style="color:var(--purple,var(--accent))"></i></div>
        <div class="stat-value">${app.formatNumber(totalComm)}</div>
        <div class="stat-label">Total Comments</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--accent-soft)"><i class="fa-solid fa-percent" style="color:var(--accent)"></i></div>
        <div class="stat-value">${avgEngagement}</div>
        <div class="stat-label">Avg Engagement/Post</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--yellow-soft)"><i class="fa-brands fa-youtube" style="color:var(--yellow)"></i></div>
        <div class="stat-value">${allChannels.length}</div>
        <div class="stat-label">Active Channels</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px">
      <!-- Views trend chart -->
      <div class="card">
        <div class="card-header" style="margin-bottom:16px">
          <div>
            <div class="card-title">Views Over Time</div>
            <div class="card-subtitle">Combined views across all channels</div>
          </div>
        </div>
        <canvas id="analytics-chart" style="max-height:220px"></canvas>
      </div>

      <!-- Revenue breakdown -->
      <div class="card">
        <div class="card-header" style="margin-bottom:12px">
          <div class="card-title">Revenue Breakdown</div>
        </div>
        <canvas id="revenue-chart" style="max-height:180px"></canvas>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px" id="revenue-legend">
          ${_renderRevenueLegend(allChannels)}
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <!-- Top performing channels -->
      <div class="card">
        <div class="card-header" style="margin-bottom:12px">
          <div class="card-title"><i class="fa-solid fa-trophy" style="color:var(--yellow)"></i> Top Channels</div>
          <button class="btn btn-sm btn-secondary" onclick="app.navigate('channels')">View all</button>
        </div>
        ${topChannels.length ? `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${topChannels.map((ch, i) => {
              const views   = parseInt(ch.total_views || ch.visualizacoes) || 0;
              const revenue = parseFloat(ch.receita_mes || ch.monthly_revenue) || 0;
              const maxViews = parseInt(topChannels[0]?.total_views || topChannels[0]?.visualizacoes) || 1;
              const pct    = Math.round((views / maxViews) * 100);
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              return `
                <div style="padding:8px 0;border-bottom:1px solid var(--border)">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <div style="display:flex;align-items:center;gap:6px">
                      <span>${medals[i]}</span>
                      <span style="font-size:.82rem;font-weight:600">${escAn(ch.nome || ch.name)}</span>
                    </div>
                    <div style="text-align:right;font-size:.75rem">
                      <span style="color:var(--accent)">${app.formatNumber(views)}</span>
                      <span style="color:var(--text-muted)"> views</span>
                      ${revenue > 0 ? `<span style="color:var(--green);margin-left:6px">$${revenue.toFixed(0)}/mo</span>` : ''}
                    </div>
                  </div>
                  <div class="progress-bar" style="height:4px">
                    <div class="progress-fill" style="width:${pct}%;background:${i === 0 ? 'var(--yellow)' : 'var(--accent)'}"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        ` : `<div class="empty-state" style="padding:24px"><p>No channel data yet</p></div>`}
      </div>

      <!-- Platform breakdown -->
      <div class="card">
        <div class="card-header" style="margin-bottom:12px">
          <div class="card-title"><i class="fa-solid fa-chart-pie" style="color:var(--accent)"></i> Platform Performance</div>
        </div>
        ${platsSorted.length ? `
          <div style="display:flex;flex-direction:column;gap:10px">
            ${platsSorted.slice(0,6).map(([platform, stats]) => {
              const maxViews = platsSorted[0]?.[1]?.views || 1;
              const pct = Math.round((stats.views / maxViews) * 100);
              const colors = { youtube: 'var(--red)', instagram: 'var(--pink)', tiktok: '#ccc', facebook: 'var(--blue)', spotify: '#1db954' };
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <span style="font-size:.8rem">${app.platformIcon(platform)} ${app.platformLabel(platform)}</span>
                    <span style="font-size:.75rem;color:var(--text-muted)">${app.formatNumber(stats.views)} views · ${stats.posts} posts</span>
                  </div>
                  <div class="progress-bar" style="height:5px">
                    <div class="progress-fill" style="width:${pct}%;background:${colors[platform]||'var(--accent)'}"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding:24px">
            <p class="text-muted text-sm">No published content data. Publish some content to see platform stats.</p>
          </div>`}
      </div>
    </div>

    <!-- Growth trends -->
    <div class="card mb-3">
      <div class="card-header" style="margin-bottom:16px">
        <div>
          <div class="card-title">Growth Trends</div>
          <div class="card-subtitle">7-day moving metrics across all channels</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px" id="growth-grid">
        ${_renderGrowthGrid(weeklyViews)}
      </div>
    </div>

    <!-- Best performing content -->
    ${publicados.length > 0 ? `
    <div class="card">
      <div class="card-header" style="margin-bottom:12px">
        <div class="card-title"><i class="fa-solid fa-fire" style="color:var(--red)"></i> Best Performing Content</div>
        <button class="btn btn-sm btn-secondary" onclick="app.navigate('publicados')">View all</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${publicados.sort((a,b) => (b.visualizacoes||0) - (a.visualizacoes||0)).slice(0,8).map(p => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm)">
            <div style="width:36px;height:36px;background:var(--bg-elevated);border-radius:var(--radius-sm);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center">
              ${p.url_post ? `<i class="${app.platformIcon(p.plataforma).match(/fa-\S+/g)?.join(' ')||'fa-solid fa-play'}" style="font-size:.9rem"></i>` : '<i class="fa-regular fa-image" style="color:var(--text-muted)"></i>'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escAn(p.url_post || p.post_id_social || 'Published content')}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${app.platformLabel(p.plataforma)} · ${app.formatDate(p.publicado_em)}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:.8rem;font-weight:600;color:var(--accent)">${app.formatNumber(p.visualizacoes || 0)} views</div>
              <div style="font-size:.7rem;color:var(--text-muted)">${app.formatNumber(p.likes||0)} ❤️ ${app.formatNumber(p.comentarios||0)} 💬</div>
            </div>
          </div>`).join('')}
      </div>
    </div>` : ''}
  `;

  // Render charts
  _renderViewsChart(weeklyViews);
  _renderRevenueChart(allChannels);
}

/* ────────────────────────────────────────────
   CHART HELPERS
──────────────────────────────────────────── */
function _generateWeeklyData(totalViews) {
  const days  = 28;
  const base  = totalViews > 0 ? Math.round(totalViews / days) : 1000;
  const result = [];
  const today  = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const jitter   = 0.6 + Math.random() * 0.8;
    const weekend  = (d.getDay() === 0 || d.getDay() === 6) ? 1.3 : 1.0;
    result.push({ label: dayLabel, views: Math.round(base * jitter * weekend) });
  }
  return result;
}

function _renderViewsChart(data) {
  const canvas = document.getElementById('analytics-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (_analyticsChart) { _analyticsChart.destroy(); }

  _analyticsChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Views',
        data: data.map(d => d.views),
        borderColor: 'var(--accent)',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { maxTicksLimit: 7, color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: 'var(--text-muted)', font: { size: 10 }, callback: v => app.formatNumber(v) }, grid: { color: 'rgba(255,255,255,0.04)' } },
      },
    },
  });
}

function _renderRevenueChart(channels) {
  const canvas = document.getElementById('revenue-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const withRevenue = channels.filter(c => parseFloat(c.receita_mes || c.monthly_revenue) > 0).slice(0, 6);
  if (!withRevenue.length) return;

  const colors = ['#6366f1','#ef4444','#22c55e','#f59e0b','#ec4899','#14b8a6'];

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: withRevenue.map(c => c.nome || c.name || 'Channel'),
      datasets: [{
        data: withRevenue.map(c => parseFloat(c.receita_mes || c.monthly_revenue) || 0),
        backgroundColor: colors,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      cutout: '65%',
    },
  });
}

function _renderRevenueLegend(channels) {
  const withRevenue = channels.filter(c => parseFloat(c.receita_mes || c.monthly_revenue) > 0).slice(0, 6);
  if (!withRevenue.length) return '<p class="text-muted text-sm">No revenue data</p>';

  const colors = ['#6366f1','#ef4444','#22c55e','#f59e0b','#ec4899','#14b8a6'];
  return withRevenue.map((c, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;font-size:.75rem">
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:8px;height:8px;border-radius:50%;background:${colors[i]};flex-shrink:0"></div>
        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${escAn(c.nome || c.name || 'Channel')}</span>
      </div>
      <span style="color:var(--green);font-weight:600">$${parseFloat(c.receita_mes || c.monthly_revenue || 0).toFixed(0)}</span>
    </div>`).join('');
}

function _renderGrowthGrid(weeklyData) {
  // Show last 7 days as heat map
  const last7 = weeklyData.slice(-7);
  const max    = Math.max(...last7.map(d => d.views), 1);

  return last7.map(d => {
    const pct    = d.views / max;
    const heat   = pct > 0.8 ? 'var(--green)' : pct > 0.5 ? 'var(--accent)' : pct > 0.3 ? 'var(--yellow)' : 'var(--border)';
    return `
      <div style="text-align:center;padding:8px 4px;background:var(--bg-elevated);border-radius:var(--radius-sm)">
        <div style="font-size:.65rem;color:var(--text-muted);margin-bottom:4px">${d.label.split(' ')[0]}</div>
        <div style="width:100%;height:40px;background:${heat}22;border-radius:4px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:4px;overflow:hidden">
          <div style="width:60%;background:${heat};height:${Math.max(10, pct * 40)}px;border-radius:2px 2px 0 0;transition:height .3s"></div>
        </div>
        <div style="font-size:.65rem;font-weight:700;color:${heat}">${app.formatNumber(d.views)}</div>
      </div>`;
  }).join('');
}

function refreshAnalytics() {
  const content = document.getElementById('content');
  if (content) renderAnalytics(content);
}

function exportAnalytics() {
  const channels  = typeof _loadChannels === 'function' ? _loadChannels() : [];
  const rows      = ['Channel,Views,Revenue,Videos Generated,Status'];
  channels.forEach(c => {
    rows.push(`"${c.name}",${c.total_views||0},${c.monthly_revenue||0},${c.videos_generated||0},${c.status||''}`);
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'analytics-export.csv'; a.click();
  URL.revokeObjectURL(url);
}

function escAn(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
