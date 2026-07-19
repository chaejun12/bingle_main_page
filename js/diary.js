/* ============================================
   빙글이 Binglee — 한 줄 일기 📔
   매일 짧게 좋았던 일 · 감사한 일 · 오늘 한 일을 기록
   우상단 📔 버튼으로 진입하는 전용 페이지
   ============================================ */

const DIARY_TAGS = [
  { id: 'good',   emoji: '😊', label: '좋았던 일' },
  { id: 'thanks', emoji: '🙏', label: '감사한 일' },
  { id: 'did',    emoji: '✏️', label: '오늘 한 일' },
];

const DIARY_REWARD = 10; // 하루 첫 기록 보상 ❄️

const diaryState = {
  entries: loadJSON('bingle_diary', []), // {id, date:'YYYY-MM-DD', tag, text, at}
  selTag: 'good',
};

const diaryBody = $('#diary-body');
const diaryFab = $('#diary-fab');

function saveDiary() {
  localStorage.setItem('bingle_diary', JSON.stringify(diaryState.entries));
}

function diaryTag(id) {
  return DIARY_TAGS.find((t) => t.id === id) || DIARY_TAGS[0];
}

function todayEntries() {
  return diaryState.entries.filter((e) => e.date === todayStr());
}

function renderDiaryFab() {
  const n = todayEntries().length;
  $('#diary-fab-badge').textContent = n ? `${n}개` : '일기';
  diaryFab.classList.toggle('has-entry', n > 0);
}

/* 지난 기록: 날짜별 그룹 (최근 14일) */
function pastGroupsHTML() {
  const past = diaryState.entries
    .filter((e) => e.date !== todayStr())
    .sort((a, b) => b.at - a.at);
  if (!past.length) return '';

  const byDate = {};
  past.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  const dates = Object.keys(byDate).sort().reverse().slice(0, 14);

  return `
    <div class="diary-past">
      <p class="lec-section-title">🗂️ 지난 기록</p>
      ${dates.map((d) => {
        const [, mm, dd] = d.split('-').map(Number);
        const dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(d + 'T00:00:00').getDay()];
        return `
          <div class="diary-day-group">
            <p class="diary-day-label">${mm}월 ${dd}일 (${dow})</p>
            <ul class="diary-list">
              ${byDate[d].map((e) => `
                <li class="diary-entry">
                  <span class="de-tag">${diaryTag(e.tag).emoji}</span>
                  <span class="de-text">${e.text}</span>
                </li>`).join('')}
            </ul>
          </div>`;
      }).join('')}
    </div>`;
}

function renderDiary() {
  const today = todayEntries().sort((a, b) => b.at - a.at);
  $('#diary-sub').textContent = `${new Date().getMonth() + 1}월 ${new Date().getDate()}일 · ${today.length ? `오늘 ${today.length}개 기록` : '오늘의 기록'}`;

  diaryBody.innerHTML = `
    <div class="ice-line diary-intro">
      <img class="sprite sm mini-ice-sprite" src="assets/binglee/sitting.png" alt="빙글이" draggable="false" />
      <p>${today.length
        ? '오늘의 기록이 쌓이고 있어! 더 적어도 좋아.'
        : '오늘 있었던 좋은 일, 감사했던 일을\n한 줄이면 충분하니까 적어봐!'}</p>
    </div>

    <div class="diary-write">
      <div class="diary-tag-row">
        ${DIARY_TAGS.map((t) => `
          <button class="diary-tag-chip ${diaryState.selTag === t.id ? 'selected' : ''}" data-tag="${t.id}">
            ${t.emoji} ${t.label}
          </button>`).join('')}
      </div>
      <form class="diary-form" id="diary-form">
        <input type="text" id="diary-input" maxlength="60"
          placeholder="${diaryTag(diaryState.selTag).label} 한 줄 (예: 실습 발표 잘 끝냄!)" autocomplete="off" />
        <button type="submit">기록</button>
      </form>
      ${today.length ? '' : `<p class="cal-hint cal-time-hint">오늘 첫 기록엔 ❄️ ${DIARY_REWARD}개를 줄게!</p>`}
    </div>

    ${today.length ? `
      <div class="lec-section diary-today">
        <p class="lec-section-title">📌 오늘</p>
        <ul class="diary-list">
          ${today.map((e) => `
            <li class="diary-entry">
              <span class="de-tag">${diaryTag(e.tag).emoji}</span>
              <span class="de-text">${e.text}</span>
              <button class="de-del" data-del="${e.id}" aria-label="기록 삭제">✕</button>
            </li>`).join('')}
        </ul>
      </div>` : ''}

    ${pastGroupsHTML()}`;

  diaryBody.querySelectorAll('.diary-tag-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      diaryState.selTag = chip.dataset.tag;
      renderDiary();
      $('#diary-input').focus();
    });
  });

  diaryBody.querySelectorAll('.de-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      diaryState.entries = diaryState.entries.filter((e) => e.id !== btn.dataset.del);
      saveDiary();
      renderDiary();
      renderDiaryFab();
      showToast('🗑️ 기록을 지웠어');
    });
  });

  $('#diary-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('#diary-input').value.trim();
    if (!text) return;
    const isFirstToday = todayEntries().length === 0;
    diaryState.entries.push({
      id: 'd' + Date.now(),
      date: todayStr(),
      tag: diaryState.selTag,
      text,
      at: Date.now(),
    });
    saveDiary();
    if (isFirstToday) {
      addCoins(DIARY_REWARD);
      showToast(`📔 오늘 첫 기록! ❄️ +${DIARY_REWARD}`);
      if (typeof say === 'function') say('좋은 하루의 증거가 하나 생겼네! 📔', 3000);
    } else {
      showToast('📔 기록했어!');
    }
    renderDiary();
    renderDiaryFab();
    $('#diary-input')?.focus();
  });
}

/* ---------- 이벤트 연결 ---------- */
diaryFab.addEventListener('click', () => switchView('diary'));
$('#diary-back').addEventListener('click', () => switchView('home'));

renderDiaryFab();
