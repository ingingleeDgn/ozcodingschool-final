// js/home.js
document.addEventListener('DOMContentLoaded', () => {
  const state = AppState.getComputedState();
  const computed = state.computed;

  const elAmount = document.getElementById('daily-amount');
  const elPeriod = document.getElementById('target-period');
  const elRemaining = document.getElementById('remaining-days');
  const elTotal = document.getElementById('total-usable');
  const elGuideAmount = document.getElementById('guide-amount');

  if (elAmount) elAmount.textContent = Calculator.formatCurrency(computed.dailyAmount);
  if (elTotal) elTotal.textContent = Calculator.formatCurrency(computed.totalUsable);
  if (elPeriod) elPeriod.textContent = computed.periodLabel;
  if (elRemaining) elRemaining.textContent = computed.remainingDays + '일';
  if (elGuideAmount) elGuideAmount.textContent = Calculator.formatCurrency(computed.dailyAmount);

  const gaugeProgress = document.getElementById('home-gauge-progress');
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
