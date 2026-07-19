/* ============================================
   빙글이 Binglee — 메인 인터페이스 로직
   '행복을 만드는 얼음' 스토리 기반
   오늘의 미션 · AI 학습 · 캘린더
   ============================================ */

const state = {
  done: 0,
  total: 5,
  userName: localStorage.getItem('bingle_user_name') || '',
  coins: Number(localStorage.getItem('bingle_coins') ?? 120),
};

const $ = (sel) => document.querySelector(sel);

const bubble = $('#speech-bubble');
const binglee = $('#binglee');
const hearts = $('#hearts');
const progressEl = $('#missions-progress');
const fabBadge = $('#fab-badge');
const missionFab = $('#mission-fab');
const missionModal = $('#mission-modal');

/* ---------- 날짜·인사 ---------- */
function renderGreeting() {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  $('#today-date').textContent =
    `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;

  const hour = now.getHours();
  let base;
  if (hour < 5) base = '늦은 밤이에요 🌙';
  else if (hour < 12) base = '좋은 아침이에요 ☀️';
  else if (hour < 18) base = '좋은 오후예요 🌤️';
  else base = '편안한 저녁이에요 🌆';

  $('#hello').textContent = state.userName
    ? `${state.userName}님, ${base}`
    : base;
}

/* ---------- 앱 내 재화: 얼음 조각 ❄️ ---------- */
function renderCoins() {
  $('#coin-count').textContent = state.coins;
}

function addCoins(n) {
  state.coins += n;
  localStorage.setItem('bingle_coins', state.coins);
  renderCoins();
}

/* 잔액이 충분하면 차감하고 true, 부족하면 false */
function spendCoins(n) {
  if (state.coins < n) return false;
  addCoins(-n);
  return true;
}

/* ---------- 말풍선 (스토리 톤) ---------- */
const idleLines = [
  '톡. 톡. 나 여기 있어!',
  '나는 행복을 만드는 얼음이야. 잊지 마!',
  '냉장고 안은 역시 아늑하다~',
  '오늘의 AI 강의 들었어? 📚',
  '미션 하나 하고 갈래? 얼음 조각 줄게!',
  '얼음 조각 모아서 냉장고 꾸미자~',
  '캘린더에 시험 일정 적어놨어? 🗓️',
];

const happyLines = [
  '방금 뭐야? 입꼬리!',
  '웃었는데? 착각 아니야!',
  '오~ 기분 좋다!',
  '역시 내 담당 인간이라니까!',
];

let bubbleTimer = null;

function say(text, holdMs = 2800) {
  bubble.textContent = text;
  bubble.classList.remove('hidden');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.add('hidden'), holdMs);
}

// 유휴 상태에서 주기적으로 혼잣말
setInterval(() => {
  if (bubble.classList.contains('hidden')) {
    say(idleLines[Math.floor(Math.random() * idleLines.length)]);
  }
}, 9000);

/* ---------- 캐릭터 반응 ---------- */
function popHearts(count = 3) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'heart-pop';
    h.textContent = ['🩵', '💙', '✨', '🤍'][Math.floor(Math.random() * 4)];
    h.style.left = 30 + Math.random() * 55 + '%';
    h.style.top = 25 + Math.random() * 30 + '%';
    h.style.animationDelay = i * 0.12 + 's';
    hearts.appendChild(h);
    setTimeout(() => h.remove(), 1400);
  }
}

function reactHappy() {
  binglee.classList.remove('happy');
  void binglee.offsetWidth; // 애니메이션 재시작
  binglee.classList.add('happy');
  popHearts();
  say(happyLines[Math.floor(Math.random() * happyLines.length)]);
}

binglee.addEventListener('click', () => {
  reactHappy();
});

/* ---------- 토스트 ---------- */
function showToast(text) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- 모달 공통 ---------- */
function openModal(overlay) { overlay.classList.remove('hidden'); }
function closeModal(overlay) { overlay.classList.add('hidden'); }

missionModal.addEventListener('click', (e) => {
  if (e.target === missionModal) closeModal(missionModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal(missionModal);
});

/* ---------- 오늘의 미션 팝업 ---------- */
missionFab.addEventListener('click', () => openModal(missionModal));
$('#modal-close').addEventListener('click', () => closeModal(missionModal));

function renderProgress() {
  progressEl.textContent = `${state.done} / ${state.total}`;
  fabBadge.textContent = `${state.done}/${state.total}`;
  if (state.done === state.total) missionFab.classList.add('all-done');
}

document.querySelectorAll('.mission').forEach((mission) => {
  mission.querySelector('.check').addEventListener('click', () => {
    if (mission.classList.contains('done')) return;

    mission.classList.add('done');
    state.done += 1;
    renderProgress();

    const reward = Number(mission.dataset.coin) || 5;
    addCoins(reward);
    showToast(`❄️ +${reward} 얼음 조각을 얻었어!`);
    reactHappy();

    if (state.done === state.total) {
      // 완료를 빙글이와 함께 축하할 수 있도록 팝업을 닫는다
      setTimeout(() => closeModal(missionModal), 550);
      addCoins(20);
      showToast('🎉 미션 전부 완료! 보너스 ❄️ +20');
      say('오늘 미션 전부 완료!! 이 정도면 나 평생 안 녹겠는데?', 4000);
      popHearts(7);
    }
  });
});


/* ============================================
   냉장고 꾸미기 상점 — 얼음 조각(❄️)으로
   벽 테마 · 바닥 테마 · 인테리어 소품 구매 후 적용
   ============================================ */

/* price 0 = 기본 보유 */
const DECOR_THEMES = [
  { id: 'ice',   label: '얼음',        price: 0 },
  { id: 'snow',  label: '포근한 눈',   price: 30 },
  { id: 'mint',  label: '민트 힐링',   price: 40 },
  { id: 'berry', label: '베리 라벤더', price: 40 },
  { id: 'wood',  label: '코지 우드',   price: 50 },
  { id: 'slate', label: '동굴 슬레이트', price: 50 },
];

/* 선반 위에 올릴 수 있는 인테리어 소품 (최대 3개 장착) */
const DECOR_PROPS = [
  { id: 'snowflake', emoji: '❄️', label: '눈 결정',     price: 0 },
  { id: 'bubble',    emoji: '🫧', label: '얼음 방울',   price: 0 },
  { id: 'star',      emoji: '⭐', label: '별 조각',     price: 0 },
  { id: 'lamp',      emoji: '💡', label: '꼬마 전구',   price: 20 },
  { id: 'tulip',     emoji: '🌷', label: '튤립 화분',   price: 25 },
  { id: 'cactus',    emoji: '🌵', label: '미니 선인장', price: 25 },
  { id: 'bear',      emoji: '🧸', label: '꼬마 곰인형', price: 35 },
  { id: 'chime',     emoji: '🎐', label: '유리 풍경',   price: 30 },
];

const PROP_SLOTS = 3;

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

const decorState = {
  wall: localStorage.getItem('bingle_decor_wall') || '',
  floor: localStorage.getItem('bingle_decor_floor') || '',
  // 무료 아이템은 처음부터 보유
  ownedWalls: loadJSON('bingle_owned_walls', ['ice']),
  ownedFloors: loadJSON('bingle_owned_floors', ['ice']),
  ownedProps: loadJSON('bingle_owned_props', ['snowflake', 'bubble', 'star']),
  equippedProps: loadJSON('bingle_equipped_props', ['snowflake', 'bubble', 'star']),
};

function saveDecor() {
  localStorage.setItem('bingle_decor_wall', decorState.wall);
  localStorage.setItem('bingle_decor_floor', decorState.floor);
  localStorage.setItem('bingle_owned_walls', JSON.stringify(decorState.ownedWalls));
  localStorage.setItem('bingle_owned_floors', JSON.stringify(decorState.ownedFloors));
  localStorage.setItem('bingle_owned_props', JSON.stringify(decorState.ownedProps));
  localStorage.setItem('bingle_equipped_props', JSON.stringify(decorState.equippedProps));
}

const wallLayer = $('#wall-tex-layer');
const floorLayer = $('#fridge-floor');
const decorModal = $('#decor-modal');
const decorBody = $('#decor-body');

function tileUrl(kind, id) {
  return `assets/decor/${kind}/${id}.svg`;
}

/* 저장된 선택을 실제 냉장고 배경·선반에 반영 */
function applyDecor() {
  if (decorState.wall) {
    wallLayer.style.backgroundImage = `url(${tileUrl('walls', decorState.wall)})`;
    wallLayer.style.backgroundSize = '48px 48px';
  } else {
    wallLayer.style.backgroundImage = 'none';
  }
  if (decorState.floor) {
    floorLayer.style.backgroundImage = `url(${tileUrl('floors', decorState.floor)})`;
    floorLayer.style.backgroundSize = '24px 24px';
  } else {
    floorLayer.style.backgroundImage = '';
  }
  // 선반 소품 슬롯 렌더링
  document.querySelectorAll('.fridge-shelf .prop').forEach((slot, i) => {
    const propId = decorState.equippedProps[i];
    const prop = DECOR_PROPS.find((p) => p.id === propId);
    slot.textContent = prop ? prop.emoji : '';
  });
}

/* ---------- 상점 로직 ---------- */
function ownedList(kind) {
  return kind === 'wall' ? decorState.ownedWalls
    : kind === 'floor' ? decorState.ownedFloors
    : decorState.ownedProps;
}

/* 미보유면 구매 시도(성공 시 보유 추가), 보유면 true */
function ensureOwned(kind, item) {
  const list = ownedList(kind);
  if (list.includes(item.id)) return true;
  if (!spendCoins(item.price)) {
    showToast(`❄️ 얼음 조각이 부족해! (필요: ${item.price})`);
    return false;
  }
  list.push(item.id);
  showToast(`🛒 '${item.label}' 구매 완료! ❄️ -${item.price}`);
  return true;
}

function handleThemePick(kind, id) {
  const theme = DECOR_THEMES.find((t) => t.id === id);
  if (!ensureOwned(kind, theme)) { renderDecorBody(); return; }
  decorState[kind] = id;
  saveDecor();
  applyDecor();
  renderDecorBody();
  showToast(`🎨 ${kind === 'wall' ? '벽' : '바닥'}이 '${theme.label}'(으)로 바뀌었어!`);
}

function handlePropPick(id) {
  const prop = DECOR_PROPS.find((p) => p.id === id);
  if (!ensureOwned('prop', prop)) { renderDecorBody(); return; }

  const idx = decorState.equippedProps.indexOf(id);
  if (idx >= 0) {
    // 이미 장착 중이면 해제
    decorState.equippedProps.splice(idx, 1);
    showToast(`↩ '${prop.label}' 선반에서 내렸어`);
  } else if (decorState.equippedProps.length >= PROP_SLOTS) {
    showToast(`선반이 가득 찼어! (최대 ${PROP_SLOTS}개) 먼저 하나를 내려줘`);
    renderDecorBody();
    return;
  } else {
    decorState.equippedProps.push(id);
    showToast(`🧸 '${prop.label}'을(를) 선반에 올렸어!`);
  }
  saveDecor();
  applyDecor();
  renderDecorBody();
}

/* ---------- 상점 UI ---------- */
function priceTagHTML(kind, item, applied) {
  const owned = ownedList(kind).includes(item.id);
  if (applied) return `<span class="swatch-check">✓ 적용중</span>`;
  if (owned) return `<span class="swatch-price owned">보유중</span>`;
  return `<span class="swatch-price">❄️ ${item.price}</span>`;
}

function decorSwatchesHTML(kind) {
  const folder = kind === 'wall' ? 'walls' : 'floors';
  return `<div class="decor-grid">${DECOR_THEMES.map((t) => {
    const applied = decorState[kind] === t.id;
    const owned = ownedList(kind).includes(t.id);
    return `<button class="decor-swatch ${applied ? 'selected' : ''} ${owned ? '' : 'locked'}"
      data-kind="${kind}" data-id="${t.id}">
      <span class="swatch-tile" style="background-image:url(${tileUrl(folder, t.id)})"></span>
      <span class="swatch-label">${t.label}</span>
      ${priceTagHTML(kind, t, applied)}
    </button>`;
  }).join('')}</div>`;
}

function propSwatchesHTML() {
  return `<div class="decor-grid">${DECOR_PROPS.map((p) => {
    const equipped = decorState.equippedProps.includes(p.id);
    const owned = decorState.ownedProps.includes(p.id);
    return `<button class="decor-swatch ${equipped ? 'selected' : ''} ${owned ? '' : 'locked'}"
      data-prop="${p.id}">
      <span class="swatch-tile prop-tile">${p.emoji}</span>
      <span class="swatch-label">${p.label}</span>
      ${equipped ? '<span class="swatch-check">✓ 장착중</span>' : priceTagHTML('prop', p, false)}
    </button>`;
  }).join('')}</div>`;
}

function renderDecorBody() {
  const wallId = decorState.wall || 'ice';
  const floorId = decorState.floor || 'ice';
  decorBody.innerHTML = `
    <div class="decor-preview">
      <div class="dp-box">
        <span class="dp-wall" style="background-image:url(${tileUrl('walls', wallId)})"></span>
        <span class="dp-floor" style="background-image:url(${tileUrl('floors', floorId)});background-size:16px 16px"></span>
      </div>
      <p>미션으로 모은 얼음 조각 ❄️으로<br>벽·바닥·소품을 사서 꾸며봐!</p>
      <span class="decor-balance">❄️ ${state.coins}</span>
    </div>
    <button class="decor-reset-btn" id="decor-reset">↺ 기본값으로</button>
    <div class="decor-section">
      <p class="decor-section-title">🧱 벽 테마</p>
      ${decorSwatchesHTML('wall')}
    </div>
    <div class="decor-section">
      <p class="decor-section-title">🀄 바닥 테마</p>
      ${decorSwatchesHTML('floor')}
    </div>
    <div class="decor-section">
      <p class="decor-section-title">🧸 인테리어 소품 <small>(선반에 최대 ${PROP_SLOTS}개)</small></p>
      ${propSwatchesHTML()}
    </div>`;

  decorBody.querySelectorAll('.decor-swatch[data-kind]').forEach((btn) => {
    btn.addEventListener('click', () => handleThemePick(btn.dataset.kind, btn.dataset.id));
  });

  decorBody.querySelectorAll('.decor-swatch[data-prop]').forEach((btn) => {
    btn.addEventListener('click', () => handlePropPick(btn.dataset.prop));
  });

  $('#decor-reset').addEventListener('click', () => {
    decorState.wall = '';
    decorState.floor = '';
    decorState.equippedProps = ['snowflake', 'bubble', 'star'];
    saveDecor();
    localStorage.removeItem('bingle_decor_wall');
    localStorage.removeItem('bingle_decor_floor');
    applyDecor();
    renderDecorBody();
    showToast('↺ 기본 냉장고로 되돌렸어');
  });
}

function openDecorShop() {
  renderDecorBody();
  openModal(decorModal);
}

$('#decor-close').addEventListener('click', () => closeModal(decorModal));
decorModal.addEventListener('click', (e) => {
  if (e.target === decorModal) closeModal(decorModal);
});

// 저장된 꾸미기 테마 복원 (앱 시작 시 1회)
applyDecor();

/* ============================================
   얼음동굴 마을 — 친구 커뮤니티
   V-log 모아보기(셋로그식) · 편지 쓰기 · 동굴 방문
   ============================================ */

/* ---------- 활동 사전: 빙글이가 대신 재현하는 동작 ----------
   pose: 픽셀 스프라이트 포즈 (standing / sitting / working) */
const ACT = {
  wake:    { emoji: '⏰', bg: '#fff3e0', doing: '기지개를 켜는 중', anim: 'mb-jump', pose: 'standing' },
  work:    { emoji: '💻', bg: '#e3f2fd', doing: '노트북을 열심히 두드리는 중', anim: 'mb-type', pose: 'working' },
  coffee:  { emoji: '☕', bg: '#efebe9', doing: '커피를 홀짝이는 중', anim: '', pose: 'sitting' },
  lunch:   { emoji: '🍱', bg: '#fffde7', doing: '점심을 냠냠 먹는 중', anim: '', pose: 'sitting' },
  meeting: { emoji: '🗣️', bg: '#ede7f6', doing: '회의에서 열심히 끄덕이는 중', anim: 'mb-sway', pose: 'standing' },
  walk:    { emoji: '🌳', bg: '#e8f5e9', doing: '저벅저벅 산책하는 중', anim: 'mb-walk', pose: 'standing' },
  movie:   { emoji: '🍿', bg: '#fce4ec', doing: '영화에 푹 빠져 있는 중', anim: '', pose: 'sitting' },
  gym:     { emoji: '🏋️', bg: '#e0f2f1', doing: '으쌰으쌰 운동하는 중', anim: 'mb-jump', pose: 'standing' },
  book:    { emoji: '📚', bg: '#f3e5f5', doing: '책장을 사락사락 넘기는 중', anim: '', pose: 'working' },
  music:   { emoji: '🎧', bg: '#e8eaf6', doing: '음악에 몸을 흔드는 중', anim: 'mb-sway', pose: 'sitting' },
  game:    { emoji: '🎮', bg: '#e1f5fe', doing: '게임에 초집중하는 중', anim: 'mb-type', pose: 'sitting' },
  sleep:   { emoji: '💤', bg: '#ede7f6', doing: '쿨쿨 자는 중', anim: 'mb-sleep', pose: 'sitting' },
  cook:    { emoji: '🍳', bg: '#fff8e1', doing: '뚝딱뚝딱 요리하는 중', anim: 'mb-type', pose: 'working' },
  study:   { emoji: '📖', bg: '#e8f0fe', doing: '집중해서 공부하는 중', anim: 'mb-type', pose: 'working' },
  lecture: { emoji: '🏫', bg: '#fff3e0', doing: '수업을 듣는 중', anim: '', pose: 'sitting' },
  hospital:{ emoji: '🏥', bg: '#e0f7f4', doing: '병원 실습을 도는 중', anim: 'mb-walk', pose: 'standing' },
};

/* ---------- 마을 주민 데이터 (프로토타입 목업) ----------
   tint: 스프라이트 색조 필터 — 친구마다 빙글이 색이 다르다 */
const PEOPLE = [
  {
    id: 'me', me: true, color: '#b9e5f8', tint: 'none', rest: '21~23시', status: 'rest',
    pos: { x: 50, y: 88 },
    vlog: [
      { t: '07:30', act: 'wake', label: '기상 성공!' },
      { t: '09:30', act: 'work', label: '오전 업무 시작' },
      { t: '12:30', act: 'lunch', label: '점심 먹고 재충전' },
      { t: '15:00', act: 'meeting', label: '오후 회의' },
      { t: '19:30', act: 'walk', label: '퇴근길 산책 미션 완료' },
      { t: '21:30', act: 'movie', label: '휴식 시간!' },
    ],
  },
  {
    id: 'yurim', name: '유림', study: { done: 9, today: true }, color: '#ffd6e8', tint: 'hue-rotate(140deg) saturate(0.75) brightness(1.06)', rest: '21~23시', status: 'rest', now: 'movie',
    pos: { x: 18, y: 46 },
    vlog: [
      { t: '08:00', act: 'gym', label: '아침 운동 완료' },
      { t: '10:00', act: 'work', label: '콘텐츠 기획 중' },
      { t: '14:00', act: 'coffee', label: '카페에서 잠깐 숨 돌리기' },
      { t: '20:00', act: 'cook', label: '저녁 요리 도전' },
      { t: '21:30', act: 'movie', label: '휴식 시간!' },
    ],
  },
  {
    id: 'gyubin', name: '규빈', study: { done: 5, today: false }, color: '#d6f5d6', tint: 'hue-rotate(290deg) saturate(0.8) brightness(1.04)', rest: '22~24시', status: 'busy', now: 'work',
    pos: { x: 82, y: 44 },
    vlog: [
      { t: '09:00', act: 'work', label: '코딩 시작' },
      { t: '13:00', act: 'lunch', label: '늦은 점심' },
      { t: '16:00', act: 'work', label: '아직도 코딩…' },
      { t: '22:00', act: 'game', label: '드디어 휴식 게임' },
    ],
  },
  {
    id: 'junho', name: '준호', study: { done: 12, today: true }, color: '#ffe9c7', tint: 'hue-rotate(195deg) saturate(0.65) brightness(1.1)', rest: '21~23시', status: 'rest', now: 'music',
    pos: { x: 30, y: 72 },
    vlog: [
      { t: '07:00', act: 'walk', label: '아침 산책' },
      { t: '09:30', act: 'meeting', label: '오전 미팅 연속' },
      { t: '18:30', act: 'gym', label: '헬스장 출석' },
      { t: '21:00', act: 'music', label: '휴식 시간!' },
    ],
  },
  {
    id: 'sohee', name: '소희', study: { done: 7, today: false }, color: '#e3d9ff', tint: 'hue-rotate(60deg) saturate(0.7) brightness(1.05)', rest: '20~22시', status: 'rest', now: 'book',
    pos: { x: 71, y: 74 },
    vlog: [
      { t: '08:30', act: 'coffee', label: '모닝 커피' },
      { t: '10:00', act: 'work', label: '디자인 작업' },
      { t: '17:00', act: 'walk', label: '한강 산책' },
      { t: '20:30', act: 'book', label: '휴식 시간!' },
    ],
  },
];

const ME = PEOPLE[0];
const FRIENDS = PEOPLE.slice(1);

/* 목업 수신 편지 */
const inbox = [
  { from: '유림', text: '오늘 같이 영화 볼래? 🍿' },
  { from: '소희', text: '오늘 하루도 고생했어. 푹 쉬어! 🧊' },
];

const sentKey = 'bingle_letters_sent';
const getSent = () => JSON.parse(localStorage.getItem(sentKey) || '[]');

function personName(p) { return p.me ? (state.userName || '나') : p.name; }

/* 내 V-log는 3시간 체크인 기록으로 실시간 생성(timelog.js), 친구는 목업 */
function personVlog(p) {
  if (p.me && typeof buildMyVlog === 'function') {
    const segs = buildMyVlog();
    if (segs.length) return segs;
  }
  return p.vlog;
}

/* 학습 현황: 나는 실제 진행 상태(lectures.js), 친구는 목업 데이터 */
function personStudy(p) {
  if (p.me) return typeof myStudyStatus === 'function' ? myStudyStatus() : null;
  return p.study ? { ...p.study, total: 14 } : null;
}

/* 동굴 방문 팝업에 넣을 학습 진행율 카드 */
function studyCardHTML(p) {
  const st = personStudy(p);
  if (!st) return '';
  const pct = Math.round((st.done / st.total) * 100);
  return `
    <div class="cave-study-card">
      <p class="cs-title">📚 AI 학습 진행율</p>
      <div class="cs-bar"><i style="width:${pct}%"></i></div>
      <p class="cs-text">${st.done}/${st.total} 강의 · ${pct}%
        <span class="cs-today ${st.today ? 'did' : ''}">${st.today ? '오늘 강의 완료 ✅' : '오늘은 아직 ⌛'}</span>
      </p>
    </div>`;
}

/* 픽셀 스프라이트 빙글이 — pose: standing / sitting / working */
function miniBingleeHTML(person, anim = '', size = '', pose = 'standing') {
  const tint = person.tint && person.tint !== 'none' ? `filter:${person.tint}` : '';
  return `<img class="sprite ${size} ${anim}" src="assets/binglee/${pose}.png"
    alt="${personName(person)}의 빙글이" draggable="false" style="${tint}" />`;
}

/* ---------- 뷰 전환 ---------- */
const views = {
  home: $('#view-home'),
  cave: $('#view-cave'),
  lecture: $('#view-lecture'),
  curriculum: $('#view-curriculum'),
  calendar: $('#view-calendar'),
};

function switchView(name) {
  Object.entries(views).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  if (name === 'cave') onEnterCave();
  if (name === 'curriculum') renderCurriculum(); // lectures.js
  if (name === 'calendar') renderCalendar(); // calendar.js
}

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.view;
    if (v === 'home' || v === 'cave' || v === 'curriculum' || v === 'calendar') switchView(v);
    else if (v === 'decor') openDecorShop(); // 현재 뷰 위에 상점 팝업
    else showToast('🚧 준비 중인 기능이야! 조금만 기다려줘');
  });
});

/* ---------- 마을 렌더링 ---------- */
function renderVillage() {
  const village = $('#village');
  village.querySelectorAll('.cave').forEach((c) => c.remove());

  PEOPLE.forEach((p) => {
    const el = document.createElement('button');
    el.className = 'cave' + (p.me ? ' me' : '');
    el.style.left = p.pos.x + '%';
    el.style.top = p.pos.y + '%';
    el.setAttribute('aria-label', `${personName(p)}의 얼음동굴`);
    const sameRest = !p.me && p.rest === ME.rest;
    const study = personStudy(p);
    el.innerHTML = `
      <div class="cave-dome">
        ${p.me ? `<span class="cave-mail">📮 ${inbox.length}</span>` : ''}
        ${miniBingleeHTML(p, '', 'sm', 'standing')}
      </div>
      <span class="cave-name">
        <span class="st ${p.status}"></span>
        ${personName(p)}${p.me ? ' (나)' : ''}${sameRest ? ' 🕘' : ''}
      </span>
      ${study ? `<span class="cave-study ${study.today ? 'did' : ''}">📚 ${study.done}/${study.total} ${study.today ? '✅' : '⌛'}</span>` : ''}`;
    el.addEventListener('click', () => (p.me ? openMyCave() : openFriendCave(p)));
    village.appendChild(el);
  });

  $('#mail-count').textContent = inbox.length;
}

let caveWelcomed = false;

function onEnterCave() {
  renderVillage();
  if (!caveWelcomed) {
    caveWelcomed = true;
    showToast('🫧 얼음동굴 마을에 온 걸 환영해!');
    // 하루가 마무리되는 저녁이면 오늘의 V-log를 자동으로 모아서 보여준다
    const hour = new Date().getHours();
    if ((hour >= 21 || hour < 4) && !sessionStorage.getItem('vlog_shown')) {
      sessionStorage.setItem('vlog_shown', '1');
      setTimeout(() => {
        showToast('🎬 하루 마무리! 오늘의 V-log가 도착했어');
        setTimeout(openVlog, 900);
      }, 1200);
    }
  }
}

/* ---------- 동굴 방문 팝업 ---------- */
const caveModal = $('#cave-modal');
const caveModalBody = $('#cave-modal-body');

function openFriendCave(p) {
  const act = ACT[p.now] || ACT.music;
  const sameRest = p.rest === ME.rest;
  caveModalBody.innerHTML = `
    <div class="modal-head">
      <h2>${p.name}의 얼음동굴</h2>
      <button class="modal-close" data-close aria-label="닫기">✕</button>
    </div>
    <div class="cave-visit-scene" style="background:${act.bg}">
      ${miniBingleeHTML(p, act.anim, '', act.pose)}
      <div class="cave-visit-info">
        <p class="cv-name">${p.name}의 빙글이</p>
        <p class="cv-status">${p.name} 대신 ${act.doing} ${act.emoji}<br>휴식 시간: ${p.rest}</p>
        ${sameRest ? '<span class="rest-chip">🕘 나와 같은 휴식 시간!</span>' : ''}
      </div>
    </div>
    ${studyCardHTML(p)}
    <div class="cave-actions">
      <button class="cave-action-btn vlog" data-vlog>🎬 V-log 보기</button>
      <button class="cave-action-btn letter" data-letter>💌 편지 쓰기</button>
    </div>`;
  caveModalBody.querySelector('[data-close]').addEventListener('click', () => closeModal(caveModal));
  caveModalBody.querySelector('[data-vlog]').addEventListener('click', () => {
    closeModal(caveModal);
    openVlog(PEOPLE.indexOf(p));
  });
  caveModalBody.querySelector('[data-letter]').addEventListener('click', () => {
    closeModal(caveModal);
    openLetter(p.id);
  });
  openModal(caveModal);
}

function openMyCave() {
  const sent = getSent();
  caveModalBody.innerHTML = `
    <div class="modal-head">
      <h2>내 얼음동굴 📮</h2>
      <button class="modal-close" data-close aria-label="닫기">✕</button>
    </div>
    ${studyCardHTML(ME)}
    <p class="letter-section-title">받은 편지 ${inbox.length}</p>
    <ul class="letter-list">
      ${inbox.map((l) => `
        <li class="letter-item">
          <span class="li-emoji">💌</span>
          <div><p class="li-from">${l.from}</p><p class="li-text">${l.text}</p></div>
        </li>`).join('')}
    </ul>
    ${sent.length ? `
      <p class="letter-section-title">보낸 편지 ${sent.length}</p>
      <ul class="letter-list">
        ${sent.map((l) => `
          <li class="letter-item">
            <span class="li-emoji">📤</span>
            <div><p class="li-from">→ ${l.to}</p><p class="li-text">${l.text}</p></div>
          </li>`).join('')}
      </ul>` : ''}`;
  caveModalBody.querySelector('[data-close]').addEventListener('click', () => closeModal(caveModal));
  openModal(caveModal);
}

/* ---------- 편지 쓰기 ---------- */
const letterModal = $('#letter-modal');
const letterModalBody = $('#letter-modal-body');
const TEMPLATES = ['오늘 같이 영화 볼래? 🍿', '산책 같이 갈래? 🚶', '내일 커피 한 잔 어때? ☕', '오늘 하루도 고생했어 🧊'];

function openLetter(preselectId) {
  // 나와 같은 휴식 시간인 친구를 먼저 보여준다
  const sorted = [...FRIENDS].sort((a, b) =>
    (b.rest === ME.rest) - (a.rest === ME.rest));
  let selectedId = preselectId || (sorted[0] && sorted[0].id);

  letterModalBody.innerHTML = `
    <div class="modal-head">
      <h2>💌 편지 쓰기</h2>
      <span class="manual-chip">한 줄이면 충분해</span>
      <button class="modal-close" data-close aria-label="닫기">✕</button>
    </div>
    <p class="letter-section-title">누구에게 보낼까? (🕘 = 같은 휴식 시간)</p>
    <div class="recipient-row">
      ${sorted.map((f) => `
        <button class="recipient ${f.id === selectedId ? 'selected' : ''}" data-id="${f.id}">
          ${miniBingleeHTML(f, '', 'sm', 'standing')}
          <span>${f.name}</span>
          ${f.rest === ME.rest ? '<span class="same-rest">🕘 같은 휴식</span>' : `<span class="same-rest" style="color:#8a97a8;background:#eef2f6">${f.rest}</span>`}
        </button>`).join('')}
    </div>
    <div class="letter-templates">
      ${TEMPLATES.map((t) => `<button class="tpl-chip">${t}</button>`).join('')}
    </div>
    <form class="letter-form" id="letter-form">
      <input type="text" id="letter-input" maxlength="40" placeholder="한 줄 편지를 써봐" autocomplete="off" />
      <button type="submit">보내기</button>
    </form>`;

  letterModalBody.querySelector('[data-close]').addEventListener('click', () => closeModal(letterModal));

  letterModalBody.querySelectorAll('.recipient').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedId = btn.dataset.id;
      letterModalBody.querySelectorAll('.recipient').forEach((b) =>
        b.classList.toggle('selected', b.dataset.id === selectedId));
    });
  });

  letterModalBody.querySelectorAll('.tpl-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $('#letter-input').value = chip.textContent;
      $('#letter-input').focus();
    });
  });

  $('#letter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('#letter-input').value.trim();
    const to = FRIENDS.find((f) => f.id === selectedId);
    if (!text || !to) return;
    const sent = getSent();
    sent.push({ to: to.name, text, at: Date.now() });
    localStorage.setItem(sentKey, JSON.stringify(sent));
    closeModal(letterModal);
    showToast(`📨 ${to.name}의 얼음동굴로 편지가 날아갔어!`);
    renderVillage();
  });

  openModal(letterModal);
}

$('#open-letter').addEventListener('click', () => openLetter());

/* ---------- V-log 플레이어 (셋로그 스타일) ---------- */
const vlogModal = $('#vlog-modal');
const vlogFrame = $('#vlog-frame');
const SEG_MS = 2800;
const vlog = { person: 0, seg: 0, timer: null };

function openVlog(personIdx = 0) {
  vlog.person = personIdx;
  vlog.seg = 0;
  renderVlog();
  vlogModal.classList.remove('hidden');
}

function closeVlog() {
  clearTimeout(vlog.timer);
  vlogModal.classList.add('hidden');
}

function vlogNext() {
  const segs = personVlog(PEOPLE[vlog.person]).length;
  if (vlog.seg < segs - 1) { vlog.seg += 1; }
  else if (vlog.person < PEOPLE.length - 1) { vlog.person += 1; vlog.seg = 0; }
  else {
    closeVlog();
    showToast('🌙 오늘의 V-log 끝! 모두 수고했어');
    return;
  }
  renderVlog();
}

function vlogPrev() {
  if (vlog.seg > 0) { vlog.seg -= 1; }
  else if (vlog.person > 0) {
    vlog.person -= 1;
    vlog.seg = personVlog(PEOPLE[vlog.person]).length - 1;
  }
  renderVlog();
}

function renderVlog() {
  clearTimeout(vlog.timer);
  const p = PEOPLE[vlog.person];
  const segList = personVlog(p);
  const seg = segList[Math.min(vlog.seg, segList.length - 1)];
  const act = ACT[seg.act] || ACT.music;

  vlogFrame.innerHTML = `
    <button class="vlog-close" aria-label="닫기">✕</button>
    <div class="vlog-people">
      ${PEOPLE.map((pp, i) => `
        <button class="vlog-person ${i === vlog.person ? 'active' : ''}" data-i="${i}">
          ${miniBingleeHTML(pp, '', 'sm', 'standing')}
          <span>${personName(pp)}</span>
        </button>`).join('')}
    </div>
    <div class="vlog-progress">
      ${segList.map((_, i) => `
        <span class="bar ${i < vlog.seg ? 'done' : i === vlog.seg ? 'now' : ''}"
          style="--seg-ms:${SEG_MS}ms"><i></i></span>`).join('')}
    </div>
    <div class="vlog-scene" style="background:${act.bg}">
      <span class="vlog-time">${seg.t}</span>
      <span class="vlog-act-emoji">${act.emoji}</span>
      ${miniBingleeHTML(p, act.anim, 'lg', act.pose)}
      <div class="vlog-caption">
        <p class="cap-main">${seg.label}</p>
        <p class="cap-sub">빙글이가 ${personName(p)} 대신 ${act.doing} ${act.emoji}</p>
      </div>
    </div>
    <button class="vlog-nav prev" aria-label="이전"></button>
    <button class="vlog-nav next" aria-label="다음"></button>`;

  vlogFrame.querySelector('.vlog-close').addEventListener('click', closeVlog);
  vlogFrame.querySelector('.vlog-nav.next').addEventListener('click', vlogNext);
  vlogFrame.querySelector('.vlog-nav.prev').addEventListener('click', vlogPrev);
  vlogFrame.querySelectorAll('.vlog-person').forEach((btn) => {
    btn.addEventListener('click', () => {
      vlog.person = Number(btn.dataset.i);
      vlog.seg = 0;
      renderVlog();
    });
  });

  vlog.timer = setTimeout(vlogNext, SEG_MS);
}

$('#open-vlog').addEventListener('click', () => openVlog(0));

vlogModal.addEventListener('click', (e) => {
  if (e.target === vlogModal) closeVlog();
});

/* 동굴/편지 모달도 공통 규칙(바깥 클릭·ESC 닫기)에 포함 */
[caveModal, letterModal].forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(caveModal);
    closeModal(letterModal);
    closeModal(decorModal);
    closeVlog();
  }
});

/* ---------- 초기 렌더 ---------- */
renderGreeting();
renderCoins();
renderProgress();

// 처음 만난 사용자에게는 빙글이가 먼저 인사한다
if (!localStorage.getItem('bingle_welcomed')) {
  localStorage.setItem('bingle_welcomed', '1');
  setTimeout(() => {
    say('안녕! 난 빙글이야. 오늘의 미션이랑 AI 강의, 같이 시작해 보자! 🧊', 3600);
  }, 900);
}
