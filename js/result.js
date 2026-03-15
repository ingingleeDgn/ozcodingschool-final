// js/result.js
document.addEventListener('DOMContentLoaded', () => {
  const state = AppState.getComputedState();
  const computed = state.computed;

  const elAmount = document.getElementById('result-amount');
  const elPeriod = document.getElementById('result-period');
  const elRemaining = document.getElementById('result-remaining');
  
  const elDetailPeriod = document.getElementById('detail-period');
  const elDetailInc = document.getElementById('detail-incoming');
  const elDetailOut = document.getElementById('detail-outgoing');
  const elDetailBuffer = document.getElementById('detail-buffer');
  const elDetailBufferLevel = document.getElementById('detail-buffer-level');

  const elExtraSection = document.getElementById('extra-section');
  const rowExtraIncome = document.getElementById('row-extra-income');
  const detailExtraIncome = document.getElementById('detail-extra-income');
  const rowExtraExpense = document.getElementById('row-extra-expense');
  const detailExtraExpense = document.getElementById('detail-extra-expense');

  if (elAmount) elAmount.textContent = Calculator.formatCurrency(computed.dailyAmount);
  if (elPeriod) elPeriod.textContent = computed.periodLabel;
  if (elRemaining) elRemaining.textContent = computed.remainingDays + '일';
  
  if (elDetailPeriod) elDetailPeriod.textContent = computed.periodLabel;
  if (elDetailInc) elDetailInc.textContent = Calculator.formatCurrency(computed.incoming);
  if (elDetailOut) elDetailOut.textContent = '- ' + Calculator.formatCurrency(computed.outgoing);
  if (elDetailBuffer) elDetailBuffer.textContent = '- ' + Calculator.formatCurrency(computed.bufferAmount);
  
  if (elDetailBufferLevel) elDetailBufferLevel.textContent = '(' + computed.bufferLabel + ')';

  let hasExtra = false;
  
  if (state.criteria.extraIncome && state.criteria.extraIncome > 0) {
      hasExtra = true;
      if (rowExtraIncome) rowExtraIncome.classList.remove('hidden');
      if (detailExtraIncome) detailExtraIncome.textContent = Calculator.formatCurrency(state.criteria.extraIncome);
  } else {
      if (rowExtraIncome) rowExtraIncome.classList.add('hidden');
  }

  if (state.criteria.extraExpense && state.criteria.extraExpense > 0) {
      hasExtra = true;
      if (rowExtraExpense) rowExtraExpense.classList.remove('hidden');
      if (detailExtraExpense) detailExtraExpense.textContent = '- ' + Calculator.formatCurrency(state.criteria.extraExpense);
  } else {
      if (rowExtraExpense) rowExtraExpense.classList.add('hidden');
  }

  if (hasExtra && elExtraSection) {
      elExtraSection.classList.remove('hidden');
  } else if (elExtraSection) {
      elExtraSection.classList.add('hidden');
  }

  const gaugeProgress = document.getElementById('result-gauge-progress');
  if (gaugeProgress) {
    const totalLength = 502.65; // 2 * PI * 80
    requestAnimationFrame(() => {
      setTimeout(() => {
        gaugeProgress.style.strokeDashoffset = totalLength - (totalLength * computed.gaugeRatio);
        gaugeProgress.setAttribute('class', `gauge-progress ${computed.gaugeStatus}`);
      }, 50);
    });
  }
});
