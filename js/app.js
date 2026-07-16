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
      <div class="ice-line"><span class="mini-ice">🧊</span>
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
        <div class="ice-line"><span class="mini-ice">🧊</span>
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
      <div class="ice-line"><span class="mini-ice">🧊</span><p>${q.intro}</p></div>
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
          <div class="ice-line"><span class="mini-ice">🧊</span><p>${q.reply[v - 1]}</p></div>`;
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
    <div class="ice-line"><span class="mini-ice">🧊</span><p>${verdict}</p></div>
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

/* ---------- 냉장고 꾸미기 (추후 기능) ---------- */
$('#decor-fab').addEventListener('click', () => {
  showToast('🎨 냉장고 꾸미기는 준비 중이야! 조금만 기다려줘');
  say('여기 곧 예쁘게 꾸밀 수 있대. 기대돼!', 3000);
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
