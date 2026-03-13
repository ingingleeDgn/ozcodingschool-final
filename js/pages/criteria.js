import { fetchHtmlAsText } from '../utils.js';
import { store } from '../store.js';
import { calculateSafeToSpend, formatCurrency } from '../calculator.js';

export async function renderCriteria(container) {
  const html = await fetchHtmlAsText('pages/criteria.html');
  container.innerHTML = html;

  const form = document.getElementById('criteria-form');
  const previewAmount = document.getElementById('preview-amount');
  
  // 1. 기존 데이터로 폼 채우기
  const currentCriteria = store.get('criteria') || {};
  
  if (currentCriteria.period) {
    const radio = form.querySelector(`input[name="period"][value="${currentCriteria.period}"]`);
    if (radio) radio.checked = true;
  }
  if (currentCriteria.incomeType) {
    const radio = form.querySelector(`input[name="incomeType"][value="${currentCriteria.incomeType}"]`);
    if (radio) radio.checked = true;
  }
  if (currentCriteria.expenseType) {
    const radio = form.querySelector(`input[name="expenseType"][value="${currentCriteria.expenseType}"]`);
    if (radio) radio.checked = true;
  }
  
  form.elements['income'].value = currentCriteria.income || '';
  form.elements['expense'].value = currentCriteria.expense || '';
  form.elements['buffer'].value = currentCriteria.buffer || '';
  form.elements['extraIncome'].value = currentCriteria.extraIncome || '';
  form.elements['extraExpense'].value = currentCriteria.extraExpense || '';

  // 아코디언 상태 확인 (데이터가 있으면 열어두기)
  const accordionBody = document.getElementById('accordion-extra-body');
  const accordionIcon = document.getElementById('accordion-icon');
  if (currentCriteria.extraIncome || currentCriteria.extraExpense) {
    accordionBody.classList.add('open');
    accordionIcon.innerHTML = `<polyline points="18 15 12 9 6 15"></polyline>`; // Up Arrow
  }

  // 아코디언 토글 이벤트
  document.getElementById('accordion-extra-btn').addEventListener('click', () => {
    accordionBody.classList.toggle('open');
    if (accordionBody.classList.contains('open')) {
      accordionIcon.innerHTML = `<polyline points="18 15 12 9 6 15"></polyline>`;
    } else {
      accordionIcon.innerHTML = `<polyline points="6 9 12 15 18 9"></polyline>`;
    }
  });

  // 커스텀 입력 토글 로직
  const checkCustomInputs = () => {
    const incomeMoreRadio = form.querySelector('input[name="incomeType"][value="more"]');
    const incomeBtn = document.getElementById('btn-input-income');
    const incomeContainer = document.getElementById('container-income');
    
    if (incomeMoreRadio && incomeMoreRadio.checked) {
      incomeBtn.style.display = 'block';
    } else {
      incomeBtn.style.display = 'none';
      incomeContainer.style.display = 'none';
    }

    const expenseMoreRadio = form.querySelector('input[name="expenseType"][value="more"]');
    const expenseBtn = document.getElementById('btn-input-expense');
    const expenseContainer = document.getElementById('container-expense');
    
    if (expenseMoreRadio && expenseMoreRadio.checked) {
      expenseBtn.style.display = 'block';
    } else {
      expenseBtn.style.display = 'none';
      expenseContainer.style.display = 'none';
    }
  };

  document.getElementById('btn-input-income').addEventListener('click', () => {
    document.getElementById('container-income').style.display = 'block';
    document.getElementById('btn-input-income').style.display = 'none';
  });

  document.getElementById('btn-input-expense').addEventListener('click', () => {
    document.getElementById('container-expense').style.display = 'block';
    document.getElementById('btn-input-expense').style.display = 'none';
  });

  // 2. 실시간 미리보기 업데이트 로직
  const updatePreview = () => {
    checkCustomInputs();

    const formData = new FormData(form);
    const mockCriteria = {
      period: formData.get('period') || 'this_month',
      incomeType: formData.get('incomeType') || 'normal',
      expenseType: formData.get('expenseType') || 'normal',
      income: formData.get('income') ? parseInt(formData.get('income')) : 0,
      expense: formData.get('expense') ? parseInt(formData.get('expense')) : 0,
      buffer: formData.get('buffer') ? parseInt(formData.get('buffer')) : 0,
      extraIncome: formData.get('extraIncome') ? parseInt(formData.get('extraIncome')) : 0,
      extraExpense: formData.get('extraExpense') ? parseInt(formData.get('extraExpense')) : 0
    };
    
    const result = calculateSafeToSpend(mockCriteria);
    previewAmount.innerHTML = `오늘 <span style="color: var(--color-primary); font-weight: var(--font-weight-bold);">${formatCurrency(result.amount)}</span> 써도 괜찮아요`;
  };

  // 초기 렌더링 시 미리보기 업데이트
  updatePreview();

  // 모든 인풋/라디오 변경 시 미리보기 업데이트
  form.addEventListener('input', updatePreview);

  // 3. 버튼 이벤트
  document.getElementById('btn-save').addEventListener('click', () => {
    const formData = new FormData(form);
    const newCriteria = {
      period: formData.get('period') || 'this_month',
      incomeType: formData.get('incomeType') || 'normal',
      expenseType: formData.get('expenseType') || 'normal',
      income: formData.get('income') ? parseInt(formData.get('income')) : 0,
      expense: formData.get('expense') ? parseInt(formData.get('expense')) : 0,
      buffer: formData.get('buffer') ? parseInt(formData.get('buffer')) : 0,
      extraIncome: formData.get('extraIncome') ? parseInt(formData.get('extraIncome')) : 0,
      extraExpense: formData.get('extraExpense') ? parseInt(formData.get('extraExpense')) : 0
    };
    store.set('criteria', newCriteria);
    
    // 강제로 히스토리 한 번 저장 (기준이 변경되었으므로)
    import('../calculator.js').then(module => module.saveHistoryRecord());

    window.location.hash = '#home';
  });

  document.getElementById('btn-cancel').addEventListener('click', () => {
    window.location.hash = '#home';
  });
}
