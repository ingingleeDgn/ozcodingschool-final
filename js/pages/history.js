import { fetchHtmlAsText } from '../utils.js';
import { store } from '../store.js';

let currentDate = new Date(); // 현재 보고 있는 달력 기준 월

export async function renderHistory(container) {
  const html = await fetchHtmlAsText('pages/history.html');
  container.innerHTML = html;

  currentDate = new Date(); // 진입 시 현재 날짜(이번 달) 기준으로 초기화

  bindEvents();
  renderCalendar();
  renderLogs();
}

function bindEvents() {
  document.getElementById('btn-prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('btn-next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const container = document.getElementById('calendar-container');
  const monthText = document.getElementById('current-month');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  monthText.textContent = `${month + 1}월 ${year}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0(Sun) ~ 6(Sat)
  const totalDays = lastDayOfMonth.getDate();

  let html = `
    <div class="calendar-grid calendar-header">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div class="calendar-grid">
  `;

  // 빈 칸 추가
  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div class="calendar-day-wrapper"><div class="calendar-day empty"></div></div>`;
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= totalDays; d++) {
    let classes = 'calendar-day';
    if (isCurrentMonth && d === today.getDate()) {
      classes += ' today';
    }

    html += `
      <div class="calendar-day-wrapper">
        <div class="${classes}" data-day="${d}">${d}</div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  // 일자 클릭 이벤트 바인딩
  const days = container.querySelectorAll('.calendar-day:not(.empty)');
  days.forEach(dayEl => {
    dayEl.addEventListener('click', () => {
      // 선택 클래스 초기화
      days.forEach(d => d.classList.remove('selected'));
      dayEl.classList.add('selected');
    });
  });

  // 오늘이 이번 달이면 오늘 날짜 선택 시뮬레이션
  if (isCurrentMonth) {
    const todayEl = container.querySelector(`.calendar-day[data-day="${today.getDate()}"]`);
    if (todayEl) todayEl.classList.add('selected');
  }
}

function renderLogs() {
  const logContainer = document.getElementById('history-log-list');
  const historyData = store.get('history') || [];
  
  if (historyData.length === 0) {
    logContainer.innerHTML = '<p class="text-sub text-secondary" style="padding: 16px 0;">아직 기준 조정 기록이 없습니다.</p>';
    return;
  }
  
  let html = '';
  // 최근 기록부터 노출
  const reversed = [...historyData].reverse();
  
  reversed.forEach(record => {
    const [yy, mm, dd] = record.date.split('-');
    const dateText = `${parseInt(mm)}월 ${parseInt(dd)}일`;
    
    // 이 예시에서는 단순 로깅을 위해 period 변경점 가정
    const periodMap = {
      'this_month': '이번 달',
      'next_payday': '다음 급여일',
      'next_2_weeks': '다음 2주',
      'custom': '직접 입력'
    };
    const periodName = periodMap[record.criteria?.period] || '지정 기간';
    
    html += `
      <div class="log-item">
        <span class="log-date">${dateText}</span>
        <span class="log-content">기준 기간 <span class="log-highlight">→ ${periodName} (으)로 설정</span></span>
      </div>
    `;
  });
  
  logContainer.innerHTML = html;
}
