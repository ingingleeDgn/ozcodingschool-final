// js/app-state.js

const AppState = (function() {
  const STORAGE_KEY = 'witin_prototype_state';

  const defaultState = {
    linkedData: {
      incomes: [
        { id: 'i1', name: '월급', amount: 2300000, date: 25, isRepeat: true }
      ],
      expenses: [
        { id: 'e1', name: '월세', amount: 500000, date: 1, isRepeat: true },
        { id: 'e2', name: '보험금', amount: 150000, date: 15, isRepeat: true },
        { id: 'e3', name: '카드값 (현대)', amount: 650000, date: 14, isRepeat: true },
        { id: 'e4', name: '통신비', amount: 100000, date: 20, isRepeat: true },
        { id: 'e5', name: '정기구독', amount: 100000, date: 5, isRepeat: true }
      ],
      accounts: [
        { id: 'a1', name: '국민은행', balance: 1450000 },
        { id: 'a2', name: '신한은행', balance: 320000 }
      ],
      cards: [
        { id: 'c1', name: '현대카드' },
        { id: 'c2', name: '삼성카드' }
      ],
      scheduleRules: {
        payday: 25
      },
      lastSyncedAt: new Date().toISOString()
    },
    criteria: {
      periodType: '30days',
      incomeAdjustment: 'normal',
      expenseAdjustment: 'normal',
      bufferLevel: 'normal',
      extraIncome: 0,
      extraExpense: 0
    },
    history: [
      {
        date: '1월 12일',
        type: '앞으로 나갈 돈',
        oldValue: '1,200,000',
        newValue: '1,500,000',
      },
      {
        date: '1월 8일',
        type: '기준 기간',
        oldValue: '다음 2주',
        newValue: '30일',
      },
      {
        date: '1월 2일',
        type: '여유 기준',
        oldValue: '조금 덜',
        newValue: '평소 수준',
      }
    ],
    resultCache: null
  };

  function getState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure backward compatibility or structure fixes if needed
        if(!parsed.linkedData || !parsed.linkedData.incomes) {
             return { ...defaultState };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse state', e);
        return { ...defaultState };
      }
    }
    return { ...defaultState };
  }

  function getComputedState() {
    const state = getState();
    // Use the central calculateDailySpendable function
    const result = Calculator.calculateDailySpendable(state.linkedData, state.criteria);
    state.computed = result;
    return state;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateCriteria(newCriteria, historyLog) {
    const state = getState();
    state.criteria = { ...state.criteria, ...newCriteria };
    if (historyLog) {
      const today = new Date();
      const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;
      state.history.unshift({
        date: dateStr,
        type: historyLog.type,
        oldValue: historyLog.oldValue,
        newValue: historyLog.newValue
      });
    }
    // clear cache when criteria changes
    state.resultCache = null;
    saveState(state);
  }
  
  function resetState() {
      localStorage.removeItem(STORAGE_KEY);
      saveState(defaultState);
  }

  function clearHistory() {
      const state = getState();
      state.history = [];
      saveState(state);
  }

  function updateLinkedData(newLinkedData, historyLogs = []) {
    const state = getState();
    state.linkedData = { ...state.linkedData, ...newLinkedData };

    // 변경 로그 기록
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;
    
    if (historyLogs && historyLogs.length > 0) {
      historyLogs.forEach(log => {
        state.history.unshift({
          date: dateStr,
          type: log.type,
          oldValue: log.oldValue,
          newValue: log.newValue
        });
      });
    } else {
      state.history.unshift({
        date: dateStr,
        type: '데이터 동기화',
        oldValue: '-',
        newValue: '완료'
      });
    }

    state.resultCache = null;
    saveState(state);
  }

  // Initialize if empty
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveState(defaultState);
  }

  return {
    getState,
    getComputedState,
    saveState,
    updateCriteria,
    updateLinkedData,
    resetState,
    clearHistory
  };
})();
