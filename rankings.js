'use strict';

const rivals = [
  ['阿福早点铺',275], ['春晨食堂',272], ['喜旺包子店',220], ['南桥豆花',217], ['大成面点',170],
  ['福记早餐车',168], ['新街蒸坊',121], ['禾香煎饼',116], ['老季豆浆摊',71], ['巷尾早点',69],
];
const standingsCache = new Map();
const myStall = '我的早餐摊';
const rankWindow = 7;
let rankTab = 'local';
let nationalRank = newNationalRank();

function newNationalRank() {
  return { best: null, sent: 0, sending: 0, submission: null, syncFailed: false, pending: false, loaded: false,
    rows: [], totalError: false, personalError: false, personal: null };
}

function seasonWeight(day) {
  return [1, 1.05, .97, .93][Math.floor((day - 1) / 8) % 4];
}

function adjustedSales(report) {
  return report.revenue / seasonWeight(report.day);
}

function recentReports(previous = false) {
  const reports = [...game.history.slice(-rankWindow - 1), ...(game.report ? [game.report] : [])];
  return previous ? reports.slice(-rankWindow - 1, -1) : reports.slice(-rankWindow);
}

function averageSales(reports) {
  return reports.length ? Math.round(reports.reduce((sum, report) => sum + adjustedSales(report), 0) / reports.length) : 0;
}

function rivalNoise(index, day, salt) {
  // Identical game dates produce identical results across reloads and save slots.
  let hash = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(day + salt, 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
  return ((hash ^ (hash >>> 16)) >>> 0) / 2147483648 - 1;
}

function rivalSales(base, index, day) {
  const stretch = 9;
  const period = Math.floor((day - 1) / stretch);
  const portion = ((day - 1) % stretch) / stretch;
  const form = rivalNoise(index, period, 31) * (1 - portion) + rivalNoise(index, period + 1, 31) * portion;
  const weather = forecasts[(day - 1) % forecasts.length].kind;
  const rain = weather === 'rain' ? ([3, 6, 8].includes(index) ? .036 : -.017) : 0;
  const variation = .15 * form + .059 * rivalNoise(index, day, 89) + rain;
  return base * (1 + Math.min(day / rankWindow, 1) * variation);
}

function rivalStandings(day) {
  if (standingsCache.has(day)) return standingsCache.get(day);
  const count = Math.min(day, rankWindow);
  const rows = rivals.map(([name, base], index) => {
    let sales = 0;
    for (let offset = 0; offset < count; offset++) sales += rivalSales(base, index, day - offset);
    return { name, value: count ? Math.round(sales / count) : base, mine: false };
  });
  if (standingsCache.size >= 4) standingsCache.delete(standingsCache.keys().next().value);
  standingsCache.set(day, rows);
  return rows;
}

function localRank(reports = recentReports()) {
  const count = reports.length;
  const score = averageSales(reports);
  const day = reports.at(-1)?.day ?? 0;
  const list = [...rivalStandings(day)];
  if (count) list.push({ name: myStall, value: score, mine: true });
  list.sort((a, b) => b.value - a.value);
  const standing = list.findIndex(row => row.mine) + 1;
  return { score, list, standing, count, day };
}

function rankMovement(list, previous) {
  const old = new Map(previous.map((row, index) => [row.name, { index, value: row.value }]));
  return list.map((row, index) => {
    const prior = old.get(row.name);
    return { ...row, rank: index + 1, delta: prior ? prior.index - index : null, change: prior ? row.value - prior.value : 0 };
  });
}

function rankTrend(delta) {
  if (delta === null) return '';
  const label = delta > 0 ? '上升 ' + delta + ' 名' : delta < 0 ? '下降 ' + -delta + ' 名' : '名次持平';
  const text = delta > 0 ? '↑' + delta : delta < 0 ? '↓' + -delta : '—';
  return '<span class="rank-trend' + (delta > 0 ? ' up' : delta < 0 ? ' down' : '') +
    '" aria-label="' + label + '">' + text + '</span>';
}

function localRankAmount(row) {
  let change = '';
  if (row.change) {
    const amount = yen(Math.abs(row.change));
    change = '<small aria-label="折算均额' + (row.change > 0 ? '增加 ' : '减少 ') + amount + '">' +
      (row.change > 0 ? '+' : '−') + amount + '</small>';
  }
  return '<div class="rank-amount"><strong>' + yen(row.value) + '</strong>' + change + '</div>';
}

function rankProgress(current) {
  const reports = recentReports();
  const project = rivalStandings(current.day + 1);
  const lead = Math.max(...project.map(row => row.value)) + 1;
  let chase = '';
  if (current.standing > 1) {
    const rival = current.list[current.standing - 2];
    const next = project.find(row => row.name === rival.name).value;
    const trailing = reports.slice(-(rankWindow - 1));
    const sum = trailing.reduce((total, report) => total + adjustedSales(report), 0);
    const need = Math.max(0, Math.ceil(((next + .5) * (trailing.length + 1) - sum) * seasonWeight(current.day + 1) - 1e-8));
    chase = '<p>预计下一班营业额达到 ' + yen(need) + '，可超过「' + rival.name + '」。</p>';
  }
  const goal = game.cityChampion ? '已拿过本城第一，分摊已开放。' :
    current.count < rankWindow ? '再记 ' + (rankWindow - current.count) + ' 班即可评定分摊资格。' : '近七班折算均额达到本城第一，即可开分摊。';
  return '<div class="rank-goal"><p>' + goal + '</p><p>下一班预估榜首门槛 ' + yen(lead) + ' / 班</p>' + chase + '</div>' +
    '<details class="receipt-notes" data-fold="rank-scoring"><summary>最近七班怎么计分</summary>' +
    (reports.length ? '<ul>' + reports.map(report => '<li>第 ' + report.day + ' 天 · ' + yen(report.revenue) + ' → 折算 ' +
      yen(Math.round(adjustedSales(report))) + '</li>').join('') + '</ul>' : '<p>首班收摊后记入第一笔成绩。</p>') + '</details>';
}

function renderRankStats(values) {
  return '<div class="rank-standing my-rank">' + values.map(([title, value]) => '<div><small>' + title +
    '</small><b>' + value + '</b></div>').join('') + '</div>';
}

function renderLocalRanks(current) {
  const rows = rankMovement(current.list, current.day ? localRank(recentReports(true)).list : []);
  const top = rows.slice(0, 3).map(row => '<div class="rank-leader' + (row.mine ? ' mine' : '') +
    '"><small>第 ' + row.rank + ' 名 ' + rankTrend(row.delta) + '</small><b>' + row.name + '</b>' +
    localRankAmount(row) + '</div>').join('');
  const rest = rows.slice(3).map(row => '<div class="rank-row' + (row.mine ? ' mine' : '') + '"><span>' +
    row.rank + '</span><b>' + row.name + '</b>' + rankTrend(row.delta) + localRankAmount(row) + '</div>').join('');
  return '<p class="rank-dated">街坊经营榜 · ' + (current.day ? '第 ' + current.day + ' 天收摊后更新 · 较上一营业日' :
    '街坊开摊前的成绩') + '</p><div class="rank-leaders">' + top + '</div>' + rest + rankProgress(current);
}

function escapeText(value) {
  const span = document.createElement('span');
  span.textContent = String(value);
  return span.innerHTML;
}

function displayRank(row) {
  const rank = typeof row?.rankDisplay === 'string' ? row.rankDisplay.trim() : '';
  if (rank && rank !== '0' && rank !== '-' && rank !== '-1') return rank.slice(0, 18);
  return Number.isInteger(row?.rank) && row.rank > 0 ? String(row.rank) : '';
}

function renderNationalRanks(current) {
  const state = nationalRank;
  const available = breakfastLeaderboard.available();
  const rows = state.rows.map(row => '<div class="rank-row' + (row.mine ? ' mine' : '') + '"><span>' +
    escapeText(row.rank) + '</span><b>' + escapeText(row.name) + '</b><strong>' + yen(row.score) + '</strong></div>').join('');
  const participation = game.settings.rankOptIn ?
    (current.count < rankWindow ? '成绩同步已开启，满 7 班后开始上榜。' : '成绩同步已开启，TapTap 会保留你的最高七班折算均额。') :
    '开启成绩同步后，可用当前 TapTap 账号参加全国排名。';
  let status = '';
  if (!available) status = '全国榜等待 TapTap 服务连接。';
  else if (state.pending) status = '正在读取 TapTap 排行…';
  else if (state.totalError) status = '全国榜暂时读取失败，请刷新重试。';
  else if (state.loaded && !state.rows.length) status = '全国榜等第一位摊主上榜。';
  return '<h2>TapTap 全国榜</h2><p class="rank-dated">' + participation + '</p>' +
    '<div class="actions rank-online-actions">' +
    button(game.settings.rankOptIn ? '暂停成绩同步' : '开启成绩同步', 'rank-sync', 'secondary', 'aria-pressed="' + game.settings.rankOptIn + '"', state.pending || !available) +
    button('刷新榜单', 'rank-tab', 'secondary', 'data-key="online"', state.pending || !available) +
    (available ? button('TapTap 全榜', 'rank-open') : '') + '</div>' +
    (state.syncFailed && game.settings.rankOptIn ? '<p class="rank-dated">成绩待同步，刷新榜单可重试。</p>' : '') +
    (state.personalError ? '<p class="rank-dated">我的名次暂时读取失败。</p>' : '') +
    (status ? '<p class="rank-dated" role="status">' + status + '</p>' : '') + rows;
}

function renderRanks() {
  const current = localRank();
  const online = rankTab === 'online';
  const own = nationalRank.personal;
  const values = online ? [
    ['我的全国名次', own ? escapeText(own.rank) : nationalRank.pending ? '读取中' : nationalRank.personalError ? '暂不可读' : '待上榜'],
    ['全国榜记录', own ? yen(own.score) : '—'],
    ['本档已记',current.count + ' / 7 班'],
  ] : [
    ['我的本城名次',current.standing ? '第 ' + current.standing + ' 名' : '待上榜'],
    ['每班折算均额',yen(current.score)],
    ['已记营业',current.count + ' / 7 班'],
  ];
  return '<section class="panel morning-rank">' + journalHeading('晨市成绩单','nav-rank',
    online ? '全国榜按历史最高的七班折算均额排位。' : '按近七班的折算营业额排名。') + renderRankStats(values) + '</section>' +
    '<section class="panel rank-board"><div class="segments">' +
    button('同城摊主','rank-tab',online?'':'active','data-key="local" aria-pressed="' + !online + '"') +
    button('全国摊主','rank-tab',online?'active':'','data-key="online" aria-pressed="' + online + '"') + '</div>' +
    (online ? renderNationalRanks(current) : renderLocalRanks(current) +
      '<div class="actions">' + button('看看走过的街区','nav','secondary','data-page="career"') + '</div>') + '</section>';
}

function bestNationalScore() {
  const reports = game.report ? [...game.history, game.report] : game.history;
  const adjusted = reports.map(adjustedSales);
  let sum = 0;
  let best = 0;
  for (let index = 0; index < adjusted.length; index++) {
    sum += adjusted[index];
    if (index >= rankWindow) sum -= adjusted[index - rankWindow];
    if (index >= rankWindow - 1) best = Math.max(best, Math.round(sum / rankWindow));
  }
  return best;
}

function syncNationalScore() {
  const state = nationalRank;
  if (!game.settings.rankOptIn || !breakfastLeaderboard.available()) return;
  state.best ??= bestNationalScore();
  if (state.best <= state.sent) return;
  if (state.submission) {
    if (state.best <= state.sending) return state.submission;
    return state.submission.then(() => { if (nationalRank === state) return syncNationalScore(); });
  }
  const score = state.best;
  state.sending = score;
  state.submission = breakfastLeaderboard.submit(score).then(best => {
    state.sent = best;
    state.syncFailed = false;
  }, () => {
    state.syncFailed = true;
  }).finally(() => {
    state.submission = null;
  });
  return state.submission;
}

async function fetchRanks() {
  const state = nationalRank;
  if (state.pending || !breakfastLeaderboard.available()) return;
  state.pending = true;
  state.totalError = false;
  state.personalError = false;
  const repaint = () => { if (nationalRank === state && !titleOpen && page === 'rank' && rankTab === 'online') paint(); };
  repaint();
  await syncNationalScore();
  if (nationalRank !== state) return;
  const [list, personal] = await Promise.allSettled([breakfastLeaderboard.list(), breakfastLeaderboard.personal()]);
  state.totalError = list.status === 'rejected';
  state.personalError = personal.status === 'rejected';
  const score = personal.status === 'fulfilled' ? personal.value : null;
  const rank = displayRank(score);
  if (!state.personalError) state.personal = rank && Number.isFinite(score.score) ? { rank, score: score.score } : null;
  if (!state.totalError) state.rows = list.value.filter(row => Number.isFinite(row?.score) && displayRank(row)).map(row => ({
    rank: displayRank(row), score: row.score,
    name: String(row.user?.name || 'TapTap 玩家').trim().slice(0, 40) || 'TapTap 玩家',
    mine: Boolean(score?.user?.openid && row.user?.openid === score.user.openid),
  }));
  state.loaded = true;
  state.pending = false;
  repaint();
}
