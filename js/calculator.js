// js/calculator.js

const Calculator = {
  calculateDailySpendable: (linkedData, criteria) => {
    let remainingDays = 0;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    // 1. Calculate Remaining Days
    if (criteria.periodType === '30days') {
       const periodEnd = new Date(year, month, date + 30);
       const diffTime = periodEnd.getTime() - today.getTime();
       remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (criteria.periodType === 'next-2-weeks') {
       remainingDays = 14;
    } else if (criteria.periodType === 'this-month') {
       const lastDay = new Date(year, month + 1, 0).getDate();
       remainingDays = Math.max(1, lastDay - date);
    } else if (criteria.periodType === 'next-payday') {
       const payday = (linkedData && linkedData.scheduleRules && linkedData.scheduleRules.payday) ? linkedData.scheduleRules.payday : 25;
       if (date < payday) {
           remainingDays = payday - date;
       } else {
           const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
           remainingDays = (lastDayOfMonth - date) + payday;
       }
    } else if (criteria.periodType === 'custom') {
        remainingDays = criteria.customDays && criteria.customDays > 0 ? criteria.customDays : 30;
    } else { // default
        remainingDays = 30;
    }

    // 2. Calculate Base Period Amount
    let incoming = Calculator.calculatePeriodAmount(linkedData.incomes, remainingDays);
    let outgoing = Calculator.calculatePeriodAmount(linkedData.expenses, remainingDays);

    // 3. Apply Adjustments
    if (criteria.incomeAdjustment === 'tight') incoming = Math.floor(incoming * 0.9);
    else if (criteria.incomeAdjustment === 'relaxed') incoming = Math.floor(incoming * 1.1);
    else if (criteria.incomeAdjustment === 'custom') incoming = criteria.customIncome || 0;

    if (criteria.expenseAdjustment === 'tight') outgoing = Math.floor(outgoing * 0.9);
    else if (criteria.expenseAdjustment === 'relaxed') outgoing = Math.floor(outgoing * 1.1);
    else if (criteria.expenseAdjustment === 'custom') outgoing = criteria.customExpense || 0;

    // Add extra income/expenses
    incoming += parseInt(criteria.extraIncome || 0, 10);
    outgoing += parseInt(criteria.extraExpense || 0, 10);

    // 4. Determine Buffer Amount
    let bufferAmount = 458000; // default for 30 days
    if (criteria.bufferLevel === 'tight') bufferAmount = 600000;
    if (criteria.bufferLevel === 'relaxed') bufferAmount = 300000;
    
    // Pro-rate buffer if not 30 days (optional, depending on design but typically absolute or pro-rated. Let's keep it simple or pro-rated. Assuming absolute value based on period isn't specified, let's just use the absolute for simplicity, or scale it. Actually the ref says 여유 기준 (금액). Let's use the absolute value as requested by the original data structure data-amount)

    // 5. Calculate Final Daily Amount
    const totalUsable = incoming - outgoing - bufferAmount;
    const dailyAmount = remainingDays > 0 ? Math.max(0, Math.floor(totalUsable / remainingDays)) : 0;
    
    // UI Label resolution for period
    let periodLabel = '30일';
    if(criteria.periodType === 'this-month') periodLabel = '이번 달';
    else if(criteria.periodType === 'next-payday') periodLabel = '다음 급여일까지';
    else if(criteria.periodType === 'next-2-weeks') periodLabel = '다음 2주';
    else if(criteria.periodType === 'custom') periodLabel = (criteria.customDays || 30) + '일';

    let bufferLabel = '평소 수준';
    if(criteria.bufferLevel === 'tight') bufferLabel = '조금 덜';
    if(criteria.bufferLevel === 'relaxed') bufferLabel = '조금 더';
    
    // 6. Gauge Calculation
    let gaugeRatio = 0;
    const netIncome = incoming - outgoing;
    if (netIncome > 0) {
      gaugeRatio = Math.min(1, Math.max(0, totalUsable / netIncome));
    } else {
      gaugeRatio = totalUsable > 0 ? 1 : 0;
    }
    
    let gaugeStatus = 'danger';
    if (gaugeRatio > 0.6) gaugeStatus = 'safe';
    else if (gaugeRatio > 0.3) gaugeStatus = 'warning';

    return {
      dailyAmount,
      totalUsable: Math.max(0, totalUsable),
      remainingDays,
      incoming,
      outgoing,
      bufferAmount,
      periodLabel,
      bufferLabel,
      gaugeRatio,
      gaugeStatus
    };
  },
  
  formatCurrency: (amount) => {
    if (isNaN(amount)) return '₩ 0';
    return '₩ ' + amount.toLocaleString('ko-KR');
  },
  
  formatCurrencyNoSymbol: (amount) => {
    if (isNaN(amount)) return '0';
    return amount.toLocaleString('ko-KR');
  },

  calculatePeriodAmount: (items, remainingDays) => {
    if (!items || !items.length) return 0;
    const today = new Date();
    const todayDate = today.getDate();
    
    let sum = 0;
    // Check next `remainingDays` days
    for (let i = 0; i < remainingDays; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), todayDate + i);
      const dayOfMonth = d.getDate();
      
      items.forEach(item => {
        if (item.date === dayOfMonth) {
          sum += item.amount;
        }
      });
    }
    return sum;
  }
};
