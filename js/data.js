/* ============================================================
 * 一起去 · 周末 —— 数据层
 * 分类色体系沿用「一起去」6 色方案；mock 数据为上海周末场景
 * ============================================================ */
window.YQ = window.YQ || {};

YQ.CATS = {
  outdoor: { name: '户外',   color: '#A3B89A', emoji: '🌿' },
  food:    { name: '美食',   color: '#F4C069', emoji: '🍜' },
  expo:    { name: '展览',   color: '#95ADC7', emoji: '🖼️' },
  show:    { name: '演出',   color: '#C9A6B5', emoji: '🎭' },
  coffee:  { name: '咖啡·手作', color: '#CC8B6D', emoji: '☕' },
  book:    { name: '书店·杂货', color: '#B4A6CC', emoji: '📚' }
};

/* weather: 适配的天气（sunny/cloudy/rainy）；indoor: 是否室内（雨天户外扣分）
 * best: 推荐时段 am/noon/pm/eve —— J 模式排课默认建议 */
YQ.PLACES = [
  { id: 'p1',  name: '西岸美术馆 · 光影特展', cat: 'expo', emoji: '🖼️',
    location: '徐汇滨江 · 龙腾大道', distance: 1.8, price: 120, priceText: '¥120',
    duration: '约 2 小时', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.8, best: 'am',
    tags: ['展览', '出片', '遛娃友好'],
    desc: '本周新开的沉浸式光影展，人不多的时候很好拍，看完顺路可以沿江边走走。',
    reviews: [
      { user: '小树', mood: '🥰', text: '光影房间待了半小时不想走，工作日下午几乎包场。' },
      { user: '阿枣', mood: '😄', text: '票有点贵但值，出口的江景是白送的。' }
    ] },
  { id: 'p2',  name: '老码头周末创意市集', cat: 'food', emoji: '🧺',
    location: '外滩 · 老码头广场', distance: 2.3, price: 0, priceText: '免费入场',
    duration: '半天', weather: ['sunny', 'cloudy'], indoor: false,
    rating: 4.6, best: 'pm',
    tags: ['市集', '手作', '可带狗'],
    desc: '六十多个摊位的复古市集，有手作、黑胶和小吃，下午去太阳正好。',
    reviews: [
      { user: 'Momo', mood: '😄', text: '淘到两张老海报，摊主还送了贴纸。' },
      { user: '大琳', mood: '🌤️', text: '人有点多，建议三四点再来，先去江边吹风。' }
    ] },
  { id: 'p3',  name: '皋兰路 Livehouse · 后摇之夜', cat: 'show', emoji: '🎸',
    location: '皋兰路 16 号', distance: 3.1, price: 150, priceText: '¥150',
    duration: '约 3 小时（晚场）', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.7, best: 'eve',
    tags: ['演出', '现场', '夜生活'],
    desc: '周六晚场的后摇专场，场地不大但音响很顶，适合把周末留到最后一刻。',
    reviews: [
      { user: '三三', mood: '🥰', text: '安可那首直接起鸡皮疙瘩，散场走路回家刚好消化情绪。' },
      { user: '老白', mood: '😄', text: '站前排很近，音量偏大可自备耳塞。' }
    ] },
  { id: 'p4',  name: '佘山短途徒步', cat: 'outdoor', emoji: '🥾',
    location: '松江 · 佘山国家森林公园', distance: 25, price: 0, priceText: '免费',
    duration: '半天 ~ 一天', weather: ['sunny', 'cloudy'], indoor: false,
    rating: 4.5, best: 'am',
    tags: ['徒步', '爬山', '自然'],
    desc: '市区出发地铁可达的轻徒步路线，全程 2-3 小时，山顶能看远郊的天际线。',
    reviews: [
      { user: ' walker', mood: '😄', text: '难度低，当散步走刚好，记得带水。' },
      { user: '小柚', mood: '🌤️', text: '阴天去更舒服，太阳大会有点晒。' }
    ] },
  { id: 'p5',  name: '永康路咖啡巡礼', cat: 'coffee', emoji: '☕',
    location: '徐汇 · 永康路', distance: 1.2, price: 45, priceText: '人均 ¥45',
    duration: '1-2 小时', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.6, best: 'noon',
    tags: ['咖啡', '街拍', '小店'],
    desc: '一条街能连喝三家：Dirty、手冲、桂花拿铁，路上的店都值得进。',
    reviews: [
      { user: 'Nana', mood: '🥰', text: '雨天坐在窗边看路人超级治愈。' },
      { user: 'K', mood: '😄', text: '周末排队略多，先挑最想去的那家。' }
    ] },
  { id: 'p6',  name: '安福路话剧 · 晚场', cat: 'show', emoji: '🎭',
    location: '安福路 288 号', distance: 2.0, price: 180, priceText: '¥180',
    duration: '约 2.5 小时（晚场）', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.9, best: 'eve',
    tags: ['话剧', '文艺', '口碑'],
    desc: '一票难求的小剧场话剧，散场后整条安福路的灯都很好看。',
    reviews: [
      { user: '叶子', mood: '🥰', text: '最后十分钟值回全部票价，记得提前取票。' },
      { user: '阿灰', mood: '😄', text: '第三排视角最好，中间有十分钟中场。' }
    ] },
  { id: 'p7',  name: '多伦路旧书市集', cat: 'book', emoji: '📚',
    location: '虹口 · 多伦路', distance: 4.2, price: 0, priceText: '免费',
    duration: '半天', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.4, best: 'pm',
    tags: ['旧书', '淘货', '老建筑'],
    desc: '老洋房里翻旧书，几块钱能淘到上世纪的画册，雨天也照常出摊。',
    reviews: [
      { user: '白石', mood: '😄', text: '淘到 1982 年的散文集，老板会讲每本书的故事。' },
      { user: '露露', mood: '🌤️', text: '街不长，适合顺路搭配甜爱路走走。' }
    ] },
  { id: 'p8',  name: '苏州河沿岸骑行', cat: 'outdoor', emoji: '🚲',
    location: '苏州河步道 · 四行仓库段', distance: 5.0, price: 20, priceText: '租车 ¥20',
    duration: '2-3 小时', weather: ['sunny', 'cloudy'], indoor: false,
    rating: 4.6, best: 'pm',
    tags: ['骑行', '沿河', '轻运动'],
    desc: '沿河一段一段慢慢骑，桥洞、仓库和老码头都在路上，累了就停下来。',
    reviews: [
      { user: '豆浆', mood: '😄', text: '傍晚骑到外白渡桥看日落，免费的大片。' },
      { user: '阿路', mood: '🌤️', text: '周末步道人多，慢点骑别赶。' }
    ] },
  { id: 'p9',  name: '城隍庙小吃半日', cat: 'food', emoji: '🥟',
    location: '黄浦 · 城隍庙', distance: 3.8, price: 80, priceText: '人均 ¥80',
    duration: '半天', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.3, best: 'noon',
    tags: ['小吃', '老城', '游客也爱'],
    desc: '蟹粉小笼、排骨年糕、桂花糖粥，一条街从中午吃到下午。',
    reviews: [
      { user: '加饭', mood: '😄', text: '排队最长的两家反而一般，小巷子里的更惊艳。' },
      { user: '小满', mood: '🥰', text: '带爸妈去过，他们很满意。' }
    ] },
  { id: 'p10', name: '手作陶艺体验课', cat: 'coffee', emoji: '🏺',
    location: 'M50 创意园', distance: 2.8, price: 168, priceText: '¥168 / 位',
    duration: '约 2 小时', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.7, best: 'pm',
    tags: ['手作', '体验', '成品带回家'],
    desc: '两小时从拉坯到上色，做一只自己的杯子，两周后寄到家里。',
    reviews: [
      { user: '圆圆', mood: '🥰', text: '第一次捏泥巴，丑得很可爱，教练全程带。' },
      { user: 'Yuki', mood: '😄', text: '适合两个人一起去，教室很安静解压。' }
    ] },
  { id: 'p11', name: '滨江日落野餐', cat: 'outdoor', emoji: '🧺',
    location: '徐汇滨江 · 草坡段', distance: 3.5, price: 60, priceText: '自带食物约 ¥60',
    duration: '下午 ~ 傍晚', weather: ['sunny', 'cloudy'], indoor: false,
    rating: 4.8, best: 'pm',
    tags: ['野餐', '日落', '出片'],
    desc: '铺块垫子躺到日落，江对岸的塔亮灯的时候刚好收摊。',
    reviews: [
      { user: '栗子', mood: '🥰', text: '六点半的粉色天空，去年秋天最好看的一次。' },
      { user: '大橙', mood: '😄', text: '风大记得带外套，垫子选厚一点的。' }
    ] },
  { id: 'p12', name: '当代艺术博物馆（PSA）', cat: 'expo', emoji: '🏗️',
    location: '花园港路 200 号', distance: 2.6, price: 60, priceText: '¥60',
    duration: '约 2 小时', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.5, best: 'am',
    tags: ['艺术', '雨天备案', '工业风'],
    desc: '老电厂改的美术馆，大烟囱是地标，雨天首选，一待就是一下午。',
    reviews: [
      { user: '耳东', mood: '😄', text: '雨天的 PSA 氛围感直接拉满，顶楼一定要去。' },
      { user: 'nini', mood: '🌤️', text: '展览更新慢，去之前查一下当期。' }
    ] },
  { id: 'p13', name: '大学路市集 × 小酒馆', cat: 'food', emoji: '🍷',
    location: '杨浦 · 大学路', distance: 5.2, price: 100, priceText: '人均 ¥100',
    duration: '下午到夜里', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.5, best: 'eve',
    tags: ['市集', '夜生活', '学生党'],
    desc: '白天是市集和咖啡，晚上变一条小酒馆街，一个地方解决一整天。',
    reviews: [
      { user: '皮蛋', mood: '😄', text: '从下午待到晚上无缝衔接，人均不贵。' },
      { user: 'Rin', mood: '🥰', text: '雨天的大学路帐篷下喝酒，意外地浪漫。' }
    ] },
  { id: 'p14', name: '深夜食堂 × 居酒屋', cat: 'food', emoji: '🍢',
    location: '虹口 · 海伦路', distance: 1.9, price: 130, priceText: '人均 ¥130',
    duration: '晚上 2-3 小时', weather: ['sunny', 'cloudy', 'rainy'], indoor: true,
    rating: 4.6, best: 'eve',
    tags: ['夜宵', '居酒屋', '一人食友好'],
    desc: '把周末的结尾交给烤串和啤酒，吧台座位一个人去也不尴尬。',
    reviews: [
      { user: '老周', mood: '🥰', text: '茶泡饭和烤鸡皮，一周的疲惫都在这了。' },
      { user: '小北', mood: '😄', text: '十点后来不用排队，老板会跟你聊天。' }
    ] }
];

/* 预置队伍：J 式定档 / P 式随心 */
YQ.TEAMS = [
  { id: 't1', style: 'J', placeId: 'p4', title: '佘山徒步 · 周六上午',
    time: '周六 09:30 地铁站集合', capacity: 6,
    members: ['阿阵', '小柚', ' walker', 'Yuki'],
    note: '路线我排好了：西坡上、东坡下，中午山下吃面。迟到不候。' },
  { id: 't2', style: 'P', placeId: 'p1', title: '有人想去看西岸的光影展吗',
    time: '时间随缘 · 先看看这周末', capacity: 8,
    members: ['泡泡', 'Momo'],
    note: '一个人去看展有点孤单，感兴趣就举手，时间到时候商量。' },
  { id: 't3', style: 'P', placeId: 'p13', title: '大学路市集 说不定周六下午',
    time: '看心情 · 下午大概率出发', capacity: 6,
    members: ['Rin'],
    note: '先占个坑，如果周六天气好就想出门，要不要一起。' }
];

/* 预置攻略：J 式完整攻略 / P 式碎片笔记 */
YQ.GUIDES = [
  { id: 'g1', style: 'J', author: '阿阵', likes: 128,
    title: '一次排满的文艺周末（含时间表）',
    placeIds: ['p1', 'p11', 'p6'],
    body: '周六上午 10 点西岸美术馆看光影展（约 2 小时）→ 中午江边简餐 → 下午 3 点滨江草坡野餐等日落 → 周日白天休整，晚上 7 点半安福路话剧。全程地铁可达，人均 ¥400 以内。' },
  { id: 'g2', style: 'P', author: '泡泡', likes: 86,
    title: '不赶时间的一天：咖啡 → 乱走 → 深夜食堂',
    placeIds: ['p5', 'p14'],
    body: '中午永康路随便挑一家咖啡店坐着，下午沿街乱走进小店，晚上九点以后去海伦路吃居酒屋。没有任何预约，走到哪算哪，反而遇到了很多惊喜。' },
  { id: 'g3', style: 'J', author: '白石', likes: 64,
    title: '雨天备案清单：室内一天不无聊',
    placeIds: ['p12', 'p10', 'p3'],
    body: '上海周末下雨概率不小，收藏这条：上午 PSA 看展 → 下午 M50 陶艺课（需提前一天约）→ 晚上皋兰路看演出。全程室内，雨天体验反而更好。' }
];

YQ.MOODS = ['😄', '🥰', '🌤️', '🫠'];
YQ.SLOTS = { am: '上午', noon: '午间', pm: '下午', eve: '晚上' };
YQ.DAYS  = { sat: '周六', sun: '周日' };
YQ.WEATHER = {
  sunny:  { label: '晴',  emoji: '☀️', tip: '晴天放心安排户外，野餐徒步正当时' },
  cloudy: { label: '多云', emoji: '⛅', tip: '多云不晒不冷，室内外都能安排' },
  rainy:  { label: '雨',  emoji: '🌧️', tip: '有雨，已为你优先室内项目' }
};
