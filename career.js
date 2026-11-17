'use strict';

const districts = [
  { name: '梧桐巷口', title: '把第一笼包子留给晨练的街坊', scene: 'morning', fee: 0, pace: .85, group: .06, stock: [8, 7, 7],
    focus: 0, guests: 27, income: 145, days: 2, prize: 45, hint: '巷口的人认得小禾。找空桌、端餐、擦桌，慢慢熟悉这一班的节奏。' },
  { name: '地铁广场', title: '赶车前揣一杯热豆浆', scene: 'metro', fee: 65, pace: 1.07, group: .13, stock: [11, 8, 12],
    focus: 2, guests: 45, income: 250, takeaway: 8, days: 2, prize: 70, hint: '通勤客赶时间。外带不用占桌，餐做完就从打包台交给客人。' },
  { name: '邻里早市', title: '给街坊拼一桌', scene: 'market', fee: 110, pace: 1.16, group: .33, stock: [13, 15, 12],
    focus: 1, guests: 58, income: 330, groups: 7, days: 2, prize: 100, hint: '买完菜的一大家子常来吃蒸包。五到八个人要两张挨着的空桌。' },
  { name: '银杏校门', title: '铃声前出餐', scene: 'school', fee: 155, pace: 1.26, group: .19, stock: [17, 14, 14],
    focus: 0, guests: 70, income: 410, takeaway: 16, days: 2, prize: 135, hint: '上课前外带单集中涌来。用打包台分流，留一部分灶位给堂食。' },
  { name: '河畔广场', title: '全城早餐节', scene: 'square', fee: 205, pace: 1.35, group: .27, stock: [19, 19, 17],
    focus: 1, guests: 90, income: 570, takeaway: 12, groups: 8, days: 3, prize: 220, hint: '堂食、拼桌和外带一起涌进广场。忙中有序才能拿到早餐节金牌。' },
];

const dailySpecials = [
  { name: '煎饼熟客日', item: 0, target: 5, prize: 14 },
  { name: '雨天热豆浆', item: 2, target: 7, prize: 19 },
  { name: '蒸包新出笼', item: 1, target: 7, prize: 18 },
  { name: '加班车早餐', item: 2, target: 9, prize: 23 },
];

const achievements = [
  { id: 'first', name: '第一桌热乎的', detail: '完成第一笔生意', goal: 1, read: (s) => s.lifetime.served },
  { id: 'neighbors', name: '巷口熟面孔', detail: '累计接待 50 位客人', goal: 50, read: (s) => s.lifetime.served },
  { id: 'bundle', name: '赶路也能吃好', detail: '累计交付 15 张外带单', goal: 15, read: (s) => s.lifetime.takeaway },
  { id: 'family', name: '给一家人加把椅子', detail: '累计接待 10 组拼桌客人', goal: 10, read: (s) => s.lifetime.groups },
  { id: 'busy', name: '手脚麻利', detail: '单日接待 30 位客人', goal: 30, read: (s) => s.lifetime.bestServed },
  { id: 'bank', name: '街角生意经', detail: '累计营业额达到 ¥1,500', goal: 1500, read: (s) => s.lifetime.revenue },
  { id: 'gold', name: '早餐节金牌', detail: '完成全部街区经营目标', goal: 1, read: (s) => Number(!!s.completedDay) },
];

const stallStyles = [
  { name: '原木长桌', required: 0, color: '#b66f51' },
  { name: '青瓷台面', required: 2, color: '#548e75' },
  { name: '琥珀花砖', required: 4, color: '#ba8541' },
  { name: '早餐节朱漆', required: 5, color: '#b94a3d' },
];
