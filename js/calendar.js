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
  events: loadJSON('bingle_calendar_events', []), // {id, date:'YYYY-MM-DD', cat, title, time?:'HH:MM', timeEnd?:'HH:MM'}
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-11
  selected: null,               // 'YYYY-MM-DD' (renderCalendar 최초 호출 시 오늘로 설정)
  weekAnchor: null,             // 주 단위 뷰가 보여줄 주의 기준 날짜
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
  // 시간 있는 일정 먼저, 시간순 정렬
  return calState.events
    .filter((e) => e.date === key)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
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
    // 원 미리보기는 3개까지, 넘치면 +n — 자세한 목록은 아래 주 단위 뷰에서
    const dots = evts.slice(0, 3).map((e) => catOf(e.cat).dot).join('');
    const more = evts.length > 3 ? `<i class="cal-more">+${evts.length - 3}</i>` : '';
    const dow = (firstDow + d - 1) % 7;
    cells += `
      <button class="cal-cell day ${key === today ? 'today' : ''} ${key === calState.selected ? 'selected' : ''} ${dow === 0 ? 'sun' : ''} ${dow === 6 ? 'sat' : ''}"
        data-date="${key}">
        <span class="cal-num">${d}</span>
        <span class="cal-marks">${doneDates.has(key) ? '📚' : ''}${dots}${more}</span>
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

/* ---------- 주 단위 확대 뷰 ----------
   월 캘린더의 원 미리보기(최대 3개) 한계를 보완:
   선택한 주의 7일을 행으로 펼쳐 모든 일정을 칩으로 보여준다 */
function sundayOf(key) {
  const d = new Date(key + 'T00:00:00');
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function keyOfDate(d) {
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

function weekHTML() {
  const start = sundayOf(calState.weekAnchor);
  const end = new Date(start.getTime() + 6 * 86400000);
  const today = todayStr();
  const doneDates = lectureDoneDates();
  const dowNames = ['일', '월', '화', '수', '목', '금', '토'];

  const rows = [...Array(7)].map((_, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    const key = keyOfDate(d);
    const evts = eventsOn(key);
    return `
      <button class="wk-row ${key === today ? 'today' : ''} ${key === calState.selected ? 'selected' : ''}"
        data-wkday="${key}">
        <span class="wk-date ${i === 0 ? 'sun' : ''} ${i === 6 ? 'sat' : ''}">
          <b>${d.getDate()}</b>
          <small>${dowNames[i]}</small>
          ${doneDates.has(key) ? '<em>📚</em>' : ''}
        </span>
        <span class="wk-events">
          ${evts.length
            ? evts.map((e) => `
                <span class="wk-chip ${e.cat}">
                  ${catOf(e.cat).dot} ${e.title}${e.time ? `<i>${e.time}${e.timeEnd ? `~${e.timeEnd}` : ''}</i>` : ''}
                </span>`).join('')
            : '<span class="wk-empty">일정 없음</span>'}
        </span>
      </button>`;
  }).join('');

  return `
    <div class="cal-card cal-week-card">
      <div class="cal-month-nav">
        <button class="lec-arrow" id="wk-prev">◀</button>
        <p class="cal-month-title wk-title">📋 주간 상세
          <small>${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}</small>
        </p>
        <button class="lec-arrow" id="wk-next">▶</button>
      </div>
      <div class="wk-list">${rows}</div>
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
              ${e.time ? `<span class="ce-time">⏰ ${e.time}${e.timeEnd ? `~${e.timeEnd}` : ''}</span>` : ''}
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
        <div class="cal-time-row">
          <label>⏰ 시작 <input type="time" id="cal-add-time" title="시작 시간 (선택)" /></label>
          <span class="cal-time-tilde">~</span>
          <label>끝 <input type="time" id="cal-add-time-end" title="끝 시간 (선택)" /></label>
        </div>
        <p class="cal-hint cal-time-hint">시간을 넣으면 그 시간대 V-log가 이 일정으로 자동 기록돼!</p>
      </div>
    </div>`;
}

function renderCalendar() {
  // 최초 진입 시 오늘을 선택해 주간 뷰·상세 패널이 바로 보이게
  if (!calState.selected) calState.selected = todayStr();
  if (!calState.weekAnchor) calState.weekAnchor = calState.selected;

  calendarBody.innerHTML = upcomingHTML() + gridHTML() + weekHTML() + dayPanelHTML();

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
      calState.weekAnchor = cell.dataset.date; // 주간 뷰도 그 주로 점프
      renderCalendar();
    });
  });

  // 주간 뷰: 주 이동
  const shiftWeek = (days) => {
    const d = sundayOf(calState.weekAnchor);
    d.setDate(d.getDate() + days);
    calState.weekAnchor = keyOfDate(d);
    renderCalendar();
  };
  $('#wk-prev').addEventListener('click', () => shiftWeek(-7));
  $('#wk-next').addEventListener('click', () => shiftWeek(7));

  // 주간 뷰: 날짜 행 클릭 → 선택 + 월 캘린더도 그 달로 동기화
  calendarBody.querySelectorAll('.wk-row').forEach((row) => {
    row.addEventListener('click', () => {
      const key = row.dataset.wkday;
      calState.selected = key;
      calState.year = Number(key.slice(0, 4));
      calState.month = Number(key.slice(5, 7)) - 1;
      renderCalendar();
    });
  });

  // D-day 칩 → 해당 날짜로 이동 (월·주 모두 동기화)
  calendarBody.querySelectorAll('[data-goto]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.goto;
      calState.year = Number(key.slice(0, 4));
      calState.month = Number(key.slice(5, 7)) - 1;
      calState.selected = key;
      calState.weekAnchor = key;
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
      let time = $('#cal-add-time').value || '';
      let timeEnd = $('#cal-add-time-end').value || '';
      // 끝 시간만 넣었으면 시작으로 취급, 순서가 뒤집혔으면 교환
      if (!time && timeEnd) { time = timeEnd; timeEnd = ''; }
      if (time && timeEnd && timeEnd < time) [time, timeEnd] = [timeEnd, time];
      calState.events.push({
        id: 'ev' + Date.now(),
        date: calState.selected,
        cat: calState.addCat,
        title,
        time,
        timeEnd,
      });
      saveCalEvents();
      renderCalendar();
      const timeStr = time ? ` (${time}${timeEnd ? `~${timeEnd}` : ''})` : '';
      showToast(`${catOf(calState.addCat).dot} '${title}'${timeStr} 일정을 추가했어!`);
    });
  }
}
