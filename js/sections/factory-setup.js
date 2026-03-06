/* ============================================================
   sections/factory-setup.js — AI Content Factory Setup
   Bulk-creates 50 channels, 50 avatars, schedules & monetization
   ============================================================ */

/* ── 50-Channel Definitions ────────────────────────────────────
   Format: [name, niche, uploads/day, monetization, avName, gender,
            personality, voice, age, visualStyle, topics[]]
──────────────────────────────────────────────────────────────── */
const FACTORY_50 = [
  ['TechBytes',      'Technology',           2, 'mixed',      'Liam',  'Male',   'entertainer', 'echo',    25, 'Minimalista, cores neon',      ['Top 5 gadgets da semana','Como otimizar o teu setup tecnológico','Review rápida de gadgets']],
  ['CodeHub',        'Education',            1, 'mixed',      'Maya',  'Female', 'educator',    'nova',    22, 'Futurista clean',              ['Python em 10 minutos','Erros comuns em JavaScript','Guia rápido de APIs REST']],
  ['AI Insights',    'Technology',           1, 'sponsorship','Aria',  'Female', 'analyst',     'shimmer', 27, 'Cyberpunk high-tech',          ['Tendências IA desta semana','Como funciona o ChatGPT','Machine Learning para iniciantes']],
  ['QuickMath',      'Education',            3, 'memberships','Theo',  'Male',   'educator',    'fable',   20, 'Colorido, educativo',          ['Álgebra em 5 minutos','Trigonometria fácil','Problemas de lógica diários']],
  ['MusicLab',       'Music',                2, 'mixed',      'Nova',  'Female', 'entertainer', 'shimmer', 23, 'Vibrante, neon',               ['Top 3 beats desta semana','Como criar loops musicais','Técnicas de produção rápidas']],
  ['FitLife',        'Health & Fitness',     2, 'affiliate',  'Max',   'Male',   'motivator',   'onyx',    28, 'Minimalismo saudável',         ['Treino de 10 min em casa','Nutrição diária simplificada','Dicas de recuperação muscular']],
  ['DailyCurios',    'Entertainment',        3, 'adsense',    'Zoey',  'Female', 'entertainer', 'nova',    24, 'Estilo vlog colorido',         ['5 factos que não sabias','Curiosidades do dia','Mitos populares desvendados']],
  ['GadgetSpot',     'Technology',           2, 'affiliate',  'Ethan', 'Male',   'analyst',     'echo',    26, 'Neon tech',                    ['Review: gadget do dia','Top gadgets abaixo de 50€','Setup gamer definitivo']],
  ['LearnLang',      'Education',            1, 'memberships','Sofia', 'Female', 'educator',    'alloy',   21, 'Minimalista clean',            ['Inglês em 10 minutos','Frases em espanhol para viajantes','Vocabulário francês essencial']],
  ['BeatFlow',       'Music',                2, 'products',   'Jax',   'Male',   'storyteller', 'fable',   25, 'Estilo urbano',                ['Beat do dia: hip-hop','Como fazer drop perfeito','Samples gratuitos desta semana']],
  ['MindHacks',      'Education',            1, 'memberships','Clara', 'Female', 'analyst',     'shimmer', 23, 'Limpo, educativo',             ['Técnicas de memorização','Hacks de produtividade','Como aprender mais rápido']],
  ['CryptoTalk',     'Finance',              2, 'mixed',      'Leo',   'Male',   'authority',   'onyx',    27, 'Cyberpunk moderno',            ['Análise cripto do dia','Bitcoin: o que esperar?','Altcoins a seguir esta semana']],
  ['DIY Studio',     'Lifestyle',            2, 'affiliate',  'Ava',   'Female', 'storyteller', 'nova',    22, 'Colorido, inspirador',         ['DIY do dia em 5 passos','Decora o teu quarto barato','Craft criativo com materiais simples']],
  ['SnackFacts',     'Entertainment',        3, 'adsense',    'Finn',  'Male',   'entertainer', 'echo',    24, 'Vlog dinâmico',                ['Factos em 60 segundos','Verdades surpreendentes','Mitos vs realidade']],
  ['FutureTech',     'Technology',           2, 'sponsorship','Iris',  'Female', 'authority',   'shimmer', 26, 'Futurista neon',               ['Tecnologia do futuro próximo','Inovações que vão mudar tudo','Robótica e IA: o que esperar']],
  ['CodeBites',      'Education',            1, 'mixed',      'Niko',  'Male',   'educator',    'fable',   23, 'Minimalista digital',          ['JavaScript tip do dia','Clean code em 3 minutos','Padrões de design explicados']],
  ['AI Trends',      'Technology',           1, 'sponsorship','Lyra',  'Female', 'analyst',     'alloy',   25, 'Cyberpunk clean',              ['Novidades em IA esta semana','Ferramentas IA gratuitas','Como usar IA no trabalho']],
  ['MathQuick',      'Education',            3, 'memberships','Ben',   'Male',   'entertainer', 'echo',    20, 'Colorido, educativo',          ['Cálculo rápido','Geometria do dia','Puzzles matemáticos']],
  ['SoundWave',      'Music',                2, 'products',   'Kai',   'Male',   'entertainer', 'fable',   24, 'Neon / urbano',                ['Produção musical do dia','Como fazer mixagem profissional','Efeitos de áudio essenciais']],
  ['HealthTips',     'Health & Fitness',     2, 'affiliate',  'Ella',  'Female', 'motivator',   'nova',    27, 'Limpo, saudável',              ['Dica de saúde do dia','Alimentos que melhoram o teu foco','Rotina matinal saudável']],
  ['FunFactsDaily',  'Entertainment',        3, 'adsense',    'Riley', 'Female', 'entertainer', 'shimmer', 22, 'Estilo vlog colorido',         ['Facto curioso do dia','Curiosidades históricas','Coisas que a ciência descobriu']],
  ['TechReview',     'Technology',           2, 'affiliate',  'Mason', 'Male',   'analyst',     'onyx',    26, 'Neon moderno',                 ['Review: smartphone do momento','Teste de laptop','Comparativo de produtos tech']],
  ['LearnCode',      'Education',            1, 'mixed',      'Lila',  'Female', 'educator',    'alloy',   21, 'Futurista clean',              ['Tutorial de Python para iniciantes','React em 10 minutos','SQL básico explicado']],
  ['BeatLab',        'Music',                2, 'products',   'Zane',  'Male',   'friend',      'fable',   25, 'Estilo urbano neon',           ['Beat trap do dia','Como fazer um beat em 15 min','Loops gratuitos desta semana']],
  ['BrainBoost',     'Education',            1, 'memberships','Nia',   'Female', 'motivator',   'nova',    23, 'Minimalista educativo',        ['Técnica de estudo Pomodoro','Como melhorar a concentração','Hacks cognitivos comprovados']],
  ['Crypto101',      'Finance',              2, 'mixed',      'Felix', 'Male',   'authority',   'echo',    27, 'Neon cyber',                   ['DeFi explicado simplesmente','NFTs: ainda valem a pena?','Staking: guia para iniciantes']],
  ['DIYMaster',      'Lifestyle',            2, 'affiliate',  'Mia',   'Female', 'storyteller', 'shimmer', 22, 'Colorido inspirador',          ['Projecto DIY do dia','Como fazer móveis com paletes','Jardim em apartamento']],
  ['CurioBytes',     'Entertainment',        3, 'adsense',    'Luca',  'Male',   'entertainer', 'fable',   24, 'Vlog dinâmico',                ['Bytes de curiosidade','Explicações rápidas de fenômenos','Mitos científicos']],
  ['FutureGadgets',  'Technology',           2, 'sponsorship','Arlo',  'Male',   'authority',   'onyx',    26, 'Futurista high-tech',          ['Gadgets de 2025 que vais querer','Tecnologia wearable do futuro','Smart home: o próximo nível']],
  ['DevQuick',       'Education',            1, 'mixed',      'Ivy',   'Female', 'educator',    'alloy',   23, 'Minimalista digital',          ['Dev tip do dia','Git tricks que não conhecias','APIs gratuitas para projetos']],
  ['AIExplained',    'Technology',           1, 'sponsorship','Nova',  'Female', 'educator',    'nova',    25, 'Cyberpunk clean',              ['Como funciona a IA explicado fácil','Redes neuronais em 5 min','IA vs humanos: o que muda?']],
  ['QuickCalc',      'Education',            3, 'memberships','Theo',  'Male',   'entertainer', 'echo',    20, 'Colorido educativo',           ['Cálculo mental rápido','Estatística do dia','Probabilidade descomplicada']],
  ['MusicVibe',      'Music',                2, 'products',   'Jax',   'Male',   'entertainer', 'fable',   25, 'Neon urbano',                  ['Música do momento','Como criar uma playlist viral','Behind the beat: como foi feito']],
  ['FitJourney',     'Health & Fitness',     2, 'affiliate',  'Max',   'Male',   'motivator',   'onyx',    28, 'Limpo saudável',               ['Jornada fitness do dia','Treino HIIT rápido','Suplementos: o que realmente funciona']],
  ['CurioWorld',     'Entertainment',        3, 'adsense',    'Zoey',  'Female', 'entertainer', 'shimmer', 24, 'Vlog dinâmico',                ['Mundo em curiosidades','Lugares mais estranhos da Terra','Animais que não sabia que existiam']],
  ['GadgetGeek',     'Technology',           2, 'affiliate',  'Ethan', 'Male',   'analyst',     'echo',    26, 'Neon tech',                    ['Unboxing do dia','Review honesta de gadgets','Comparativo: vale ou não vale?']],
  ['Polyglot',       'Education',            1, 'memberships','Sofia', 'Female', 'friend',      'alloy',   21, 'Minimalista clean',            ['Aprende 10 palavras hoje','Pronúncia perfeita em inglês','Dicas de imersão linguística']],
  ['BeatMaker',      'Music',                2, 'products',   'Kai',   'Male',   'storyteller', 'fable',   24, 'Neon urbano',                  ['Como fazer um beat do zero','Técnica de layering de sons','Sintetizadores para iniciantes']],
  ['MindBoost',      'Education',            1, 'memberships','Clara', 'Female', 'analyst',     'nova',    23, 'Limpo educativo',              ['Psicologia do sucesso','Como criar hábitos duradouros','Técnicas de meditação em 5 min']],
  ['CryptoTrends',   'Finance',              2, 'mixed',      'Leo',   'Male',   'authority',   'onyx',    27, 'Cyberpunk moderno',            ['Tendências crypto desta semana','Análise técnica: BTC chart','Projetos blockchain a seguir']],
  ['DIYPro',         'Lifestyle',            2, 'affiliate',  'Ava',   'Female', 'storyteller', 'shimmer', 22, 'Colorido inspirador',          ['Hack DIY rápido','Reparações em casa fáceis','Upcycling criativo']],
  ['FactRush',       'Entertainment',        3, 'adsense',    'Finn',  'Male',   'entertainer', 'echo',    24, 'Vlog dinâmico',                ['3 factos em 30 segundos','Curiosidades históricas rápidas','Ciência do quotidiano']],
  ['TechNext',       'Technology',           2, 'sponsorship','Iris',  'Female', 'authority',   'alloy',   26, 'Futurista neon',               ['O que vem a seguir em tech','Startups que vão explodir','Previsões tecnológicas']],
  ['CodeSprint',     'Education',            1, 'mixed',      'Niko',  'Male',   'educator',    'fable',   23, 'Minimalista digital',          ['Code challenge do dia','Algoritmos em 5 min','Estruturas de dados simples']],
  ['AIHub',          'Technology',           1, 'sponsorship','Lyra',  'Female', 'analyst',     'shimmer', 25, 'Cyberpunk clean',              ['Hub de ferramentas IA','Prompt engineering dicas','IA para criadores de conteúdo']],
  ['MathExpress',    'Education',            3, 'memberships','Ben',   'Male',   'entertainer', 'echo',    20, 'Colorido educativo',           ['Matemática expressa','Equações do dia','Cálculo para a vida real']],
  ['SoundLab',       'Music',                2, 'products',   'Zane',  'Male',   'friend',      'fable',   25, 'Neon urbano',                  ['Lab de som: experiências','Efeitos de áudio criativos','Como masterizar em casa']],
  ['HealthGuide',    'Health & Fitness',     2, 'affiliate',  'Ella',  'Female', 'educator',    'nova',    27, 'Limpo saudável',               ['Guia de saúde diário','Como prevenir lesões','Alimentação anti-inflamatória']],
  ['DailyCurio',     'Entertainment',        3, 'adsense',    'Riley', 'Female', 'entertainer', 'alloy',   22, 'Vlog dinâmico',                ['Curiosidade do dia','Explica em 60 segundos','Fenômenos naturais incríveis']],
  ['GadgetZone',     'Technology',           2, 'affiliate',  'Mason', 'Male',   'analyst',     'onyx',    26, 'Neon moderno',                 ['Zona de gadgets','Melhores deals desta semana','Análise de custo-benefício tech']],
];

/* Niche → background gradient color map */
const NICHE_COLORS = {
  'Technology':      ['#6366f1','#818cf8'],
  'Education':       ['#22c55e','#4ade80'],
  'Music':           ['#ec4899','#f472b6'],
  'Health & Fitness':['#14b8a6','#2dd4bf'],
  'Entertainment':   ['#f59e0b','#fbbf24'],
  'Finance':         ['#ef4444','#f87171'],
  'Lifestyle':       ['#a855f7','#c084fc'],
};

function _factoryNicheGradient(niche) {
  const [c1, c2] = NICHE_COLORS[niche] || ['#6366f1','#818cf8'];
  return `linear-gradient(135deg,${c1},${c2})`;
}

const MONETIZATION_LABELS = {
  adsense:     'Publicidade',
  affiliate:   'Afiliados',
  products:    'Produtos digitais',
  memberships: 'Assinaturas',
  sponsorship: 'Sponsorship',
  mixed:       'Misto',
};

const PERSONALITY_LABELS = {
  educator:    'Educador',
  entertainer: 'Entertainer',
  authority:   'Autoridade',
  storyteller: 'Contador',
  motivator:   'Motivador',
  analyst:     'Analista',
  friend:      'Amigo',
  interviewer: 'Entrevistador',
};

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════════ */
function renderFactorySetup(container) {
  const existingChannels = _factoryLoadChannels();
  const existingAvatars  = _factoryLoadAvatars();
  const existingScheds   = _factoryLoadSchedules();

  const initialized = existingChannels.filter(c => c._factory).length;
  const isSetUp     = initialized >= 50;

  const nicheGroups = {};
  FACTORY_50.forEach(([name,niche]) => { nicheGroups[niche] = (nicheGroups[niche]||0)+1; });

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fa-solid fa-rocket" style="color:var(--accent)"></i> AI Content Factory</div>
        <div class="section-subtitle">50 canais automáticos com avatares IA, pipeline de conteúdo e monetização</div>
      </div>
      <div class="flex gap-1">
        ${isSetUp ? `
          <button class="btn btn-secondary" onclick="factoryResetConfirm()">
            <i class="fa-solid fa-arrow-rotate-left"></i> Reinicializar
          </button>` : ''}
        <button class="btn btn-primary" id="factory-init-btn" onclick="factoryInitialize()" ${isSetUp ? 'disabled' : ''}>
          <i class="fa-solid fa-rocket"></i> ${isSetUp ? 'Fábrica ativa' : 'Inicializar 50 Canais'}
        </button>
      </div>
    </div>

    <!-- Status bar -->
    ${isSetUp ? `
      <div class="card mb-3" style="padding:14px 16px;border-left:4px solid var(--green)">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <i class="fa-solid fa-circle-check" style="color:var(--green);font-size:1.4rem"></i>
          <div style="flex:1">
            <div style="font-weight:700;font-size:1rem">Fábrica de conteúdo ativa!</div>
            <div class="text-muted text-sm">${initialized} canais · ${existingAvatars.filter(a=>a._factory).length} avatares · ${existingScheds.filter(s=>s._factory).length} jobs de automação configurados</div>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-sm btn-secondary" onclick="app.navigate('channels')">
              <i class="fa-brands fa-youtube"></i> Ver canais
            </button>
            <button class="btn btn-sm btn-secondary" onclick="app.navigate('avatar-studio')">
              <i class="fa-solid fa-masks-theater"></i> Ver avatares
            </button>
            <button class="btn btn-sm btn-secondary" onclick="app.navigate('scheduler')">
              <i class="fa-solid fa-robot"></i> Ver scheduler
            </button>
          </div>
        </div>
      </div>` : `
      <div class="card mb-3" style="padding:14px 16px;border-left:4px solid var(--accent)">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <i class="fa-solid fa-info-circle" style="color:var(--accent);font-size:1.2rem;margin-top:2px"></i>
          <div>
            <div style="font-weight:600;margin-bottom:4px">O que será criado automaticamente</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px">
              ${[
                ['fa-masks-theater','var(--pink)',   '50 Avatares IA únicos','Com voz, personalidade e estilo visual'],
                ['fa-brands fa-youtube','var(--red)', '50 Canais YouTube','Nicho, frequência e monetização configurados'],
                ['fa-robot','var(--accent)',          'Jobs de automação','Geração e publicação automática diária'],
                ['fa-dollar-sign','var(--green)',      'Monetização integrada','Adsense, afiliados, assinaturas, produtos'],
              ].map(([icon,color,title,sub]) => `
                <div style="display:flex;gap:8px;align-items:flex-start">
                  <i class="fa-solid ${icon}" style="color:${color};margin-top:2px;flex-shrink:0"></i>
                  <div>
                    <div style="font-size:.83rem;font-weight:600">${title}</div>
                    <div class="text-muted" style="font-size:.72rem">${sub}</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`}

    <!-- Progress bar (hidden initially) -->
    <div id="factory-progress-wrap" style="display:none" class="card mb-3" style="padding:16px">
      <div style="padding:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:.85rem;font-weight:600" id="factory-progress-label">A inicializar…</span>
          <span style="font-size:.85rem;color:var(--accent)" id="factory-progress-pct">0%</span>
        </div>
        <div class="progress-bar" style="height:8px;margin-bottom:12px">
          <div class="progress-fill" id="factory-progress-fill" style="width:0%;background:var(--accent);transition:width .3s"></div>
        </div>
        <div id="factory-progress-log" style="font-size:.75rem;color:var(--text-muted);max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:2px"></div>
      </div>
    </div>

    <!-- Niches summary -->
    <div class="grid-4 mb-3">
      ${Object.entries(nicheGroups).map(([niche, count]) => {
        const [c1] = NICHE_COLORS[niche] || ['#6366f1','#818cf8'];
        return `
          <div class="stat-card">
            <div class="stat-icon" style="background:${c1}22">
              <i class="fa-solid ${_nicheIcon(niche)}" style="color:${c1}"></i>
            </div>
            <div class="stat-value">${count}</div>
            <div class="stat-label">${niche}</div>
          </div>`;
      }).join('')}
    </div>

    <!-- Channel grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
      ${FACTORY_50.map(([name, niche, uploads, monetization, avName, gender, personality, voice, age, visualStyle, topics], idx) => {
        const [c1, c2] = NICHE_COLORS[niche] || ['#6366f1','#818cf8'];
        const ch = existingChannels.find(c => c.name === name && c._factory);
        return `
          <div class="card" style="padding:0;overflow:hidden">
            <div style="height:4px;background:${_factoryNicheGradient(niche)}"></div>
            <div style="padding:12px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <div style="width:40px;height:40px;border-radius:8px;background:${_factoryNicheGradient(niche)};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i class="fa-solid ${_nicheIcon(niche)}" style="color:#fff;font-size:.9rem"></i>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;font-size:.9rem">${name}</div>
                  <div style="font-size:.72rem;color:var(--text-muted)">${niche} · ${uploads}x/dia</div>
                </div>
                <div>
                  ${ch ? '<span class="badge" style="background:var(--green-soft);color:var(--green);font-size:.65rem">✓ ativo</span>'
                       : '<span class="badge badge-muted" style="font-size:.65rem">pendente</span>'}
                </div>
              </div>

              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                <span class="badge badge-muted" style="font-size:.68rem"><i class="fa-solid fa-masks-theater"></i> ${avName}, ${age}</span>
                <span class="badge badge-muted" style="font-size:.68rem"><i class="fa-solid fa-microphone"></i> ${voice}</span>
                <span class="badge badge-muted" style="font-size:.68rem">${MONETIZATION_LABELS[monetization] || monetization}</span>
                <span class="badge badge-muted" style="font-size:.68rem">${PERSONALITY_LABELS[personality] || personality}</span>
              </div>

              <div style="font-size:.7rem;color:var(--text-muted);line-height:1.4;margin-bottom:6px">
                <i class="fa-solid fa-palette" style="color:${c1}"></i> ${visualStyle}
              </div>

              <div style="border-top:1px solid var(--border);padding-top:6px">
                <div style="font-size:.68rem;color:var(--text-muted);margin-bottom:3px">Tópicos diários</div>
                ${topics.slice(0,2).map(t => `<div style="font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">• ${t}</div>`).join('')}
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

/* ══════════════════════════════════════════════════════════════
   INICIALIZAÇÃO DA FÁBRICA
══════════════════════════════════════════════════════════════ */
async function factoryInitialize() {
  const btn = document.getElementById('factory-init-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;display:inline-block"></div> A criar…'; }

  const progressWrap = document.getElementById('factory-progress-wrap');
  const progressFill = document.getElementById('factory-progress-fill');
  const progressLabel = document.getElementById('factory-progress-label');
  const progressPct   = document.getElementById('factory-progress-pct');
  const progressLog   = document.getElementById('factory-progress-log');

  if (progressWrap) progressWrap.style.display = 'block';

  const TOTAL_STEPS = FACTORY_50.length * 3; // avatar + channel + schedules per entry
  let step = 0;

  function setProgress(label, pct) {
    if (progressLabel) progressLabel.textContent = label;
    if (progressFill)  progressFill.style.width  = pct + '%';
    if (progressPct)   progressPct.textContent   = pct + '%';
  }

  function logStep(msg) {
    if (!progressLog) return;
    const el = document.createElement('div');
    el.textContent = '✓ ' + msg;
    el.style.color = 'var(--green)';
    progressLog.appendChild(el);
    progressLog.scrollTop = progressLog.scrollHeight;
  }

  const createdAvatars  = {};  // name → avatar obj
  const createdChannels = [];
  const createdScheds   = [];

  const existingAvatars  = _factoryLoadAvatars();
  const existingChannels = _factoryLoadChannels();
  const existingScheds   = _factoryLoadSchedules();

  /* ── Step 1: Create all avatars ── */
  setProgress('A criar avatares…', 5);

  const uniqueAvatarNames = [...new Set(FACTORY_50.map(r => r[4]))];
  for (const avName of uniqueAvatarNames) {
    // Find first channel that uses this avatar
    const row = FACTORY_50.find(r => r[4] === avName);
    if (!row) continue;
    const [, , , , , gender, personality, voice, age] = row;

    // Check if already exists
    const exists = existingAvatars.find(a => a.name === avName && a._factory);
    if (exists) {
      createdAvatars[avName] = exists;
      continue;
    }

    const av = {
      id:             `factory_av_${avName.toLowerCase().replace(/\s+/g,'_')}_${Date.now()}`,
      name:           avName,
      nome:           avName,
      gender,
      personality,
      voice_id:       voice,
      animation_model:'sadtalker',
      image:          '',
      imagem_url:     '',
      _factory:       true,
      created_at:     new Date().toISOString(),
    };
    createdAvatars[avName] = av;
    logStep(`Avatar criado: ${avName} (${gender}, ${personality})`);

    step++;
    setProgress(`Avatares: ${avName}`, Math.round((step / TOTAL_STEPS) * 40));
    await _factoryYield();
  }

  // Save all avatars
  const newAvatars = Object.values(createdAvatars).filter(a => !existingAvatars.find(x => x.id === a.id));
  _factoryLoadAvatars; // warm
  localStorage.setItem('yt_studio_avatars', JSON.stringify([...existingAvatars, ...newAvatars]));

  /* ── Step 2: Create all channels ── */
  setProgress('A criar canais…', 42);

  const uploadsHours = {
    1: ['09:00'],
    2: ['09:00','18:00'],
    3: ['08:00','13:00','19:00'],
  };

  for (let i = 0; i < FACTORY_50.length; i++) {
    const [name, niche, uploads, monetization, avName, gender, personality, voice, age, visualStyle, topics] = FACTORY_50[i];
    const av = createdAvatars[avName];

    // Check if already exists
    const exists = existingChannels.find(c => c.name === name && c._factory);
    if (exists) {
      createdChannels.push(exists);
    } else {
      const ch = {
        id:               `factory_ch_${i + 1}_${Date.now() + i}`,
        name,
        niche,
        language:         'pt',
        avatar_host:      av?.id || '',
        avatar_host_name: avName,
        upload_frequency: '1d',
        shorts_per_day:   Math.max(0, uploads - 1),
        monetization_type:monetization,
        total_views:      0,
        monthly_revenue:  0,
        url:              '',
        status:           'active',
        videos_generated: 0,
        visual_style:     visualStyle,
        daily_topics:     topics,
        _factory:         true,
        created_at:       new Date().toISOString(),
      };
      createdChannels.push(ch);
      logStep(`Canal criado: ${name} (${niche}, ${uploads}x/dia)`);
    }

    step++;
    setProgress(`Canais: ${name}`, 42 + Math.round((i / FACTORY_50.length) * 30));
    await _factoryYield();
  }

  // Merge channels (keep non-factory channels + new factory channels)
  const nonFactory    = existingChannels.filter(c => !c._factory);
  const factoryUpdate = createdChannels;
  localStorage.setItem('yt_factory_channels', JSON.stringify([...nonFactory, ...factoryUpdate]));

  /* ── Step 3: Create automation schedules ── */
  setProgress('A configurar automação…', 74);

  const nonFactoryScheds = existingScheds.filter(s => !s._factory);
  const newScheds = [];

  for (let i = 0; i < FACTORY_50.length; i++) {
    const [name, niche, uploads, monetization] = FACTORY_50[i];
    const ch = createdChannels.find(c => c.name === name);
    if (!ch) continue;

    const alreadyHasScheds = existingScheds.some(s => s._factory && s.channel_id === ch.id);
    if (alreadyHasScheds) continue;

    const hours = uploadsHours[uploads] || ['09:00'];

    // Generate video job(s)
    hours.forEach(time => {
      newScheds.push({
        id:         `factory_sj_${ch.id}_gen_${time.replace(':','')}`,
        type:       'generate_video',
        frequency:  'daily',
        time,
        channel_id: ch.id,
        notes:      `Auto: ${name} — geração de conteúdo`,
        enabled:    true,
        last_run:   null,
        _factory:   true,
        created_at: new Date().toISOString(),
      });
    });

    // Upload video job (30 min after last generation)
    const lastHour = hours[hours.length - 1];
    const [h, m] = lastHour.split(':').map(Number);
    const uploadTime = `${String(h).padStart(2,'0')}:${String((m + 30) % 60).padStart(2,'0')}`;
    newScheds.push({
      id:         `factory_sj_${ch.id}_upload`,
      type:       'upload_video',
      frequency:  'daily',
      time:       uploadTime,
      channel_id: ch.id,
      notes:      `Auto: ${name} — publicação`,
      enabled:    true,
      last_run:   null,
      _factory:   true,
      created_at: new Date().toISOString(),
    });

    // Generate thumbnail job (early morning)
    newScheds.push({
      id:         `factory_sj_${ch.id}_thumb`,
      type:       'generate_thumbnail',
      frequency:  'daily',
      time:       '07:30',
      channel_id: ch.id,
      notes:      `Auto: ${name} — thumbnails`,
      enabled:    true,
      last_run:   null,
      _factory:   true,
      created_at: new Date().toISOString(),
    });

    // Generate script job (early morning)
    newScheds.push({
      id:         `factory_sj_${ch.id}_script`,
      type:       'generate_script',
      frequency:  'daily',
      time:       '07:00',
      channel_id: ch.id,
      notes:      `Auto: ${name} — roteiros`,
      enabled:    true,
      last_run:   null,
      _factory:   true,
      created_at: new Date().toISOString(),
    });

    step++;
    setProgress(`Automação: ${name}`, 74 + Math.round((i / FACTORY_50.length) * 24));
    await _factoryYield();
  }

  localStorage.setItem('yt_factory_schedules', JSON.stringify([...nonFactoryScheds, ...newScheds]));

  /* ── Done ── */
  setProgress('Fábrica inicializada com sucesso!', 100);
  logStep(`${factoryUpdate.length} canais criados`);
  logStep(`${Object.keys(createdAvatars).length} avatares criados`);
  logStep(`${newScheds.length} jobs de automação configurados`);

  app.toast('🚀 50 canais criados com sucesso!', 'success');

  setTimeout(() => {
    renderFactorySetup(document.getElementById('content'));
  }, 1500);
}

/* Confirm reset */
function factoryResetConfirm() {
  const body = `
    <div style="text-align:center;padding:16px 0">
      <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;color:var(--yellow);margin-bottom:16px"></i>
      <p style="font-size:1rem;font-weight:600;margin-bottom:8px">Reinicializar a fábrica?</p>
      <p class="text-muted" style="font-size:.85rem">Todos os 50 canais, avatares e schedules criados automaticamente serão apagados. Posts e canais adicionados manualmente <strong>não são afetados</strong>.</p>
    </div>`;
  const footer = `
    <button class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
    <button class="btn btn-danger" onclick="factoryReset()">
      <i class="fa-solid fa-arrow-rotate-left"></i> Reinicializar
    </button>`;
  app.openModal('Reinicializar fábrica', body, footer);
}

function factoryReset() {
  // Remove factory channels
  const channels = _factoryLoadChannels().filter(c => !c._factory);
  localStorage.setItem('yt_factory_channels', JSON.stringify(channels));

  // Remove factory avatars
  const avatars = _factoryLoadAvatars().filter(a => !a._factory);
  localStorage.setItem('yt_studio_avatars', JSON.stringify(avatars));

  // Remove factory schedules
  const scheds = _factoryLoadSchedules().filter(s => !s._factory);
  localStorage.setItem('yt_factory_schedules', JSON.stringify(scheds));

  app.closeModal();
  app.toast('Fábrica reinicializada', 'success');
  renderFactorySetup(document.getElementById('content'));
}

/* ── Helpers ── */
function _factoryLoadChannels()  { try { return JSON.parse(localStorage.getItem('yt_factory_channels') || '[]'); } catch { return []; } }
function _factoryLoadAvatars()   { try { return JSON.parse(localStorage.getItem('yt_studio_avatars')   || '[]'); } catch { return []; } }
function _factoryLoadSchedules() { try { return JSON.parse(localStorage.getItem('yt_factory_schedules')|| '[]'); } catch { return []; } }

function _factoryYield() { return new Promise(r => setTimeout(r, 0)); }

function _nicheIcon(niche) {
  const icons = {
    'Technology':       'fa-microchip',
    'Education':        'fa-graduation-cap',
    'Music':            'fa-music',
    'Health & Fitness': 'fa-heart-pulse',
    'Entertainment':    'fa-star',
    'Finance':          'fa-coins',
    'Lifestyle':        'fa-leaf',
  };
  return icons[niche] || 'fa-play';
}
