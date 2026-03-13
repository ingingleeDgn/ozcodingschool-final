import { store } from './store.js';

/**
 * Safe-to-Spend 계산 함수
 * Safe-to-Spend = 잔액 + 예상 수입 - 예정 지출 - 안전 버퍼
 */
export function calculateSafeToSpend(criteriaOverride = null) {
  const user = store.get('user') || { balance: 0 };
  const criteria = criteriaOverride || store.get('criteria') || {};
  
  let income = parseInt(criteria.income) || 0;
  let expense = parseInt(criteria.expense) || 0;
  let buffer = parseInt(criteria.buffer) || 0;
  
  // 텍스트로 입력된 추가 수입/지출 처리 가능하도록(현재는 기본 0)
  let extraIncome = parseInt(criteria.extraIncome) || 0;
  let extraExpense = parseInt(criteria.extraExpense) || 0;
  
  let balance = parseInt(user.balance) || 1500000;

  // "앞으로 들어올 돈/나갈 돈" 수준(라디오) 보정 (조금 덜: 90%, 조금 더: 110%)
  if (criteria.incomeType === 'less') income = income * 0.9;
  if (criteria.incomeType === 'more') income = income * 1.1;

  if (criteria.expenseType === 'less') expense = expense * 0.9;
  if (criteria.expenseType === 'more') expense = expense * 1.1;

  // 1. 전체 가용 자산 계산
  let totalSafeToSpend = balance + income + extraIncome - expense - extraExpense - buffer;
  
  // 2. 남은 기간 일수(days) 계산
  let daysRemaining = 1;
  const today = new Date();
  
  if (criteria.period === 'this_month') {
    // 이번 달 말일까지
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    daysRemaining = lastDayOfMonth.getDate() - today.getDate() + 1;
  } else if (criteria.period === 'next_payday') {
    // 임의 급여일 25일 기준
    let payDay = new Date(today.getFullYear(), today.getMonth(), 25);
    if (today > payDay) {
        payDay = new Date(today.getFullYear(), today.getMonth() + 1, 25);
    }
    daysRemaining = Math.max(1, Math.ceil((payDay - today) / (1000 * 60 * 60 * 24)));
  } else if (criteria.period === 'next_2_weeks') {
    daysRemaining = 14;
  } else {
    daysRemaining = 1; // 기본 혹은 직접입력
  }

  // 3. 일별 사용 가능 금액 도출
  let dailySafeToSpend = totalSafeToSpend / daysRemaining;
  let finalAmount = Math.max(0, Math.floor(dailySafeToSpend));
  
  return {
    amount: finalAmount,
    details: {
      balance,
      income: income + extraIncome,
      expense: expense + extraExpense,
      buffer,
      daysRemaining,
      totalSafeToSpend
    }
  };
}

/**
 * 계산 결과를 history에 저장
 */
export function saveHistoryRecord() {
  const result = calculateSafeToSpend();
  const criteria = store.get('criteria');
  const history = store.get('history') || [];
  
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 오늘 날짜의 기록이 이미 있으면 덮어쓰기
  const existingIndex = history.findIndex(h => h.date === todayStr);
  const record = {
    date: todayStr,
    safeToSpend: result.amount,
    criteria: criteria
  };
  
  if (existingIndex >= 0) {
    history[existingIndex] = record;
  } else {
    history.push(record);
  }
  
  store.set('history', history);
  return result;
}

/**
 * 화폐 포맷 변환 (예: ₩38,000)
 */
export function formatCurrency(amount) {
  return '₩' + Math.floor(amount).toLocaleString('ko-KR');
}
