'use strict';

const staffPool = [
  { name: '小陈', age: 25, grade: 'C', role: 'waiter', wage: 9, fee: 24, art: 'q-chen', bio: '下班后过来搭把手。' },
  { name: '张姐', age: 41, grade: 'B', role: 'waiter', wage: 13, fee: 38, art: 'q-zhang', bio: '收桌利落，忙起来也有条理。' },
  { name: '建叔', age: 46, grade: 'B', role: 'cook', wage: 15, fee: 45, art: 'q-jian', bio: '会照看额外炉位。' },
  { name: '许晴', age: 29, grade: 'A', role: 'waiter', wage: 17, fee: 54, art: 'q-qing', bio: '在餐馆干过，送餐比谁都快。' },
  { name: '周师傅', age: 52, grade: 'A', role: 'cook', wage: 19, fee: 60, art: 'q-chef', bio: '会同时照顾几份不同的早点。' },
  { name: '小满', age: 20, grade: 'C', role: 'waiter', wage: 8, fee: 21, art: 'q-man', bio: '周末来帮忙，最会招呼小客人。' },
];

const regulars = [
  ['老周','晨练后总坐同一桌。','grandpa'], ['陈阿姨','喜欢热豆浆，常带街坊来。','elder'],
  ['小周','要赶头一班地铁。','office'], ['林师傅','出车前先填饱肚子。','rider'],
  ['阿健','骑过长街才闻到煎饼香。','cyclist'], ['小满','书包里总揣着一张书签。','student'],
  ['宋姨','来早市买菜，也来聊天。','keeper'], ['许晴','总是帮同事顺手带早餐。','office'],
  ['大鹏','搬货之前喜欢坐一会儿。','rider'], ['阿良','路上骑得快，吃饭却很慢。','cyclist'],
  ['叶老师','赶上课，也照顾排队秩序。','office'], ['小鱼','第一次用零花钱买蒸包。','student'],
  ['阿杰','跑步的终点站是你的摊位。','cyclist'], ['邻摊梅姐','开摊晚一点，先来和你打招呼。','keeper'],
];
const regularPortraits=['grandpa','elder','office','rider','q-cyclist','student','q-song','q-qing','q-mechanic','q-chen','q-teacher','q-fish','q-runner','keeper'];
const regularStories={
  0:{seat:'warm',gift:'老周竹凳',art:'q-stool-0',chapters:['听着铁板滋啦响，老周就想起第一次跟师傅学做早饭。','老周今天指着炉子说：翻面慢一点，边上才会脆。','他带来一只亲手编的竹凳，说这里以后就是他的老座位。']},
  2:{seat:'street',gift:'晨班纸杯',art:'soy',chapters:['小周掐着地铁时间来，一坐下就能望见街口的钟。','小周把豆浆喝完才走，说今天还是赶上了头一班车。','他给摊上拿了叠画着小钟的纸杯，街口的座位也有了自己的记号。']},
  5:{seat:'edge',gift:'蒸包小书签',art:'bao',chapters:['小满把书包放在边桌，免得挡住赶路的街坊。','今天小满多带了一支彩笔，在餐纸上画了三个笑脸蒸包。','她带来一枚蒸包书签，说翻到这一页就想起摊上的香味。']},
};

const dailyEvents = [
  { title:'晨跑社在巷口集合', story:'跑完两圈的街坊打算结伴吃早饭。老周来问，能不能帮忙张罗一下座位？', pictures:['table','crepe'], options:[
    ['给跑友留个位置','花 ¥5，今天会多来几组大桌',5,0,'groups'], ['来了再安排','按平常的节奏开摊',0,0,'none']] },
  { title:'给扫街班留块甜的', art:'q-birthday', pictures:['cake','bao'], defaultChoice:0,
    story:'清扫班的小陈今天最后一班岗。搭档凑了张感谢卡，想让你帮忙把小蛋糕随早餐端上桌。', options:[
    ['随餐端上小蛋糕','花 ¥10，口碑 +2',10,2,'birthday'], ['让搭档自己准备','照常出餐，桌上由搭档布置',0,0,'none']] },
  { title:'早市来了试吃摊', art:'q-rival', pictures:['crepe','soy','bao'], defaultChoice:1,
    story:'广场的试吃摊一开，人都去排队尝新品了。小禾手里还揣着一张空白的菜单牌。', options:[
    ['挂上晨间优惠牌','成交价 −10%，来客加快',0,0,'discount'], ['照原菜单卖','今日客流 −12%，之后三天 −5%',0,0,'steady'], ['留一筐包子试吃','花 ¥14，今日客流 −4%，之后三天 +4%，口碑 +2',14,2,'gift']] },
  { title:'借个干爽的等位处', pictures:['soy','crepe'], story:'屋檐被菜篮子占满了。隔壁杂货铺说，可以借一角给排队的人歇脚。', options:[
    ['给杂货铺送壶豆浆','花 ¥6，客人愿意多等，口碑 +1',6,1,'shelter'], ['照常在街口接客','按天气变化接客',0,0,'none']] },
];

const decorTypes = [
  { name:'挂灯', items:[
    ['折纸暖灯','券',4,0,'#e9ac59',2], ['蓝鱼灯','券',7,1,'#6d9baa',3], ['团花灯','券',11,2,'#b55759',4],
    ['南瓜灯','券',13,3,'#d48038',5], ['银杏灯','券',16,4,'#c8a444',6], ['金牌灯','章',0,5,'#e8ba42',8]] },
  { name:'桌子', items:[
    ['竹纹桌','天',3,0,'#9d8052',1], ['青瓷桌','元',50,0,'#61927d',2], ['木纹桌','章',0,2,'#976044',2],
    ['海风方桌','元',95,3,'#598a9b',3], ['灯会红桌','元',125,4,'#ac4a43',4], ['团圆软凳桌','章',0,5,'#be805d',5]] },
  { name:'板凳', items:[
    ['老周竹凳','访',3,0,'#785342',0], ['青瓷凳','元',35,0,'#5d897a',0], ['软垫凳','章',0,2,'#ae7764',0],
    ['海蓝凳','元',65,3,'#557f93',0], ['朱红凳','元',80,4,'#a63c3b',0], ['金丝靠椅','章',0,5,'#ac893c',0]] },
];

const videoMilestones = [5,10,20,35,50,80,120];
const signInAmounts = [13,13,22,22,27,27,40];
const signInBoosts = [null,[4,30],null,[0,30],null,[0,60],[0,120]];
const milestoneBoosts = [[4,30],[0,30],[0,60],[0,60],[0,120],[0,120],[0,180]];
const specialsBoard = [
  {name:'三样早点都上桌',art:'crepe',area:0,focus:null},
  {name:'暖手豆浆',art:'soy',area:0,focus:2,day:2},
  {name:'头笼鲜肉包',art:'bao',area:1,focus:1},
  {name:'铁板脆边煎饼',art:'crepe',area:2,focus:0},
];
const optionNames = {
  music:'背景音乐', voice:'角色配音', rain:'雨天粒子效果', reduced:'精简烟雾和金币特效', showCanopy:'显示雨棚',
  autoEvent:'自动回信', rankOptIn:'把成绩记进全国榜', autoSeat:'伙计负责带位',
  autoServe:'伙计负责端餐', autoClear:'伙计负责擦桌', smart:'优先安排大桌和熟客', continuous:'自动准备下一班',
};

function extraState() {
  return {
    staff: [], recruitShift: 0, activeStove: 1, stoveLevel: 0, coolerLevel: 0, signboard: false,
    orderPref: 0, featured: 0, eventChoice: null, eventCost: 0, trafficEffects: [], cityChampion: false, tutorial: -1, streetLesson: null,
    stockDelivery: null, pendingIncident: null, drinkOnly: false, perkEnds: {}, welfare: { key: '', free: false, video: false, emergency: false, decor: false, signDate: '', signed: 0, views: 0, todayViews: 0, milestone: 0, boost: 0, perks: [] },
    vouchers: 0, ownedDecor: [], equipped: [null,null,null], memories: [], known: {},
    earnings: [0,0,0], expenses: {}, tips: 0, branches: [], branchMenus: {}, incidents: {},
    outstanding: {}, missedStock: [0,0,0], coolerPriority: 'main', savedAt: null,
    settings: { music:true, voice:true, rain:true, reduced:false, showCanopy:true, fps:60, inset:0,
      autoEvent:false, rankOptIn:false, autoSeat:false, autoServe:true, autoClear:true, smart:true, continuous:false },
  };
}

let decorTab = 0;
let decorPage = 0;
let staffTab = 'roster';
let historyArea=-1;
let historyLimit=20;
let chosenSlot = 0;
let activeSlot = 0;
let titleOpen = true;

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function slotKey(i) { return i === 0 ? saveKey : saveKey + '-slot-' + (i + 1); }
function slotLabel(i) {
  const saved = readStorage(slotKey(i));
  return saved ? '第 ' + saved.day + ' 天 · ' + districts[saved.area]?.name : '空存档';
}
function renderTitle() {
  const saved=readStorage(slotKey(chosenSlot));
  return '<section class="title-screen"><div class="title-lockup"><h2>早高峰<br>早餐摊</h2><p>小禾的街口手账</p></div>' + audioToggle('title-audio') +
    '<div class="title-tray"><div class="title-menu"><div class="title-slots" aria-label="选择经营存档">' + [0,1,2].map((i) =>
      button('<b>摊记 '+['一','二','三'][i]+'</b><small>'+slotLabel(i)+'</small>', 'choose-slot', chosenSlot === i ? 'active' : '', 'data-i="' + i + '" aria-pressed="'+(chosenSlot===i)+'"')).join('') + '</div>' +
    '<div class="title-actions">' + button(saved ? '接着摆摊' : '推车去街口', 'open-slot', 'primary') +
    (saved ? button('重开这一档', 'new-slot') : '') + '</div></div></div></section>';
}
function openSlot(reset = false) {
  breakfastAudio.reset();
  activeSlot = chosenSlot;
  game = reset ? freshGame() : load(activeSlot);
  decorTab = 0;
  decorPage = 0;
  staffTab = 'roster';
  rankTab = 'local';
  nationalRank = newNationalRank();
  historyArea=-1;
  historyLimit=20;
  reportReading=false;
  game.decorPreview = null;
  selected = game.phase==='live'&&game.queue.some(guest=>guest.id===game.pendingGuest)?game.pendingGuest:null;
  nextId = Math.max(0, ...game.queue.map((c)=>c.id), ...orders().map((t)=>t?.id || 0)) + 1;
  titleOpen = false;
  page = defaultPage();
  if (game.day === 1 && game.phase === 'prep' && game.tutorial === -1) {
    startDay();
    openStory('小禾推车出门了','早呀！我是小禾。早餐都备好啦，一起把炉子烧热吧！',button('去点炉','dismiss','primary'),'q-hero');
    breakfastAudio.say('hello', {important:true});
  }
  if (game.phase==='live' && game.pendingIncident) showIncident(game.pendingIncident);
  void syncNationalScore();
}

function forecastStrip() {
  const season = ['春','夏','秋','冬'][Math.floor((game.day-1)/8)%4];
  return '<div class="forecast-strip"><b>' + season + '季</b>' +
    Array.from({length:7},(_,i)=>{
      const f=forecasts[(game.day+i-1)%forecasts.length];
      return '<button class="forecast-day" data-act="weather" data-i="' + i + '" data-weather="' + f.kind + '"><small>' + (i === 0 ? '今天' : '第'+(game.day+i)+'天') +
        '</small>' + icon(f.kind) + '<small>' + f.label + '</small></button>';
    }).join('') + '</div>';
}
function openStory(title, body, controls = button('知道了','dismiss','primary'), illustration = false) {
  dialog.innerHTML = (illustration ? art(illustration === true ? 'story' : illustration,'story-art') : '') + '<h2>'+title+'</h2><p>'+body+'</p><div class="story-actions">'+controls+'</div>';
  if (!dialog.open) dialog.showModal();
  breakfastAudio.sync();
}
function prepEvent() { return dailyEvents[(game.day-1)%dailyEvents.length]; }
function defaultPrepChoice() {
  const event = prepEvent();
  const preferred = event.defaultChoice;
  if (preferred!==undefined&&(game.eventChoice===preferred||eventAffordable(event.options[preferred][2]))) return preferred;
  return event.options.findIndex((option) => option[2] === 0);
}
function eventAffordable(cost) {
  const planned=menus.filter((_,i)=>game.plan[i]>0);
  const cheapest=Math.min(...(planned.length?planned:menus).map(menu=>menu.cost));
  return game.money>=cost && (cost===0 || game.stock.some(Boolean) || game.money-cost>=cheapest);
}
function showDailyEvent(pauseForChoice=false) {
  const event=prepEvent();
  const chosen=game.eventChoice;
  const outcome = chosen === null ? '' : '<span class="event-outcome">回信 · '+event.options[chosen][0]+'</span>';
  const choices = event.options.map(([name,detail,cost],i)=>
    button(art(event.pictures[i])+'<span><b>'+name+'</b>'+(i===defaultPrepChoice()?' <small class="event-default">默认</small>':'')+'<small>'+detail+'</small>'+
      (chosen===null&&cost?'<small>选后可进 '+affordablePlan(game.plan,Math.max(0,game.money-cost)).reduce((sum,n)=>sum+n,0)+' 份</small>':'')+
      (chosen===null&&!eventAffordable(cost)?'<small>须留出最低进货款</small>':'')+'</span>','event-choice','secondary story-choice','data-i="'+i+'"',chosen !== null || !eventAffordable(cost))).join('');
  openStory(event.title,event.story+outcome,
    '<div class="event-options">'+choices+'</div>'+
    button(chosen === null ? '按默认选择' : '返回',chosen === null ? 'event-choice' : 'dismiss','secondary full',
      'data-i="'+defaultPrepChoice()+'"'),event.art || 'street-dawn');
  if(pauseForChoice)dialog.querySelector('.event-options').dataset.pauseForChoice='true';
}
function applyDailyEvent(index) {
  const choice=prepEvent().options[index];
  if (game.phase!=='prep' || game.eventChoice !== null || !choice || !eventAffordable(choice[2]))return false;
  game.money-=choice[2];game.eventCost=choice[2];game.reputation+=choice[3];game.eventChoice=index;
  if(choice[4]==='birthday') remember('birthday','扫街班的谢幕早餐','q-birthday');
  if(['steady','gift'].includes(choice[4]))game.trafficEffects.push({from:game.day+1,until:game.day+3,multiplier:choice[4]==='steady'?.95:1.04});
  return true;
}
function eventEffect() { return prepEvent().options[game.eventChoice]?.[4] || 'none'; }
function eventTraffic() {
  const today={steady:.88,gift:.96,discount:1.12}[eventEffect()]||1;
  return game.trafficEffects.reduce((value,effect)=>game.day>=effect.from&&game.day<=effect.until?value*effect.multiplier:value,today);
}
function showSpecials() {
  openStory('今天主推哪一口？','主推会增加对应餐点的点单机会。',specialsBoard.map((item,i)=>
    button(art(item.art)+item.name+(game.featured===i?' ✓':''),'feature','menu-choice','data-i="'+i+'"',
      !featureUnlocked(item)||game.featured===i)).join('')+button('返回','dismiss','secondary full'));
}
function featureUnlocked(item) { return game.day>=(item.day||1)&&(item.area<=game.area||game.progress[item.area]?.visited); }
function setPrepPreset(index) {
  if (game.phase!=='prep' || ![0,1,2].includes(index)) return;
  game.orderPref=index;
  recommendStock();
}
function adjustPrepTotal(change) {
  if (game.phase!=='prep' || ![-5,5].includes(change)) return;
  const direction=Math.sign(change);
  const targets=stockAdvice();
  for(let count=0;count<Math.abs(change);count++){
    const choices=game.plan.map((planned,index)=>({
      index, planned, ratio:(planned+game.stock[index])/targets[index].count,
    })).filter(({planned})=>direction>0 ? planned<35 : planned>0);
    choices.sort((a,b)=>(a.ratio-b.ratio)*direction);
    if(!choices.length) break;
    game.plan[choices[0].index]+=direction;
  }
}
function remember(id, name, image) {
  if (!game.memories.some((m)=>m.id===id))game.memories.push({id,name,image,day:game.day});
}
function employeeList(role) {
  return game.staff.map((id)=>staffPool[id]).filter((p)=>p?.role===role);
}
function operatingStoves() { return Math.max(1, Math.min(game.activeStove, game.stove, 1+employeeList('cook').length+Number(game.assistant))); }
function wageTotal() { return 3+game.staff.reduce((sum,id)=>sum+(staffPool[id]?.wage || 0),0); }
function shiftsCompleted() {
  return game.history.length + Number(game.phase === 'report');
}
function candidateIds(shift=game.recruitShift) {
  return Array.from({length:staffPool.length},(_,i)=>(game.day-2+shift+i+staffPool.length)%staffPool.length)
    .filter((id)=>!game.staff.includes(id)).slice(0,3);
}
function nextCandidateShift(){
  const current=candidateIds();
  for(let offset=3;offset<3+staffPool.length;offset++){
    const shift=game.recruitShift+offset;
    if(candidateIds(shift).some(id=>!current.includes(id)))return shift;
  }
  return null;
}
function canReroll(){ return game.phase!=='live'&&game.staff.length<4&&nextCandidateShift()!==null; }
function switchRow(key, details = '', unavailable = false) {
  return '<div class="option-row"><div><b>'+optionNames[key]+'</b><p>'+details+'</p></div>'+
    button(unavailable?'待雇人':game.settings[key]?'开启':'关闭','option','toggle'+(game.settings[key]&&!unavailable?' on':''),'data-key="'+key+'" aria-pressed="'+(!unavailable&&game.settings[key])+'"',unavailable)+'</div>';
}
function renderPersonnel() {
  const available=game.phase!=='live';
  const hasWaiter=employeeList('waiter').length>0;
  const cooks=employeeList('cook').length;
  const staffedStoves=1+cooks+Number(game.assistant);
  const candidates=candidateIds();
  const full=game.staff.length>=4;
  const waiterTasks=[['autoSeat','接客'],['autoServe','上餐'],['autoClear','收桌']]
    .filter(([key])=>game.settings[key]).map(([,label])=>label).join('、');
  const top='<div class="management-page staff-page"><section class="panel">'+journalHeading('小摊值班表','nav-staff',game.staff.length+' 位伙计 · 本班人手开销 '+yen(wageTotal()))+
    '<div class="segments staff-tabs" aria-label="值班与邀约">'+[['roster','这班谁在'],['hiring','找人搭把手']].map(([key,label])=>
      button(label,'staff-tab',staffTab===key?'active':'','data-key="'+key+'" aria-pressed="'+(staffTab===key)+'"')).join('')+'</div></section>';
  const hiring='<section class="panel hiring"><div class="staff-panel-head"><h2>'+icon('people')+' 街坊来应邀</h2>'+offer('reroll','看看别的街坊')+'</div>'+
    (!available||full?'<p class="staff-status">'+(!available?'营业中，收摊后可招人和调整在岗名单。':'在岗已满 4 人，解聘后可补招。')+'</p>':'')+
    '<div class="candidate-grid staff-applicants">'+
    candidates.map((id)=>{
      const p=staffPool[id];
      const cook=p.role==='cook';
      const hire=!available?'收摊后可邀请':full?'排班已满':game.money<p.fee?'还差 '+yen(p.fee-game.money):'邀请 · '+yen(p.fee);
      return '<article class="employee staff-candidate">'+art(p.art,'staff-portrait')+'<div class="staff-profile"><h3>'+p.name+' <small>· '+p.age+' 岁</small></h3><p>'+p.bio+'</p>'+
        '<span class="staff-role '+p.role+'">'+(cook?'炉灶师傅':'服务员')+'</span><span class="staff-wage">每日 '+yen(p.wage)+'</span>'+
        '<small>'+(cook?'出餐效率 ':'服务速度 ')+Math.round(staffSpeed(p)*100)+'%</small></div>'+
        '<div class="staff-hire"><span class="staff-grade grade-'+p.grade+'" aria-label="'+p.grade+' 级">'+p.grade+'</span>'+
        button(hire,'hire-candidate','secondary','data-i="'+id+'"',!available||game.money<p.fee||full)+'</div></article>';
    }).join('')+'</div><div class="staff-refresh">'+button(game.used.reroll?'告示今日已贴':'重贴招工告示 · ¥8','reroll-pay','secondary','',!canReroll()||game.money<8||!!game.used.reroll)+
    '</div></section>';
  const roster='<section class="panel roster"><div class="staff-panel-head"><h2>'+icon('people')+' 当班名单</h2><span>'+game.staff.length+' / 4 个岗位</span></div>'+
    '<div class="list-item permanent-helper">'+art('q-song')+'<div><b>妈妈 · 采购帮手</b><p>进货 −5% · 每日补贴 ¥3</p></div><span>常驻</span></div>'+
    game.staff.map((id)=>{
      const employee=staffPool[id];
      return '<div class="list-item">'+art(employee.art)+'<div><b>'+employee.name+' · '+employee.grade+' 级</b><p>'+
        (employee.role==='cook'?'炉灶师傅 · 可启用额外炉位':'服务员'+(waiterTasks?' · 自动'+waiterTasks:''))+' · 每日 '+yen(employee.wage)+'</p></div>'+
        button('结束合作','fire','secondary','data-i="'+id+'" aria-label="结束与'+employee.name+'的合作"',!available)+'</div>';
    }).join('')+
    '<div class="row personnel-tally"><span>运行炉位 <b>'+operatingStoves()+' / '+game.stove+'</b></span><span>每日人手支出 <b>'+yen(wageTotal())+'</b></span></div>'+
    (operatingStoves()<game.stove?'<p>'+(staffedStoves<game.stove?'尚缺炉灶师傅':'有炉位尚未启用')+' · '+(game.stove-operatingStoves())+' 台待用</p>':
      cooks>=game.stove?'<p>有师傅等炉，添炉后可安排到岗。</p>':'')+
    '<div class="actions">'+button('查看炉位','stoves','secondary')+button('回街口','nav','secondary','data-page="stall"')+offer('help','请临时搭档')+'</div></section>'+
    '<section class="panel roster-options">'+panelHeading('把哪些活儿交给伙计','people')+
    '<div class="staff-switches">'+switchRow('autoSeat',hasWaiter?'空桌和食材都够时，伙计会招呼客人。':'请到服务员后可以安排。',!hasWaiter)+
    switchRow('smart','自动接客时优先大桌和偏好座位。')+
    switchRow('continuous','账单后自动备货，遇到事件或预算不足时停下。')+
    '<details class="ux-fold" data-fold="staff-auto"><summary>上餐与收桌分工</summary>'+
    switchRow('autoServe','给已做好的堂食上餐或交付外带。',!hasWaiter)+switchRow('autoClear','收拾用完餐的桌子。',!hasWaiter)+'</details></div>'+
    '</section>';
  return top+(staffTab==='hiring'?hiring:roster)+'</div>';
}
function staffSpeed(employee) { return {A:1.25,B:1,C:.85}[employee?.grade]||1; }
function showStoves() {
  const needsCook=!employeeList('cook').length;
  const lock=game.area===0?' · 地铁广场开放':needsCook?' · 先雇师傅':operatingStoves()<game.stove?' · 先启用闲置炉位':'';
  openStory('炉具管理','正在使用 '+operatingStoves()+' 台 · 待安排 '+(game.stove-operatingStoves())+' 台。额外炉位需要炉灶师傅值班。',
    button('添加炉位 · ¥95'+lock,'stove-buy','secondary','',game.stove>=3||game.money<95||!!lock)+
    button('给炉具换新 · '+yen(40+game.stoveLevel*35)+(game.stoveLevel>=Math.min(3,game.area+1)?' · 本站已满级':''),'stove-renew','secondary','',game.stoveLevel>=Math.min(3,game.area+1)||game.money<40+game.stoveLevel*35)+
    button('切换启用数量','stove-assign','secondary','',game.stove<2)+button('返回','dismiss'));
}
function renderDecor() {
  const type=decorTypes[decorTab];
  const rows=type.items.slice(decorPage*3,decorPage*3+3);
  const chosen=game.decorPreview??game.equipped[decorTab];
  const preview=type.items[chosen];
  const set=[...game.equipped];
  const keepsakes=storyKeepsakes();
  if(game.decorPreview!==null)set[decorTab]=game.decorPreview;
  const pairs=Array.from({length:6},(_,i)=>i).filter(i=>game.ownedDecor.includes('1:'+i)&&game.ownedDecor.includes('2:'+i)).length;
  const target=decorTypes[0].items.find((item,i)=>!game.ownedDecor.includes('0:'+i)&&item[1]==='券'&&passedCount()>=item[3]&&item[2]>game.vouchers);
  return '<section class="panel decor-panel">'+journalHeading('给摊车换个样','nav-decor','手里有 '+game.vouchers+' 张装扮券')+
    '<div class="segments">'+decorTypes.map((entry,i)=>button(entry.name,'decor-tab',decorTab===i?'active':'','data-i="'+i+'" aria-pressed="'+(decorTab===i)+'"')).join('')+'</div>'+
    '<div class="decor-stage decor-full district-'+district().scene+'">'+art('cart','decor-cart')+
    (set[0]===null?'':art('q-lamp-'+set[0],'preview-lamp'))+
    art('q-sit-elder','preview-guest guest-left')+art('q-sit-office','preview-guest guest-right')+
    art(set[1]===null?'table':'q-table-'+set[1],'preview-table')+
    art(set[2]===null?'stool':'q-stool-'+set[2],'preview-stool preview-left')+
    art(set[2]===null?'stool':'q-stool-'+set[2],'preview-stool preview-right')+
      '<span>'+(game.decorPreview!==null&&preview?'预览 · '+preview[0]:'街口当前布置')+'</span></div>'+
    '<div class="decor-rack">'+rows.map((item,j)=>{
      const i=decorPage*3+j, key=decorTab+':'+i, owned=game.ownedDecor.includes(key), active=game.equipped[decorTab]===i;
      const [name,currency,cost,unlock,,bonus]=item;
      const unlocked=decorUnlocked(currency,cost,unlock);
      const canPay=currency==='元'?game.money>=cost:currency==='券'?game.vouchers>=cost:true;
      const missing=currency==='元'?yen(cost-game.money):cost-game.vouchers+' 张券';
      return '<div class="list-item decor-item">'+button(decorSample(decorTab,item),'decor-preview','decor-mini','data-i="'+i+'" aria-label="预览'+name+'"')+'<div><b>'+name+'</b><p>'+
        (currency==='章'?'完成 '+unlock+' 个街区解锁':currency==='天'?'收摊 '+cost+' 天赠送':currency==='访'?'老周第三次到访赠送':cost+' '+currency)+
        (bonus?' · 收藏 +'+bonus+'%':'')+(decorTab>0?' · 成套 +'+[2,2,2,.5,.5,.5][i]+'%':'')+'</p></div>'+
        button(active?'使用中':owned?'装备':!unlocked?'未解锁':!canPay?'还差 '+missing:['天','章','访'].includes(currency)?'领取并装备':'购买并装备','decor-buy','secondary','data-i="'+i+'"',active||(!owned&&(!unlocked||!canPay)))+'</div>';
    }).join('')+'</div>'+
    '<div class="segments">'+button('上一页','decor-page','','data-i="0"',!decorPage)+'<span class="chip">'+(decorPage+1)+' / 2</span>'+
    button('下一页','decor-page','','data-i="1"',!!decorPage)+'</div><div class="actions">'+
    (target?offer('vouchers','离「'+target[0]+'」差 '+(target[2]-game.vouchers)+' 张 · +3 张'):'')+button('恢复原始装扮','decor-reset')+'</div>'+
    '<details class="ux-fold" data-fold="decor-bonuses"><summary>收藏与套装效果</summary><p>已收藏 '+game.ownedDecor.length+' / 18 · 成套 '+pairs+' / 6</p>'+
    '<p>收藏 +'+collectionBonus()+'% · 当前套装 +'+setBonus(game.equipped)+'%'+
    (game.decorPreview!==null&&preview?' · 预览套装 +'+setBonus(set)+'%':'')+'</p>'+
    (keepsakes?'<div class="keepsakes">'+keepsakes+'</div>':'')+'</details></section>';
}
function decorUnlocked(currency,cost,chapters){
  return passedCount()>=chapters&&(currency!=='天'||shiftsCompleted()>=cost)&&(currency!=='访'||(game.known[0]?.visits||0)>=3);
}
function decorSample(category,item) {
  const kind=['lamp','table','stool'][category];
  const index=decorTypes[category].items.indexOf(item);
  return '<span class="decor-sample decor-part-'+category+'">'+art(index>=0?'q-'+kind+'-'+index:kind==='lamp'?'q-lamp-0':kind)+'</span>';
}
function collectionBonus() {
  return game.ownedDecor.reduce((sum,key)=>{
    const [tab,index]=key.split(':').map(Number);return sum+(decorTypes[tab]?.items[index]?.[5]||0);
  },0);
}
function setBonus(set){return set[1]!==null&&set[1]===set[2]?[2,2,2,.5,.5,.5][set[1]]:0;}
function decorBonus(){return collectionBonus()+setBonus(game.equipped);}
function equipDecor(index) {
  const key=decorTab+':'+index, item=decorTypes[decorTab].items[index];
  if(!item)return;
  if(!game.ownedDecor.includes(key)){
    const [,currency,cost,unlock]=item;
    if(!decorUnlocked(currency,cost,unlock))return;
    if(currency==='元'){if(game.money<cost)return;game.money-=cost;}
    if(currency==='券'){if(game.vouchers<cost)return;game.vouchers-=cost;}
    game.ownedDecor.push(key);
  }
  game.equipped[decorTab]=index;
  breakfastAudio.effect('upgrade');
}
function welfareKey() {
  const d=new Date(Date.now()+3*60*60*1000); // UTC+8, refreshed at 05:00 local.
  return d.toISOString().slice(0,10);
}
function refreshWelfare() {
  const key=welfareKey();
  if(game.welfare.key!==key)Object.assign(game.welfare,{key,free:false,video:false,emergency:false,decor:false,support:false,todayViews:0});
}
function boostLabel(perk) { return perk?(perk[0]?perk[0]+'× ':'4× 或 8× ')+perk[1]+' 秒':''; }
function renderWelfare() {
  refreshWelfare();
  const w=game.welfare;
  const today=w.signDate===w.key;
  const idx=w.signed%7;
  const signedInCycle=today&&idx===0?7:idx;
  const goal=videoMilestones[w.milestone];
  return '<section class="panel welfare-board">'+journalHeading('街坊补给站','nav-prep','每天早上 05:00 补货。')+
    '<div class="benefit welfare-gift">'+art('q-neighbors')+'<div><h3>街坊送来的开摊红包</h3><div class="actions">'+
    button(w.free?'红包已收':'收下红包 ¥27','welfare-free','primary','',w.free)+offer('gift','再收一份 ¥27')+'</div></div></div>'+
    '<details class="ux-fold" data-fold="welfare-cash"><summary>手头紧，看看周转金</summary><div class="benefit welfare-cash"><p>余额低于 ¥30 时，每天可以领取一次。</p><div class="actions">'+
    button(w.emergency?'今天已领取':'街坊周转金 ¥12','welfare-cash','secondary','',w.emergency||game.money>=30)+
    (!w.emergency&&game.money<30?offer('cash','看视频领 ¥27'):'')+'</div></div></details>'+
    '<div class="benefit welfare-sign"><h3>早安签到卡</h3><p>攒满 7 天换一张新卡。漏签时，之前的印章都还在。</p><p>手里有 '+(w.boost+w.perks.length)+' 张倍速券'+
    (w.perks.length?' · '+w.perks.map(boostLabel).join('、'):'')+(w.boost?' · 通用券 '+w.boost+' 张':'')+'</p><div class="calendar">'+signInAmounts.map((amount,i)=>'<span class="'+
      (i<signedInCycle?'checked':!today&&i===idx?'today':'')+'"><small>第 '+(i+1)+' 天</small><b>'+yen(amount)+'</b>'+
      (signInBoosts[i]?'<small>'+boostLabel(signInBoosts[i])+'</small>':'')+'</span>').join('')+'</div>'+
      button(today?'今日已签到':'签到 '+yen(signInAmounts[idx]),'sign-in','primary full','',today)+'</div>'+
    '<div class="benefit"><h3>视频补给进度</h3><p>已完整观看 '+w.views+' 次'+(goal?' · 再看 '+Math.max(0,goal-w.views)+' 次可以领下一份':' · 已领完')+'</p><div class="calendar">'+
      videoMilestones.map((amount,i)=>'<span class="'+(i<w.milestone?'checked':'')+'"><b>'+amount+' 次</b><small>'+boostLabel(milestoneBoosts[i])+'</small></span>').join('')+'</div><div class="actions">'+
      button('领取倍速权益','video-milestone','secondary','',!goal||w.views<goal)+'</div></div></section>';
}
function renderMore() {
  const met = Object.values(game.known).filter(entry => entry.visits > 0).length;
  const journals = [
    ['regulars', '街坊图鉴', met + ' / ' + regulars.length + ' 位', 'q-neighbors'],
    ['album', '街口相册', game.memories.length + ' 张照片', 'q-birthday'],
  ];
  const shortcuts = [
    ['career', '出摊路线', '街区目标与进度', 'map'],
    ['history', '营业账本', '往期收支', 'ledger'],
    ['welfare', '街坊补给', '签到与红包', 'heart'],
    ['branches', '筹备分摊', chainUnlocked() ? '查看分摊经营' : '本城第一后开放', 'stall'],
  ];
  return '<section class="panel more-directory">' + journalHeading('小禾的街口手账','nav-more') +
    '<section class="journal-shortcuts"><h3>摆摊常用</h3><div class="journal-link-grid">' + shortcuts.map(([target, name, detail, glyph]) =>
      button('<span class="journal-link-icon">' + icon(glyph) + '</span><span><strong>' + name + '</strong><small>' + detail + '</small></span>',
        'nav', 'journal-link', 'data-page="' + target + '"')).join('') + '</div></section>' +
    '<section class="journal-collections"><h3>街坊与留影</h3><div class="journal-link-grid">' + journals.map(([target, name, detail, image]) =>
      button(art(image) + '<span><strong>' + name + '</strong><small>' + detail + '</small></span>',
        'nav', 'journal-postcard', 'data-page="' + target + '"')).join('') + '</div></section></section>' +
    '<section class="panel ux-options journal-settings"><h2>设置</h2><details class="ux-fold" data-fold="settings-sound"><summary>声音</summary><div class="option-row"><b>音效与环境声</b>'+
    button(game.sound?'开启':'关闭','effects','toggle'+(game.sound?' on':''),'aria-label="音效与环境声" aria-pressed="'+game.sound+'"')+'</div>'+switchRow('music')+switchRow('voice')+'</details>'+
    '<details class="ux-fold" data-fold="settings-display"><summary>画面与省电</summary><div class="segments">'+[30,45,60].map((fps,i)=>button(fps+' 帧 · '+['省电','均衡','流畅'][i],
      'fps',fps===game.settings.fps?'active':'','data-i="'+fps+'"')).join('')+'</div>'+
    switchRow('rain')+switchRow('reduced')+switchRow('showCanopy','只调整画面，挡雨效果照常。')+
    '<div class="row"><b>顶部避让</b><div class="segments">'+['不让','一点','多些'].map((name,i)=>button(name,'inset',game.settings.inset===i?'active':'','data-i="'+i+'"')).join('')+'</div></div></details>'+
    '<details class="ux-fold" data-fold="settings-play"><summary>玩法设置</summary>'+switchRow('autoEvent','连续营业时自动应用默认事件选项。')+
    switchRow('rankOptIn','满 7 班后，将这档的最高七班折算均额同步到 TapTap。')+
    '</details></section>'+renderMoreTools();
}
function renderMoreTools(){
  refreshWelfare();
  const savedTime=game.savedAt?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(game.savedAt):null;
  const speed=Object.entries(game.perkEnds).filter(([,end])=>end>game.elapsed)
    .map(([rate,end])=>rate+'× '+Math.ceil(end-game.elapsed)+'秒').join(' · ');
  return '<section class="panel">'+panelHeading('视频权益','clock','<span class="chip">今天 '+game.welfare.todayViews+' 次</span>')+
    '<p>倍速 '+(speed||'未开启')+'</p><div class="actions">'+button('播放帮助','video-help')+offer('support','请小禾喝杯豆浆')+'</div></section>'+
    '<section class="panel">'+panelHeading('存档','stock')+'<p>存档 '+(activeSlot+1)+' · 第 '+game.day+' 天 · '+
      (savedTime?'最近保存 '+savedTime:'还没有成功保存')+'</p><div class="actions">'+
    button('立即存档','save-now','primary')+button('返回标题与存档','title')+button('玩法说明','play-guide')+'</div></section>';
}
function renderRegulars() {
  const met=Object.values(game.known).filter(entry=>entry.visits>0).length;
  return '<section class="panel neighbors-book">'+journalHeading('来过的街坊','nav-staff',met+' / '+regulars.length+' 位已经和小禾熟络起来。')+'<div class="neighbor-grid">'+regulars.map(([name,detail,person],i)=>{
    const known=game.known[i];
    const visited=known?.visits>0;
    const story=regularStories[i];
    const portrait=visited?regularPortraits[i]:'q-walk-'+(person==='cyclist'?'rider':person);
    return '<div class="list-item regular-card"><span class="regular-portrait'+(visited?'':' unknown-portrait')+'">'+art(portrait)+'</span><div><b>'+(visited?name:'还没打过招呼')+'</b><p>'+
      (visited?detail+' · 来过 '+known.visits+' 次'+(known.choice||story?' · '+preferenceLabel(known.choice||story.seat):''):'营业时有机会遇到。')+'</p>'+
      (visited&&story?'<small>故事 '+Math.min(3,known.visits)+'/3 · '+(known.visits>=3?'已获 '+story.gift:'第三次到访送 '+story.gift)+'</small>':'')+'</div>'+
      (visited?button('翻开这一页','regular','secondary','data-i="'+i+'"'):'')+'</div>';
  }).join('')+'</div></section>';
}
function renderAlbum() {
  return '<section class="panel photo-book">'+journalHeading('手账里的留影','nav-more','夹了 '+game.memories.length+' 张照片')+
    (game.memories.length?'<div class="photo-grid">'+game.memories.map((m,i)=>
      button(art(m.image)+'<b>'+m.name+'</b><small>第 '+m.day+' 天</small>','album-photo','memory','data-i="'+i+'" aria-label="看照片 '+m.name+'"')).join('')+'</div>':'<p>开张和街坊事件会留下照片。</p>')+
      '<div class="album-missing">'+[['sold-out','第一次卖空'],['birthday','扫街班的谢幕早餐'],['city-champion','全城早餐第一']]
        .filter(([id])=>!game.memories.some(m=>m.id===id)).map(([,name])=>'<span>🔒 '+name+'</span>').join('')+'</div></section>';
}
function storyKeepsakes(){
  return Object.entries(regularStories).filter(([id])=>game.known[id]?.visits>=3)
    .map(([,story])=>'<span>'+art(story.art)+story.gift+'</span>').join('');
}
function branchTerms(index) { return { cost:160+index*70, daily:12+index*6 }; }
const branchDemand=[0,2,1,0];
function branchDaily(index,day=game.day){
  const menu=game.branchMenus[index]??branchDemand[index];
  const base=branchTerms(index).daily;
  const fit=menu===branchDemand[index];
  const localBonus=fit?Math.ceil(base*.25):0;
  const weatherBonus=menu===2&&forecasts[(day-1)%forecasts.length].kind==='rain'?2:0;
  return {index,menu,base,amount:base+localBonus+weatherBonus,localBonus,weatherBonus};
}
function cityTitleEarned() {
  const rank=localRank();
  return rank.count===rankWindow&&rank.standing===1;
}
function chainUnlocked() { return game.cityChampion||game.branches.length>0||cityTitleEarned(); }
function renderBranches() {
  const unlocked=chainUnlocked();
  return '<section class="panel chain-board">'+journalHeading('把早点带到新街口','nav-stall',unlocked?'分摊收入会随每天的收摊账一起结算。':'连记 7 班营业额，拿到本城第一就能开分摊。')+'<div class="branch-grid">'+
    districts.slice(0,-1).map((entry,i)=>{
      const {cost}=branchTerms(i);
      const forecast=branchDaily(i,game.day+Number(game.phase==='report'));
      const open=game.branches.includes(i);
      return '<div class="list-item branch-card">'+art(entry.scene)+'<div><b>'+entry.name+'分店</b><p>'+(open?'主推 '+menus[forecast.menu].name:'推荐 '+menus[branchDemand[i]].name)+' · 预计日结 '+yen(forecast.amount)+'</p>'+
        (open?'<details class="ux-fold employee-info" data-fold="branch-'+i+'"><summary>调整主推</summary><div class="segments">'+
        menus.map((menu,m)=>button(art(menu.art),'branch-menu',forecast.menu===m?'active':'','data-i="'+i+'" data-key="'+m+'" aria-label="主推'+menu.name+'"',game.phase==='live')).join('')+'</div></details>':'')+'</div>'+
        button(open?'营业中':!unlocked?'待解锁':'开店 '+yen(cost),'branch','secondary','data-i="'+i+'"',
          !unlocked||open||game.money<cost||game.phase==='live')+'</div>';
    }).join('')+'</div></section>';
}
function renderHistory() {
  const rows=[...game.history,...(game.report?[game.report]:[])].reverse().filter(r=>historyArea<0||(r.area||0)===historyArea);
  return '<section class="panel ledger-history">'+journalHeading('旧账本','nav-more',rows.length+' 班记录')+'<div class="journal-filter">'+
    '<label class="history-filter">街区 <select data-history-area>'+[{name:'全部街区'},...districts].map((area,i)=>'<option value="'+(i-1)+'"'+(historyArea===i-1?' selected':'')+'>'+area.name+'</option>').join('')+'</select></label></div>'+
    (rows.length?rows.slice(0,historyLimit).map((r)=>'<div class="list-item"><span class="medal">'+icon('ledger')+'</span><div><b>第 '+r.day+' 天 · '+
      districts[r.area||0].name+'</b><p>营业额 '+yen(r.revenue)+'</p></div>'+
      '<div class="history-profit"><small>利润</small><strong>'+yen(r.profit)+'</strong></div>'+
      button('明细','old-report','secondary','data-i="'+r.day+'"')+'</div>').join(''):'<p>这里还没有账单。</p>')+
    (rows.length>historyLimit?button('再看 20 天','history-more','secondary full'):'')+'</section>';
}
function receiptDetail(report) {
  const lines = [];
  for(let i=0;i<menus.length;i++)if(report.earnings)lines.push([menus[i].name,report.earnings[i]]);
  if(report.tips)lines.push(['街坊小费',report.tips]);
  lines.push(['营业额',report.revenue]);
  if(report.expenses)for(const [name,amount] of Object.entries(report.expenses))if(amount)lines.push([name,-amount]);
  if(!report.expenses)lines.push(['当日成本',-report.cost]);
  lines.push(['经营利润',report.profit]);
  if(report.branchIncome)lines.push(['分店收入',report.branchIncome]);
  for(const sale of report.branchSales||[])lines.push([districts[sale.index].name+'分店'+(sale.menu!==undefined?' · '+menus[sale.menu].name:''),sale.amount]);
  const branchDetail=report.branchSales?.filter(sale=>sale.menu!==undefined).map(sale=>'<li>'+districts[sale.index].name+' · '+menus[sale.menu].name+
    ' · 基础 '+yen(sale.base)+(sale.localBonus?' · 商圈 '+yen(sale.localBonus):'')+(sale.weatherBonus?' · 雨天 '+yen(sale.weatherBonus):'')+'</li>').join('');
  const bills=report.bills?.map(({name,due,old,paid,unpaid})=>'<li><b>'+name+'</b> 应付 '+yen(due)+
    (old?' · 前欠 '+yen(old):'')+' · 实付 '+yen(paid)+' · 未付 '+yen(unpaid)+'</li>').join('');
  return '<div class="receipt detailed">'+lines.map(([name,value])=>'<div class="row"><span>'+name+'</span><b>'+yen(value)+'</b></div>').join('')+'</div>'+
    (bills?'<details class="receipt-notes"><summary>应付与实付'+(report.bills.some(bill=>bill.unpaid)?' · 有欠款':'')+'</summary><ul>'+bills+'</ul></details>':'')+
    (branchDetail?'<details class="receipt-notes"><summary>分店主推收入</summary><ul>'+branchDetail+'</ul></details>':'')+
    (report.food?'<div class="receipt-food"><h3>餐品去向</h3>'+report.food.map((line,i)=>'<div>'+art(menus[i].art)+'<b>'+menus[i].name+'</b><small>售 '+line.sold+' · 缺货 '+line.missed+' · 冷藏 '+line.cold+' · 损耗 '+line.waste+'</small></div>').join('')+
    '</div>':'');
}

function payExpense(name, amount) {
  game.cost += amount;
  game.money -= amount;
  game.expenses[name]=(game.expenses[name]||0)+amount;
}
function settleOverheads(){
  const amounts={'当日人员补贴':wageTotal(),'摊位费':5+game.area*2,'炉火与用水':operatingStoves()*2};
  return Object.entries(amounts).map(([name,due])=>{
    const old=game.outstanding[name]||0;
    const paid=Math.min(game.money,due+old);
    const unpaid=due+old-paid;
    game.money-=paid;
    game.cost+=due;
    game.expenses[name]=(game.expenses[name]||0)+due;
    if(unpaid)game.outstanding[name]=unpaid;
    else delete game.outstanding[name];
    return {name,due,old,paid,unpaid};
  });
}
function livePrompt(){
  if(game.closing){
    const waiting=orders().filter(t=>t&&['queued','cooking','ready','eating'].includes(t.state)).length;
    return waiting ? '收摊中 · 剩余 '+waiting+' 组客人' : game.stockDelivery ? '收摊中 · 等已订的食材送到' : '收摊中';
  }
  if(game.tutorial<3)return '点炉子三次，把灶火烧起来';
  if(game.tables.some(t=>t?.state==='ready'))return '早餐做好了，点桌子上餐';
  if(game.tables.some(t=>t?.state==='dirty'))return '有桌客人吃完了，点桌面收拾';
  if(game.queue.some(c=>!c.toGo&&c.size>seatsPerTable))return '大桌来客 · 需要两张相邻空桌';
  if(game.queue.length)return '客人来了 · 拖到空桌或接外带';
  return capacityText()+(game.drinkOnly?' · 只接豆浆单':'');
}
function sceneDecor() {
  const light=decorTypes[0].items[game.equipped[0]];
  const canopy=game.canopy&&game.settings.showCanopy ? '<span class="canopy-tag">'+(forecast().kind==='rain'?'雨棚已展开':'雨棚待命')+'</span>' : '';
  const sign=game.signboard?'<span class="stall-sign">热乎早点</span>':'';
  return canopy+sign+(light?'<div class="lantern-line" style="--light:'+light[4]+'" aria-hidden="true"><i></i><i></i><i></i><i></i></div>':'');
}
function preferenceLabel(key,friendId){
  if(key?.startsWith('friend:')){
    const index=Number(key.split(':')[1]);
    const table=game.tables[index];
    return table?.state==='eating'&&(friendId===undefined||friendId===table.id)?'找 '+(index+1)+' 号桌朋友':'朋友已离席';
  }
  if(key==='friend-left')return '朋友已离席';
  return {warm:'看做早餐',street:'靠街座',edge:'坐边上',fresh:'想避开烟'}[key]||'';
}
function preferenceFits(key,index,friendId){
  if(key?.startsWith('friend:')){
    const friend=Number(key.split(':')[1]);
    const table=game.tables[friend];
    return table?.state==='eating' && (friendId===undefined||friendId===table.id) &&
      Math.floor(index/4)===Math.floor(friend/4) && Math.abs(index-friend)===1;
  }
  return {warm:index>=4||index<2,street:index%4>=2,edge:index%4===0||index%4===3,fresh:index<4&&index%4>=2}[key]||false;
}
function reserveTutorGuests() {
  if (game.queue.length || game.tables.some((t)=>t)) return;
  const first=game.stock.findIndex(Boolean);
  addCustomer(1,0,menus.map((_,i)=>Number(i===first)),false);
}
function warmStove(skip = false) {
  if(game.phase!=='live'||game.tutorial<0||game.tutorial>=3)return;
  game.tutorial=skip?3:game.tutorial+1;
  if(!skip){streetEffect('spark',-1,'✦');breakfastAudio.effect('ignite');}
  if(game.tutorial===3){
    reserveTutorGuests();
    if (!skip) {
      game.streetLesson = 'seat';
      game.lessonParty = game.queue[0]?.id;
      game.lessonRound = 0;
    }
    game.arrival=game.elapsed+4;
    if (skip) notify('炉子热了。把客人拖到空桌，或点客人再点桌。');
  }
}
function advanceStreetLesson() {
  game.streetLesson = null;
  game.lessonParty = null;
  const size = [4,8][game.lessonRound ?? 0];
  if (!size || game.stock.reduce((total,n)=>total+n,0)<4) return;
  const items = [0,0,0];
  let remaining = 4;
  while (remaining) {
    for (let i=0; i<items.length && remaining; i++) {
      if (items[i]>=game.stock[i]) continue;
      items[i]++;
      remaining--;
    }
  }
  if (!addCustomer(size,1,items,false)) {
    game.streetLesson = 'next-party';
    return;
  }
  const guest = game.queue.pop();
  game.queue.unshift(guest);
  game.lessonParty = guest.id;
  game.lessonRound = (game.lessonRound ?? 0)+1;
  game.streetLesson = 'seat';
}
function markRegular(order) {
  if(order.regularId===undefined)return;
  const id=order.regularId;
  const existing=game.known[id] || { visits:0, choice:null };
  existing.visits++;
  game.known[id]=existing;
  if(existing.visits===1)remember('regular-'+id,'认识了'+regulars[id][0],'story');
  if(existing.visits===3){
    const story=regularStories[id];
    game.vouchers+=2;
    if(id===0&&!game.ownedDecor.includes('2:0'))game.ownedDecor.push('2:0');
    remember('regular-gift-'+id,story?story.gift:regulars[id][0]+'带了礼物',story?.art||'q-neighbors');
    streetEffect('gift',game.tables.indexOf(order),story?.art||'bao');
    streetEffect('message',game.tables.indexOf(order),(story?.gift||'熟客礼物')+' · 券 +2');
  }
}
function showRegular(index, currentGuest = false, requestedEpisode) {
  const entry=regulars[index];if(!entry)return;
  const record=game.known[index];
  const visits=record?.visits||0;
  const story=regularStories[index];
  const latest=Math.min(2,Math.max(0,visits-Number(!currentGuest)));
  const episode=requestedEpisode===undefined?latest:Math.max(0,Math.min(latest,requestedEpisode));
  const seat=record?.choice||story?.seat;
  const body=entry[1]+(seat?' 喜欢'+preferenceLabel(seat)+'。':'')+
    (story?' '+story.chapters[episode]:[' 下回给你讲巷口的故事。',' 上次那口热乎的，我还记得。',' 今天给你带了份小礼物。',' 路过总要来坐一坐。'][Math.min(visits,3)])+
    (story&&visits>=3?'<span class="regular-present">'+art(story.art)+'已获 '+story.gift+'</span>':'');
  const visitSeat=seat||'warm';
  const seatAction={warm:'留靠炉的位置',street:'留靠街的位置',edge:'留一张边桌'}[visitSeat]||'留一个位置';
  const actions=currentGuest?button(seatAction,'regular-choice','primary','data-i="'+index+'" data-key="'+visitSeat+'"')+
    button('照常安排','dismiss','secondary'):
    (story?'<div class="segments">'+story.chapters.map((_,chapter)=>button('第 '+(chapter+1)+' 话','regular-episode',chapter===episode?'active':'',
      'data-i="'+index+'" data-key="'+chapter+'"',chapter>latest)).join('')+'</div>':'')+button('返回','dismiss','primary');
  openStory(entry[0]+' · '+(story?'故事 '+(episode+1)+'/3':'第 '+(visits+Number(currentGuest))+' 次见面'),body,actions,regularPortraits[index]);
}
function addRegular() {
  if(game.queue.length>=5)return;
  const order=[0,2,5,1,3,4,6,7,8,9,10,11,12,13];
  const id=order[Math.floor((game.day-1)/3)%order.length];
  const artId=streetCharacters.indexOf(regulars[id][2]==='cyclist'?'rider':regulars[id][2]);
  if(!addCustomer(1,Math.max(0,artId),null,false))return;
  game.queue.at(-1).regularId=id;
  game.queue.at(-1).preference=game.known[id]?.choice||regularStories[id]?.seat||null;
  game.incidents.regular=true;
}
function showIncident(key) {
  game.pendingIncident=key;
  game.pendingGuest=key==='stockout'?selected:null;
  save();
  if(key==='crowded')openStory('炉子排长队了','可以先做一张急单，也可以请邻摊帮忙。',
    stovePriorityButtons()+offer('help','请邻摊帮忙')+button('按原顺序','dismiss'));
  if(key==='stockout') {
    const guest=game.queue.find(item=>item.id===selected);
    const focused=stockGap(guest).some(Boolean);
    const expanded=dialog.querySelector('details[data-fold="stock"]')?.open;
    openStory(focused?'这单还缺食材':'食材快卖完了',focused?'补好后可接着招待这位客人。':'小额补货立刻到摊，电话配送约 9 个营业秒后送到。',
      '<div class="stock-dialog">'+inventoryDetails()+'</div>'+button('回到营业','dismiss',focused?'secondary':'primary'));
    const options=dialog.querySelector('details[data-fold="stock"]');
    if(options&&expanded)options.open=true;
    breakfastAudio.say('stock');
  }
  if(key==='argument')openStory('两桌客人为座位起了争执','一边说自己先来的，另一边说已经替朋友留好位置了。',
    button('过去劝开','incident-choice','primary','data-key="talk"')+button('请管理员帮忙','incident-choice','secondary','data-key="guard"',game.money<6));
  if(key==='preference')openStory('这位客人有座位偏好','拖动客人时，合意的位置会亮金色。坐边上、靠炉、避烟或找朋友，都可以按现场提示找桌。');
}
function incidentTick() {
  if(game.closing||dialog.open||drag||game.tutorial<3||game.streetLesson)return;
  const covering = autoShiftActive();
  if(!game.incidents.regular && game.elapsed>=32 && game.queue.length<5) { addRegular(); return; }
  if(!covering && !game.incidents.preference && game.day>=2 && game.queue.some(c=>c.preference)){
    game.incidents.preference=true;
    showIncident('preference');
    return;
  }
  if(!game.incidents.argument && game.day===1 && game.elapsed>=48 && game.tables.filter(t=>t?.state==='eating').length>=2) {
    game.incidents.argument=true;showIncident('argument');return;
  }
  if(!covering && !game.incidents.crowded && game.day>1 && orders().filter(t=>t?.state==='queued').length>=2){
    game.incidents.crowded=true;showIncident('crowded');return;
  }
  if(!game.incidents.stockout && game.stock[0]+game.stock[1]<=4 && game.elapsed<92 && !game.stockDelivery){
    game.incidents.stockout=true;
    game.shortageAt=game.elapsed;
    save();
    notify('主食快卖完了，可点「补货」。');
    breakfastAudio.effect('warning');
    breakfastAudio.say('stock');
  }
}
function enableTimedSpeed(speed,duration=speed===4?30:15) {
  game.perkEnds[speed]=game.elapsed+duration;
  game.speed=speed;
}
function applyStaffAutomation() {
  if(game.closing||drag||game.elapsed<(game.incidents.nextSeat||0))return;
  const covering = autoShiftActive();
  if (!covering && (!game.settings.autoSeat || !employeeList('waiter').length)) return;
  game.incidents.nextSeat=game.elapsed+2.5;
  const preserve=selected;
  const candidates=game.settings.smart?[...game.queue].sort((a,b)=>b.size-a.size):game.queue;
  for(const c of candidates){
    if(covering && c.id===preserve)continue;
    if(c.items.some((n,i)=>n>game.stock[i]))continue;
    if(c.toGo){if(game.takeaway.length>=game.boxes||!sendStreetWorker(-1,'seat',c.id))continue;acceptTakeaway(c.id);break;}
    const free=game.tables.flatMap((table,i)=>table===null&&(c.size<=seatsPerTable||adjacentSeat(i)!==undefined)?[i]:[]);
    const preferred=game.settings.smart&&c.preference ? free.find(i=>preferenceFits(c.preference,i,c.friendId)) : undefined;
    const index=preferred??free[0];
    if(index!==undefined&&sendStreetWorker(index,'seat',c.id)){seatGuest(c.id,index);break;}
  }
  if(game.queue.some(c=>c.id===preserve))selected=preserve;
}
function handleExtraAction(act, index, key) {
  switch(act){
    case 'choose-slot': chosenSlot=index;break;
    case 'open-slot': openSlot();break;
    case 'new-slot': openStory('重开这个存档？','该栏原有的经营记录会被新的进度替换。',button('取消','dismiss')+button('确认重开','reset-slot','primary'));return 'dialog';
    case 'reset-slot': dialog.close();openSlot(true);break;
    case 'title': save();titleOpen=true;chosenSlot=activeSlot;continuousAt=null;breakfastAudio.reset();break;
    case 'warm': warmStove();break;
    case 'skip-tutorial': warmStove(true);break;
    case 'skip-street-lesson': game.streetLesson=null; break;
    case 'auto-shift':
      if (!autoShiftActive()) return false;
      openStory('搭档正在托管','还剩 '+Math.ceil(game.autoShiftUntil-game.elapsed)+' 个营业秒。你也可以自己招待客人。提前结束会取消剩余时间，本班托管算已用。',
        button('继续托管','dismiss','primary')+button('结束托管','end-auto-shift'));
      return 'dialog';
    case 'end-auto-shift':
      game.autoShiftUntil=0;
      dismissStory();
      break;
    case 'weather': {
      const f=forecasts[(game.day+(Number.isFinite(index)?index:0)-1)%forecasts.length];
      openStory(f.label+' · 天气预报',f.rush+(f.kind==='rain'?(game.canopy?'。雨棚已装，挡雨效果生效。':'。没装雨棚时，来客会减少。'):'。适合照常营业。'));return 'dialog';
    }
    case 'daily-event': showDailyEvent();return 'dialog';
    case 'feature-menu': if(game.phase==='prep')showSpecials();return 'dialog';
    case 'feature': if(game.phase==='prep'&&specialsBoard[index]&&featureUnlocked(specialsBoard[index])){game.featured=index;recommendStock();dialog.close();}break;
    case 'cooler-priority': if(game.phase==='prep'&&['main','drink'].includes(key))game.coolerPriority=key;break;
    case 'save-now': {const saved=save();paint();notify(saved?'存档 '+(activeSlot+1)+' 已保存。':'保存失败，请检查设备存储后重试。');return 'dialog';}
    case 'stop-continuous': game.settings.continuous=false;continuousAt=null;break;
    case 'video-help': openStory('视频播放帮助','视频中断或播放失败时会回到游戏，奖励只在完整播放后发放。');return 'dialog';
    case 'play-guide': openStory('街坊早餐怎么卖？','拖客入座，点桌上餐和清台。五到八位客人用两张相邻桌，星标提示他们喜欢的位置。',undefined,'q-neighbors');return 'dialog';
    case 'event-choice': if(applyDailyEvent(index))dialog.close();break;
    case 'preset': setPrepPreset(index);break;
    case 'stoves': showStoves();return 'dialog';
    case 'stove-buy':
      if(game.phase!=='live'&&game.area>0&&employeeList('cook').length&&operatingStoves()===game.stove&&game.stove<3&&game.money>=95){game.money-=95;game.stove++;game.activeStove=game.stove;}showStoves();break;
    case 'stove-renew': {
      const cost=40+game.stoveLevel*35;
      if(game.phase!=='live'&&game.stoveLevel<Math.min(3,game.area+1)&&game.money>=cost){game.money-=cost;game.stoveLevel++;}showStoves();break;
    }
    case 'stove-assign':
      if(game.phase!=='live')game.activeStove=game.activeStove%game.stove+1;
      showStoves();break;
    case 'hire-candidate': {
      const p=staffPool[index];
      if(game.phase!=='live'&&p&&candidateIds().includes(index)&&game.money>=p.fee&&game.staff.length<4){
        game.money-=p.fee;game.staff.push(index);breakfastAudio.effect('upgrade');
        notify(p.name+'已经记进值班表。');
      }
      break;
    }
    case 'fire': if(game.phase!=='live')game.staff=game.staff.filter(id=>id!==index);break;
    case 'reroll-pay': if(canReroll()&&game.money>=8&&!game.used.reroll){game.money-=8;game.recruitShift=nextCandidateShift();game.used.reroll=true;}break;
    case 'staff-tab':
      if(key==='roster'||key==='hiring'){
        staffTab=key;
        main.scrollTop=0;
      }
      break;
    case 'option':
      if(Object.hasOwn(optionNames,key)){
        game.settings[key]=!game.settings[key];
        if(key==='rankOptIn'&&game.settings.rankOptIn)void syncNationalScore();
        if(!game.settings[key]&&['autoServe','autoClear'].includes(key)){
          const cancelled=key==='autoServe'?['serve','deliver']:['clear'];
          for(const [id,route] of Object.entries(game.staffRoutes||{})){
            if(id!=='helper'&&id!=='cover'&&cancelled.includes(route.action))delete game.staffRoutes[id];
          }
        }
      }
      break;
    case 'fps': if([30,45,60].includes(index))game.settings.fps=index;break;
    case 'inset': if([0,1,2].includes(index))game.settings.inset=index;break;
    case 'rank-tab':
      rankTab=key==='online'?'online':'local';
      if(rankTab==='online')void fetchRanks();
      break;
    case 'rank-sync':
      game.settings.rankOptIn=!game.settings.rankOptIn;
      if(game.settings.rankOptIn)void fetchRanks();
      break;
    case 'rank-open':
      void breakfastLeaderboard.open().catch(()=>notify('TapTap 全榜暂时打不开，可以在游戏内刷新。'));
      break;
    case 'decor-tab': if(decorTypes[index]){decorTab=index;decorPage=0;game.decorPreview=null;}break;
    case 'decor-page': if([0,1].includes(index))decorPage=index;break;
    case 'decor-preview': if(decorTypes[decorTab].items[index])game.decorPreview=index;break;
    case 'decor-buy': equipDecor(index);game.decorPreview=null;break;
    case 'decor-reset': game.equipped=[null,null,null];game.style=0;game.decorPreview=null;break;
    case 'album-photo': {
      const photo=game.memories[index];
      if(photo)openStory(photo.name,'第 '+photo.day+' 天',button('合上照片','dismiss','primary'),photo.image);
      return 'dialog';
    }
    case 'welfare-free': refreshWelfare();if(!game.welfare.free){game.money+=27;game.welfare.free=true;breakfastAudio.effect('reward');}break;
    case 'welfare-cash': refreshWelfare();if(!game.welfare.emergency&&game.money<30){game.money+=12;game.welfare.emergency=true;breakfastAudio.effect('reward');}break;
    case 'sign-in': refreshWelfare();if(game.welfare.signDate!==game.welfare.key){
      const reward=game.welfare.signed%7;
      game.money+=signInAmounts[reward];game.welfare.signed++;game.welfare.signDate=game.welfare.key;
      if(signInBoosts[reward])game.welfare.perks.push(signInBoosts[reward]);
      breakfastAudio.effect('reward');
    }break;
    case 'video-milestone': if(game.welfare.views>=videoMilestones[game.welfare.milestone]){game.welfare.perks.push(milestoneBoosts[game.welfare.milestone]);game.welfare.milestone++;}break;
    case 'regular': if(game.known[index])showRegular(index);return 'dialog';
    case 'regular-episode': if(game.known[index]&&regularStories[index])showRegular(index,false,Number(key));return 'dialog';
    case 'regular-choice':
      if(regulars[index]){
        game.known[index]||={visits:0,choice:null};game.known[index].choice=key;
        const guest=game.queue.find(c=>c.id===selected&&c.regularId===index);
        if(guest)guest.preference=key;
        dialog.close();
      }
      break;
    case 'branch': {
      const {cost}=branchTerms(index);
      if(chainUnlocked()&&index>=0&&index<districts.length-1&&game.phase!=='live'&&!game.branches.includes(index)&&game.money>=cost){
        game.money-=cost;game.branches.push(index);remember('branch-'+index,'开张：'+districts[index].name+'分店',districts[index].scene);
      }
      break;
    }
    case 'branch-menu':
      if(game.phase!=='live'&&game.branches.includes(index)&&menus[Number(key)])game.branchMenus[index]=Number(key);
      break;
    case 'history-more': historyLimit+=20;break;
    case 'old-report': {
      const report=[...game.history,...(game.report?[game.report]:[])].find(r=>r.day===index);
      if(report)openStory('第 '+index+' 天 · 收摊账单',receiptDetail(report));
      return 'dialog';
    }
    case 'phone-stock':
      if(game.phase==='live'&&!game.closing&&game.money>=12&&!game.stockDelivery){
        payExpense('电话补货',12);
        breakfastAudio.effect('stock');
        game.stockDelivery={orderedAt:game.elapsed,at:game.elapsed+9};
        if(game.speed===0)game.speed=1;
        dismissStory();page='stall';
      }break;
    case 'stock-options':
      cancelStreetDrag();
      if(Number.isFinite(index)&&game.queue.some(guest=>guest.id===index))selected=index;
      showIncident('stockout');
      return 'dialog';
    case 'drink-only':
      if(game.phase==='live'&&!game.closing&&game.stock[2]>0){
        game.drinkOnly=true;
        game.queue=game.queue.filter(c=>{
          if(c.items[2]>0||c.person%2===0)return true;
          recordMissedGuest(c);
          if(c.id===selected)selected=null;
          return false;
        });
        for(const c of game.queue)c.items=[0,0,Math.min(c.size,4)];
        dismissStory();page='stall';notify('先用现有豆浆招待客人。');
      }
      break;
    case 'live-table':
      if(game.phase==='live'&&!game.closing&&game.seatCount<tableLimit()&&game.money>=50){
        payExpense('临时添置折叠桌',50);game.seatCount++;game.tables.push(null);
        breakfastAudio.effect('upgrade');
        notify('新桌已经摆好。');
      }
      break;
    case 'incident-choice':
      if(key==='talk')game.reputation++;
      else if(game.money>=6){payExpense('摊位协调',6);game.reputation+=2;}
      dismissStory();break;
    case 'fast':
      if(game.perkEnds[index]>game.elapsed){game.speed=index;break;}
      {
        const perk=game.welfare.perks.findIndex(([rate])=>rate===index||rate===0);
        if(perk>=0){const [[,duration]]=game.welfare.perks.splice(perk,1);enableTimedSpeed(index,duration);break;}
      }
      if(game.welfare.boost>0){game.welfare.boost--;enableTimedSpeed(index);break;}
      if(availableReward()&&!rewardUsed('fast'+index))showOffer('fast'+index);
      else if(game.day===1&&game.phase==='live')openStory(index+'× 加速','首日收摊后可在福利中心签到领取倍速权益。',button('返回营业','dismiss','primary'));
      else openStory(index+'× 加速','从七日签到拿到倍速券后可使用。',button('去签到','go-welfare','primary')+button('返回','dismiss'));
      return 'dialog';
    case 'go-welfare': dialog.close();if(game.day>1||game.phase!=='live')page='welfare';break;
    default:return false;
  }
  return true;
}
