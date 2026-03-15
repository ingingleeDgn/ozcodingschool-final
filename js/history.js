// js/history.js

document.addEventListener('DOMContentLoaded', () => {
  const state = AppState.getState();
  const historyList = document.querySelector('.history-log');

  if (!historyList) return;

  function renderCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    const monthEl = document.getElementById('calendar-month');
    const daysEl = document.getElementById('calendar-days');
    
    if(!monthEl || !daysEl) return;
    monthEl.textContent = `${currentYear}년 ${currentMonth + 1}월`;

    // Process history logs dates to sets
    const logDatesInMonth = new Set();
    if (state.history) {
      state.history.forEach(log => {
        // Log dates are assumed like `3월 15일`
        const match = log.date.match(/(\d+)월\s+(\d+)일/);
        if (match) {
          const m = parseInt(match[1], 10) - 1; // 0 ind
          const d = parseInt(match[2], 10);
          if (m === currentMonth) {
            logDatesInMonth.add(d);
          }
        }
      });
    }

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevLastDate = new Date(currentYear, currentMonth, 0).getDate();

    let daysHtml = '';
    
    // Prev month days
    for (let i = firstDayIndex; i > 0; i--) {
      daysHtml += `<span class="muted">${prevLastDate - i + 1}</span>`;
    }
    
    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      let classes = [];
      if (i === currentDate) classes.push('today');
      if (logDatesInMonth.has(i)) classes.push('has-log');
      
      const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
      daysHtml += `<span${classAttr}>${i}</span>`;
    }
    
    // Next month days
    const nextDays = 42 - (firstDayIndex + lastDate);
    for (let i = 1; i <= nextDays; i++) {
      daysHtml += `<span class="muted">${i}</span>`;
    }

    daysEl.innerHTML = daysHtml;
  }

  renderCalendar();

  if (!state.history || state.history.length === 0) {
    historyList.innerHTML = `
      <div class="history-log__empty">
        <p>아직 저장된 기록이 없어요</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = '';
  
  state.history.forEach(log => {
    const logItem = document.createElement('div');
    logItem.className = 'history-log__item';
    
    logItem.innerHTML = `
      <div class="history-log__date">${log.date}</div>
      <div class="history-log__card card">
        <div class="history-log__type">${log.type}</div>
        <div class="history-log__change">
          <span class="history-log__old">${log.oldValue}</span>
          <span class="history-log__arrow">→</span>
          <span class="history-log__new">${log.newValue}</span>
        </div>
      </div>
    `;
    
    historyList.appendChild(logItem);
  });
});
