'use strict';

const tableAnchors = [
  [13, 89], [38, 89], [62, 89], [87, 89],
  [13, 74], [38, 74], [62, 74], [87, 74],
];
const counterAnchor = [73, 46];
const packingAnchor = [21, 39];
const streetEntrance = [-10, 59];
const waiterAnchors = [[40, 66], [60, 66], [20, 66], [80, 66], [31, 72], [71, 72], [51, 73]];
const rainDrops = [
  [4, 2], [24, 8], [43, 4], [61, 10], [76, 2], [96, 8],
  [9, 24], [22, 34], [34, 23], [53, 32], [67, 24], [88, 30],
  [14, 53], [32, 48], [46, 60], [62, 54], [77, 50], [98, 51],
  [6, 76], [26, 81], [51, 73], [72, 81], [89, 72],
];
const visitorNodes = new Map();
let streetRoot = null;
const staffNodes = new Map();
const streetCharacters=['office','elder','grandpa','student','rider','keeper'];

function renderStreet() {
  return '<section class="street-session" aria-label="早餐摊营业现场">' +
    '<div class="street-world district-' + district().scene + '" id="street-world">' +
    '<div class="street-atmosphere" aria-hidden="true"></div>' +
    '<div class="street-rain" aria-hidden="true">' + rainDrops.map(([x, y], index) =>
      '<i style="left:' + x + '%;top:' + y + '%;--length:' + (10 + index % 4 * 4) + 'px;--delay:-' + index * 83 + 'ms;--period:' +
      (720 + index % 5 * 123) + 'ms"></i>').join('') + '</div>' +
    '<div class="street-hud"><div id="street-weather"></div><div id="street-audio"></div></div>' +
    '<div id="street-supply-status"></div>'+
    '<div class="street-passers" aria-hidden="true">' + art('q-walk-grandpa') + art('q-walk-student') + '</div>' +
    '<div class="street-stall" aria-hidden="true">'+art('cart','street-cart')+'<div class="street-owner">'+art('q-walk-keeper')+'</div><div class="street-steam"><i></i><i></i></div></div>' +
    '<div id="street-stall-control"></div>' +
    '<div id="street-props"></div><div id="street-tables"></div><div id="street-people"></div><div id="street-staff" aria-hidden="true"></div><div id="street-effects" aria-hidden="true"></div>' +
    '<div id="street-delivery" class="street-delivery" aria-hidden="true" hidden>' + art('supply') + '<span></span></div>' +
    '<div id="street-packing"></div></div>' +
    '<div class="street-dock"><div id="street-order"></div><div id="street-help"></div><div class="street-status">'+art('keeper')+'<span id="street-status" aria-live="polite"></span></div>'+
    '<div id="street-auto"></div>' +
    button('收摊','close','street-pill street-close','',game.closing)+
    '<div class="shift-toolbar"><div id="street-pause"></div><div id="controls" class="live-controls"></div></div></div></section>';
}

function streetWeather(weather) {
  return button(icon(weather.kind) + ' ' + weather.label, 'weather', 'street-pill street-weather', 'data-i="0"') +
    (game.canopy && game.settings.showCanopy ? '<span class="street-pill">' + (weather.kind === 'rain' ? '雨棚展开' : '雨棚待命') + '</span>' : '');
}

function streetAutomation() {
  if (game.closing || game.tutorial < 3 || game.streetLesson) return '';
  if (autoShiftActive()) {
    return button('托管 <span id="auto-shift-seconds"></span>', 'auto-shift', 'street-pill shift-auto-active');
  }
  if (rewardUsed('autoShift')) return button('托管已用', 'auto-shift', 'street-pill', '', true);
  return offers.autoShift.valid() ? offer('autoShift', '托管') : '';
}

function streetPos([x, y]) {
  return 'left:' + x + '%;top:' + y + '%';
}

function tableStatus(table) {
  if (!table) return '';
  if (table.state === 'queued') return table.id === game.priorityOrder ? '优先' : '等餐';
  if (table.state === 'ready') return '上餐';
  if (table.state === 'dirty') return '收桌';
  if (['cooking', 'eating'].includes(table.state)) {
    return Math.max(0, Math.ceil(table.finish - game.elapsed)) + '秒';
  }
  return '';
}

function tableControls() {
  return game.tables.map((table, index) => {
    const paired = table?.state === 'paired';
    const source = paired ? game.tables[table.paired] : table;
    const kind = table?.state || 'open';
    const tableAsset=game.equipped[1]===null?(game.style?'q-table-'+[0,1,0,4][game.style]:'table'):'q-table-'+game.equipped[1];
    const stoolAsset=game.equipped[2]===null?'stool':'q-stool-'+game.equipped[2];
    const meal = ['eating','dirty'].includes(source?.state);
    const birthday = source?.state === 'eating' && source?.birthday;
    const chairs = source && source.state !== 'dirty' ? (paired ? 4 : 0) : null;
    const label = paired ? '拼桌' : tableStatus(table);
    const status = kind==='cooking'?'制作 '+label:kind==='eating'?'用餐 '+label:label;
    const remaining=table?.duration&&kind==='cooking'?(table.finish-game.elapsed)/table.duration:
      kind==='eating'?(table.finish-game.elapsed)/(3.5+table.size*.7):0;
    const guided = index === game.lessonTable && ['serve', 'clean'].includes(game.streetLesson);
    return '<button type="button" class="street-table" data-act="seat" data-i="' + index + '" data-kind="' + kind + '"' +
      (guided ? ' data-guide="true"' : '') +
      ' style="' + streetPos(tableAnchors[index]) + ';--meal-progress:'+Math.ceil(Math.max(0,remaining)*100)+
      '%;z-index:' + Math.round(tableAnchors[index][1]) +
      '" aria-label="' + (index + 1) + ' 号桌 ' + (label || '空位') + '">' +
      (chairs===null?'':seatedPortraits(source,chairs,chairs+2,'back'))+
      art(stoolAsset,'street-stool stool-left')+art(stoolAsset,'street-stool stool-right')+art(tableAsset,'street-tabletop')+
      (meal ? '<span class="street-meal">' + (source.state==='dirty'?art('dirty'):source.items.map((n,i)=>n?art(menus[i].art):'').join('')) + '</span>' : '') +
      (birthday && !paired ? '<span class="birthday-cake" aria-label="随餐小蛋糕">'+art('cake')+'</span>' : '') +
      (chairs===null?'':seatedPortraits(source,chairs+2,chairs+4,'front'))+
      (label ? '<span class="table-state">' + status + '</span>' : '<span class="table-number">' + (index + 1) + '</span>') +
      '</button>';
  }).join('') + tableAnchors.slice(game.seatCount,tableLimit()).map((anchor,offset)=>
    button('＋','live-table','future-table','style="'+streetPos(anchor)+'" aria-label="添第 '+(game.seatCount+offset+1)+' 张桌 · ¥50"',
      game.closing||game.money<50||offset>0)).join('');
}
function paintTables(){
  const layer=$('street-tables');
  const markup=tableControls();
  if(layer.rendered===markup)return;
  const template=document.createElement('template');
  template.innerHTML=markup;
  if(layer.children.length!==template.content.children.length ||
    [...layer.children].some((node,i)=>node.dataset.act!==template.content.children[i].dataset.act)){
    layer.replaceChildren(template.content);
  }else{
    for(const [i,node] of [...layer.children].entries()){
      const next=template.content.children[i];
      for(const name of ['style','data-guide','data-kind','aria-label','disabled']){
        const value=next.getAttribute(name);
        if(node.getAttribute(name)===value)continue;
        if(value===null)node.removeAttribute(name);
        else node.setAttribute(name,value);
      }
      const badge=node.querySelector('.table-state');
      const nextBadge=next.querySelector('.table-state');
      if(badge&&nextBadge&&node.children.length===next.children.length&&
        [...node.children].every((child,j)=>child===badge||child.outerHTML===next.children[j].outerHTML)){
        if(badge.textContent!==nextBadge.textContent)badge.textContent=nextBadge.textContent;
      }else if(node.innerHTML!==next.innerHTML)node.innerHTML=next.innerHTML;
    }
  }
  layer.rendered=markup;
}

function queueAnchor(index) {
  return [10 + index * 20, 61];
}

function positionActor(node, anchor, kind, layer = 0) {
  node.style.left = anchor[0] + '%';
  node.style.top = anchor[1] + '%';
  node.style.zIndex = Math.round(anchor[1]) + layer;
  node.dataset.pose = kind;
}

function actorPortraits(guest) {
  return Array.from({length: Math.min(3, guest.size)}, (_, i) =>
    art('q-walk-'+streetCharacters[(guest.person+i)%streetCharacters.length], 'visitor-person person-' + i)).join('');
}

function seatedPortraits(guest,start,end,side) {
  const count=Math.max(0,Math.min(guest.size,end)-start);
  if(!count)return '';
  const portraits=Array.from({length:count},(_,i)=>
    art('q-sit-'+streetCharacters[(guest.person+start+i)%streetCharacters.length],'diner diner-'+i)).join('');
  const eating=guest.state==='eating'?' eating-party'+(guest.items[2]?' drinking-party':''):'';
  return '<span aria-hidden="true" class="street-diners '+side+eating+'">'+portraits+'</span>';
}

function updateVisitors() {
  const layer = $('street-people');
  const current = new Set();
  const retain = (guest, kind, anchor, ordinal = 0) => {
    current.add(guest.id);
    let node = visitorNodes.get(guest.id);
    if (!node) {
      node = document.createElement('button');
      node.className = 'street-party';
      node.type = 'button';
      node.dataset.id = guest.id;
      visitorNodes.set(guest.id, node);
      positionActor(node, kind === 'queue' ? streetEntrance : anchor, kind);
      layer.append(node);
      if (kind === 'queue' && !game.settings.reduced) node.getBoundingClientRect();
    }
    node.classList.toggle('picked', kind === 'queue' && selected === guest.id);
    node.classList.toggle('lesson-party',kind==='queue'&&game.streetLesson==='seat'&&game.lessonParty===guest.id);
    node.classList.toggle('drag-origin', !!drag?.moved && drag.id === guest.id);
    node.tabIndex = kind === 'queue' ? 0 : -1;
    node.dataset.act = kind === 'queue' ? 'guest' : '';
    node.setAttribute('aria-hidden', kind === 'queue' ? 'false' : 'true');
    const seated = kind === 'table';
    node.guest=guest;
    const preference = guest.preference ? ' · ' + preferenceLabel(guest.preference,guest.friendId) : '';
    const partyLabel = guest.toGo ? '外带' : guest.size + ' 位';
    const caption = kind === 'queue' ?
      '<span class="party-label">' + partyLabel + (preference || guest.regularId !== undefined ? ' ★' : '') + '<i></i></span>' : '';
    const markup = seated ? '' : actorPortraits(guest) + caption;
    if (node.rendered !== markup) {
      node.innerHTML = markup;
      node.rendered = markup;
    }
    node.setAttribute('aria-label', kind === 'queue' ? (regulars[guest.regularId]?.[0] || people[guest.person] || '街坊') + ' · ' + partyLabel + preference : '');
    if (kind === 'queue') {
      const remaining = node.classList.contains('lesson-party') ? 1 : Math.max(0, Math.min(1, (guest.deadline - game.elapsed) / guest.patience));
      node.style.setProperty('--patience', Math.round(remaining * 100) + '%');
      node.style.setProperty('--party-depth', ordinal);
    }
    positionActor(node, anchor, kind, seated ? 1 : 0);
  };

  game.queue.forEach((guest, index) => retain(guest, 'queue', queueAnchor(index), index));
  game.tables.forEach((table, index) => {
    if (!table || ['dirty', 'paired'].includes(table.state)) return;
    const anchor = [...tableAnchors[index]];
    if (table.neighbor !== undefined) anchor[0] = (anchor[0] + tableAnchors[table.neighbor][0]) / 2;
    retain(table, 'table', anchor);
  });
  game.takeaway.forEach((guest, index) => retain(guest, 'packing', [12 + index * 13, 49]));

  for (const [id, node] of visitorNodes) {
    if (current.has(id)) continue;
    visitorNodes.delete(id);
    if (game.settings.reduced) { node.remove(); continue; }
    node.dataset.act = '';
    node.tabIndex = -1;
    node.setAttribute('aria-hidden', 'true');
    node.classList.add('departing');
    const groundY=parseFloat(node.style.top);
    if(node.dataset.pose==='table')node.innerHTML=actorPortraits(node.guest);
    positionActor(node,[108,groundY],'leaving');
    setTimeout(() => node.remove(), 790);
  }
}

function stoveControl() {
  const warming = game.tutorial < 3;
  const pending = orders().some((order) => order?.state === 'queued');
  const label = warming ? '点炉子 · ' + game.tutorial + '/3' : pending ? '排单 '+orders().filter(o=>o?.state==='queued').length+' · '+kitchenWait()+'秒' : capacityText();
  return button('<span class="stove-light" aria-hidden="true"></span><span>' + label + '</span>',
    warming ? 'warm' : 'street-stove', 'street-stove' + (warming ? ' warming' : ''), 'data-flame="' + Math.max(0, game.tutorial) + '"') +
    (warming ? '<span class="stove-hand" aria-hidden="true">👆</span>'+button('跳过教学', 'skip-tutorial', 'street-pill street-skip') :
      game.streetLesson ? button('跳过引导', 'skip-street-lesson', 'street-pill street-skip') : '');
}

function streetProps() {
  const light = decorTypes[0].items[game.equipped[0]];
  const decor = light ? '<div class="street-lanterns" aria-hidden="true">' + art('q-lamp-'+game.equipped[0]).repeat(3) + '</div>' : '';
  const sign = game.signboard ? '<span class="street-sign" aria-hidden="true">热乎早点</span>' : '';
  const canopy = game.canopy && game.settings.showCanopy && forecast().kind === 'rain' ? '<div class="street-canopy" aria-hidden="true"></div>' : '';
  const deal = {discount:'早客优惠',gift:'包子试吃'}[eventEffect()];
  const poster = deal ? '<span class="street-deal" aria-hidden="true">' + deal + '</span>' : '';
  return decor + sign + canopy + poster;
}

function paintStreetStaff() {
  const layer = $('street-staff');
  const assigned = [];
  for (const id of game.staff) assigned.push([String(id), staffPool[id]]);
  if (game.assistant) assigned.push(['legacy', {name:'店员', role:'waiter'}]);
  if (game.elapsed < game.helpUntil) assigned.push(['helper', {name:'邻摊帮手', role:'waiter'}]);
  if (autoShiftActive() || (game.staffRoutes?.cover?.until ?? 0) > game.elapsed) {
    assigned.push(['cover', {name:'托管搭档', role:'waiter'}]);
  }
  let cooks = 0;
  const extraStoves = operatingStoves() - 1;
  let waiters = 0;
  for (const [id, employee] of assigned) {
    if (!employee) continue;
    const isCook = employee.role === 'cook';
    const ordinal = isCook ? cooks++ : waiters++;
    const anchor = isCook ? [34 - ordinal * 10, 49] : waiterAnchors[ordinal];
    let node = staffNodes.get(id);
    if (!node) {
      node = document.createElement('div');
      node.className = 'street-worker';
      node.innerHTML = art(isCook ? 'q-walk-grandpa' : ordinal % 2 ? 'q-walk-office' : 'q-walk-rider') +
        '<span>' + (isCook ? '炉灶' : employee.name) + '</span>';
      layer.append(node);
      staffNodes.set(id, node);
    }
    const task = game.staffRoutes?.[id];
    const working = !isCook && task?.until > game.elapsed;
    const cooking=isCook&&ordinal<extraStoves&&occupiedStovePortions()>(ordinal+1)*stovePortions;
    const label=node.querySelector('span');
    const job=working?({seat:'接客',serve:'上餐',clear:'清台',deliver:'外带'}[task.action]||task.label):cooking?'做餐':'';
    const name=employee.name+(job?' · '+job:'');
    if(label.textContent!==name)label.textContent=name;
    const table=working?tableAnchors[task.index]:null;
    const spot=table?[table[0]+(table[0]>65?-9:9),table[1]-5]:[36,49];
    positionActor(node, working ? spot : anchor, 'staff', 2);
    node.classList.toggle('on-duty', !!working || cooking);
    node.classList.toggle('wiping',working&&task.label==='清台'&&game.elapsed>=task.arrives);
  }
  for (const [id, node] of staffNodes) {
    if (assigned.some(([current]) => current === id)) continue;
    node.remove();
    staffNodes.delete(id);
  }
}

function sendStreetWorker(index, action, orderId) {
  const waiters = game.staff.filter((id) => staffPool[id]?.role === 'waiter').map(String);
  const enabled={seat:game.settings.autoSeat,serve:game.settings.autoServe,deliver:game.settings.autoServe,clear:game.settings.autoClear}[action];
  if(!enabled)waiters.length=0;
  if (enabled&&game.assistant&&action!=='seat') waiters.push('legacy');
  if (game.elapsed < game.helpUntil&&action!=='seat') waiters.push('helper');
  if (autoShiftActive()) waiters.push('cover');
  if (!waiters.length) return false;
  game.staffRoutes ||= {};
  const id = waiters.find((worker) => !game.staffRoutes[worker] || game.staffRoutes[worker].until <= game.elapsed);
  if (id === undefined) return false;
  const arrives = game.elapsed + .85/staffSpeed(staffPool[Number(id)]);
  game.staffRoutes[id] = { until:arrives + .65, arrives, action, index, orderId,
    label:{seat:'接客',serve:'上餐',clear:'清台',deliver:'外带'}[action] };
  return true;
}

function finishStaffRoutes() {
  for (const route of Object.values(game.staffRoutes || {})) {
    if (!route.action || game.elapsed < route.arrives) continue;
    const {action,index,orderId}=route;
    route.action=null;
    if(action==='seat')continue;
    if (action === 'deliver') {
      const order=game.takeaway.find((item)=>item.id===orderId);
      if(order?.state==='ready')deliverTakeaway(order);
      continue;
    }
    const table=game.tables[index];
    if (table?.id !== orderId) continue;
    if (action === 'serve' && table.state === 'ready') serve(table);
    if (action === 'clear' && table.state === 'dirty') clearTable(index);
  }
}

function hasStaffTask(action, orderId) {
  return Object.values(game.staffRoutes || {}).some((route) => route.action===action && route.orderId===orderId);
}

function paintDelivery() {
  const trolley = $('street-delivery');
  const delivery = game.stockDelivery;
  trolley.hidden = !delivery;
  update('street-supply-status',delivery?'<span class="supply-count">'+art('supply')+Math.max(0,Math.ceil(delivery.at-game.elapsed))+'秒到</span>':'');
  if (!delivery) return;
  const remaining = Math.max(0, delivery.at - game.elapsed);
  const progress = Math.max(0, Math.min(1, 1 - remaining / 9));
  trolley.style.left = (104 - progress * 11) + '%';
  trolley.style.top = (60 - progress * 7) + '%';
  const label = trolley.querySelector('span');
  const text = '送货 ' + Math.ceil(remaining) + '秒';
  if (label.textContent !== text) label.textContent = text;
}

function packingControl() {
  if (game.area < 1) return '';
  const guest = game.queue.find((customer) => customer.id === selected);
  const ready = game.takeaway.some((order) => order.state === 'ready');
  const canAccept = guest?.toGo && game.takeaway.length < game.boxes && !game.closing;
  const act = ready && !canAccept ? 'deliver' : 'takeaway';
  const enabled = act === 'deliver' || canAccept;
  return button(icon('bag') + '<span>' + (act === 'deliver' ? '交付外带' : canAccept ? '接外带' : '打包台 ' + game.takeaway.length + '/' + game.boxes) + '</span>',
    act, 'street-packing' + (ready ? ' ready' : ''), 'style="' + streetPos(packingAnchor) + '"', !enabled);
}

function streetHelp() {
  if (game.closing || game.tutorial < 3) return '';
  const short = game.queue.some((guest) => guest.items.some((count, index) => count > game.stock[index]));
  const selectedNeedsStock=stockGap(game.queue.find(guest=>guest.id===selected)).some(Boolean);
  const needsSupplies = short || game.stock[0] + game.stock[1] <= 4;
  return (needsSupplies && !game.stockDelivery && !selectedNeedsStock ? button('补货', 'stock-options', 'street-pill') : '') +
    (orders().some((order) => order?.state === 'queued') ? offer('help', '叫帮手 · 等 '+kitchenWait()+'秒') : '') +
    (game.seatCount < tableLimit() ? button('添第 '+(game.seatCount+1)+' 张桌 · ' + yen(50), 'live-table', 'street-pill', '', game.money < 50) : '');
}

function paintStreet() {
  const world = $('street-world');
  if (!world) return;
  if (world !== streetRoot) {
    streetRoot = world;
    visitorNodes.clear();
    staffNodes.clear();
  }
  const weather = forecast();
  world.dataset.weather = weather.kind;
  world.classList.toggle('rain-particles', game.settings.rain && weather.kind === 'rain');
  world.classList.toggle('closing', game.closing);
  world.classList.toggle('packing-up', game.closingReadyAt != null);
  world.classList.toggle('working', orders().some((order) => order?.state === 'cooking'));
  breakfastAudio.sync();
  breakfastAudio.lesson();
  update('street-weather', streetWeather(weather));
  update('street-audio', audioToggle('street-volume'));
  update('street-stall-control', stoveControl());
  update('street-props', streetProps());
  paintDelivery();
  paintTables();
  updateVisitors();
  paintStreetStaff();
  update('street-packing', packingControl());
  update('street-help', streetHelp());
  update('street-auto', streetAutomation());
  if (autoShiftActive()) update('auto-shift-seconds', Math.ceil(game.autoShiftUntil - game.elapsed) + '秒');
  const guide = { seat:['来客人啦，把他们拖到空桌','四位客人刚好坐一桌，给他们带个位','八位来了一起吃，给他们找两张挨着的空桌'][game.lessonRound ?? 0], cook:'客人坐下啦，等小禾把这份做好', serve:'桌牌亮了，点一下就能端餐',
    eat:'客人吃完会付钱，留意桌边的收款提示', clean:'点「收桌」擦干净，下一组就能坐' }[game.streetLesson];
  const prompt = game.closingReadyAt != null ? '桌面收拾好了，正在记账…' :
    game.closing ? livePrompt() : selected !== null ? queueHint() : guide || livePrompt();
  update('street-status', prompt);
  update('street-pause', button(game.speed === 0 ? '继续' : '暂停', 'speed', 'street-pill pause',
    'data-i="' + (game.speed === 0 ? 1 : 0) + '"', game.tutorial < 3));
  paintControls();
  const close = world.parentElement.querySelector('[data-act="close"]');
  close.disabled = game.closing || game.tutorial < 3;
  close.textContent = game.closing ? '收摊中' : '收摊';
  highlightLanding(drag?.hover);
}

function highlightLanding(hover) {
  const guest = game.queue.find((customer) => customer.id === (drag?.moved ? drag.id : selected));
  const pair = guest?.size > seatsPerTable;
  const valid = (index) => guest && !guest.toGo && game.tables[index] === null &&
    (!pair || adjacentSeat(index) !== undefined) && !guest.items.some((n, i) => n > game.stock[i]);
  const neighbor = valid(hover) && pair ? adjacentSeat(hover) : undefined;
  for (const table of document.querySelectorAll('.street-table')) {
    const index = Number(table.dataset.i);
    table.classList.toggle('can-drop', !!valid(index));
    table.classList.toggle('favorite-drop', !!valid(index) && preferenceFits(guest.preference,index,guest.friendId));
    table.classList.toggle('drop-hit', !!valid(hover) && (index === hover || index === neighbor));
    table.classList.toggle('drop-invalid', index === hover && !valid(index));
  }
  if(!$('street-order'))return;
  const shortage=stockGapText(guest);
  const hovered=Number.isInteger(hover);
  const reason=!guest?'':shortage|| (guest.toGo?'送去打包台':!hovered?(pair?'找两张相邻空桌':'拖到空桌'):game.tables[hover]?.state==='dirty'?
    '先收桌':game.tables[hover]?'这桌有人':!valid(hover)?'旁边需要一张空桌':preferenceFits(guest.preference,hover,guest.friendId)?'合意座位 · 小费 +¥2':'可以入座');
  const preference=guest?.preference&&!hovered&&!shortage?preferenceLabel(guest.preference,guest.friendId):'';
  update('street-order',guest?'<div class="order-peek">'+guest.items.map((n,i)=>n?'<span>'+art(menus[i].art)+'×'+n+'</span>':'').join('')+
    '<b>'+reason+(preference?' · '+preference:'')+'</b>'+(shortage?button('补货','stock-options','street-pill','data-i="'+guest.id+'"'):'')+'</div>':'');
}

function streetEffect(kind, index, value) {
  const layer = $('street-effects');
  if (!layer) return;
  if (game.settings.reduced && ['clean','spark','coin'].includes(kind)) return;
  const spot = tableAnchors[index] || packingAnchor;
  const effect = document.createElement('span');
  effect.className = 'street-effect fx-' + kind;
  effect.style.cssText = streetPos(spot) + ';--from-x:' + (counterAnchor[0] - spot[0]) + 'cqw;--from-y:' +
    (counterAnchor[1] - spot[1]) + 'cqh';
  if (kind === 'food'||kind==='gift'||kind==='drink') effect.innerHTML = art(value);
  else effect.textContent = value;
  layer.append(effect);
  setTimeout(() => effect.remove(), kind==='arrival'?1800:['cash','tip','coin','chat'].includes(kind)?1050:580);
}

function stovePriorityButtons() {
  const queued = orders().filter((order) => order?.state === 'queued');
  return queued.map((order) => {
    const label = order.toGo ? '外带' : (game.tables.indexOf(order) + 1) + ' 号桌';
    return button(label + '优先', 'prioritize', 'secondary', 'data-id="' + order.id + '"');
  }).join('');
}

function openStoveQueue() {
  openStory('灶台', capacityText(), stovePriorityButtons() + offer('help', '请帮手') + button('回摊位', 'dismiss', 'primary'));
}

function cancelStreetDrag() {
  if (!drag) return;
  const { origin, pointer, ghost, previous, moved } = drag;
  drag = null;
  if (moved) selected = previous;
  ghost?.remove();
  origin.classList.remove('drag-origin');
  if (origin.hasPointerCapture(pointer)) origin.releasePointerCapture(pointer);
  highlightLanding();
}

function targetAt(event) {
  return document.elementFromPoint(event.clientX, event.clientY)?.closest('.street-table, .street-packing');
}

function enableStreetGestures() {
  main.addEventListener('pointerdown', (event) => {
    const origin = event.target.closest('.street-party[data-act="guest"]');
    if (!origin || event.button !== 0 || drag || dialog.open) return;
    drag = {
      origin, id: Number(origin.dataset.id), pointer: event.pointerId,
      x: event.clientX, y: event.clientY, moved: false, previous: selected,
    };
    origin.setPointerCapture(event.pointerId);
  });

  main.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointer || dialog.open) return;
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
      const ghost = document.createElement('div');
      ghost.className = 'street-drag';
      ghost.innerHTML = drag.origin.innerHTML;
      ghost.setAttribute('aria-hidden', 'true');
      document.body.append(ghost);
      drag.ghost = ghost;
      drag.moved = true;
      selected = drag.id;
      drag.origin.classList.add('drag-origin');
      paintStreet();
    }
    drag.ghost.style.left = event.clientX + 'px';
    drag.ghost.style.top = event.clientY + 'px';
    const target = targetAt(event);
    drag.hover = target?.classList.contains('street-table') ? Number(target.dataset.i) : undefined;
    highlightLanding(drag.hover);
  });

  main.addEventListener('pointerup', (event) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const { moved, id, previous } = drag;
    const target = moved ? targetAt(event) : null;
    cancelStreetDrag();
    if (!moved) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 240);
    if (game.phase === 'live' && !dialog.open) {
      const customer = game.queue.find(guest => guest.id === id);
      if (target?.classList.contains('street-table')) seatGuest(id, Number(target.dataset.i));
      else if (target?.classList.contains('street-packing')) acceptTakeaway(id);
      if (target && !game.queue.includes(customer)) breakfastAudio.guest(customer, 6800);
    }
    if (!game.queue.some(guest=>guest.id===id&&selected===id)&&game.queue.some((guest) => guest.id === previous)) selected = previous;
    save();
    paintLive();
  });
  main.addEventListener('lostpointercapture', (event) => {
    if (drag?.pointer !== event.pointerId) return;
    const previous = drag.previous;
    cancelStreetDrag();
    selected = previous;
    paintStreet();
  });
  main.addEventListener('pointercancel', (event) => {
    if (drag?.pointer !== event.pointerId) return;
    const previous = drag.previous;
    cancelStreetDrag();
    selected = previous;
    paintStreet();
  });
}
