'use strict';

const $ = (id) => document.getElementById(id);
const main = $('main');
const dialog = $('dialog');
const saveKey = 'breakfast-rush-v1';
const dayLength = 100;
const autoShiftDuration = 40;
const seatsPerTable = 4;
const menus = [
  { name: '鸡蛋煎饼', art: 'crepe', cost: 2, price: 9, time: 5 },
  { name: '鲜肉蒸包', art: 'bao', cost: 1, price: 5, time: 4 },
  { name: '现磨豆浆', art: 'soy', cost: 1, price: 4, time: 3 },
];
const people = ['小周', '陈阿姨', '老周', '小满', '林师傅', '梅姐'];
const qArt = new Set(['office','elder','cyclist','student','rider','keeper','grandpa','table','stool','cart','crepe','bao','soy','supply','cake','dirty']);
const forecasts = [
  { kind: 'sun', label: '晴天', rush: '上班族陆续到场', pace: 1, stock: [8, 7, 7] },
  { kind: 'rain', label: '小雨', rush: '热豆浆更受欢迎', pace: .93, stock: [8, 8, 10] },
  { kind: 'sun', label: '晴天', rush: '地铁口迎来客流高峰', pace: 1.16, stock: [10, 9, 9] },
  { kind: 'cloud', label: '多云', rush: '街坊结伴出门吃早饭', pace: 1.08, stock: [9, 10, 8] },
];
const paths = {
  stall:'M3 10h18l-2-6H5z M5 10v10h14V10 M9 20v-6h6v6',
  stock:'M4 8l8-4 8 4v9l-8 4-8-4z M4 8l8 4 8-4 M12 12v9',
  people:'M15 20v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3 M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M17 4a3 3 0 0 1 0 6 M21 20v-3a4 4 0 0 0-3-4',
  ledger:'M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8 7h7 M8 11h7 M8 15h4',
  clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  coin:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9 7l3 4 3-4 M9 12h6 M9 15h6 M12 11v7',
  heart:'M12 20 4 12C-2 6 7 1 12 7c5-6 14-1 8 5z',
  sound:'M3 9h4l5-4v14l-5-4H3z M15 9a4 4 0 0 1 0 6 M18 6a8 8 0 0 1 0 12',
  mute:'M3 9h4l5-4v14l-5-4H3z M16 10l5 5 M21 10l-5 5',
  cup:'M5 8h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z M17 9h2a2 2 0 0 1 0 4h-2 M7 5V3 M11 5V3',
  table:'M3 9h18v4H3z M6 13v7 M18 13v7',
  sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1',
  cloud:'M6 18a4 4 0 0 1-.9-7.9 5.6 5.6 0 0 1 10.8-1.4A4.7 4.7 0 1 1 18.3 18Z',
  rain:'M6 15a3.6 3.6 0 0 1-.6-7.1 5.4 5.4 0 0 1 10.3-1.2A4.2 4.2 0 1 1 18 15H6 M8 18l-1 3 M13 18l-1 3 M18 18l-1 3',
  tool:'M4 17l8-8a5 5 0 0 1 6-6l-3 3 3 3 3-3a5 5 0 0 1-6 6l-8 8z',
  map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15',
  bag:'M5 7h14l2 14H3z M8 8V6a4 4 0 0 1 8 0v2',
};
const coolerCaps=[0,10,20,35];
const offers = {
  trial: { title: '试用双层蒸笼', detail: '今天开摊后，前 35 秒可多做一张单。', valid: () => game.phase === 'prep', apply: () => {} },
  help: { title: '请邻摊来帮忙', detail: '接下来 22 秒多一个出餐位，帮手会送餐和收桌。', valid: () => game.phase === 'live' && !game.closing, apply: () => { game.helpUntil = game.elapsed + 22; } },
  restock: { title: '领取应急食材', detail: '煎饼、蒸包和豆浆各补 4 份。', valid: () => game.phase === 'live' && !game.closing, apply: () => { game.stock = game.stock.map((n) => n + 4); game.drinkOnly=false; } },
  shout: { title: '吆喝一嗓子', detail: '请来四组捧场客，吃完会额外给小费。', valid: () => game.phase === 'live' && !game.closing && game.tutorial>=3 && game.queue.length <= 1 && game.tables.includes(null), apply: () => {
    for(let i=0;i<4;i++)if(addCustomer(i%2+1,undefined,null,false))game.queue.at(-1).sponsor=true;
  } },
  bonus: { title: '经营利润翻倍', detail: '再领一份当日经营利润。基础利润已到账。', valid: () => game.phase === 'report' && game.report?.profit > 0, apply: () => { game.money += game.report.profit; game.report.bonus = game.report.profit; } },
  fast4:{ title:'4× 加速',detail:'获得 30 个营业秒的 4× 加速。',valid:()=>game.phase==='live'&&!game.closing&&game.tutorial>=3,apply:()=>enableTimedSpeed(4) },
  fast8:{ title:'8× 加速',detail:'获得 15 个营业秒的 8× 加速。',valid:()=>game.phase==='live'&&!game.closing&&game.tutorial>=3,apply:()=>enableTimedSpeed(8) },
  autoShift: {
    title: '请搭档托管',
    detail: '搭档帮你带位、上餐、收桌，也会接单并交付外带。持续 '+autoShiftDuration+' 个营业秒，倍速会一起快进，每班可领一次。食材不足时会跳过该单。',
    valid: () => game.phase === 'live' && !game.closing && game.tutorial >= 3 && !game.streetLesson &&
      game.elapsed + autoShiftDuration <= dayLength,
    apply: () => { game.autoShiftUntil = game.elapsed + autoShiftDuration; },
  },
  reroll:{ title:'再看一批应聘者',detail:'替换至少一位今天来应聘的街坊。',valid:()=>canReroll(),apply:()=>{game.recruitShift=nextCandidateShift();} },
  gift:{ title:'每日礼包再领一份',detail:'今日额外领 ¥27。',calendar:'video',valid:()=>!game.welfare.video,apply:()=>{game.money+=27;} },
  cash:{ title:'领取周转金',detail:'领 ¥27 周转金，无需归还。',calendar:'emergency',valid:()=>game.money<30&&!game.welfare.emergency,apply:()=>{game.money+=27;} },
  vouchers:{ title:'领取装扮券',detail:'获得 3 张装扮券。',calendar:'decor',valid:()=>!game.welfare.decor,apply:()=>{game.vouchers+=3;} },
  support:{title:'请小禾喝杯豆浆',detail:'自愿看一次视频，支持继续更新早餐摊。',calendar:'support',valid:()=>true,apply:()=>{}},
};
const platformTimeoutMs=120000;
let game = load(0);
let page = defaultPage();
let selected = null;
let rewardChoice = null;
let rewardReturn = null;
let rewardPending = false;
let toastTimeout;
let drag = null;
let suppressClick = false;
let nextId = Math.max(0, ...game.queue.map((c) => c.id), ...orders().map((t) => t?.id || 0)) + 1;
let lastTick = performance.now();
let nextTick = lastTick;
let lastPaint = 0;
let lastSave = 0;
let continuousAt = null;
let reportReading = false;

function freshGame() {
  return {
    ...extraState(),
    version: 3, phase: 'prep', day: 1, money: 100, reputation: 12, area: 0, seatCount: 4, stove: 1,
    cooler: false, assistant: false, sound: true, plan: [8, 7, 7], price: 1, speed: 1,
    stock: [0, 0, 0], queue: [], tables: [], elapsed: 0, arrival: 0, served: 0, lost: 0,
    revenue: 0, cost: 0, used: {}, helpUntil: 0, autoShiftUntil: 0, closing: false, report: null, history: [],
    takeaway: [], boxes: 1, todayTakeaway: 0, todayGroups: 0, sold: [0, 0, 0], style: 0, canopy: false, priorityOrder: null,
    progress: districts.map(() => ({ served: 0, revenue: 0, takeaway: 0, groups: 0, days: 0, reputation:12, cleared: false })),
    lifetime: { served: 0, revenue: 0, takeaway: 0, groups: 0, bestServed: 0 }, completedDay: null,
  };
}
function load(slot = activeSlot) {
  try {
    const saved = readStorage(slotKey(slot));
    if (saved && ['prep', 'live', 'report'].includes(saved.phase) && Array.isArray(saved.tables)
      && Array.isArray(saved.queue) && saved.plan?.length === 3 && saved.stock?.length === 3) {
      const result = { ...freshGame(), ...saved };
      if (!saved.version || saved.version < 2) {
        const reports = [...(saved.history || []), ...(saved.report ? [saved.report] : [])];
        for (const report of reports) {
          result.lifetime.served += report.served;
          result.lifetime.revenue += report.revenue;
          result.lifetime.bestServed = Math.max(result.lifetime.bestServed, report.served);
          result.progress[0].served += report.served;
          result.progress[0].revenue += report.revenue;
          result.progress[0].days++;
        }
      }
      if (!saved.version || saved.version < 3) {
        result.activeStove=result.stove;
        result.coolerLevel=Number(result.cooler);
        result.tutorial=3;
      }
      result.settings={...extraState().settings,...saved.settings};
      result.welfare={...extraState().welfare,...saved.welfare};
      result.version=3;
      return result;
    }
  } catch { /* browser storage may be unavailable */ }
  return freshGame();
}
function save() {
  if(titleOpen)return false;
  const timestamp=Date.now();
  if(!writeStorage(slotKey(activeSlot),{...game,savedAt:timestamp}))return false;
  game.savedAt=timestamp;
  return true;
}
function defaultPage() {
  return { prep: 'prep', live: 'stall', report: 'ledger' }[game.phase];
}
function district() { return districts[game.area]; }
function forecast() { return forecasts[(game.day - 1) % forecasts.length]; }
function autoShiftActive() {
  return game.phase === 'live' && !game.closing && game.autoShiftUntil > game.elapsed;
}
function special() {
  const entry = dailySpecials[(game.day - 1) % dailySpecials.length];
  return { ...entry, target: entry.target + game.area, prize: entry.prize + game.area * 3 };
}
function desiredStock(day=game.day) {
  const weather=forecasts[(day-1)%forecasts.length];
  return district().stock.map((count,index)=>Math.min(35,count+weather.stock[index]-forecasts[0].stock[index]));
}
function orders() { return [...game.tables, ...game.takeaway]; }
function passedCount() { return game.progress.filter((entry) => entry.cleared).length; }
function availableReward() {
  const provider = window.breakfastRewardedVideo;
  return typeof provider?.play === 'function' &&
    (typeof provider.available !== 'function' || provider.available());
}
async function platformCall(action,timeoutMs=platformTimeoutMs){
  let timer;
  try{
    return await Promise.race([Promise.resolve().then(action),new Promise((_,reject)=>{
      timer=setTimeout(()=>reject(new Error('Platform request timed out')),timeoutMs);
    })]);
  }finally{clearTimeout(timer);}
}
function icon(name) {
  return '<svg aria-hidden="true" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="' + paths[name] + '"/></svg>';
}
function art(name, className = '') {
  const asset = qArt.has(name) ? 'q-'+name : name;
  return '<img class="illustrated ' + className + '" src="./assets/' + asset + '.webp" alt="" draggable="false">';
}
function yen(n) { return '¥' + n.toLocaleString('zh-CN'); }
function button(label, act, kind = 'secondary', data = '', disabled = false) {
  return '<button class="' + kind + '" data-act="' + act + '" ' + data + (disabled ? ' disabled' : '') + '>' + label + '</button>';
}
function offer(key, label) {
  if(!availableReward()&&key==='trial')return '';
  const used=rewardUsed(key);
  return button('<span class="ad-symbol" aria-hidden="true">▶</span>' + (used ? '已领取' : label),
    'offer', 'reward', 'data-key="' + key + '"', used || !offers[key].valid());
}
function rewardUsed(key) {
  const calendar=offers[key]?.calendar;
  if(calendar){refreshWelfare();return !!game.welfare[calendar];}
  return !!game.used[key];
}
function clockText() {
  return shiftClock(game.phase === 'prep' ? 0 : game.elapsed);
}
function shiftClock(elapsed) {
  const minutes = Math.min(160, Math.floor(elapsed * 160 / dayLength));
  return String(6 + Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
}
function paintStats() {
  $('location').textContent = district().name + ' · 第 ' + game.day + ' 天';
  $('stats').innerHTML = '<span>' + icon('clock') + '<strong>' + clockText() + '</strong> ' +
    { prep: '备货', live: page !== 'stall' || game.speed === 0 ? '已暂停' : game.closing ? '收摊中' : '营业', report: '打烊' }[game.phase] +
    '</span><span>' + icon('coin') + '<strong>' + yen(game.money) + '</strong></span><span>' + icon('heart') + '<strong>口碑 ' + game.reputation + '</strong></span>';
  const quantities=game.phase==='prep'?game.stock:game.phase==='live'?game.stock:[0,0,0];
  const total=quantities.reduce((sum,n)=>sum+n,0);
  const initial=game.phase==='live'?Math.max(total,game.openingStock||0,1):Math.max(1,total);
  const standing=localRank().standing;
  update('service-strip','<span>'+icon('stock')+' '+(game.phase==='live'?'库存':'冷藏余货')+' <strong>'+total+' 份</strong><i class="stock-meter" aria-hidden="true"><i style="width:'+Math.round(total/initial*100)+'%"></i></i></span>'+
    button(standing?'本城第 '+standing+' 名 ›':'本城榜 ›','nav','inline-link','data-page="rank"'));
  $('sound').innerHTML = icon(breakfastAudio.isMuted() ? 'mute' : 'sound');
  $('sound').setAttribute('aria-label', breakfastAudio.isMuted() ? '开启声音' : '关闭声音');
}
function audioToggle(position) {
  const muted = breakfastAudio.isMuted();
  const label = muted ? '开启声音' : '关闭声音';
  return button(icon(muted ? 'mute' : 'sound'), 'sound', 'sound ' + position, 'aria-label="' + label + '" title="' + label + '"');
}
function panelHeading(title, glyph, trailing = '') {
  return '<div class="page-heading row"><h2>'+icon(glyph)+' '+title+'</h2>'+trailing+'</div>';
}
function journalHeading(title, illustration, detail = '') {
  return '<div class="journal-heading"><div><h2>'+title+'</h2>'+
    (detail?'<p>'+detail+'</p>':'')+'</div>'+art(illustration)+'</div>';
}
function paint() {
  breakfastAudio.sync();
  const app=$('app');
  app.classList.toggle('title-open',titleOpen);
  app.dataset.page=titleOpen?'title':page;
  app.dataset.district=district().scene;
  const street = !titleOpen && game.phase === 'live' && page === 'stall';
  app.classList.toggle('street-active', street);
  app.classList.toggle('low-effects',game.settings.reduced);
  app.style.setProperty('--top-inset',[0,12,24][game.settings.inset]+'px');
  if(titleOpen){
    const returningToTitle=Boolean(main.dataset.view);
    delete main.dataset.view;
    main.innerHTML=renderTitle();
    if(returningToTitle)main.scrollTop=0;
    return;
  }
  paintStats();
  const firstShift=game.day===1&&game.phase==='live';
  const selectedTab={ledger:'stall',career:'stall',regulars:'more',album:'more',branches:'more',history:'more',welfare:'more'}[page]??page;
  $('nav').innerHTML = [
    ['stall','街口'],['prep',game.phase==='live'?'食材':'备料'],['staff','排班'],
    ['decor','布置'],['rank','晨市榜'],['more','手账'],
  ].map(([name, label]) => button('<span class="nav-icon" aria-hidden="true">'+art('nav-'+name)+'</span><span>'+label+'</span>', 'nav', selectedTab === name ? 'active' : '', 'data-page="' + name + '"' + (selectedTab === name ? ' aria-current="'+(page===name?'page':'location')+'"' : '')+
    (firstShift&&name!=='stall'?' aria-disabled="true" title="第一天收摊后开放"':''))).join('');
  const views={ prep:renderPrep,stall:renderStall,staff:renderPersonnel,career:renderCareer,ledger:renderLedger,
    rank:renderRanks,decor:renderDecor,more:renderMore,welfare:renderWelfare,regulars:renderRegulars,album:renderAlbum,branches:renderBranches,history:renderHistory };
  if (street && $('street-world')?.classList.contains('district-' + district().scene)) {
    paintStreet();
    return;
  }
  const view = `${activeSlot}:${game.day}:${game.phase}:${page}`;
  const sameView = main.dataset.view === view;
  const opened = sameView ? [...main.querySelectorAll('details[data-fold][open]')].map(fold => fold.dataset.fold) : [];
  main.dataset.view = view;
  main.innerHTML = views[page]();
  for (const fold of main.querySelectorAll('details[data-fold]')) fold.open = opened.includes(fold.dataset.fold);
  if(!sameView)main.scrollTop=0;
  if (street) paintStreet();
}
function scene(caption = '', layout = '') {
  const weather = forecast();
  return '<div class="scenery scenery-' + district().scene + (layout?' '+layout:'') + '" data-weather="' + weather.kind + '">' +
    (game.area>0?art('cart','scene-cart'):'')+
    '<div class="steam" aria-hidden="true"><i></i><i></i><i></i></div>' +
    sceneDecor() + '<div class="scene-top">' + button(icon(weather.kind)+' '+weather.label+' · '+weather.rush,'weather','weather','data-i="0"') +
    '<span class="chip">' + district().name + '</span></div>' +
    '<div class="hero-note"><div><small>第 ' + game.day + ' 天</small><h2>' + caption + '</h2></div></div></div>';
}
function costOf(items) { return Math.round(items.reduce((total, n, i) => total + n * menus[i].cost, 0)*.95); }
function renderPrep() {
  if (game.phase === 'live') return renderInventory();
  if (game.phase === 'report') return '<section class="panel">'+journalHeading('给明早备点什么','nav-prep','今天的炉火已经歇了。结完这一班的账，就能备下一班。')+
    button('打开今天的账','nav','primary full','data-page="ledger"')+'</section>';
  const event=prepEvent();
  const eventChoice=event.options[game.eventChoice ?? defaultPrepChoice()];
  const eventCost=game.eventChoice===null ? eventChoice[2] : 0;
  const actual = affordablePlan(game.plan,game.money-eventCost);
  const cost = costOf(actual);
  const planned=game.plan.reduce((sum,count)=>sum+count,0);
  const purchased=actual.reduce((sum,count)=>sum+count,0);
  const chilled=game.stock.reduce((sum,count)=>sum+count,0);
  const stocked=chilled+purchased;
  const capped=purchased<planned;
  const advice=stockAdvice();
  const adjusted = game.plan.some((n,i)=>n!==Math.max(0,advice[i].count-game.stock[i]));
  const draft=specialsBoard[game.featured];
  const unlocked=specialsBoard.filter(featureUnlocked).length;
  const missed=game.history.at(-1)?.food;
  const missedItem=missed?.findIndex(({missed})=>missed>0) ?? -1;
  const note=missedItem>=0 ? '上一班'+menus[missedItem].name+'卖得快，今天可以多备一点。' : forecast().rush+'。';
  return '<div class="management-page prep-page">'+
    '<section class="panel prep-board">'+journalHeading('小禾的备料单','nav-prep',note)+
    '<div class="segments prep-presets" aria-label="备料偏好">'+['跟着建议','多备 25%','多备 50%'].map((label,i)=>
      button(label,'preset',game.orderPref===i?'active':'','data-i="'+i+'" aria-pressed="'+(game.orderPref===i)+'"')).join('')+'</div>'+
    '<div class="products">' + menus.map((menu,i) => '<div class="product">' + art(menu.art) + '<div class="prep-food"><strong>'+menu.name+'</strong>'+
      '<small>'+yen(menu.cost)+'/份 · 建议带 '+advice[i].count+' 份'+(advice[i].reason?' · '+advice[i].reason:'')+'</small>'+
      '<small>冷柜 '+game.stock[i]+' 份'+(actual[i]!==game.plan[i]?' · 实买 '+actual[i]+' 份':'')+'</small></div><div class="stepper">' +
      button('−', 'plan', '', 'data-i="' + i + '" data-change="-1" aria-label="减少' + menu.name + '"', game.plan[i] === 0) +
      '<span>' + game.plan[i] + '</span>' +
      button('+', 'plan', '', 'data-i="' + i + '" data-change="1" aria-label="增加' + menu.name + '"', game.plan[i] >= 35) +
      '</div></div>').join('') + '</div>' +
    '<div class="prep-quantity">'+button('−5','plan-batch','quantity-button','data-change="-5" aria-label="减少 5 份备货"',!planned)+
    '<div><small>合计计划买</small> <b>'+planned+' 份</b></div>'+
    button('+5','plan-batch','quantity-button','data-change="5" aria-label="增加 5 份备货"',game.plan.every(count=>count>=35))+'</div>'+
    '<div class="prep-totals"><p>冷柜 '+chilled+' ＋ 新买 '+purchased+' ＝ <strong>带出 '+stocked+' 份</strong></p>'+
    '<p>采购 <b>'+yen(cost)+'</b>'+(eventCost?' ＋ 街坊来信 '+yen(eventCost):'')+' <span>· 预计剩 '+yen(game.money-cost-eventCost)+'</span></p></div>'+
    (capped?'<p class="prep-budget">手里的钱能买 '+purchased+' 份。带出量已按实际采购计算。</p>':'')+
    (adjusted?button('重算建议量','recommend','inline-link'):'')+'</section>'+
    '<section class="panel menu-board">'+panelHeading('菜单与标价','ledger')+
    button(art(draft.art)+'<span><small>黑板推荐 · 已解锁 '+unlocked+'/'+specialsBoard.length+'</small><b>'+draft.name+'</b></span><strong>换一道 ›</strong>','feature-menu','prep-feature-card')+
    '<div class="prep-prices" aria-label="菜单定价">' + [['早客价','来客 +12%'],['原菜单价','常规客流'],['溢价','来客 −12%']].map(([name,detail],i) =>
      button('<b>'+name+'</b><small>'+detail+'</small>','price',game.price===i?'active':'','data-i="'+i+'" aria-pressed="'+(game.price===i)+'"')).join('')+'</div>'+
    '</section><div class="prep-main-links">'+
    button(icon('ledger')+'<span><b>'+event.title+'</b><small>'+(game.eventChoice===null?'街坊来信 · 默认 ':'已回信 · ')+eventChoice[0]+'</small></span><strong aria-hidden="true">'+(game.eventChoice===null?'›':'✓')+'</strong>','daily-event','prep-event')+
    button(icon('heart')+'<span>补给</span>','nav','prep-welfare','data-page="welfare"')+'</div>'+
    '<section class="panel prep-extras"><details class="ux-fold" data-fold="prep-goals"><summary>看天气和今天的销售目标</summary>'+
    forecastStrip()+
    '<p>'+special().name+' · 卖出 '+special().target+' 份'+menus[special().item].name+'可领 '+yen(special().prize)+'。</p>'+
    '<p>'+district().hint+'</p><div class="actions">'+button('街区目标 ›','nav','secondary','data-page="career"')+
    offer('trial','试用蒸笼')+'</div></details></section>'+
    '<div class="prep-checkout">'+
    (game.money < 4 && !game.stock.some(Boolean) ? button('领街坊食材', 'credit', 'secondary full') : '')+
    button(icon('stall')+'<b>装车开摊</b><small id="prep-fast-tally">'+stocked+' 份 · '+yen(cost+eventCost)+'</small>',
      'start','primary full prep-start','aria-describedby="prep-fast-tally"',!stocked||cost>game.money)+
    '</div></div>';
}
function renderInventory() {
  return '<section class="panel inventory-panel">'+
    journalHeading('补给台','nav-prep',game.stock.reduce((sum,count)=>sum+count,0)+' 份食材可用')+
    inventoryDetails()+'<div class="actions">'+button('回街口接客','nav','secondary','data-page="stall"')+'</div></section>';
}
function stockGap(guest) {
  return menus.map((_,i)=>Math.max(0,(guest?.items?.[i]||0)-game.stock[i]));
}
function stockGapText(guest) {
  return stockGap(guest).map((n,i)=>n?'缺 '+n+' 份'+menus[i].name:'').filter(Boolean).join(' · ');
}
function restockCost(counts) {
  return counts.reduce((cost,count,i)=>cost+(menus[i].cost+1)*count,0);
}
function inventoryDetails() {
  const guests=game.queue.filter(guest=>stockGap(guest).some(Boolean));
  const requested=guests.find(guest=>guest.id===selected);
  const requestedGap=stockGap(requested);
  const total=restockCost(requestedGap);
  const remaining=requested?guests.filter(guest=>guest!==requested):guests;
  const options=(remaining.length?'<ul class="stock-requests">'+remaining.map(guest=>
    '<li>'+guest.size+' 位'+(guest.toGo?'外带客':'等位客')+' · '+stockGapText(guest)+'</li>').join('')+'</ul>':'')+
    '<div class="stock-items">'+menus.map((item,i)=>{
      const count=requestedGap[i]||3;
      const price=(item.cost+1)*count;
      return '<div class="list-item">'+art(item.art)+'<div><b>'+item.name+'</b><span class="sub">余 '+game.stock[i]+' 份</span></div>'+
        button('补 '+count+' 份 · '+yen(price),'buy-stock','secondary','data-i="'+i+'" data-count="'+count+'"',game.money<price||game.closing)+'</div>';
    }).join('')+'</div><div class="actions">'+
    button(game.stockDelivery?'配送中 · '+Math.max(0,Math.ceil(game.stockDelivery.at-game.elapsed))+' 秒':'电话补货 · ¥12','phone-stock','secondary','',game.closing||game.money<12||!!game.stockDelivery)+
    button(game.drinkOnly?'当前只卖豆浆':'只卖豆浆','drink-only','secondary','',game.closing||game.drinkOnly||!game.stock[2])+
    offer('restock','应急食材')+'</div>';
  if(!requested)return options;
  return '<div class="stock-rescue"><b>'+stockGapText(requested)+'</b>'+
    button('补足这单 · '+yen(total),'rescue-stock','primary full','data-id="'+requested.id+'"',game.money<total||game.closing)+
    (game.money<total?'<small>差 '+yen(total-game.money)+'，可看看其他补货方式。</small>':'')+'</div>'+
    '<details class="ux-fold" data-fold="stock"><summary>其他补货方式</summary><p>电话配送约 9 个营业秒后到达。</p>'+options+'</details>';
}
function renderStall() {
  if (game.phase === 'live') return renderStreet();
  return '<section class="panel stall-links">'+journalHeading('今天在'+district().name,'nav-stall',district().title)+
    '<div class="actions">' + button(game.phase === 'prep' ? '拿备料单' : '翻开收摊账','nav','primary',
      'data-page="'+(game.phase==='prep'?'prep':'ledger')+'"')+
    button('查看摆摊路线','nav','secondary','data-page="career"')+'</div>'+
    '<details class="ux-fold" data-fold="stall-weather"><summary>未来几天的天气</summary>'+forecastStrip()+'</details></section>'+
    '<div class="stall-plan">'+renderExpansion()+
    '<section class="panel stall-equipment">'+panelHeading('摊车上的家当','stall')+'<div class="equipment-grid">'+renderUpgrades()+'</div>'+renderCoolerPriority()+'</section></div>';
}
function renderCoolerPriority(){
  if(!game.coolerLevel)return '';
  const locked=game.phase==='report';
  return '<div class="cooler-choice"><b>冷柜满时优先保留</b><div class="segments">'+
    [['main','主食'],['drink','豆浆']].map(([key,label])=>button(label,'cooler-priority',game.coolerPriority===key?'active':'','data-key="'+key+'"',locked)).join('')+
    '</div>'+(locked?'<small>本日已结算，下一天备货时可调整。</small>':'')+'</div>';
}
function queueHint() {
  if (game.closing) return '还剩 '+orders().filter(t=>t&&['queued','cooking','ready','eating'].includes(t.state)).length+' 组';
  if (selected === null) return game.tables.some(t=>t?.state==='dirty')?'点桌面收拾干净':'拖到空桌，或点客人再点桌';
  const guest = game.queue.find((c) => c.id === selected);
  if (stockGap(guest).some(Boolean)) return '这单食材不足';
  if (guest?.toGo) return '点「接外带」安排制作';
  return guest?.size > seatsPerTable ? '需要两张相邻空桌' : '请选择空桌';
}
function capacity() { return operatingStoves() + Number((game.used.trial && game.elapsed < 35) || game.elapsed < game.helpUntil); }
const stovePortions=5;
function kitchenLoad(order) { return Math.min(stovePortions,Math.max(1,order.items[0]+order.items[1])); }
function occupiedStovePortions() {
  return orders().filter(order=>order?.state==='cooking').reduce((sum,order)=>sum+kitchenLoad(order),0);
}
function capacityText() { return occupiedStovePortions()+' / '+capacity()*stovePortions+' 份在做'; }
function kitchenWait() {
  const pending=orders().filter(order=>order?.state==='queued').length;
  const next=orders().filter(order=>order?.state==='cooking').map(order=>order.finish-game.elapsed);
  return Math.max(0,Math.ceil((next.length?Math.min(...next):0)+Math.max(0,pending-1)*4/capacity()));
}
function renderControls() {
  return button('1×', 'speed', 'control' + (game.speed === 1 ? ' active' : ''), 'data-i="1"') +
    button('2×', 'speed', 'control' + (game.speed === 2 ? ' active' : ''), 'data-i="2"') +
    [4,8].map((speed)=>button(speed+'× <small></small>',
      'fast','control','data-i="'+speed+'" aria-label="'+speed+'×"')).join('')+
    offer('shout', '吆喝');
}
function paintControls() {
  const root=$('controls');
  if(!root.firstElementChild)root.innerHTML=renderControls();
  for(const control of root.querySelectorAll('.control')){
    const speed=Number(control.dataset.i);
    control.classList.toggle('active',game.speed===speed);
    if(speed<=2)continue;
    const remaining=game.perkEnds[speed]-game.elapsed;
    const ticket = game.welfare.boost > 0 || game.welfare.perks.some(([rate]) => rate === speed || rate === 0);
    control.querySelector('small').textContent = remaining > 0 ? Math.ceil(remaining) + '秒'
      : ticket ? '倍速券' : rewardUsed('fast' + speed) ? '本班已用' : '+' + (speed === 4 ? 30 : 15) + '秒';
    control.disabled=game.closing||game.tutorial<3;
  }
  const shout=root.querySelector('[data-key=shout]');
  if(shout){
    const used=rewardUsed('shout');
    shout.disabled=used||!offers.shout.valid();
    shout.lastChild.textContent=used?'已吆喝':'吆喝';
  }
}
function renderUpgrades() {
  return [
    ['table', '折叠桌', '已有 ' + game.seatCount + ' / '+tableLimit()+' 桌', 50, game.seatCount >= tableLimit(), 'table'],
    ['tool', '炉子 · '+game.stove+' 台', '运行 '+operatingStoves()+' 台 · 换新 '+game.stoveLevel+' 级', 0, false, 'stoves'],
    ['stock', '冷藏柜 · '+game.coolerLevel+' 级', '容量 '+coolerCaps[game.coolerLevel]+' 份'+(game.coolerLevel<3?' → '+coolerCaps[game.coolerLevel+1]+' 份':''), 85+game.coolerLevel*80, game.coolerLevel>=3, 'cooler'],
    ['bag', '扩充打包台', '可同时接 ' + game.boxes + ' 张外带单', 75, game.boxes >= 3, 'boxes'],
    ['sun', '搭一顶雨棚', '下雨时，排队客人愿意多等 5 秒', 70, game.canopy, 'canopy'],
    ['stall', '灯箱招牌', game.area===0&&!game.signboard?'迁到地铁广场后开放':'来客速度增加 6%', 90, game.signboard, 'signboard'],
  ].map(([glyph, name, desc, price, done, key]) => '<div class="list-item"><span class="medal">' + icon(glyph) + '</span><div><b>' +
    name + '</b><span class="sub">' + desc + '</span></div>' + button(key==='stoves'?'管理炉子 ›':done ? '已完成' : yen(price), key==='stoves'?'stoves':'upgrade', 'secondary', 'data-key="' + key + '"', done || game.money < price || key==='signboard'&&game.area===0) + '</div>').join('');
}
function tableLimit(){ return Math.min(8,4+game.area*2); }
function renderExpansion(){
  const next=districts[game.area+1];if(!next)return '';
  const entry=game.progress[game.area];
  const goals=chapterGoals(game.area).map(([key,name,target,suffix])=>'<div class="row sub"><span>'+name+'</span><b>'+
    Math.min(entry[key]??game.reputation,target)+' / '+target+suffix+'</b></div><div class="progress"><span style="width:'+Math.min(100,100*(entry[key]??game.reputation)/target)+'%"></span></div>').join('');
  return '<section class="panel expansion">'+panelHeading('攒够进度，去'+next.name,'map')+'<p>'+next.hint+'</p>'+goals+
    '<div class="row sub"><span>入驻资金</span><b>'+yen(game.money)+' / '+yen(next.fee)+'</b></div><div class="actions">'+
    button('准备搬摊 · '+yen(next.fee),'district','primary','data-i="'+(game.area+1)+'"',!entry.cleared||game.money<next.fee)+'</div></section>';
}
function chapterGoals(index) {
  const district = districts[index];
  if(index===0)return [['days','完成营业',1,' 天'],['reputation','口碑',13,'']];
  return [
    ['served', '接待客人', district.guests, ' 位'],
    ['revenue', '累计营业额', district.income, ' 元'],
    ['takeaway', '交付外带', district.takeaway, ' 单'],
    ['groups', '接待拼桌', district.groups, ' 组'],
    ['days', '完成营业', district.days, ' 天'],
  ].filter(([, , target]) => target);
}
function renderRouteGoals(index) {
  const progress = game.progress[index];
  return '<ul class="route-goals">' + chapterGoals(index).map(([key, name, target, suffix]) => {
    const value = Math.min(target, progress[key] ?? game.reputation);
    return '<li><div class="route-goal-value"><span>' + name + '</span><b>' + value + ' / ' + target + suffix + '</b></div>' +
      '<progress aria-hidden="true" value="' + value + '" max="' + target + '"></progress></li>';
  }).join('') + '</ul>';
}
function renderCareer() {
  const banner = game.completedDay ? '<section class="panel champion"><span class="chip">早餐节金牌</span><h2>全城都记得这一口热乎</h2><p>第 ' +
    game.completedDay + ' 天完成五个街区的经营目标。你可以继续摆摊、回访街区和收集成就。</p></section>' : '';
  const current = district();
  const cleared = game.progress[game.area].cleared;
  const completed = passedCount();
  const currentPostcard = '<article class="route-current route-' + current.scene + '"><div class="route-cover">' +
    '<span class="route-cover-label">当前摊位' + (cleared ? ' · 目标已完成' : '') + '</span><h3>' + current.name + '</h3></div>' +
    '<div class="route-content"><p>' + current.hint + '</p>' + renderRouteGoals(game.area) + '</div></article>';
  return banner + '<section class="panel career-route">' + journalHeading('出摊路线','nav-stall','已完成 ' + completed + ' / ' + districts.length + ' 个街区') +
    currentPostcard + '<h3 class="route-list-title">其他街区</h3><div class="route-stops">' +
    districts.map((entry, i) => {
      if (i === game.area) return '';
      const progress = game.progress[i];
      const unlocked = i === 0 || game.progress[i - 1].cleared;
      const visited = i === 0 || progress.visited || progress.days > 0;
      const fee = visited ? 0 : entry.fee;
      const status = progress.cleared ? '已完成' : unlocked ? (visited ? '可回访' : '可入驻') : '待解锁';
      const visit = unlocked
        ? button(fee ? '入驻 · ' + yen(fee) : '返回经营', 'district', 'secondary', 'data-i="' + i + '"', game.phase === 'live' || game.money < fee)
        : '<p class="route-unlock">完成「' + districts[i - 1].name + '」的目标后解锁</p>';
      return '<details class="route-stop ux-fold route-' + entry.scene + '" data-fold="route-' + i + '">' +
        '<summary><span class="route-thumb" aria-hidden="true"></span><strong>' + entry.name + '</strong>' +
        '<span class="route-state' + (unlocked ? '' : ' route-locked') + '">' + status + '</span></summary>' +
        '<div class="route-content"><p>' + entry.hint + '</p>' + renderRouteGoals(i) + visit + '</div></details>';
    }).join('') + '</div></section><section class="panel">'+panelHeading('一路攒下的摊车样式','heart')+'<div class="swatches">' + stallStyles.map((style, i) =>
      button('<span style="background:' + style.color + '"></span>' + style.name + (passedCount() < style.required ? '<small>完成 ' + style.required + ' 个街区解锁</small>' : ''),
        'style', game.style === i ? 'control active' : 'control', 'data-i="' + i + '"', passedCount() < style.required)).join('') +
    '</div></section><section class="panel">'+panelHeading('摆摊里程碑','map')+achievements.map((item) => {
      const progress = Math.min(item.goal, item.read(game));
      return '<div class="list-item"><span class="medal">' + (progress === item.goal ? '★' : '☆') + '</span><div><b>' + item.name +
        '</b><p>' + item.detail + '</p></div><span class="sub">' + progress + '/' + item.goal + '</span></div>';
    }).join('') + '</section>';
}
function renderLedger() {
  const report = game.report;
  if (game.phase === 'report' && report?.chapterPrize && game.completedDay === report.day) {
    return '<div class="report-festival">'+art('q-festival')+'<h2>拿到早餐节金牌了！</h2></div>' +
      '<section class="panel champion"><span class="chip">全城早餐节 · 金牌</span><h2>全城都记得这一口热乎</h2>' +
      '<p>从梧桐巷口的一辆小摊车，到河畔广场的早餐节，你走完了五个街区。</p>' +
      '<div class="receipt"><div class="row"><span>经营天数</span><strong>' + game.completedDay + ' 天</strong></div>' +
      '<div class="row"><span>接待客人</span><strong>' + game.lifetime.served + ' 位</strong></div>' +
      '<div class="row"><span>累计营业额</span><strong>' + yen(game.lifetime.revenue) + '</strong></div>' +
      '<div class="row"><span>早餐节奖金已到账</span><strong>' + yen(report.chapterPrize) + '</strong></div></div>' +
      '<details class="receipt-notes"><summary>查看早餐节当天账单</summary>'+receiptDetail(report)+renderReceiptGoals(report)+'</details>'+
      '<div class="actions">' + button('继续经营', 'next', 'primary') + button('看生涯与装扮', 'nav', 'secondary', 'data-page="career"') + '</div>' +
      (offer('bonus', '加领今日经营补贴') ? '<div class="actions">' + offer('bonus', '加领今日经营补贴') + '</div>' : '') + '</section>';
  }
  const chapter = report?.chapterPrize ? '<div class="milestone"><h3>' + districts[report.area].name + '经营目标完成</h3><p>街区奖励 ' +
    yen(report.chapterPrize) + ' 已到账。' + (report.area === districts.length - 1 ? '早餐节金牌已收入生涯。' : '下一处摊位已解锁。') + '</p>' +
    button('打开生涯 ›', 'nav', 'inline-link', 'data-page="career"') + '</div>' : '';
  if (game.phase === 'report' && report) return '<section class="panel shift-receipt">'+
    journalHeading('小禾的收摊账','nav-more','第 '+game.day+' 天 · '+districts[report.area??game.area].name)+
    '<div class="receipt-summary"><div><small>这一班净赚</small><strong>'+yen(report.profit)+'</strong></div>'+
    '<div><small>招呼了</small><strong>'+report.served+' 位</strong></div>'+
    '<div><small>口碑变化</small><strong>'+(report.rep>=0?'+':'')+report.rep+'</strong></div></div>'+
    (report.shortage?'<p class="shift-tip">今天主食一度不足，明早可参考备货建议。</p>':'')+
    (report.bonus?'<p class="shift-tip">已领经营补贴 '+yen(report.bonus)+'。</p>':'')+
    chapter + '<div class="actions">' + button('去备下一班', 'next', 'primary') + (report.profit>0?offer('bonus', '加领经营补贴 ' + yen(report.profit)):'') + '</div>'+
    (game.settings.continuous?'<div class="continuous-panel"><b id="continuous-status"></b>'+button('暂停自动接班','stop-continuous')+'</div>':'')+
    (canExpandAfterReport(report)?'<div class="actions">'+button('这班结束，换个街口','district','secondary','data-i="'+(report.area+1)+'"')+'</div>':'')+
    '</section><section class="panel ledger-notes">'+
    '<details class="ux-fold receipt-notes" data-fold="receipt"><summary>翻看收支与剩料'+
    (report.bills?.some(bill=>bill.unpaid)?' · 有欠款':'')+'</summary>'+
    '<p>错过 '+report.lost+' 位'+
    (report.waste?' · 余货损耗 '+report.waste+' 份':'')+(report.retained?' · 冷藏 '+report.retained+' 份':'')+'</p>'+receiptDetail(report) +
    (report.shortage?'<div class="helpbox">'+(Number.isFinite(report.shortageAt)?shiftClock(report.shortageAt)+' 主食库存告急。':'今天食材提前见底。')+
      (report.drinkOnlyOrders?' 只卖豆浆期间接了 '+report.drinkOnlyOrders+' 单。':'')+'</div>':'')+
    (report.takeaway || report.groups ? '<p>交付外带 ' + (report.takeaway || 0) + ' 单 · 接待拼桌 ' + (report.groups || 0) + ' 组</p>' : '') +
    (report.specialPrize ? '<p>每日招牌奖励 ' + yen(report.specialPrize) + ' 已到账。</p>' : '') +
    renderReceiptGoals(report)+'</details>' +
    '<div class="actions">' + button('整理摊车', 'nav', 'secondary', 'data-page="stall"') + button('看摆摊路线', 'nav', 'secondary', 'data-page="career"') +
    button('翻旧账本', 'nav', 'secondary', 'data-page="history"') + '</div></section>';
  return scene('每一笔都记下') + '<section class="panel"><h2>' + (game.phase === 'live' ? '今日营业' : '营业记录') + '</h2>' +
    (game.phase === 'live' ? '<div class="receipt"><div class="row"><span>营业额</span><b>' + yen(game.revenue) +
    '</b></div><div class="row"><span>已接待</span><b>' + game.served + ' 位</b></div></div>' : '') +
    (game.history.length ? game.history.slice(-12).reverse().map((r) => '<div class="list-item"><span class="medal">' + icon('ledger') +
    '</span><div><b>第 ' + r.day + ' 天 · ' + districts[r.area || 0].name + '</b><span class="sub">接待 ' + r.served + ' 位</span></div><strong>' + yen(r.profit + (r.bonus || 0) + (r.chapterPrize || 0) + (r.specialPrize || 0)) + '</strong></div>').join('') :
    '<p>第一份账单会在收摊后出现。</p>') + '</section>';
}

function canExpandAfterReport(report) {
  const next=districts[report.area+1];
  return next&&game.area===report.area&&game.progress[report.area].cleared&&game.money>=next.fee;
}
function renderReceiptGoals(report){
  const next=districts[report.area+1];
  const goal=game.progress[report.area];
  const advice=report.nextStock?.map(({count,reason},i)=>'<li>'+menus[i].name+' <b>'+count+' 份</b>'+(reason?' · '+reason:'')+'</li>').join('');
  return (next?'<div class="receipt-goal"><b>下一站 · '+next.name+'</b><span>口碑 '+game.reputation+
    ' · '+(goal.cleared?'经营目标达成':'经营目标未完成')+' · 资金 '+yen(game.money)+' / '+yen(next.fee)+'</span></div>':'')+
    (advice?'<div class="receipt-goal"><b>明早建议备货</b><ul>'+advice+'</ul></div>':'');
}
function startDay() {
  if (game.phase !== 'prep') return;
  const choice=defaultPrepChoice();
  const pendingCost=game.eventChoice===null?prepEvent().options[choice][2]:0;
  const actual=affordablePlan(game.plan,game.money-pendingCost);
  if(!actual.some((n,i)=>n+game.stock[i]>0))return;
  if(game.eventChoice===null)applyDailyEvent(choice);
  const cost = costOf(actual);
  game.expenses={};
  game.earnings=[0,0,0];
  game.cost=game.eventCost;
  if(game.eventCost)game.expenses['街坊事件']=game.eventCost;
  game.tips=0;
  payExpense('进货成本（开摊已付）',cost);
  game.stock = game.stock.map((n, i) => n + actual[i]);
  game.openingStock=game.stock.reduce((a,b)=>a+b,0);
  Object.assign(game, {
    phase: 'live', queue: [], tables: Array(game.seatCount).fill(null), speed: 1,
    elapsed: 0, arrival: 0, served: 0, lost: 0, revenue: 0, helpUntil: 0, autoShiftUntil: 0, closing: false,
    takeaway: [], todayTakeaway: 0, todayGroups: 0, sold: [0, 0, 0], priorityOrder: null,
    incidents:{}, stockDelivery:null, pendingIncident:null, pendingGuest:null, drinkOnly:false, perkEnds:{}, streetLesson:null, lessonParty:null, lessonTable:null,
    closingReadyAt:null, shortageAt:null, drinkOnlyOrders:0, staffRoutes:{}, missedStock:[0,0,0],
  });
  page = 'stall';
  selected = null;
  if(game.tutorial===-1&&game.day===1){
    game.tutorial=0;
    remember('opening','在梧桐巷开张','q-hero');
    return;
  }
  game.tutorial=3;
  const stocked = game.stock.findIndex(Boolean);
  addCustomer(1, 0, menus.map((_, i) => Number(i === stocked)), false);
  if (game.day === 1 && game.stock[1] && game.stock[2]) addCustomer(2, 1, [0, 1, 1], false);
  else addCustomer();
  game.arrival = 4;
  breakfastAudio.effect('open');
  if (game.day > 1) breakfastAudio.say('opening');
  if (game.day === 1 && game.tutorial === 3) notify('可以拖客人入座，也可以先点客人，再点桌。');
}
function addCustomer(size, person, items, toGo) {
  if (game.queue.length >= 5) return false;
  const roll = Math.random();
  toGo ??= game.area > 0 && Math.random() < (game.area === 3 ? .43 : .27);
  if(size===undefined){
    const groupChance=game.area>0?district().group:0;
    const big=roll>1-groupChance-(eventEffect()==='groups'?.12:0);
    size=toGo?(roll<.8?1:2):big?5+Math.floor(Math.random()*4):roll<.42?1:roll<.68?2:roll<.87?3:4;
  }
  person ??= Math.floor(Math.random() * people.length);
  if (!items) {
    items = [0, 0, 0];
    for (let i = 0; i < Math.min(size,4); i++) {
      const draw = Math.random();
      const preferred = specialsBoard[game.featured].focus ?? (forecast().kind === 'rain' ? 2 : district().focus);
      items[draw < .46 ? preferred : (preferred + (draw < .75 ? 1 : 2)) % 3]++;
    }
    if (size > 1 && Math.random() < .34) items[2]++;
  }
  if(game.drinkOnly&&items[2]===0&&person%2!==0){recordMissedGuest({size,items});return false;}
  if(game.drinkOnly)items=[0,0,Math.min(size,4)];
  const patience = [24, 21, 17][game.price] - (toGo ? 4 : 0) + Math.min(4, Math.floor(game.reputation / 15)) +
    (game.canopy && forecast().kind === 'rain' ? 5 : 0) + (eventEffect()==='shelter'?4:0);
  let preference=null;
  if(!toGo&&game.day>=2&&game.elapsed>=15&&Math.random()<.22){
    const friend=game.tables.findIndex(t=>t?.state==='eating');
    const choices=friend>=0?['street','warm','edge','fresh','friend:'+friend]:['street','warm','edge','fresh'];
    preference=choices[Math.floor(Math.random()*choices.length)];
  }
  const friendId=preference?.startsWith('friend:')?game.tables[Number(preference.split(':')[1])]?.id:undefined;
  game.queue.push({ id: nextId++, person, size, items, toGo, preference, friendId, deadline: game.elapsed + patience, patience });
  return true;
}
function clearTable(index) {
  const table = game.tables[index];
  streetEffect('clean', index, '✦');
  if (table && !game.closing) breakfastAudio.effect('clear');
  if (table?.neighbor !== undefined) game.tables[table.neighbor] = null;
  game.tables[index] = null;
}
function adjacentSeat(index){
  const perRow=4;
  return [index+1,index-1].find(i=>i>=0&&Math.floor(i/perRow)===Math.floor(index/perRow)&&game.tables[i]===null);
}
function seatGuest(id, index) {
  if (game.closing || game.phase !== 'live') return;
  const customer = game.queue.find((c) => c.id === id);
  if (!customer) return;
  if (game.tables[index] !== null) {
    streetEffect('message', index, game.tables[index]?.state === 'dirty' ? '先收桌' : '这里有人');
    return;
  }
  if (customer.toGo) { notify('这位客人要外带，请用打包台。'); breakfastAudio.effect('warning'); return; }
  let neighbor;
  if (customer.size > seatsPerTable) {
    neighbor = adjacentSeat(index);
    if (neighbor === undefined) { streetEffect('message', index, '需要相邻空桌'); return; }
  }
  if (!acceptOrder(customer)) return;
  game.tables[index] = { ...customer, state: 'queued', neighbor };
  game.tables[index].seatedAt=game.elapsed;
  if (game.streetLesson === 'seat' && (game.lessonParty == null || game.lessonParty === id)) {
    if((game.lessonRound??0)<2)advanceStreetLesson();
    else {
      game.streetLesson = 'cook';
      game.lessonTable = index;
    }
  }
  if(customer.preference){
    const match=preferenceFits(customer.preference,index,customer.friendId) || neighbor!==undefined&&preferenceFits(customer.preference,neighbor,customer.friendId);
    game.tables[index].seatedWell=match;
    if(match)streetEffect('message',index,'好位置！');
  }
  if (neighbor !== undefined) game.tables[neighbor] = { state: 'paired', paired: index };
  startKitchen();
}
function acceptOrder(customer) {
  if (stockGap(customer).some(Boolean)) {
    selected=customer.id;
    notify(stockGapText(customer)+'，点「补货」处理。');
    breakfastAudio.effect('warning');
    return false;
  }
  game.stock = game.stock.map((n, i) => n - customer.items[i]);
  if(!game.incidents.soldOut&&game.stock[0]+game.stock[1]===0){
    game.incidents.soldOut=true;
    remember('sold-out','第一次卖空','q-hero');
  }
  if(game.drinkOnly)game.drinkOnlyOrders=(game.drinkOnlyOrders||0)+1;
  game.queue = game.queue.filter((c) => c.id !== customer.id);
  selected = null;
  breakfastAudio.effect(customer.toGo ? 'bag' : 'seat');
  return true;
}
function acceptTakeaway(id = selected) {
  const guest = game.queue.find((c) => c.id === id);
  if (game.phase !== 'live' || game.closing || !guest?.toGo || game.takeaway.length >= game.boxes || !acceptOrder(guest)) return;
  game.takeaway.push({ ...guest, state: 'queued' });
  startKitchen();
}
function deliverTakeaway(order) {
  if (!order || order.state !== 'ready') return;
  charge(order);
  breakfastAudio.effect('handoff');
  game.takeaway = game.takeaway.filter((item) => item !== order);
  game.todayTakeaway++;
}
function startKitchen() {
  const current = orders();
  let available = capacity()*stovePortions-occupiedStovePortions();
  const waiting = current.filter((t) => t?.state === 'queued').sort((a, b) =>
    Number(b.id === game.priorityOrder) - Number(a.id === game.priorityOrder) || a.id - b.id);
  if(available<=0||!waiting.length)return;
  const cooks=employeeList('cook').slice(0,operatingStoves()-1);
  const efficiency=(1+cooks.reduce((sum,cook)=>sum+staffSpeed(cook),0))/(1+cooks.length);
  for (const table of waiting) {
    const portions=kitchenLoad(table);
    if (available<portions) break;
    available-=portions;
    if (table.id === game.priorityOrder) game.priorityOrder = null;
    table.state = 'cooking';
    const active = table.items.map((n, i) => n ? menus[i].time + (n - 1) * 1.7 : 0);
    table.duration = (Math.max(...active) + (table.items.filter(Boolean).length - 1) * 1.2) * (1-game.stoveLevel*.09)/efficiency;
    table.finish = game.elapsed + table.duration;
  }
}
function serve(table) {
  const index = game.tables.indexOf(table);
  streetEffect('food', index, menus[table.items.findIndex(Boolean)]?.art || 'bao');
  if(eventEffect()==='birthday' && !game.incidents.birthdayServed) {
    game.incidents.birthdayServed=true;
    table.birthday=true;
    streetEffect('message', index, '谢谢你扫亮这条街！');
  }
  if (index === game.lessonTable && game.streetLesson === 'serve') game.streetLesson = 'eat';
  table.state = 'eating';
  delete table.waitingNote;
  table.finish = game.elapsed + 3.5 + table.size * .7;
  if(table.items[2]>0){streetEffect('drink',index,'soy');breakfastAudio.effect('sip');}
  if(!table.birthday&&table.id%4===0){
    const voiced = table.person === 1 && !game.streetLesson && !dialog.open;
    if (voiced) breakfastAudio.say('thanks', {gap:7500});
    streetEffect('chat',index,voiced?'这早饭真香！':['这口真香！','豆浆暖暖的。','老板，明天见！'][table.person%3]);
  }
  breakfastAudio.effect('serve');
}
function charge(table) {
  const tableIndex=game.tables.indexOf(table);
  const multiplier=[.87,1,1.2][game.price]*(eventEffect()==='discount'?.9:1)*(table.toGo?1:1+decorBonus()/100);
  const line=table.items.map((n,i)=>Math.round(n*menus[i].price*multiplier));
  game.earnings=game.earnings.map((n,i)=>n+line[i]);
  const tip=(table.sponsor?4:table.regularId!==undefined?2:0)+Number(!!table.seatedWell)*2;
  game.tips+=tip;
  const amount=line.reduce((a,b)=>a+b,tip);
  game.money += amount;
  game.revenue += amount;
  game.served += table.size;
  game.sold = game.sold.map((n, i) => n + table.items[i]);
  markRegular(table);
  if(game.lifetime.served+game.served===table.size)remember('first-sale','第一桌客人结账','story');
  if (table.neighbor !== undefined) game.todayGroups++;
  table.state = 'dirty';
  if(tableIndex>=0)for(const guest of game.queue){
    if(guest.preference==='friend:'+tableIndex)guest.preference='friend-left';
  }
  table.finish = game.elapsed + 1;
  if (tableIndex === game.lessonTable && game.streetLesson === 'eat') game.streetLesson = 'clean';
  streetEffect('cash',tableIndex,'+'+yen(amount));
  streetEffect('coin',tableIndex,'●');
  if(table.seatedWell)streetEffect('tip',tableIndex,'合心意小费 +¥2');
  if (!table.toGo) breakfastAudio.effect('coin');
}
function operateTable(index) {
  const table = game.tables[index];
  if (table?.state === 'ready') serve(table);
  else if (table?.state === 'dirty') {
    clearTable(index);
    if (index === game.lessonTable && game.streetLesson === 'clean') advanceStreetLesson();
  }
  else if (table === null && selected !== null) seatGuest(selected, index);
  else if (table?.state === 'queued') {
    game.priorityOrder = table.id;
    streetEffect('message', index, '下一桌先做');
  }
  else if (table === null && game.queue.length) notify('先选一位排队客人。');
  else if (table?.state === 'paired') operateTable(table.paired);
}
function earlyClose() {
  if (game.closing) return;
  game.closing = true;
  game.streetLesson = null;
  for(const guest of game.queue)recordMissedGuest(guest);
  game.queue = [];
  selected = null;
  game.speed = game.speed || 1;
  finishClosing();
}
function recordMissedGuest(guest){
  game.lost+=guest.size;
  const gap=stockGap(guest);
  game.missedStock=game.missedStock.map((n,i)=>n+gap[i]);
}
function hasOrders() {
  return orders().some((t) => t && ['queued', 'cooking', 'ready', 'eating'].includes(t.state));
}
function finishClosing() {
  if (!game.closing || hasOrders() || game.stockDelivery) return;
  if (Object.values(game.staffRoutes || {}).some((route)=>route.action==='clear')) return;
  if (game.closingReadyAt == null) {
    game.closingReadyAt = game.elapsed + 2.2;
    game.tables.forEach((table,index) => { if(table?.state==='dirty')clearTable(index); });
    save();
  }
  if (game.elapsed < game.closingReadyAt) return;
  reportDay();
}
function reportDay() {
  if (game.phase !== 'live') return;
  const oldReputation = game.reputation;
  const adjustment = Math.max(-3, Math.min(8, Math.ceil(game.served / 3) - Math.floor(game.lost / 4)));
  game.reputation = Math.max(0, game.reputation + adjustment);
  const rep = game.reputation - oldReputation;
  const branchSales=game.branches.map((index)=>branchDaily(index));
  const branchIncome=branchSales.reduce((total,sale)=>total+sale.amount,0);
  game.money+=branchIncome;
  const bills=settleOverheads();
  const chilled=retainedStock();
  const retained=chilled.reduce((sum,n)=>sum+n,0);
  const waste=game.stock.reduce((sum,n)=>sum+n,0)-retained;
  if(game.served>0)game.vouchers++;
  remember('settle','第一次收摊','morning');
  const progress = game.progress[game.area];
  progress.served += game.served;
  progress.revenue += game.revenue;
  progress.takeaway += game.todayTakeaway;
  progress.groups += game.todayGroups;
  if (game.served > 0) progress.days++;
  progress.reputation=game.reputation;
  game.lifetime.served += game.served;
  game.lifetime.revenue += game.revenue;
  game.lifetime.takeaway += game.todayTakeaway;
  game.lifetime.groups += game.todayGroups;
  game.lifetime.bestServed = Math.max(game.lifetime.bestServed, game.served);
  let chapterPrize = 0;
  if (!progress.cleared && chapterGoals(game.area).every(([key, , target]) => progress[key] >= target)) {
    progress.cleared = true;
    chapterPrize = district().prize;
    game.money += chapterPrize;
    if (passedCount() === districts.length) game.completedDay = game.day;
  }
  if(game.completedDay===game.day)remember('breakfast-gold','早餐节金牌','q-festival');
  const daily = special();
  const specialPrize = game.sold[daily.item] >= daily.target ? daily.prize : 0;
  game.money += specialPrize;
  game.report = { day: game.day, area: game.area, profit: game.revenue - game.cost, revenue: game.revenue,
    cost: game.cost, served: game.served, lost: game.lost, takeaway: game.todayTakeaway, groups: game.todayGroups, rep, bonus: 0, chapterPrize, specialPrize,
    earnings:game.earnings,expenses:game.expenses,tips:game.tips,waste,branchIncome,shortage:!!game.incidents.stockout,
    shortageAt:game.shortageAt,drinkOnlyOrders:game.drinkOnlyOrders,retained,branchSales,bills,
    food:menus.map((_,i)=>({sold:game.sold[i],missed:game.missedStock[i],cold:chilled[i],waste:game.stock[i]-chilled[i]})) };
  game.report.nextStock=stockAdvice(game.day+1,game.report);
  game.phase = 'report';
  game.speed = 1;
  game.queue = [];
  game.tables = [];
  game.takeaway = [];
  selected = null;
  page = 'ledger';
  reportReading=false;
  if(cityTitleEarned()&&!game.cityChampion){
    game.cityChampion=true;
    remember('city-champion','全城早餐第一','q-festival');
  }
  $('toast').classList.remove('show');
  save();
  paint();
  main.scrollTop=0;
  breakfastAudio.effect(chapterPrize ? 'milestone' : 'report');
  breakfastAudio.say('close', {important:true});
  nationalRank.best=null;
  void syncNationalScore();
}
function continueAfterReport(now) {
  if (titleOpen || game.phase !== 'report' || !game.settings.continuous ||
    game.report?.chapterPrize || page !== 'ledger' || dialog.open || rewardPending || document.hidden || reportReading) {
    continuousAt = null;
    update('continuous-status',game.report?.chapterPrize?'已暂停连开，查看扩建或通关奖励。':reportReading?'已暂停连开，查账后可准备下一天。':'');
    return;
  }
  continuousAt ??= now + 7000;
  if (now < continuousAt) {
    update('continuous-status',Math.ceil((continuousAt-now)/1000)+' 秒后进入备货'+(game.settings.autoEvent?'':'，等待选择街坊事件'));
    return;
  }
  continuousAt = null;
  nextDay();
  if (!game.settings.autoEvent) showDailyEvent(true);
  else if (costOf(game.plan)+prepEvent().options[defaultPrepChoice()][2]<=game.money && (game.plan.some(Boolean)||game.stock.some(Boolean)))startDay();
  else notify('预算不足，已停在备货。可以减量或领取福利。');
  save();
  paint();
}
function nextDay() {
  if (game.phase !== 'report') return;
  game.history.push(game.report);
  reportReading=false;
  game.day++;
  game.stock = game.report.food?.map(item=>item.cold) || retainedStock();
  game.trafficEffects=game.trafficEffects.filter(effect=>effect.until>=game.day);
  game.used = {};
  game.autoShiftUntil = 0;
  game.phase = 'prep';
  game.report = null;
  game.eventChoice=null;
  game.eventCost=0;
  game.recruitShift=0;
  recommendStock();
  page = 'prep';
}
function retainedStock() {
  const retain=[0,.5,.7,.9][game.coolerLevel];
  let space=coolerCaps[game.coolerLevel];
  const kept=[0,0,0];
  const order=game.coolerPriority==='drink'?[2,0,1]:[0,1,2];
  for(const index of order){
    const keep=Math.min(space,Math.floor(game.stock[index]*retain));
    space-=keep;
    kept[index]=keep;
  }
  return kept;
}
function affordablePlan(wanted, budget = game.money) {
  if(costOf(wanted)<=budget)return [...wanted];
  const plan = [0, 0, 0];
  let gross = 0;
  for (let round = 0; round < 35; round++) {
    for (let i = 0; i < menus.length; i++) {
      const cost=menus[i].cost;
      if (round < wanted[i] && Math.round((gross+cost)*.95)<=budget) {
        plan[i]++;
        gross+=cost;
      }
    }
  }
  return plan;
}
function recommendStock() {
  game.plan=stockAdvice().map(({count},i)=>Math.max(0,count-game.stock[i]));
}
function stockAdvice(day=game.day,previous=game.history.at(-1),featured=game.featured) {
  return desiredStock(day).map((base,i)=>{
    const last=previous?.food?.[i];
    const missed=last?.missed||0;
    const loss=last?.waste||0;
    const boost=specialsBoard[featured].focus===i?Math.ceil(base*.25):0;
    const correction=missed?Math.min(7,Math.ceil(missed*.5)):loss>=4?-Math.min(4,Math.floor(loss/3)):previous?.shortage&&!previous.food&&i<2?Math.ceil(base*.16):0;
    const count=Math.max(1,Math.min(35,Math.ceil((base+correction+boost)*[1,1.25,1.5][game.orderPref])));
    return {count,reason:[boost?'主推加量':'',missed?'上次缺货':correction<0?'上次有损耗':correction>0?'上次主食不足':''].filter(Boolean).join('、')};
  });
}
function changeDistrict(index) {
  if (game.phase === 'live' || index === game.area || !districts[index] || (index > 0 && !game.progress[index - 1].cleared)) return;
  const progress = game.progress[index];
  const fee = index === 0 || progress.visited || progress.days > 0 ? 0 : districts[index].fee;
  if (game.money < fee) return;
  game.money -= fee;
  game.area = index;
  progress.visited = true;
  remember('district-'+index,'搬到'+district().name,district().scene);
  if (game.phase === 'prep') {
    recommendStock();
    page = 'prep';
  } else page = 'ledger';
  notify('摊位已搬到' + district().name + '。');
  return true;
}
function confirmDistrict(index) {
  const target=districts[index];
  if(!target||game.phase==='live'||index===game.area||(index>0&&!game.progress[index-1].cleared))return;
  const fee=index===0||game.progress[index].visited||game.progress[index].days>0?0:target.fee;
  if(game.money<fee)return;
  openStory('搬到'+target.name+'？',fee?'转让费 '+yen(fee)+' · 搬完后剩 '+yen(game.money-fee):'这次回访免费。',
    button('确认迁址','confirm-district','primary','data-i="'+index+'"')+button('再看看','dismiss'),'q-hero');
}
function upgrade(key) {
  if (game.phase === 'live') return;
  const options = {
    table: [50, game.seatCount < tableLimit(), () => game.seatCount++],
    stove: [95, game.area>0&&employeeList('cook').length>0&&game.stove<3, () => { game.stove++;game.activeStove=game.stove; }],
    cooler: [85+game.coolerLevel*80, game.coolerLevel<3, () => { game.coolerLevel++;game.cooler=true; }],
    boxes: [75, game.boxes < 3, () => game.boxes++],
    canopy: [70, !game.canopy, () => { game.canopy = true; }],
    signboard: [90, !game.signboard&&game.area>0, () => { game.signboard=true; }],
  };
  const [cost, available, apply] = options[key];
  if (!available || game.money < cost) return;
  game.money -= cost;
  apply();
  notify('升级完成。下次开摊就能用上。');
  breakfastAudio.effect('upgrade');
}
function buyStock(index,count=3) {
  if(!menus[index]||!Number.isInteger(count)||count<1||count>5)return;
  const cost = (menus[index].cost + 1) * count;
  const counts=menus.map((_,i)=>i===index?count:0);
  if(restock(counts,cost))notify(menus[index].name + '已补 '+count+' 份。');
}
function restock(counts,cost=restockCost(counts)) {
  if (game.phase !== 'live' || game.closing || !cost || game.money < cost) return false;
  payExpense('营业补货',cost);
  game.stock=game.stock.map((count,i)=>count+counts[i]);
  if(counts[0]||counts[1])game.drinkOnly=false;
  breakfastAudio.effect('stock');
  return true;
}
function updateLive(dt) {
  if(game.tutorial<3)return;
  game.elapsed += dt;
  if(game.speed>2&&game.perkEnds[game.speed]<=game.elapsed)game.speed=2;
  if(game.stockDelivery?.at<=game.elapsed){
    game.stock=game.stock.map(n=>n+5);game.stockDelivery=null;game.drinkOnly=false;
    streetEffect('arrival', -1, '食材送到了 · 库存 +15');
    breakfastAudio.effect('delivery');
    save();
  }
  if (!game.closing && game.elapsed >= dayLength) earlyClose();
  if (game.phase !== 'live') return;
  if (!game.closing) {
    if (game.elapsed >= game.arrival) {
      if(game.queue.length>=5)game.lost++;
      else addCustomer();
      const traffic=[1.12,1,.88][game.price]*(game.signboard?1.06:1)*eventTraffic()*
        (forecast().kind==='rain'&&!game.canopy?.9:1);
      game.arrival = game.elapsed + (3.7 + Math.random() * 2.0) / ((forecast().pace * district().pace + (game.elapsed > 30 && game.elapsed < 62 ? .27 : 0))*traffic);
    }
    game.queue = game.queue.filter((c) => {
      if (game.streetLesson==='seat' && c.id===game.lessonParty) return true;
      if (c.deadline > game.elapsed) return true;
      recordMissedGuest(c);
      if (selected === c.id) selected = null;
      return false;
    });
    if (game.streetLesson==='next-party') advanceStreetLesson();
  }
  finishStaffRoutes();
  const hasService = game.assistant || employeeList('waiter').length > 0 ||
    game.elapsed < game.helpUntil || autoShiftActive();
  game.tables.forEach((table, index) => {
    if(!table)return;
    if(table.state==='queued'&&!table.waitingNote&&game.elapsed-(table.seatedAt??game.elapsed)>9){
      table.waitingNote=true;
      streetEffect('message',index,'早餐还要多久呀？');
    }
    if(table.finish>game.elapsed)return;
    if (table.state === 'cooking') {
      table.state = 'ready';
      table.finish = game.elapsed + 1;
      breakfastAudio.effect('ready');
      if (index === game.lessonTable && game.streetLesson === 'cook') game.streetLesson = 'serve';
    } else if (table.state === 'ready') {
      if (game.closing && game.elapsed >= table.finish + 10) serve(table);
      else if (hasService && !hasStaffTask('serve',table.id)) sendStreetWorker(index,'serve',table.id);
    }
    else if (table.state === 'eating') charge(table);
    else if (table.state === 'dirty' && hasService && !hasStaffTask('clear',table.id)) {
      sendStreetWorker(index,'clear',table.id);
    }
  });
  for (const order of game.takeaway) {
    if (order.finish > game.elapsed) continue;
    if (order.state === 'cooking') {
      order.state = 'ready';
      order.finish = game.elapsed + 1;
      breakfastAudio.effect('ready');
    } else if (order.state === 'ready') {
      if (game.closing && game.elapsed >= order.finish + 10) deliverTakeaway(order);
      else if (hasService && !hasStaffTask('deliver',order.id)) sendStreetWorker(-1,'deliver',order.id);
    }
  }
  applyStaffAutomation();
  startKitchen();
  incidentTick();
  finishClosing();
}
function update(id, html) {
  const target = $(id);
  if (target && target.rendered !== html) {
    const left = target.scrollLeft;
    target.innerHTML = html;
    target.scrollLeft = left;
    target.rendered = html;
  }
}
function paintLive() {
  paintStats();
  paintStreet();
}
function tick(now) {
  if(now+1<nextTick){requestAnimationFrame(tick);return;}
  const interval=1000/game.settings.fps;
  nextTick=Math.max(now-interval,nextTick)+interval;
  const realDt = Math.min(.25, (now - lastTick) / 1000);
  lastTick = now;
  continueAfterReport(now);
  if (!titleOpen&&game.phase === 'live' && page === 'stall' && game.speed && !dialog.open && !rewardPending && !document.hidden) {
    updateLive(realDt * game.speed);
    if (now - lastPaint > (game.settings.fps===30?280:game.settings.fps===45?210:160) && game.phase === 'live') { paintLive(); lastPaint = now; }
    if (now - lastSave > 1700) { save(); lastSave = now; }
  }
  requestAnimationFrame(tick);
}
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('toast').classList.remove('show'), 2200);
}
function showOffer(key) {
  const item = offers[key];
  if (rewardPending || !item || rewardUsed(key) || !item.valid()) return;
  if(!availableReward()){
    const note='视频暂未连接，可以继续经营。';
    showVideoStatus(note);
    return;
  }
  rewardReturn = dialog.open ? dialog.innerHTML : null;
  rewardChoice = key;
  dialog.innerHTML = '<h2>' + item.title + '</h2><p>' + item.detail + '</p><div class="actions">' +
    button('返回游戏', 'dismiss') + button('看视频领取', 'claim', 'primary') + '</div>';
  if(!dialog.open)dialog.showModal();
  breakfastAudio.stopVoice();
  breakfastAudio.sync();
}
function showVideoStatus(message){
  if(!dialog.open){notify(message);return;}
  let status=dialog.querySelector('.video-status');
  if(!status){status=document.createElement('p');status.className='video-status';status.setAttribute('role','status');dialog.append(status);}
  status.textContent=message;
}
function leaveOffer(restore) {
  const previous = rewardReturn;
  rewardChoice = null;
  rewardReturn = null;
  if (restore && previous) dialog.innerHTML = previous;
  else {
    if (!restore) game.pendingIncident = null;
    dialog.close();
  }
}
function dismissStory() {
  if (game.pendingIncident) { game.pendingIncident=null;game.pendingGuest=null;save(); }
  dialog.close();
}
function closeGameDialog() {
  const eventOpen=dialog.querySelector('.event-options');
  if(eventOpen&&game.eventChoice===null&&!eventOpen.dataset.pauseForChoice)applyDailyEvent(defaultPrepChoice());
  dismissStory();
  if(eventOpen){save();paint();}
}
async function claimOffer() {
  const key = rewardChoice;
  const item = offers[key];
  if (rewardPending || !availableReward() || !item || rewardUsed(key) || !item.valid()) return;
  rewardPending = true;
  breakfastAudio.sync();
  const day = game.day;
  const slot=activeSlot;
  let rewarded = false;
  let status='';
  dialog.querySelectorAll('button').forEach((control) => { control.disabled = true; });
  showVideoStatus('正在打开视频…');
  save();
  try {
    const playback = window.breakfastRewardedVideo.play(key);
    const earned = await platformCall(() => playback);
    if (earned !== true) status='视频未完整播放，未领取奖励。';
    else if (game.day === day && activeSlot===slot && !rewardUsed(key) && item.valid()) {
      refreshWelfare();
      if(item.calendar)game.welfare[item.calendar]=true;
      else game.used[key] = true;
      game.welfare.views++;
      game.welfare.todayViews++;
      item.apply();
      game.pendingIncident=null;
      game.pendingGuest=null;
      save();
      rewarded = true;
      notify(item.title + ' · 已领取');
    } else status='这份奖励已无法领取，可以继续经营。';
  } catch {
    status='视频暂时无法播放，可以继续营业。';
  } finally {
    rewardPending = false;
    leaveOffer(!rewarded);
    paint();
    if(rewarded)breakfastAudio.effect('reward');
    if(status)showVideoStatus(status);
  }
}
function clickAction(event) {
  const element = event.target.closest('[data-act]');
  if (!element || element.disabled || rewardPending) return;
  const { act, key, page: targetPage, id, i, change } = element.dataset;
  const index = Number(i);
  if (suppressClick && ['guest','seat','takeaway'].includes(act)) return;
  breakfastAudio.unlock();
  const previousPage = page;
  switch (act) {
    case 'nav':
      if(game.day===1&&game.phase==='live'&&targetPage!=='stall'){notify('第一天收摊后开放。');return;}
      breakfastAudio.effect('tap');
      if(page!==targetPage)$('toast').classList.remove('show');
      page = targetPage;
      if (game.phase === 'live' && page === 'staff') selected = null;
      if (page === 'rank' && rankTab === 'online') void fetchRanks();
      break;
    case 'plan':
      game.plan[index] = Math.max(0, Math.min(35, game.plan[index] + Number(change)));
      break;
    case 'plan-batch': adjustPrepTotal(Number(change)); break;
    case 'price': game.price = index; break;
    case 'recommend': recommendStock(); break;
    case 'credit':
      if (game.phase === 'prep' && game.money < 4 && !game.stock.some(Boolean)) {
        game.stock = [3, 3, 3];
        game.plan = [0, 0, 0];
        notify('街坊送来每样 3 份食材，先把摊开起来。');
      }
      break;
    case 'start': startDay(); break;
    case 'next': nextDay(); break;
    case 'district': confirmDistrict(index); return;
    case 'confirm-district':
      dialog.close();
      if(changeDistrict(index))openStory('第 '+(index+1)+' 站 · '+district().name,district().hint,button('去看看','dismiss','primary'),'q-hero');
      break;
    case 'style':
      if (stallStyles[index] && passedCount() >= stallStyles[index].required) game.style = index;
      break;
    case 'guest':
      selected = selected === Number(id) ? null : Number(id);
      {
        const guest=game.queue.find(c=>c.id===selected);
        breakfastAudio.effect('select');
        breakfastAudio.guest(guest);
        if(guest?.regularId!==undefined && !guest.storyShown) {
          guest.storyShown=true;
          showRegular(guest.regularId,true);
        }
      }
      save();
      paintLive();
      return;
    case 'street-stove': openStoveQueue(); return;
    case 'seat':
      if (game.phase === 'live') operateTable(index);
      break;
    case 'takeaway': acceptTakeaway(); break;
    case 'deliver': deliverTakeaway(game.takeaway.find((order) => order.state === 'ready')); break;
    case 'prioritize': {
      const order = orders().find((item) => item?.id === Number(id) && item.state === 'queued');
      if (order) game.priorityOrder = order.id;
      if (dialog.open) dismissStory();
      break;
    }
    case 'close':
      dialog.innerHTML = '<h2>今天提前收摊？</h2><p>暂停接待新客，已入座的客人照常上餐和结账。</p><div class="actions">' +
        button('继续营业', 'dismiss') + button('确认收摊', 'confirm-close', 'primary') + '</div>';
      dialog.showModal();
      breakfastAudio.sync();
      return;
    case 'confirm-close': dialog.close(); earlyClose(); break;
    case 'speed': game.speed = index; break;
    case 'buy-stock':
      buyStock(index,Number(element.dataset.count||3));
      if(dialog.open&&game.pendingIncident==='stockout')showIncident('stockout');
      break;
    case 'rescue-stock': {
      const guest=game.queue.find(item=>item.id===Number(id));
      if(!guest||!restock(stockGap(guest)))return;
      if(dialog.open)dismissStory();
      selected=guest.id;
      page='stall';
      notify(guest.toGo?'食材齐了，可以接外带。':'食材齐了，可以安排入座。');
      break;
    }
    case 'upgrade': upgrade(key); break;
    case 'offer': showOffer(key); return;
    case 'claim': void claimOffer(); return;
    case 'dismiss': if (rewardChoice) leaveOffer(true); else closeGameDialog(); return;
    case 'sound':
      if (!breakfastAudio.toggleMute()) breakfastAudio.effect('tap');
      break;
    case 'effects':
      game.sound = !game.sound;
      if (game.sound) breakfastAudio.effect('tap');
      break;
    default: {
      const result=handleExtraAction(act,index,key);
      if(!result||result==='dialog')return;
    }
  }
  save();
  paint();
  if (page !== previousPage || ['title','open-slot','reset-slot'].includes(act)) main.scrollTop=0;
}
function updateViewportInsets() {
  breakfastTapAds.preload();
  if (page==='rank' && rankTab==='online' && !nationalRank.loaded) void fetchRanks();
  const tap=window.tap;
  const inTap=document.querySelector('meta[name="breakfast-host"][content="taptap"]') ||
    !!tap || /TapTap|TapPlay/i.test(navigator.userAgent) || /(^|\.)tapplay\.(cn|com)$/i.test(location.hostname);
  const root=document.documentElement;
  root.classList.toggle('taptap-host',Boolean(inTap));
  if(!inTap)return;
  try {
    const info=tap?.getWindowInfo?.();
    const top=Number(info?.safeArea?.top ?? info?.statusBarHeight);
    const windowTop=Number(info?.screenTop ?? 0);
    if(Number.isFinite(top)&&Number.isFinite(windowTop)){
      root.style.setProperty('--host-safe-top',Math.min(136,Math.max(0,top-windowTop)+45)+'px');
    }
  }catch {
    // Keep the CSS clearance if this host does not expose window information.
  }
}
window.addEventListener('resize',updateViewportInsets);
window.addEventListener('pageshow',updateViewportInsets);
// Some H5 hosts inject the bridge after the page starts.
for(const delay of [250,1000,3000])setTimeout(updateViewportInsets,delay);
document.addEventListener('click', clickAction);
document.addEventListener('change',event=>{
  if(!event.target.matches('[data-history-area]'))return;
  historyArea=Number(event.target.value);
  historyLimit=20;
  paint();
});
document.addEventListener('toggle',event=>{
  if(page==='ledger'&&game.phase==='report'&&event.target.open&&event.target.matches('.receipt-notes'))reportReading=true;
},true);
dialog.addEventListener('cancel', (event) => {
  if (rewardPending) event.preventDefault();
  else if (rewardChoice) { event.preventDefault(); leaveOffer(true); }
  else if (game.pendingIncident||dialog.querySelector('.event-options')) { event.preventDefault(); closeGameDialog(); }
});
dialog.addEventListener('close', () => {
  if (dialog.open) return;
  breakfastAudio.stopVoice();
  breakfastAudio.sync();
  if (!titleOpen && game.phase === 'live' && page === 'stall') breakfastAudio.lesson();
});
enableStreetGestures();
document.addEventListener('visibilitychange', () => {
  lastTick = performance.now();
  nextTick = lastTick;
  if (document.hidden) { continuousAt = null; cancelStreetDrag(); save(); }
  breakfastAudio.sync();
});
window.addEventListener('pagehide', () => { save(); breakfastAudio.pause(); });
window.addEventListener('pageshow', () => breakfastAudio.sync());
updateViewportInsets();
paint();
requestAnimationFrame(tick);
