// js/data-connections.js
document.addEventListener('DOMContentLoaded', () => {
  const state = AppState.getState();
  
  // Clone local linkedData so we don't mutate state until applied
  let localData = JSON.parse(JSON.stringify(state.linkedData || {}));
  // Fallbacks if missing
  if (!localData.incomes) localData.incomes = [];
  if (!localData.expenses) localData.expenses = [];
  if (!localData.scheduleRules) localData.scheduleRules = { payday: 25 };
  if (!localData.scheduleRules.rent) localData.scheduleRules.rent = 1;
  if (!localData.scheduleRules.card) localData.scheduleRules.card = 14;
  if (!localData.scheduleRules.insurance) localData.scheduleRules.insurance = 15;

  const scheduleList = document.getElementById('schedule-list');
  const incomeList = document.getElementById('income-list');
  const expenseList = document.getElementById('expense-list');

  // Modal elements
  const modal = document.getElementById('edit-modal');
  const modalTitle = document.getElementById('modal-title');
  const inputName = document.getElementById('modal-input-name');
  const inputAmount = document.getElementById('modal-input-amount');
  const inputDate = document.getElementById('modal-input-date');
  const inputRepeat = document.getElementById('modal-input-repeat');
  
  const groupAmount = document.getElementById('modal-group-amount');
  const groupRepeat = document.getElementById('modal-group-repeat');
  
  const btnSave = document.getElementById('modal-btn-save');
  const btnCancel = document.getElementById('modal-btn-cancel');
  const btnDelete = document.getElementById('modal-btn-delete');
  
  // State for modal
  let currentEditMode = null; // 'schedule', 'income', 'expense'
  let currentEditIndex = -1; // -1 means new item
  let pendingLogs = [];      // Track changes
  let currentEditingItem = null; // Save original for diff
  
  function renderAll() {
    renderTopSummary();
    renderSchedule();
    renderIncome();
    renderExpense();
    renderBottomSummary();
  }

  function renderTopSummary() {
    document.getElementById('last-sync-time').textContent = '최근 동기화: ' + formatDateStr(localData.lastSyncedAt);
    document.getElementById('account-count').textContent = (localData.accounts ? localData.accounts.length : 0) + '개';
    document.getElementById('card-count').textContent = (localData.cards ? localData.cards.length : 0) + '개';
  }

  function formatDateStr(isoStr) {
    if(!isoStr) return '없음';
    const d = new Date(isoStr);
    return `${d.getMonth()+1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function renderBottomSummary() {
    // Dynamic recalculation of summary before apply
    const remDays = Calculator.calculateRemainingDays(state.criteria.targetPeriodType, localData);
    const sumInc = Calculator.calculatePeriodAmount(localData.incomes, remDays);
    const sumExp = Calculator.calculatePeriodAmount(localData.expenses, remDays);
    
    document.getElementById('summary-period').textContent = state.criteria.targetPeriodLabel || '-';
    document.getElementById('summary-days').textContent = remDays + '일';
    document.getElementById('summary-income').textContent = Calculator.formatCurrencyNoSymbol(sumInc) + '원';
    document.getElementById('summary-expense').textContent = Calculator.formatCurrencyNoSymbol(sumExp) + '원';
    
    let krLevel = '평소 수준';
    if(state.criteria.bufferLevel === 'tight') krLevel = '조금 덜';
    if(state.criteria.bufferLevel === 'relaxed') krLevel = '조금 더';
    document.getElementById('summary-buffer').textContent = krLevel;
  }

  function renderSchedule() {
    const schedules = [
      { key: 'payday', name: '급여일', desc: '기준이 되는 시작일', date: localData.scheduleRules.payday },
      { key: 'rent', name: '월세일', desc: '고정지출 기준일', date: localData.scheduleRules.rent },
      { key: 'card', name: '카드 결제일', desc: '주요 카드 대금 출금일', date: localData.scheduleRules.card },
      { key: 'insurance', name: '보험일', desc: '보험료 이체일', date: localData.scheduleRules.insurance }
    ];

    scheduleList.innerHTML = schedules.map(s => `
      <div class="data-item" data-type="schedule" data-key="${s.key}">
        <div class="data-item__info">
          <div class="data-item__name">${s.name}</div>
          <div class="data-item__meta">${s.desc}</div>
        </div>
        <div class="data-item__value data-item__value--expense">
          매월 ${s.date}일
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>
      </div>
    `).join('');

    scheduleList.querySelectorAll('.data-item').forEach((el, index) => {
      const s = schedules[index];
      el.addEventListener('click', () => {
        openModal('schedule', index, {
          key: s.key,
          name: s.name,
          date: s.date
        });
      });
    });
  }

  function renderIncome() {
    incomeList.innerHTML = '';
    localData.incomes.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'data-item';
      el.innerHTML = `
        <div class="data-item__info">
          <div class="data-item__name">${item.name}</div>
          <div class="data-item__meta">매월 ${item.date}일 ${item.isRepeat ? '(반복)' : ''}</div>
        </div>
        <div class="data-item__value">
          ${Calculator.formatCurrencyNoSymbol(item.amount)}원
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>
      `;
      el.addEventListener('click', () => openModal('income', index, item));
      incomeList.appendChild(el);
    });
  }

  function renderExpense() {
    expenseList.innerHTML = '';
    localData.expenses.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'data-item';
      el.innerHTML = `
        <div class="data-item__info">
          <div class="data-item__name">${item.name}</div>
          <div class="data-item__meta">매월 ${item.date}일 ${item.isRepeat ? '(반복)' : ''}</div>
        </div>
        <div class="data-item__value data-item__value--expense">
          ${Calculator.formatCurrencyNoSymbol(item.amount)}원
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>
      `;
      el.addEventListener('click', () => openModal('expense', index, item));
      expenseList.appendChild(el);
    });
  }

  function openModal(type, index, data) {
    currentEditMode = type;
    currentEditIndex = index;
    currentEditingItem = data ? JSON.parse(JSON.stringify(data)) : null;
    
    // Reset groups
    groupAmount.classList.remove('hidden');
    groupRepeat.classList.remove('hidden');
    btnDelete.classList.add('hidden');
    inputName.disabled = false;

    if (type === 'schedule') {
      modalTitle.textContent = '기준 일정 수정';
      groupAmount.classList.add('hidden');
      groupRepeat.classList.add('hidden');
      inputName.value = data.name;
      inputName.disabled = true;
      inputDate.value = data.date;
    } else {
      modalTitle.textContent = index === -1 ? (type === 'income' ? '수입 추가' : '지출 추가') : '항목 수정';
      inputName.value = data ? data.name : '';
      inputAmount.value = data ? data.amount : '';
      inputDate.value = data ? data.date : '';
      inputRepeat.checked = data ? data.isRepeat : true;

      if (index !== -1) {
        btnDelete.classList.remove('hidden');
      }
    }

    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  btnCancel.addEventListener('click', closeModal);

  btnSave.addEventListener('click', () => {
    const name = inputName.value.trim();
    const amount = parseInt(inputAmount.value, 10) || 0;
    const date = parseInt(inputDate.value, 10) || 1;
    const isRepeat = inputRepeat.checked;

    let logType = null;
    let oldVal = null;
    let newVal = null;

    if (currentEditMode === 'schedule') {
      const newPayday = Math.min(Math.max(date, 1), 31);
      if (currentEditingItem && currentEditingItem.date !== newPayday) {
        logType = currentEditingItem.name;
        oldVal = currentEditingItem.date + '일';
        newVal = newPayday + '일';
      }
      localData.scheduleRules[currentEditingItem.key] = newPayday;
    } else {
      const newItem = {
        id: (currentEditIndex === -1) ? 'new_' + Math.random().toString(36).substr(2, 9) : null,
        name: name || '이름 없음',
        amount: Math.max(amount, 0),
        date: Math.min(Math.max(date, 1), 31),
        isRepeat: isRepeat
      };

      const targetList = currentEditMode === 'income' ? localData.incomes : localData.expenses;
      
      if (currentEditIndex === -1) {
        logType = newItem.name;
        oldVal = '-';
        newVal = Calculator.formatCurrencyNoSymbol(newItem.amount) + '원 추가';
        targetList.push(newItem);
      } else {
        if (currentEditingItem && (currentEditingItem.amount !== newItem.amount || currentEditingItem.name !== newItem.name)) {
          logType = newItem.name;
          oldVal = Calculator.formatCurrencyNoSymbol(currentEditingItem.amount) + '원';
          newVal = Calculator.formatCurrencyNoSymbol(newItem.amount) + '원 변경';
        }
        newItem.id = targetList[currentEditIndex].id;
        targetList[currentEditIndex] = newItem;
      }
    }

    if (logType) {
      pendingLogs.push({ type: logType, oldValue: oldVal, newValue: newVal });
    }

    renderAll();
    closeModal();
  });

  btnDelete.addEventListener('click', () => {
    let item;
    if (currentEditMode === 'income') {
      item = localData.incomes[currentEditIndex];
      localData.incomes.splice(currentEditIndex, 1);
    } else if (currentEditMode === 'expense') {
      item = localData.expenses[currentEditIndex];
      localData.expenses.splice(currentEditIndex, 1);
    }
    if (item) {
      pendingLogs.push({
        type: item.name,
        oldValue: Calculator.formatCurrencyNoSymbol(item.amount) + '원',
        newValue: '삭제됨'
      });
    }
    renderAll();
    closeModal();
  });

  document.getElementById('btn-add-income').addEventListener('click', () => openModal('income', -1, null));
  document.getElementById('btn-add-expense').addEventListener('click', () => openModal('expense', -1, null));

  // Reset to default
  document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm('데이터를 초기화하시겠습니까?')) {
      AppState.resetState();
      window.location.reload();
    }
  });

  // Apply Changes
  document.getElementById('btn-apply').addEventListener('click', () => {
    if (pendingLogs.length === 0) {
      pendingLogs.push({ type: '데이터 연결', oldValue: '-', newValue: '저장 완료' });
    }
    AppState.updateLinkedData(localData, pendingLogs);
    pendingLogs = [];
    alert('데이터 연동 및 계산이 완료되었습니다.');
    window.location.href = 'index.html';
  });

  // Init
  renderAll();
});
