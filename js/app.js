/* ============================================
   빙글이 Binglee — 메인 인터페이스 로직
   감정 온도 지수 · 돌봄 미션 팝업 · 캐릭터 반응
   ============================================ */

const TEMP_MIN = 12;   // 소진
const TEMP_MAX = 100;  // 회복 완료
const TEMP_BASE = 36;  // 오늘의 시작 온도

const state = {
  temp: TEMP_BASE,
  done: 0,
  total: 5,
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

/* ---------- 날짜 표기 ---------- */
(function setDate() {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  $('#today-date').textContent =
    `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;

  const hour = now.getHours();
  const hello = $('.hello');
  if (hour < 5) hello.textContent = '늦은 밤이에요 🌙';
  else if (hour < 12) hello.textContent = '좋은 아침이에요 ☀️';
  else if (hour < 18) hello.textContent = '좋은 오후예요 🌤️';
  else hello.textContent = '편안한 저녁이에요 🌆';
})();

/* ---------- 감정 온도 게이지 ---------- */
function renderTemp() {
  const ratio = (state.temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  tempNow.textContent = state.temp;
  tempFill.style.width = pct + '%';
  tempMarker.style.left = pct + '%';
}

function raiseTemp(delta) {
  state.temp = Math.min(TEMP_MAX, state.temp + delta);
  renderTemp();
}

/* ---------- 말풍선 ---------- */
const idleLines = [
  '오늘도 와줘서 고마워!',
  '냉장고 안은 시원하고 아늑해~',
  '네 덕분에 조금씩 따뜻해지고 있어',
  '무리하지 않아도 괜찮아',
  '나를 돌봐줘서 고마워 🩵',
];

const happyLines = [
  '와아! 고마워!! 🧡',
  '몸이 따뜻해지는 기분이야~',
  '너랑 있으면 든든해!',
  '조금씩, 우리 같이 회복하자!',
  '오늘의 돌봄, 최고야!',
];

let bubbleTimer = null;

function say(text, holdMs = 2600) {
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

/* ---------- 돌봄 미션 팝업 열기/닫기 ---------- */
function openMissions() {
  missionModal.classList.remove('hidden');
}

function closeMissions() {
  missionModal.classList.add('hidden');
}

missionFab.addEventListener('click', openMissions);
$('#modal-close').addEventListener('click', closeMissions);

// 오버레이(팝업 바깥) 클릭 시 닫기
missionModal.addEventListener('click', (e) => {
  if (e.target === missionModal) closeMissions();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMissions();
});

/* ---------- 돌봄 미션 체크 ---------- */
function showToast(text) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

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
      // 완료를 캐릭터와 함께 축하할 수 있도록 팝업을 닫는다
      setTimeout(closeMissions, 550);
      showToast('🎉 오늘의 돌봄 미션 완료! 빙글이가 한층 따뜻해졌어요');
      say('오늘 미션 전부 완료!! 정말 최고야 🩵', 4000);
      popHearts(7);
    }
  });
});

/* ---------- 초기 렌더 ---------- */
renderTemp();
renderProgress();
