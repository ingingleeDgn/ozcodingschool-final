import { fetchHtmlAsText } from '../utils.js';
import { calculateSafeToSpend, formatCurrency } from '../calculator.js';
import { store } from '../store.js';

export async function renderExplanation(container) {
  const html = await fetchHtmlAsText('pages/explanation.html');
  container.innerHTML = html;

  const result = calculateSafeToSpend();
  const criteria = store.get('criteria') || {};
  const details = result.details;

  document.getElementById('expl-balance').textContent = formatCurrency(details.balance);
  document.getElementById('expl-income').textContent = formatCurrency(details.income);
  document.getElementById('expl-expense').textContent = formatCurrency(details.expense);
  document.getElementById('expl-buffer').textContent = formatCurrency(details.buffer);
  
  const periodMap = {
    'this_month': '이번 달',
    'next_payday': '다음 급여일',
    'next_2_weeks': '다음 2주',
    'custom': '직접 입력'
  };
  const periodText = periodMap[criteria.period] || '지정 기간';
  
  document.getElementById('expl-criteria-text').textContent = `${periodText} 기준`;
  document.getElementById('expl-period-label').textContent = `${periodText} 기준`;
  document.getElementById('expl-days').textContent = `${details.daysRemaining}일`;
  
  document.getElementById('expl-final').textContent = formatCurrency(result.amount);

  document.getElementById('btn-go-criteria').addEventListener('click', () => {
    window.location.hash = '#criteria';
  });
}
