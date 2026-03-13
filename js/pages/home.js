import { fetchHtmlAsText } from '../utils.js';
import { calculateSafeToSpend, formatCurrency } from '../calculator.js';
import { store } from '../store.js';
import { renderModal } from '../components/modal.js';

export async function renderHome(container) {
  const html = await fetchHtmlAsText('pages/home.html');
  container.innerHTML = html;

  const result = calculateSafeToSpend();
  const user = store.get('user') || {};
  const criteria = store.get('criteria') || {};

  // 1. 인사말 및 결과 표시
  if (user.name) {
    document.getElementById('home-greeting').textContent = `${user.name}님,`;
  }
  
  const amountEl = document.getElementById('safe-to-spend-amount');
  amountEl.textContent = formatCurrency(result.amount);
  
  // 긍정적/주의 메시지 분기 (단순 금액 기반 예시)
  const cheerEl = document.getElementById('home-cheer');
  if (result.amount === 0) {
    cheerEl.innerHTML = '오늘은 지출을 최소화하는 것이 안전해요.<br/>꼭 필요한 곳에만 사용하세요.';
  } else if (result.amount > 50000) {
    cheerEl.innerHTML = '지금은 무리없이 사용할 수 있어요!<br/>따로 판단하지 않아도 괜찮아요';
  } else {
    cheerEl.innerHTML = '예산 범위 내에서 신중하게 소비해보세요!<br/>충분히 조절할 수 있습니다.';
  }

  // 2. 기준 요약 및 남은 금액 표시
  const periodMap = {
    'this_month': '이번 달 말까지',
    'next_payday': '다음 급여일까지',
    'next_2_weeks': '다음 2주 동안',
    'custom': '직접 입력'
  };
  
  const periodText = periodMap[criteria.period] || '지정 기간';
  document.getElementById('home-subtext').textContent = `${periodText} 기준 · ${result.details.daysRemaining}일 남음`;
  document.getElementById('remain-total-amount').textContent = formatCurrency(result.details.totalSafeToSpend);

  // 3. 페이지 이동 클릭 이벤트
  const btnExplanation = document.getElementById('btn-explanation');
  if (btnExplanation) {
    btnExplanation.addEventListener('click', () => {
      window.location.hash = '#explanation';
    });
  }
}

