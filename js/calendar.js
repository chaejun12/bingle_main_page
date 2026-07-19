/* ============================================
   빙글이 Binglee — 캘린더 🗓️
   의대생 맞춤 일정 관리
   시험 D-day · 실습 · 과제 · 스터디 + 강의 완료 기록
   ============================================ */

const CAL_CATS = [
  { id: 'exam',       label: '시험',   dot: '🔴' },
  { id: 'practice',   label: '실습',   dot: '🔵' },
  { id: 'assignment', label: '과제',   dot: '🟡' },
  { id: 'study',      label: '스터디', dot: '🟢' },
  { id: 'etc',        label: '기타',   dot: '⚪' },
];

const calState = {
  events: loadJSON('bingle_calendar_events', []), // {id, date:'YYYY-MM-DD', cat, title}
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-11
  selected: null,               // 'YYYY-MM-DD'
  addCat: 'exam',               // 추가 폼에서 선택된 카테고리
};

const calendarBody = $('#calendar-body');

function saveCalEvents() {
  localStorage.setItem('bingle_calendar_events', JSON.stringify(calState.events));
}

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function catOf(id) {
  return CAL_CATS.find((c) => c.id === id) || CAL_CATS[4];
}

function eventsOn(key) {
  return calState.events.filter((e) => e.date === key);
}

/* 기초 강의를 완료한 날짜들 (시작일 + Day번호로 환산) */
function lectureDoneDates() {
  if (typeof lectureState === 'undefined' || !lectureState.startDate) return new Set();
  const start = new Date(lectureState.startDate + 'T00:00:00');
  return new Set(lectureState.doneDays.map((day) => {
    const d = new Date(start.getTime() + (day - 1) * 86400000);
    return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
  }));
}

/* D-day 계산: 오늘 기준 남은 일수 (오늘=0) */
function daysUntil(key) {
  const now = new Date(todayStr() + 'T00:00:00');
  const target = new Date(key + 'T00:00:00');
  return Math.round((target - now) / 86400000);
}

function ddayLabel(n) {
  return n === 0 ? 'D-Day' : n > 0 ? `D-${n}` : `D+${-n}`;
}

/* ---------- 렌더링 ---------- */
function upcomingHTML() {
  const upcoming = calState.events
    .map((e) => ({ ...e, left: daysUntil(e.date) }))
    .filter((e) => e.left >= 0 && e.left <= 60)
    .sort((a, b) => a.left - b.left)
    .slice(0, 4);

  $('#calendar-upcoming-count').textContent = upcoming.length;

  if (!upcoming.length) {
    return `
      <div class="ice-line cal-intro">
        <img class="sprite sm mini-ice-sprite" src="assets/binglee/sitting.png" alt="빙글이" draggable="false" />
        <p>다가오는 일정이 없네!\n날짜를 눌러 시험·실습 일정을 추가해 봐.</p>
      </div>`;
  }
  return `
    <div class="cal-dday-row">
      ${upcoming.map((e) => `
        <button class="cal-dday ${e.cat} ${e.left <= 3 ? 'urgent' : ''}" data-goto="${e.date}">
          <span class="cd-count">${ddayLabel(e.left)}</span>
          <span class="cd-title">${catOf(e.cat).dot} ${e.title}</span>
          <span class="cd-date">${Number(e.date.slice(5, 7))}/${Number(e.date.slice(8, 10))}</span>
        </button>`).join('')}
    </div>`;
}

function gridHTML() {
  const y = calState.year;
  const m = calState.month;
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = todayStr();
  const doneDates = lectureDoneDates();

  let cells = '';
  for (let i = 0; i < firstDow; i++) cells += '<span class="cal-cell empty"></span>';
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(y, m, d);
    const evts = eventsOn(key);
    const dots = evts.slice(0, 3).map((e) => catOf(e.cat).dot).join('');
    const dow = (firstDow + d - 1) % 7;
    cells += `
      <button class="cal-cell day ${key === today ? 'today' : ''} ${key === calState.selected ? 'selected' : ''} ${dow === 0 ? 'sun' : ''} ${dow === 6 ? 'sat' : ''}"
        data-date="${key}">
        <span class="cal-num">${d}</span>
        <span class="cal-marks">${doneDates.has(key) ? '📚' : ''}${dots}</span>
      </button>`;
  }

  return `
    <div class="cal-card">
      <div class="cal-month-nav">
        <button class="lec-arrow" id="cal-prev">◀</button>
        <p class="cal-month-title">${y}년 ${m + 1}월</p>
        <button class="lec-arrow" id="cal-next">▶</button>
      </div>
      <div class="cal-grid cal-week-head">
        ${['일', '월', '화', '수', '목', '금', '토'].map((w, i) =>
          `<span class="cal-cell head ${i === 0 ? 'sun' : ''} ${i === 6 ? 'sat' : ''}">${w}</span>`).join('')}
      </div>
      <div class="cal-grid">${cells}</div>
      <p class="cal-legend">📚 강의 완료 ${CAL_CATS.map((c) => `${c.dot} ${c.label}`).join(' ')}</p>
    </div>`;
}

function dayPanelHTML() {
  if (!calState.selected) {
    return `<p class="cal-hint">날짜를 누르면 일정을 보고 추가할 수 있어 👆</p>`;
  }
  const key = calState.selected;
  const evts = eventsOn(key);
  const left = daysUntil(key);
  const [yy, mm, dd] = key.split('-').map(Number);
  const dowName = ['일', '월', '화', '수', '목', '금', '토'][new Date(key + 'T00:00:00').getDay()];

  return `
    <div class="cal-card cal-day-panel">
      <div class="cal-day-head">
        <p class="cal-day-title">${mm}월 ${dd}일 (${dowName})</p>
        ${left >= 0 ? `<span class="cal-day-dday">${ddayLabel(left)}</span>` : ''}
      </div>

      ${evts.length ? `
        <ul class="cal-event-list">
          ${evts.map((e) => `
            <li class="cal-event">
              <span class="ce-dot">${catOf(e.cat).dot}</span>
              <span class="ce-title">${e.title}</span>
              <span class="ce-cat">${catOf(e.cat).label}</span>
              <button class="ce-del" data-del="${e.id}" aria-label="일정 삭제">✕</button>
            </li>`).join('')}
        </ul>` : `<p class="cal-hint">이 날은 일정이 없어.</p>`}

      <div class="cal-add">
        <div class="cal-cat-row">
          ${CAL_CATS.map((c) => `
            <button class="cal-cat-chip ${calState.addCat === c.id ? 'selected' : ''}" data-cat="${c.id}">
              ${c.dot} ${c.label}
            </button>`).join('')}
        </div>
        <form class="cal-add-form" id="cal-add-form">
          <input type="text" id="cal-add-title" maxlength="24"
            placeholder="${catOf(calState.addCat).label} 이름 (예: 해부학 중간)" autocomplete="off" />
          <button type="submit">추가</button>
        </form>
      </div>
    </div>`;
}

function renderCalendar() {
  calendarBody.innerHTML = upcomingHTML() + gridHTML() + dayPanelHTML();

  $('#cal-prev').addEventListener('click', () => {
    calState.month -= 1;
    if (calState.month < 0) { calState.month = 11; calState.year -= 1; }
    renderCalendar();
  });
  $('#cal-next').addEventListener('click', () => {
    calState.month += 1;
    if (calState.month > 11) { calState.month = 0; calState.year += 1; }
    renderCalendar();
  });

  calendarBody.querySelectorAll('.cal-cell.day').forEach((cell) => {
    cell.addEventListener('click', () => {
      calState.selected = cell.dataset.date;
      renderCalendar();
    });
  });

  // D-day 칩 → 해당 날짜로 이동
  calendarBody.querySelectorAll('[data-goto]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.goto;
      calState.year = Number(key.slice(0, 4));
      calState.month = Number(key.slice(5, 7)) - 1;
      calState.selected = key;
      renderCalendar();
    });
  });

  calendarBody.querySelectorAll('.cal-cat-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      calState.addCat = chip.dataset.cat;
      renderCalendar();
      $('#cal-add-title')?.focus();
    });
  });

  calendarBody.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      calState.events = calState.events.filter((e) => e.id !== btn.dataset.del);
      saveCalEvents();
      renderCalendar();
      showToast('🗑️ 일정을 지웠어');
    });
  });

  const form = $('#cal-add-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#cal-add-title').value.trim();
      if (!title || !calState.selected) return;
      calState.events.push({
        id: 'ev' + Date.now(),
        date: calState.selected,
        cat: calState.addCat,
        title,
      });
      saveCalEvents();
      renderCalendar();
      showToast(`${catOf(calState.addCat).dot} '${title}' 일정을 추가했어!`);
    });
  }
}
