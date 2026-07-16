/* ============================================
   빙글이 Binglee — 메인 인터페이스 로직
   '행복을 만드는 얼음' 스토리 기반
   감정 온도 · 상태 확인(생존 매뉴얼) · 돌봄 미션
   ============================================ */

const TEMP_MIN = 12;   // 소진 — 빙글이가 녹기 직전
const TEMP_MAX = 100;  // 회복 완료
const TEMP_BASE = 36;  // 상태 확인 전 기본 온도
const MELT_LINE = 40;  // 이 온도보다 낮으면 빙글이가 녹기 시작

const state = {
  temp: TEMP_BASE,
  done: 0,
  total: 5,
  userName: localStorage.getItem('bingle_user_name') || '',
};

const $ = (sel) => document.querySelector(sel);

const tempNow = $('#temp-now');
const tempFill = $('#temp-fill');
const tempMarker = $('#temp-marker');
const bubble = $('#speech-bubble');
const binglee = $('#binglee');
const hearts = $('#hearts');
const progressEl = $('#missions-progress');
const fabBadge = $('#fab-badge');
const missionFab = $('#mission-fab');
const missionModal = $('#mission-modal');
const checkinFab = $('#checkin-fab');
const checkinModal = $('#checkin-modal');
const checkinBody = $('#checkin-body');

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

/* ---------- 감정 온도 게이지 ---------- */
function renderTemp() {
  const ratio = (state.temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  tempNow.textContent = state.temp;
  tempFill.style.width = pct + '%';
  tempMarker.style.left = pct + '%';
  updateMelt();
}

function raiseTemp(delta) {
  state.temp = Math.min(TEMP_MAX, state.temp + delta);
  renderTemp();
}

/* 온도가 낮으면 빙글이가 녹기 시작한다 */
function updateMelt() {
  binglee.classList.toggle('melting', state.temp < MELT_LINE);
}

/* ---------- 말풍선 (스토리 톤) ---------- */
const idleLines = [
  '톡. 톡. 나 여기 있어!',
  '나는 행복을 만드는 얼음이야. 잊지 마!',
  '냉장고 안은 역시 아늑하다~',
  '무리하지 않아도 괜찮아.',
  '네 하루가 너무 뜨거워 보여. 조금 식히고 가자.',
  '네가 다시 웃을 수 있을 때까지, 나는 절대 녹지 않을 거야.',
];

const meltingLines = [
  '어쩐지... 아침부터 내가 좀 빨리 녹는 것 같았어.',
  '괜찮아, 아직 안 녹았어! 아직!',
  '오늘 미션 하나만 해줘. 내가 좀 오래 버티게.',
];

const happyLines = [
  '방금 뭐야? 입꼬리!',
  '웃었는데? 착각 아니야!',
  '오~ 덕분에 몸이 단단해지는 기분이야!',
  '역시 내 담당 인간이라니까!',
  '조금씩, 우리 같이 회복하자!',
];

let bubbleTimer = null;

function say(text, holdMs = 2800) {
  bubble.textContent = text;
  bubble.classList.remove('hidden');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.add('hidden'), holdMs);
}

// 유휴 상태에서 주기적으로 혼잣말 — 녹는 중이면 녹는 얘기부터
setInterval(() => {
  if (bubble.classList.contains('hidden')) {
    const pool = state.temp < MELT_LINE && Math.random() < 0.5 ? meltingLines : idleLines;
    say(pool[Math.floor(Math.random() * pool.length)]);
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
  // 빙글이는 가끔 웃음을 기록한다
  if (Math.random() < 0.3) {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    showToast(`✏️ 기록: ${state.userName || '인간'}, ${h}시 ${m}분. 아주 작게 웃음.`);
  }
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

[missionModal, checkinModal].forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(missionModal);
    closeModal(checkinModal);
  }
});

/* ---------- 돌봄 미션 팝업 ---------- */
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

    raiseTemp(Number(mission.dataset.temp) || 5);
    reactHappy();

    if (state.done === state.total) {
      // 완료를 빙글이와 함께 축하할 수 있도록 팝업을 닫는다
      setTimeout(() => closeModal(missionModal), 550);
      showToast('🎉 오늘의 돌봄 미션 완료! 빙글이가 단단해졌어요');
      say('오늘 미션 전부 완료!! 이 정도면 나 평생 안 녹겠는데?', 4000);
      popHearts(7);
    }
  });
});

/* ============================================
   오늘의 상태 확인 — 빙글이의 생존 매뉴얼
   이름 입력(최초 1회) → KEDS 3문항 → 결론
   ============================================ */

const QUESTIONS = [
  {
    text: '직무로 인해 감정적으로 고갈된 느낌이 든다.',
    intro: '자, 첫 번째.\n매뉴얼에 이렇게 적혀 있어.',
    reply: [
      '오, 아직 덜 미지근하네!',
      '흠… 그 정도면 나쁘지 않아.',
      '흠.',
      '역시 네 커피는 얼음 많이 넣어야겠다.',
      '너… 너무 미지근해.',
    ],
  },
  {
    text: '근무 후 기진맥진한 느낌이 든다.',
    intro: '두 번째.\n"누구나 그렇지"라고 넘어가기 없기.',
    reply: [
      '오늘은 좀 남아 있네. 다행이다!',
      '그 정도면 버틸 만하지?',
      '누구나 그렇다는 말로 넘어가는 사람은 보통 꽤 그렇다는 뜻이래.',
      '어쩐지… 아침부터 내가 좀 빨리 녹는 것 같았어.',
      '이건 내 탓 아니야. 네 탓이야.',
    ],
  },
  {
    text: '아침에 일어나 또 하루 일을 대면해야 한다는 것이 피곤하게 느껴진다.',
    intro: '세 번째.\n이게 제일 중요해 보이는데.',
    reply: [
      '그 정도면 아침이 가볍네!',
      '나쁘지 않아. 기록해둘게.',
      '왜 말이 없어? …생각 중인 거 보니 맞다는 뜻이네.',
      '알람보다 마음이 먼저 지치는 타입이구나.',
      '기록해둬야겠다. 인간, 오늘도 출근 전부터 지침.',
    ],
  },
];

const checkin = { step: -1, answers: [] };

function likertHTML() {
  const labels = ['전혀 그렇지 않다', '가끔 그렇다', '보통이다', '자주 그렇다', '매우 그렇다'];
  return `<ul class="likert">${labels
    .map((l, i) => `<li><button data-v="${i + 1}"><span class="num">${i + 1}</span>${l}</button></li>`)
    .join('')}</ul>`;
}

function renderCheckinStep() {
  // 이름을 아직 모르면 이름부터 (스토리: "앞으로 계속 같이 있을 건데, 너라고 부를 순 없으니까.")
  if (!state.userName && checkin.step === -1) {
    checkinBody.innerHTML = `
      <div class="ice-line"><img class="sprite sm mini-ice-sprite" src="assets/binglee/standing.png" alt="빙글이" draggable="false" />
        <p>좋아, 그럼 오늘의 상태 확인부터 하자.\n…아, 그 전에. 이름이 뭐야?\n앞으로 계속 같이 있을 건데, 너라고 부를 순 없으니까.</p>
      </div>
      <form class="name-form" id="name-form">
        <input type="text" id="name-input" maxlength="10" placeholder="이름을 알려줘" autocomplete="off" />
        <button type="submit">알려주기</button>
      </form>`;
    $('#name-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#name-input').value.trim();
      if (!v) return;
      state.userName = v;
      localStorage.setItem('bingle_user_name', v);
      renderGreeting();
      checkinBody.innerHTML = `
        <div class="ice-line"><img class="sprite sm mini-ice-sprite" src="assets/binglee/standing.png" alt="빙글이" draggable="false" />
          <p>${v}… ${v}…\n(자기 몸집만 한 연필로 힘겹게 적는 중)\n그럼, 잘 부탁해. ${v}!</p>
        </div>`;
      setTimeout(() => { checkin.step = 0; renderCheckinStep(); }, 1600);
    });
    return;
  }

  if (checkin.step < 0) checkin.step = 0;

  // 질문 단계
  if (checkin.step < QUESTIONS.length) {
    const q = QUESTIONS[checkin.step];
    checkinBody.innerHTML = `
      <div class="ice-line"><img class="sprite sm mini-ice-sprite" src="assets/binglee/standing.png" alt="빙글이" draggable="false" /><p>${q.intro}</p></div>
      <p class="q-count">질문 ${checkin.step + 1} / ${QUESTIONS.length}</p>
      <div class="ice-line" style="margin-bottom:10px"><span class="mini-ice">📜</span>
        <p><b>${q.text}</b></p>
      </div>
      ${likertHTML()}`;

    checkinBody.querySelectorAll('.likert button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = Number(btn.dataset.v);
        checkin.answers[checkin.step] = v;
        // 빙글이의 얄미운 코멘트
        checkinBody.innerHTML = `
          <div class="ice-line"><img class="sprite sm mini-ice-sprite" src="assets/binglee/standing.png" alt="빙글이" draggable="false" /><p>${q.reply[v - 1]}</p></div>`;
        setTimeout(() => { checkin.step += 1; renderCheckinStep(); }, 1400);
      });
    });
    return;
  }

  // 결론 단계
  const sum = checkin.answers.reduce((a, b) => a + b, 0); // 3~15
  state.temp = Math.max(TEMP_MIN, Math.min(TEMP_MAX, TEMP_MIN + (15 - sum) * 4));
  renderTemp();

  let verdict;
  if (sum <= 6) {
    verdict = '결론이 나왔어.\n오늘 하루는 덜 뜨겁네. 그래도 방심 금지!';
  } else if (sum <= 10) {
    verdict = '결론이 나왔어.\n너는 오늘 아이스 아메리카노를 큰 걸로 마셔야 해.\n…그리고 나랑 미션 하나만 하자.';
  } else {
    verdict = '결론이 나왔어.\n네 하루가 너무 뜨거워 보이니까…\n오늘은 내가 옆에 딱 붙어 있을게. 조금 식히러 가자.';
  }

  checkinBody.innerHTML = `
    <div class="ice-line"><img class="sprite sm mini-ice-sprite" src="assets/binglee/standing.png" alt="빙글이" draggable="false" /><p>${verdict}</p></div>
    <div class="ice-line"><span class="mini-ice">📜</span>
      <p>오늘의 감정 온도: <b>${state.temp}°C</b>\n${state.temp < MELT_LINE ? '(…이 온도면 나 좀 빨리 녹아. 미션 부탁해.)' : '(이 정도면 나 오늘 잘 버틸 수 있어!)'}</p>
    </div>
    <button class="checkin-done-btn" id="checkin-done">알겠어, 같이 가자 🧊</button>`;

  $('#checkin-done').addEventListener('click', () => {
    closeModal(checkinModal);
    say(state.temp < MELT_LINE
      ? '어쩐지… 오늘 좀 빨리 녹는 것 같았어. 미션 잊지 마!'
      : '좋아! 오늘도 잘 버텨보자!', 3600);
  });
}

function startCheckin() {
  checkin.step = state.userName ? 0 : -1;
  checkin.answers = [];
  renderCheckinStep();
  openModal(checkinModal);
}

checkinFab.addEventListener('click', startCheckin);
$('#checkin-close').addEventListener('click', () => closeModal(checkinModal));

/* ============================================
   냉장고 꾸미기 — 바닥 · 벽 테마를 독립적으로 선택
   ============================================ */

const DECOR_THEMES = [
  { id: 'ice',   label: '얼음' },
  { id: 'snow',  label: '포근한 눈' },
  { id: 'mint',  label: '민트 힐링' },
  { id: 'berry', label: '베리 라벤더' },
  { id: 'wood',  label: '코지 우드' },
  { id: 'slate', label: '동굴 슬레이트' },
];

const decorState = {
  wall: localStorage.getItem('bingle_decor_wall') || '',
  floor: localStorage.getItem('bingle_decor_floor') || '',
};

const wallLayer = $('#wall-tex-layer');
const floorLayer = $('#fridge-floor');
const decorModal = $('#decor-modal');
const decorBody = $('#decor-body');

function tileUrl(kind, id) {
  return `assets/decor/${kind}/${id}.svg`;
}

/* 저장된 선택을 실제 냉장고 배경에 반영. 미선택 시 기존 기본 그라데이션 유지 */
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
}

function setDecor(kind, id) {
  decorState[kind] = id;
  localStorage.setItem(kind === 'wall' ? 'bingle_decor_wall' : 'bingle_decor_floor', id);
  applyDecor();
  renderDecorBody();
}

function decorSwatchesHTML(kind) {
  const folder = kind === 'wall' ? 'walls' : 'floors';
  return `<div class="decor-grid">${DECOR_THEMES.map((t) => {
    const selected = decorState[kind] === t.id;
    return `<button class="decor-swatch ${selected ? 'selected' : ''}" data-kind="${kind}" data-id="${t.id}">
      <span class="swatch-tile" style="background-image:url(${tileUrl(folder, t.id)})"></span>
      <span class="swatch-label">${t.label}</span>
      <span class="swatch-check">✓ 적용중</span>
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
      <p>벽과 바닥을 자유롭게 조합해서<br>빙글이의 냉장고를 꾸며봐!</p>
    </div>
    <button class="decor-reset-btn" id="decor-reset">↺ 기본값으로</button>
    <div class="decor-section">
      <p class="decor-section-title">🧱 벽 테마</p>
      ${decorSwatchesHTML('wall')}
    </div>
    <div class="decor-section">
      <p class="decor-section-title">🀄 바닥 테마</p>
      ${decorSwatchesHTML('floor')}
    </div>`;

  decorBody.querySelectorAll('.decor-swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      setDecor(btn.dataset.kind, btn.dataset.id);
      showToast(`🎨 ${btn.dataset.kind === 'wall' ? '벽' : '바닥'}이 바뀌었어!`);
    });
  });

  $('#decor-reset').addEventListener('click', () => {
    decorState.wall = '';
    decorState.floor = '';
    localStorage.removeItem('bingle_decor_wall');
    localStorage.removeItem('bingle_decor_floor');
    applyDecor();
    renderDecorBody();
    showToast('↺ 기본 냉장고로 되돌렸어');
  });
}

$('#decor-fab').addEventListener('click', () => {
  renderDecorBody();
  openModal(decorModal);
});
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
    id: 'yurim', name: '유림', color: '#ffd6e8', tint: 'hue-rotate(140deg) saturate(0.75) brightness(1.06)', rest: '21~23시', status: 'rest', now: 'movie',
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
    id: 'gyubin', name: '규빈', color: '#d6f5d6', tint: 'hue-rotate(290deg) saturate(0.8) brightness(1.04)', rest: '22~24시', status: 'busy', now: 'work',
    pos: { x: 82, y: 44 },
    vlog: [
      { t: '09:00', act: 'work', label: '코딩 시작' },
      { t: '13:00', act: 'lunch', label: '늦은 점심' },
      { t: '16:00', act: 'work', label: '아직도 코딩…' },
      { t: '22:00', act: 'game', label: '드디어 휴식 게임' },
    ],
  },
  {
    id: 'junho', name: '준호', color: '#ffe9c7', tint: 'hue-rotate(195deg) saturate(0.65) brightness(1.1)', rest: '21~23시', status: 'rest', now: 'music',
    pos: { x: 30, y: 72 },
    vlog: [
      { t: '07:00', act: 'walk', label: '아침 산책' },
      { t: '09:30', act: 'meeting', label: '오전 미팅 연속' },
      { t: '18:30', act: 'gym', label: '헬스장 출석' },
      { t: '21:00', act: 'music', label: '휴식 시간!' },
    ],
  },
  {
    id: 'sohee', name: '소희', color: '#e3d9ff', tint: 'hue-rotate(60deg) saturate(0.7) brightness(1.05)', rest: '20~22시', status: 'rest', now: 'book',
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

/* 픽셀 스프라이트 빙글이 — pose: standing / sitting / working */
function miniBingleeHTML(person, anim = '', size = '', pose = 'standing') {
  const tint = person.tint && person.tint !== 'none' ? `filter:${person.tint}` : '';
  return `<img class="sprite ${size} ${anim}" src="assets/binglee/${pose}.png"
    alt="${personName(person)}의 빙글이" draggable="false" style="${tint}" />`;
}

/* ---------- 뷰 전환 ---------- */
const views = { home: $('#view-home'), cave: $('#view-cave') };

function switchView(name) {
  Object.entries(views).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  if (name === 'cave') onEnterCave();
}

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.view;
    if (v === 'home' || v === 'cave') switchView(v);
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
    el.innerHTML = `
      <div class="cave-dome">
        ${p.me ? `<span class="cave-mail">📮 ${inbox.length}</span>` : ''}
        ${miniBingleeHTML(p, '', 'sm', 'standing')}
      </div>
      <span class="cave-name">
        <span class="st ${p.status}"></span>
        ${personName(p)}${p.me ? ' (나)' : ''}${sameRest ? ' 🕘' : ''}
      </span>`;
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
  const segs = PEOPLE[vlog.person].vlog.length;
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
    vlog.seg = PEOPLE[vlog.person].vlog.length - 1;
  }
  renderVlog();
}

function renderVlog() {
  clearTimeout(vlog.timer);
  const p = PEOPLE[vlog.person];
  const seg = p.vlog[vlog.seg];
  const act = ACT[seg.act];

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
      ${p.vlog.map((_, i) => `
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
renderTemp();
renderProgress();

// 처음 만난 사용자에게는 빙글이가 먼저 상태 확인을 청한다
if (!state.userName) {
  setTimeout(() => {
    say('안녕! 잘 잤어? 오늘의 상태 확인부터 하자!', 3200);
    setTimeout(startCheckin, 1200);
  }, 900);
}
