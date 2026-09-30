/* ============================================================
 * 一起去 · 周末 —— 应用层
 * 全局命名空间 YQ，无构建依赖，普通 <script> 加载
 * ============================================================ */
window.YQ = window.YQ || {};
(function () {
  const { CATS, PLACES, TEAMS, GUIDES, MOODS, SLOTS, DAYS, WEATHER } = YQ;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    key: 'yiqi_weekend_v1',
    load() {
      try { return JSON.parse(localStorage.getItem(this.key)) || null; }
      catch (e) { return null; }
    },
    save(s) { try { localStorage.setItem(this.key, JSON.stringify(s)); } catch (e) {} }
  };

  /* ---------- 默认状态 ---------- */
  const DEFAULT = {
    onboarded: false,
    mode: 'P',               // 'P' 随心收集 | 'J' 好好安排
    tab: 'discover',
    weather: 'sunny',
    budget: 300,             // 预算线 ¥
    interests: ['expo', 'food', 'outdoor'],
    pocket: [],              // [placeId]
    schedule: { sat: { am: null, noon: null, pm: null, eve: null },
                sun: { am: null, noon: null, pm: null, eve: null } },
    teamsJoined: [],
    myTeams: [],             // 我发起的
    checkins: [],            // {placeId, mood, note, ts}
    guides: [],              // {id, style, author, likes, title, placeIds, body, ts}
    likes: []
  };
  let state = Object.assign({}, DEFAULT, store.load() || {});
  /* 深合并 schedule，防止旧版本缺字段 */
  state.schedule = Object.assign({}, DEFAULT.schedule, state.schedule);
  state.schedule.sat = Object.assign({}, DEFAULT.schedule.sat, state.schedule.sat);
  state.schedule.sun = Object.assign({}, DEFAULT.schedule.sun, state.schedule.sun);
  const save = () => store.save(state);

  /* ---------- 推荐引擎 ---------- */
  function recommend(p) {
    let score = p.rating;                       // 基础口碑分
    const reasons = [];
    if (p.weather.includes(state.weather)) { score += 2; reasons.push('适合' + WEATHER[state.weather].label + '天'); }
    else if (!p.indoor && state.weather === 'rainy') { score -= 4; reasons.push('雨天不建议'); }
    else if (!p.indoor && state.weather !== 'rainy') { score += 1; }
    if (p.price <= state.budget) { score += 1; reasons.push('预算内'); }
    else score -= 3;
    const hit = p.tags.filter(t => state.interests.includes(p.cat));
    if (state.interests.includes(p.cat)) { score += 2; reasons.push('符合你的兴趣'); }
    if (p.distance <= 3) { score += 1; reasons.push('离家近'); }
    return { score, reason: reasons.slice(0, 2).join(' · ') || '本周热门' };
  }
  const ranked = () => PLACES.map(p => ({ p, ...recommend(p) }))
    .sort((a, b) => b.score - a.score);

  /* ---------- 通用 UI ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function openModal(html, cls = '') {
    $('#modalRoot').innerHTML =
      `<div class="mask" onclick="YQ.closeModal(event)"><div class="modal ${cls}" onclick="event.stopPropagation()">${html}</div></div>`;
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }
  YQ.closeModal = e => { if (!e || e.type === 'click' || e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const catColor = c => CATS[c].color;
  const placeById = id => PLACES.find(p => p.id === id);
  const esc = s => String(s).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  /* ---------- 模式徽章 / 切换 ---------- */
  const MODE_META = {
    P: { name: 'P · 随心收集', hint: '先存着，到时候看心情' },
    J: { name: 'J · 好好安排', hint: '排进课表，心里踏实' }
  };
  function setMode(m) {
    state.mode = m; save();
    document.body.dataset.mode = m;
    if (state.tab === 'plan') renderPlan();
    renderHeader();
    toast(m === 'P' ? '已切到 P · 随心收集 🫧' : '已切到 J · 好好安排 📋');
  }
  YQ.setMode = setMode;

  /* ---------- 引导页 ---------- */
  function renderOnboard() {
    $('#onboard').innerHTML = `
      <div class="onboard">
        <div class="onboard-brand"><span class="logo">→</span> 一起去 · 周末</div>
        <h1>这个周末，<br><em>按你的节奏来。</em></h1>
        <p class="onboard-sub">同一份周末计划，两种节奏。不用选对角色，随时可以切换。</p>
        <div class="onboard-cards">
          <button class="ob-card ob-p" onclick="YQ.pickMode('P')">
            <b>P</b><i>~</i><strong>随心收集</strong>
            <span>刷到心动的展览、市集，先丢进口袋，时间到了再说。</span>
          </button>
          <button class="ob-card ob-j" onclick="YQ.pickMode('J')">
            <b>J</b><i>▦</i><strong>好好安排</strong>
            <span>把想法排进周末课表，上午下午一格一格填满。</span>
          </button>
        </div>
        <button class="ob-skip" onclick="YQ.pickMode(null)">随便看看，稍后再选</button>
      </div>`;
  }
  YQ.pickMode = m => {
    if (m) { state.mode = m; }
    state.onboarded = true; save();
    document.body.dataset.mode = state.mode;
    boot();
    if (m) toast(m === 'P' ? 'P · 随心收集，刷到喜欢的先存着 🫧' : 'J · 好好安排，一格一格填满周末 📋');
  };

  /* ---------- 头部 ---------- */
  function renderHeader() {
    const m = MODE_META[state.mode];
    $('#header').innerHTML = `
      <div class="head-brand"><span class="logo">→</span>一起去·周末</div>
      <button class="mode-pill ${state.mode === 'P' ? 'mp' : 'mj'}" onclick="YQ.swapMode()">
        <b>${state.mode}</b><span>${state.mode === 'P' ? '随心收集' : '好好安排'}</span> ⇄
      </button>
      <button class="avatar" onclick="YQ.openSettings()">🙂</button>`;
  }
  YQ.swapMode = () => setMode(state.mode === 'P' ? 'J' : 'P');

  /* ---------- 发现页 ---------- */
  function renderDiscover() {
    const w = WEATHER[state.weather];
    const list = ranked().slice(0, 10);
    $('#view-discover').innerHTML = `
      <div class="weather-card w-${state.weather}">
        <div class="w-left">
          <span class="w-emoji">${w.emoji}</span>
          <div><b>上海 · ${w.label}</b><small>${w.tip}</small></div>
        </div>
        <div class="w-switch">
          ${Object.entries(WEATHER).map(([k, v]) =>
            `<button class="${k === state.weather ? 'on' : ''}" onclick="YQ.setWeather('${k}')" title="演示切换">${v.emoji}</button>`).join('')}
        </div>
      </div>
      <div class="chips">
        <span class="chip-label">预算</span>
        ${[['any', '不限'], [100, '≤100'], [300, '≤300'], [500, '≤500']].map(([v, t]) =>
          `<button class="chip ${v === 'any' ? (state.budget === 99999 ? 'on' : '') : (state.budget === v ? 'on' : '')}"
            onclick="YQ.setBudget(${v === 'any' ? 99999 : v})">${t}</button>`).join('')}
        <span class="chip-label">人数</span>
        <button class="chip" onclick="toast('同行人数在组队页设置 ~')">👥</button>
      </div>
      <div class="feed">
        ${list.map(({ p, reason }) => cardHTML(p, reason)).join('')}
      </div>`;
  }
  YQ.setWeather = w => { state.weather = w; save(); renderDiscover(); toast('天气切换为「' + WEATHER[w].label + '」，推荐已更新'); };
  YQ.setBudget = v => { state.budget = v; save(); renderDiscover(); };

  /* 活动卡片（P：丢进口袋 / J：排入课表） */
  function cardHTML(p, reason) {
    const inPocket = state.pocket.includes(p.id);
    const c = CATS[p.cat];
    const primary = state.mode === 'P'
      ? `<button class="btn-sm ${inPocket ? 'ghost' : 'blue'}" onclick="YQ.toPocket('${p.id}')">${inPocket ? '已在口袋 ✓' : '+ 丢进口袋'}</button>`
      : `<button class="btn-sm yellow" onclick="YQ.toSchedule('${p.id}')">排入课表</button>`;
    return `
      <article class="card place" onclick="YQ.openPlace('${p.id}')">
        <div class="card-emoji" style="border-color:${c.color};color:${c.color};background:${c.color}22">${p.emoji}</div>
        <div class="card-main">
          <div class="card-title">${esc(p.name)}</div>
          <div class="card-meta">${c.emoji} ${c.name} · ${p.distance}km · ${p.priceText} · ★${p.rating}</div>
          <div class="card-tags">${p.tags.map(t => `<i>${t}</i>`).join('')}${reason ? `<i class="why">💡 ${reason}</i>` : ''}</div>
        </div>
        <div class="card-act" onclick="event.stopPropagation()">${primary}</div>
      </article>`;
  }

  /* ---------- 计划页（P 口袋 / J 课表） ---------- */
  function renderPlan() {
    if (state.mode === 'P') renderPocket(); else renderSchedule();
  }
  function renderPocket() {
    const items = state.pocket.map(placeById).filter(Boolean);
    $('#view-plan').innerHTML = `
      <div class="page-head">
        <h2>旅行口袋 → 周末口袋</h2>
        <small>先存着，到时候看心情 · ${items.length} 个想法</small>
      </div>
      ${items.length ? `<div class="pocket-list">
        ${items.map(p => `
          <div class="card pocket-item" onclick="YQ.openPlace('${p.id}')">
            <span class="dot" style="background:${catColor(p.cat)}"></span>
            <div class="card-main">
              <div class="card-title">${esc(p.name)}</div>
              <div class="card-meta">${p.priceText} · ${p.distance}km · ${p.duration}</div>
            </div>
            <div class="card-act" onclick="event.stopPropagation()">
              <button class="btn-sm yellow" onclick="YQ.toSchedule('${p.id}')">转安排</button>
              <button class="btn-sm ghost" onclick="YQ.rmPocket('${p.id}')">移除</button>
            </div>
          </div>`).join('')}
        <div class="pocket-tip">想法攒够了？<a href="javascript:YQ.swapMode()">切到 J 模式排进课表 →</a></div>
      </div>` : `
        <div class="empty">
          <div class="empty-emoji">🫧</div>
          <p>口袋还是空的</p>
          <small>去<a href="javascript:YQ.goTab('discover')">发现页</a>刷到心动的就丢进来，不用管时间。</small>
        </div>`}`;
  }
  YQ.toPocket = id => {
    if (state.pocket.includes(id)) { toast('已经在口袋里啦'); return; }
    state.pocket.push(id); save();
    renderDiscover();
    toast('已丢进口袋 🫧 看心情再去');
  };
  YQ.rmPocket = id => { state.pocket = state.pocket.filter(x => x !== id); save(); renderPlan(); };

  function renderSchedule() {
    const days = ['sat', 'sun'];
    const booked = flatSchedule();
    const total = booked.reduce((s, x) => s + x.p.price, 0);
    const over = total > state.budget;
    $('#view-plan').innerHTML = `
      <div class="page-head">
        <h2>周末课表</h2>
        <small>一格一格填满，也留白给意外</small>
      </div>
      <div class="grid-wrap"><div class="grid">
        <div class="grid-slot"></div>
        ${days.map(d => `<div class="grid-day">${DAYS[d]}</div>`).join('')}
        ${Object.keys(SLOTS).map(slot => `
          <div class="grid-slot">${SLOTS[slot]}</div>
          ${days.map(d => {
            const pid = state.schedule[d][slot];
            const p = pid && placeById(pid);
            return p ? `
              <div class="cell filled" style="--c:${catColor(p.cat)}" onclick="YQ.openPlace('${p.id}')">
                <b>${p.emoji} ${esc(p.name)}</b>
                <small>${p.priceText} · ${p.duration}</small>
              </div>` : `
              <button class="cell empty-cell" onclick="YQ.pickSlot('${d}','${slot}')">+</button>`;
          }).join('')}
        `).join('')}
      </div></div>
      <div class="sum ${over ? 'over' : ''}">
        <span>已安排 ${booked.length} 项 · 预算合计 <b>¥${total}</b> / 线 ¥${state.budget === 99999 ? '∞' : state.budget}</span>
        <small>${over ? '超预算了，砍掉一项？' : '还在预算内，不错 👌'}</small>
      </div>
      ${booked.length ? '' : '<div class="empty"><div class="empty-emoji">▦</div><p>课表还空着</p><small>从<a href="javascript:YQ.goTab(\'discover\')">发现页</a>「排入课表」，或把口袋里的想法<a href="javascript:YQ.swapMode()">转过来</a>。</small></div>'}`;
  }
  function flatSchedule() {
    const out = [];
    for (const d of ['sat', 'sun']) for (const s of Object.keys(SLOTS)) {
      const pid = state.schedule[d][s];
      if (pid) out.push({ d, s, p: placeById(pid) });
    }
    return out;
  }
  YQ.pickSlot = (d, s) => {
    const inPocket = state.pocket.map(placeById).filter(Boolean);
    const others = ranked().filter(({ p }) => !flatSchedule().some(x => x.p.id === p.id)).slice(0, 6);
    openModal(`
      <h3>${DAYS[d]} ${SLOTS[s]} · 安排什么？</h3>
      ${inPocket.length ? '<p class="m-label">口袋里的想法</p>' + inPocket.map(p =>
        `<button class="row" onclick="YQ.fillSlot('${d}','${s}','${p.id}')"><span class="dot" style="background:${catColor(p.cat)}"></span>${esc(p.name)} <small>${p.priceText}</small></button>`).join('') : ''}
      <p class="m-label">为你推荐</p>
      ${others.map(({ p }) =>
        `<button class="row" onclick="YQ.fillSlot('${d}','${s}','${p.id}')"><span class="dot" style="background:${catColor(p.cat)}"></span>${esc(p.name)} <small>${p.priceText}</small></button>`).join('')}
    `);
  };
  YQ.fillSlot = (d, s, id) => {
    state.schedule[d][s] = id; save(); closeModal(); renderPlan();
    toast(`已排入 ${DAYS[d]}${SLOTS[s]}`);
  };
  /* J 模式发现页主按钮：快速排课（默认推荐时段） */
  YQ.toSchedule = id => {
    if (state.mode === 'J') {
      const p = placeById(id);
      const d = 'sat', s = p.best in SLOTS ? p.best : 'pm';
      if (flatSchedule().some(x => x.p.id === id)) { openPlace(id); return; }
      state.schedule[d][s] = id; save(); renderPlan();
      toast(`已排入 ${DAYS[d]}${SLOTS[s]}，可去课表调整`);
      if (state.tab === 'discover') renderDiscover();
    } else YQ.toPocket(id);
  };

  /* ---------- 地点详情（含用户评价） ---------- */  function openPlace(id) {
    const p = placeById(id);
    const c = CATS[p.cat];
    const myReviews = state.checkins.filter(x => x.placeId === id).map(x =>
      ({ user: '我', mood: x.mood, text: x.note }));
    const reviews = [...myReviews, ...p.reviews];
    openModal(`
      <div class="d-hero" style="background:${c.color}33;border-color:${c.color};color:#3a3324">
        <span>${p.emoji}</span>
        <div><h3>${esc(p.name)}</h3><small>${p.location} · 距离 ${p.distance}km</small></div>
      </div>
      <div class="d-stats">
        <div><b>${p.priceText}</b><small>价格</small></div>
        <div><b>★ ${p.rating}</b><small>评分</small></div>
        <div><b>${p.duration}</b><small>时长</small></div>
        <div><b>${p.weather.map(w => WEATHER[w].emoji).join('')}</b><small>适宜</small></div>
      </div>
      <p class="d-desc">${esc(p.desc)}</p>
      <div class="d-tags">${p.tags.map(t => `<i>${t}</i>`).join('')}</div>
      <div class="d-act">
        <button class="btn blue" onclick="YQ.toPocket('${p.id}');YQ.closeModal()">丢进口袋</button>
        <button class="btn yellow" onclick="YQ.closeModal();YQ.openSlotPick('${p.id}')">排入课表</button>
      </div>
      <h4>评价 · ${reviews.length}</h4>
      <div class="revs">
        ${reviews.map(r => `<div class="rev"><b>${r.mood} ${esc(r.user)}</b><p>${esc(r.text)}</p></div>`).join('') || '<small>还没有评价</small>'}
      </div>
      <button class="btn ghost w100" onclick="YQ.writeReview('${p.id}')">写一条评价</button>
    `);
  }
  YQ.openPlace = openPlace;
  /* 从详情选时段（自由选六/日 × 时段） */
  YQ.openSlotPick = id => {
    openModal(`<h3>排到什么时候？</h3>` + ['sat', 'sun'].map(d =>
      `<p class="m-label">${DAYS[d]}</p><div class="slot-grid">` +
      Object.keys(SLOTS).map(s => {
        const busy = state.schedule[d][s] && state.schedule[d][s] !== id;
        return `<button class="chip ${busy ? 'off' : ''}" ${busy ? 'disabled' : ''}
          onclick="YQ.fillSlot('${d}','${s}','${id}')">${SLOTS[s]}${busy ? ' · 已占' : ''}</button>`;
      }).join('') + '</div>').join(''));
  };
  YQ.writeReview = id => {
    openModal(`
      <h3>评价 ${esc(placeById(id).name)}</h3>
      <p class="m-label">这一趟的心情</p>
      <div class="slot-grid">${MOODS.map(m => `<button class="chip" onclick="YQ.submitReview('${id}','${m}')">${m}</button>`).join('')}</div>
      <input id="revNote" class="inp" placeholder="一句话说说（可选）" maxlength="40">`);
  };
  YQ.submitReview = (id, mood) => {
    const note = ($('#revNote') && $('#revNote').value.trim()) || '值得记录的一天';
    state.checkins.unshift({ placeId: id, mood, note, ts: Date.now() });
    save(); closeModal(); toast('评价已发布 📝');
    if (state.tab === 'checkin') renderCheckin();
  };

  /* ---------- 组队 ---------- */
  function allTeams() {
    const mine = state.myTeams.map(t => ({ ...t, mine: true }));
    return [...mine, ...TEAMS];
  }
  function renderTeams() {
    $('#view-team').innerHTML = `
      <div class="page-head"><h2>组队出发</h2><small>J 定档期，P 看心情，都能组到局</small></div>
      <div class="team-acts">
        <button class="btn blue" onclick="YQ.createTeam('P')">🫧 P 式 · 随心喊人</button>
        <button class="btn yellow" onclick="YQ.createTeam('J')">📋 J 式 · 定档组队</button>
      </div>
      <div class="team-list">
        ${allTeams().map(t => {
          const joined = state.teamsJoined.includes(t.id) || t.mine;
          const p = placeById(t.placeId);
          return `
          <div class="card team">
            <span class="badge ${t.style === 'J' ? 'bj' : 'bp'}">${t.style}</span>
            <div class="card-main">
              <div class="card-title">${esc(t.title)}</div>
              <div class="card-meta">${t.style === 'J' ? '⏰ ' : '🫧 '}${esc(t.time)} · ${p ? p.location : ''}</div>
              <div class="card-tags">${t.members.map(m => `<i>🙂 ${esc(m)}</i>`).join('')}<i class="why">${t.members.length}/${t.capacity} 人</i></div>
              <p class="team-note">${esc(t.note)}</p>
            </div>
            <div class="card-act">
              ${joined ? '<button class="btn-sm ghost" disabled>已加入 ✓</button>'
                       : `<button class="btn-sm blue" onclick="YQ.joinTeam('${t.id}')">加入</button>`}
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }
  YQ.joinTeam = id => {
    state.teamsJoined.push(id); save(); renderTeams();
    toast('已加入！出发前记得看集合信息 👋');
  };
  YQ.createTeam = style => {
    const opts = PLACES.map(p => `<option value="${p.id}">${p.emoji} ${esc(p.name)}</option>`).join('');
    openModal(`
      <h3>${style === 'J' ? 'J 式 · 定档组队' : 'P 式 · 随心喊人'}</h3>
      ${style === 'J' ? '<p class="m-label">时间定死，人来就行</p>' : '<p class="m-label">先喊人，时间到时候商量</p>'}
      <select id="tPlace" class="inp">${opts}</select>
      ${style === 'J' ? `
        <div class="pair">
          <select id="tDay" class="inp"><option value="sat">周六</option><option value="sun">周日</option></select>
          <select id="tSlot" class="inp">${Object.entries(SLOTS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
        </div>` : `
        <input id="tTime" class="inp" placeholder="大概时间（如：周六下午？看天气）" maxlength="20">`}
      <input id="tCap" class="inp" type="number" min="2" max="10" value="6" placeholder="人数上限">
      <input id="tNote" class="inp" placeholder="${style === 'J' ? '集合地点 / 注意事项' : '说一句召集的话'}" maxlength="50">
      <button class="btn blue w100" onclick="YQ.submitTeam('${style}')">发起组队</button>`);
  };
  YQ.submitTeam = style => {
    const placeId = $('#tPlace').value;
    const cap = Math.max(2, Math.min(10, +$('#tCap').value || 6));
    const note = ($('#tNote').value || '').trim() || (style === 'J' ? '记得准时集合' : '感兴趣就来');
    const p = placeById(placeId);
    const time = style === 'J'
      ? `${DAYS[$('#tDay').value]} ${SLOTS[$('#tSlot').value]} 集合`
      : ($('#tTime').value || '时间随缘');
    state.myTeams.unshift({
      id: 'mt' + Date.now(), style, placeId, capacity: cap, note, time,
      title: p.name.split(' · ')[0], members: ['我'], mine: true
    });
    save(); closeModal(); renderTeams();
    toast('组队已发起，等人上车 🚗');
  };

  /* ---------- 打卡 ---------- */
  function renderCheckin() {
    const done = new Set(state.checkins.map(c => c.placeId));
    const pending = flatSchedule().map(x => x.p)
      .concat(state.pocket.map(placeById).filter(Boolean))
      .filter(p => p && !done.has(p.id));
    const uniqPending = [...new Map(pending.map(p => [p.id, p])).values()];
    const spent = state.checkins.reduce((s, c) => s + (placeById(c.placeId)?.price || 0), 0);
    $('#view-checkin').innerHTML = `
      <div class="page-head"><h2>打卡记录</h2><small>去过的地方，都值得留一条</small></div>
      <div class="footprint">
        <div><b>${state.checkins.length}</b><small>打卡</small></div>
        <div><b>${new Set(state.checkins.map(c => c.placeId)).size}</b><small>去过</small></div>
        <div><b>¥${spent}</b><small>已花</small></div>
      </div>
      ${uniqPending.length ? `<p class="m-label">待打卡（来自课表和口袋）</p>
        <div class="pending">
          ${uniqPending.map(p => `
            <div class="card pending-item">
              <span class="dot" style="background:${catColor(p.cat)}"></span>
              <div class="card-main"><div class="card-title">${esc(p.name)}</div>
              <div class="card-meta">${p.location}</div></div>
              <button class="btn-sm blue" onclick="YQ.doCheckin('${p.id}')">打卡</button>
            </div>`).join('')}
        </div>` : ''}
      <p class="m-label">打卡墙</p>
      ${state.checkins.length ? `<div class="wall">
        ${state.checkins.map(c => {
          const p = placeById(c.placeId);
          return `<div class="wall-item">
            <span class="wall-emoji" style="border-color:${p ? catColor(p.cat) : '#ccc'};color:${p ? catColor(p.cat) : '#ccc'};background:${p ? catColor(p.cat) : '#ccc'}22">${p ? p.emoji : '📍'}</span>
            <div><b>${esc(p ? p.name : '未知地点')} ${c.mood}</b>
            <p>${esc(c.note)}</p><small>${new Date(c.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small></div>
          </div>`;
        }).join('')}
      </div>` : `<div class="empty"><div class="empty-emoji">📍</div><p>还没有打卡</p><small>出门玩回来，点上面「打卡」留一句。</small></div>`}`;
  }
  YQ.doCheckin = id => {
    openModal(`
      <h3>打卡 · ${esc(placeById(id).name)}</h3>
      <p class="m-label">此刻的心情</p>
      <div class="slot-grid">${MOODS.map(m => `<button class="chip" onclick="YQ.submitCheckin('${id}','${m}')">${m}</button>`).join('')}</div>
      <input id="ckNote" class="inp" placeholder="一句话记录（可选）" maxlength="40">`);
  };
  YQ.submitCheckin = (id, mood) => {
    const note = ($('#ckNote') && $('#ckNote').value.trim()) || '到过，很喜欢。';
    state.checkins.unshift({ placeId: id, mood, note, ts: Date.now() });
    save(); closeModal(); renderCheckin();
    toast('打卡成功 📍 足迹 +1');
  };

  /* ---------- 攻略 ---------- */
  function renderGuides() {
    const mine = state.guides.map(g => ({ ...g }));
    const all = [...mine, ...GUIDES];
    $('#view-guide').innerHTML = `
      <div class="page-head"><h2>攻略分享</h2><small>J 拿去照着排，P 收进口袋慢慢看</small></div>
      <button class="btn blue w100" onclick="YQ.writeGuide()">✏️ 写一篇周末攻略</button>
      <div class="guide-list">
        ${all.map(g => `
          <div class="card guide">
            <span class="badge ${g.style === 'J' ? 'bj' : 'bp'}">${g.style}</span>
            <div class="card-main">
              <div class="card-title">${esc(g.title)}</div>
              <div class="card-meta">by ${esc(g.author)} · ♥ ${g.likes}</div>
              <p class="guide-body">${esc(g.body)}</p>
              <div class="card-tags">${(g.placeIds || []).map(id => {
                const p = placeById(id); return p ? `<i style="border-color:${catColor(p.cat)};color:${catColor(p.cat)}">${p.emoji} ${esc(p.name.split(' · ')[0])}</i>` : '';
              }).join('')}</div>
            </div>
            <div class="card-act col">
              <button class="btn-sm ghost" onclick="YQ.guideLike('${g.id}')">♥</button>
              <button class="btn-sm blue" onclick="YQ.guideToPocket('${g.id}')">进口袋</button>
              <button class="btn-sm yellow" onclick="YQ.guideToSchedule('${g.id}')">照着排</button>
            </div>
          </div>`).join('')}
      </div>`;
  }
  YQ.guideLike = id => {
    const g = state.guides.find(x => x.id === id);
    if (g) { g.likes++; save(); renderGuides(); toast('已点赞 ♥'); }
    else toast('已点赞 ♥');
  };
  YQ.guideToPocket = id => {
    const g = GUIDES.find(x => x.id === id) || state.guides.find(x => x.id === id);
    if (!g) return;
    let n = 0;
    (g.placeIds || []).forEach(pid => {
      if (!state.pocket.includes(pid)) { state.pocket.push(pid); n++; }
    });
    save(); renderGuides(); toast(n ? `已把 ${n} 个地方收进口袋 🫧` : '口袋里已经有这些啦');
  };
  YQ.guideToSchedule = id => {
    const g = GUIDES.find(x => x.id === id) || state.guides.find(x => x.id === id);
    if (!g) return;
    /* 按 g.placeIds 顺序填入周六上午→晚上，再周日 */
    const order = ['am', 'noon', 'pm', 'eve'];
    let i = 0;
    outer:
    for (const d of ['sat', 'sun'])
      for (const s of order) {
        if (i >= (g.placeIds || []).length) break outer;
        if (!state.schedule[d][s]) state.schedule[d][s] = g.placeIds[i++];
      }
    save(); setMode('J');
    YQ.goTab('plan');
    toast('攻略已照着排进课表 📋');
  };
  YQ.writeGuide = () => {
    const opts = PLACES.map(p => `<option value="${p.id}">${p.emoji} ${esc(p.name)}</option>`).join('');
    openModal(`
      <h3>写攻略</h3>
      <input id="gTitle" class="inp" placeholder="标题（如：雨天周末这样过）" maxlength="24">
      <select id="gPlaces" multiple size="4">${opts}</select>
      <small class="muted">按住 Cmd/Ctrl 可多选，选的顺序就是推荐顺序</small>
      <textarea id="gBody" class="inp" rows="4" placeholder="正文：怎么去、几点去、注意什么……" maxlength="200"></textarea>
      <button class="btn blue w100" onclick="YQ.submitGuide()">发布</button>`);
  };
  YQ.submitGuide = () => {
    const title = $('#gTitle').value.trim();
    const body = $('#gBody').value.trim();
    const placeIds = [...$('#gPlaces').selectedOptions].map(o => o.value);
    if (!title || !body) { toast('标题和正文都要填哦'); return; }
    state.guides.unshift({
      id: 'mg' + Date.now(), style: state.mode, author: '我', likes: 0,
      title, body, placeIds, ts: Date.now()
    });
    save(); closeModal(); renderGuides();
    toast('攻略已发布 📝');
  };

  /* ---------- 我的 / 偏好设置 ---------- */
  const ALL_INTERESTS = Object.keys(CATS);
  YQ.openSettings = () => {
    openModal(`
      <h3>我的偏好</h3>
      <p class="m-label">周末最想做的事（影响推荐）</p>
      <div class="slot-grid">
        ${ALL_INTERESTS.map(k => `
          <button class="chip ${state.interests.includes(k) ? 'on' : ''}" onclick="YQ.toggleInterest('${k}')">
            ${CATS[k].emoji} ${CATS[k].name}</button>`).join('')}
      </div>
      <p class="m-label">周末预算线</p>
      <div class="slot-grid">
        ${[[100, '¥100'], [300, '¥300'], [500, '¥500'], [99999, '不限']].map(([v, t]) =>
          `<button class="chip ${state.budget === v ? 'on' : ''}" onclick="YQ.setBudgetLine(${v})">${t}</button>`).join('')}
      </div>
      <button class="btn blue w100" onclick="YQ.closeModal()">保存并关闭</button>`);
  };
  YQ.toggleInterest = k => {
    const i = state.interests.indexOf(k);
    i > -1 ? state.interests.splice(i, 1) : state.interests.push(k);
    save(); YQ.openSettings(); renderDiscover();
  };
  YQ.setBudgetLine = v => { state.budget = v; save(); YQ.openSettings(); renderDiscover(); };

  /* ---------- Tab 路由 ---------- */
  const RENDERERS = { discover: renderDiscover, plan: renderPlan, team: renderTeams, checkin: renderCheckin, guide: renderGuides };
  YQ.goTab = t => {
    state.tab = t; save();
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
    $$('.view').forEach(v => v.classList.remove('active'));
    $('#view-' + t).classList.add('active');
    RENDERERS[t]();
    $('#content').scrollTop = 0;
  };

  /* ---------- 启动 ---------- */
  function boot() {
    $('#onboard').style.display = 'none';
    $('#app').style.display = 'flex';
    renderHeader();
    YQ.goTab(state.tab in RENDERERS ? state.tab : 'discover');
  }
  YQ.boot = boot;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.mode = state.mode;
    if (state.onboarded) boot();
    else {
      renderOnboard();
      $('#onboard').style.display = 'flex';
      $('#app').style.display = 'none';
    }
  });
})();
