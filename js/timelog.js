/* ============================================
   빙글이 Binglee — 3시간 체크인 ⏱️
   3시간마다 "지금 뭐 하고 있어?"를 물어보고,
   선택한 활동으로 오늘의 V-log를 실시간 생성한다.
   선택하지 않은 시간대는 캘린더 스케줄(시간 있는 일정)로
   자동 채우고, 그것도 없으면 기본값으로 채운다.
   ============================================ */

/* 하루를 3시간 슬롯 6개로 나눈다 (00~06시는 수면으로 간주, 질문 없음) */
const TIME_SLOTS = [
  { start: 6, end: 9 },
  { start: 9, end: 12 },
  { start: 12, end: 15 },
  { start: 15, end: 18 },
  { start: 18, end: 21 },
  { start: 21, end: 24 },
];

/* 체크인 선택지: [ACT id, 표시 라벨] — ACT는 app.js의 활동 사전 */
const TIMELOG_CHOICES = [
  ['study', '📖 공부'],
  ['lecture', '🏫 수업'],
  ['hospital', '🏥 실습'],
  ['work', '💻 과제'],
  ['meeting', '🗣️ 스터디'],
  ['lunch', '🍱 식사'],
  ['coffee', '☕ 커피'],
  ['gym', '🏋️ 운동'],
  ['walk', '🌳 산책'],
  ['game', '🎮 게임'],
  ['music', '🎧 휴식'],
  ['sleep', '💤 잠'],
];

/* 캘린더 카테고리 → V-log 활동 매핑 */
const CAT_TO_ACT = {
  exam: 'study',
  practice: 'hospital',
  assignment: 'work',
  study: 'meeting',
  etc: 'book',
};

/* 체크인·스케줄 둘 다 없을 때 시간대별 기본 활동 */
const SLOT_FALLBACK = ['wake', 'study', 'lunch', 'study', 'book', 'music'];

function timelogKey() {
  return 'bingle_timelog_' + todayStr();
}

function loadTimelog() {
  return loadJSON(timelogKey(), {});
}

function saveTimelogEntry(slotIdx, actId) {
  const log = loadTimelog();
  log[slotIdx] = actId;
  localStorage.setItem(timelogKey(), JSON.stringify(log));
}

/* 현재 시각이 속한 슬롯 index (00~06시는 -1) */
function currentSlotIdx(hour = new Date().getHours()) {
  return TIME_SLOTS.findIndex((s) => hour >= s.start && hour < s.end);
}

function slotLabel(idx) {
  const s = TIME_SLOTS[idx];
  return `${s.start}시~${s.end}시`;
}

function choiceLabel(actId) {
  const found = TIMELOG_CHOICES.find(([id]) => id === actId);
  return found ? found[1] : actId;
}

/* 해당 슬롯에 걸리는 오늘 캘린더 일정 (시간 지정된 것만) */
function slotEvent(slotIdx) {
  if (typeof calState === 'undefined') return null;
  const s = TIME_SLOTS[slotIdx];
  return calState.events.find((e) => {
    if (e.date !== todayStr() || !e.time) return false;
    const h = Number(e.time.slice(0, 2));
    return h >= s.start && h < s.end;
  }) || null;
}

/* ---------- 내 V-log 생성 (app.js의 personVlog가 호출) ----------
   지나갔거나 진행 중인 슬롯을 채워 세그먼트 배열로 반환 */
function buildMyVlog() {
  const log = loadTimelog();
  const h = new Date().getHours();
  // 새벽(6시 전)이면 첫 슬롯 하나만, 그 외엔 현재 슬롯까지
  const lastIdx = h < 6 ? 0 : currentSlotIdx(Math.min(h, 23));
  const segs = [];

  for (let i = 0; i <= lastIdx; i++) {
    const t = String(TIME_SLOTS[i].start).padStart(2, '0') + ':00';
    if (log[i]) {
      // 1순위: 직접 체크인한 활동
      segs.push({ t, act: log[i], label: `${choiceLabel(log[i])} · 직접 기록` });
    } else {
      const ev = slotEvent(i);
      if (ev) {
        // 2순위: 캘린더 스케줄로 자동 채움
        segs.push({ t, act: CAT_TO_ACT[ev.cat] || 'study', label: `${ev.title} · 캘린더 자동` });
      } else {
        // 3순위: 시간대 기본값
        segs.push({ t, act: SLOT_FALLBACK[i], label: '자동 채움' });
      }
    }
  }
  return segs;
}

/* ---------- 체크인 질문 모달 ---------- */
const timelogModal = $('#timelog-modal');
const timelogBody = $('#timelog-body');

function dismissKey(idx) {
  return `timelog_dismiss_${todayStr()}_${idx}`;
}

function renderTimelogModal(idx) {
  const log = loadTimelog();
  const current = log[idx];

  timelogBody.innerHTML = `
    <div class="ice-line">
      <img class="sprite sm mini-ice-sprite" src="assets/binglee/standing.png" alt="빙글이" draggable="false" />
      <p>${slotLabel(idx)}, 지금 뭐 하고 있어?\n골라주면 오늘의 V-log에 기록해 둘게! 🎬</p>
    </div>
    <div class="timelog-grid">
      ${TIMELOG_CHOICES.map(([id, label]) => `
        <button class="timelog-choice ${current === id ? 'selected' : ''}" data-act="${id}">${label}</button>
      `).join('')}
    </div>
    <button class="timelog-later" id="timelog-later">나중에 할게</button>`;

  timelogBody.querySelectorAll('.timelog-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      saveTimelogEntry(idx, btn.dataset.act);
      closeModal(timelogModal);
      showToast(`🎬 ${slotLabel(idx)} = ${choiceLabel(btn.dataset.act)} 기록 완료!`);
      if (typeof say === 'function') say('오케이, V-log에 적어 뒀어! 🎬', 2600);
    });
  });

  $('#timelog-later').addEventListener('click', () => {
    sessionStorage.setItem(dismissKey(idx), '1');
    closeModal(timelogModal);
    showToast('⏰ 알겠어, 다음 시간대에 다시 물어볼게');
  });
}

/* 현재 슬롯이 미기록이면 질문 (force = 수동으로 열기) */
function maybeAskTimelog(force = false) {
  const idx = currentSlotIdx();
  if (idx < 0) return; // 새벽엔 묻지 않는다
  if (!force) {
    if (loadTimelog()[idx] !== undefined) return;              // 이미 기록함
    if (sessionStorage.getItem(dismissKey(idx))) return;       // 이번 슬롯은 나중에
    if (!timelogModal.classList.contains('hidden')) return;    // 이미 열려 있음
  }
  renderTimelogModal(idx);
  openModal(timelogModal);
}

/* ---------- 이벤트 연결 ---------- */
$('#timelog-close').addEventListener('click', () => {
  const idx = currentSlotIdx();
  if (idx >= 0) sessionStorage.setItem(dismissKey(idx), '1');
  closeModal(timelogModal);
});

timelogModal.addEventListener('click', (e) => {
  if (e.target === timelogModal) closeModal(timelogModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal(timelogModal);
});

// 앱을 켜고 잠시 뒤 이번 시간대 질문, 이후 1분마다 새 슬롯 진입을 감지
setTimeout(() => maybeAskTimelog(), 2500);
setInterval(() => maybeAskTimelog(), 60000);
