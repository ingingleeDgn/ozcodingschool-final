// js/criteria-form.js
document.addEventListener('DOMContentLoaded', () => {
  const state = AppState.getState();
  
  // Elements
  const form = document.getElementById('criteria-form');
  const previewAmount = document.getElementById('preview-amount');
  const btnApply = document.getElementById('btn-apply');
  const btnCancel = document.getElementById('btn-cancel');
  
  const periodRadios = form.elements['targetPeriod'];
  const incomeAdjustmentRadios = form.elements['incomeAdjustment'];
  const expenseAdjustmentRadios = form.elements['expenseAdjustment'];
  const bufferRadios = form.elements['bufferLevel'];
  
  const extraIncomeInput = document.getElementById('extraIncome');
  const extraExpenseInput = document.getElementById('extraExpense');
  
  const btnCustomPeriod = document.getElementById('btn-custom-period');
  const customPeriodContainer = document.getElementById('custom-period-container');
  const customPeriodInput = document.getElementById('custom-period-input');
  
  const btnCustomIncome = document.getElementById('btn-custom-income');
  const customIncomeContainer = document.getElementById('custom-income-container');
  const customIncomeInput = document.getElementById('custom-income-input');
  
  const btnCustomExpense = document.getElementById('btn-custom-expense');
  const customExpenseContainer = document.getElementById('custom-expense-container');
  const customExpenseInput = document.getElementById('custom-expense-input');
  
  const accordionToggle = document.getElementById('accordion-toggle');
  const accordionContent = document.getElementById('accordion-content');
  const accordionIcon = document.getElementById('accordion-icon');

  // Initialize form controls from state
  const criteria = state.criteria;

  if (periodRadios) {
    for (let r of periodRadios) {
      if (r.value === criteria.periodType) r.checked = true;
    }
    Array.from(periodRadios).forEach(radio => {
        radio.addEventListener('change', () => {
            if (customPeriodContainer) customPeriodContainer.classList.remove('open');
            if (btnCustomPeriod) btnCustomPeriod.classList.remove('active');
            if (customPeriodInput) customPeriodInput.value = "";
            updatePreview();
        });
    });
  }

  if (btnCustomPeriod && customPeriodContainer) {
      if (criteria.periodType === 'custom') {
          if (periodRadios) Array.from(periodRadios).forEach(r => r.checked = false);
          btnCustomPeriod.classList.add('active');
          customPeriodContainer.classList.add('open', 'full-width');
          if (customPeriodInput) customPeriodInput.value = criteria.customDays || '';
      }
      
      btnCustomPeriod.addEventListener('click', () => {
          if (periodRadios) Array.from(periodRadios).forEach(r => r.checked = false);
          btnCustomPeriod.classList.add('active');
          customPeriodContainer.classList.add('open', 'full-width');
          if (customPeriodInput) customPeriodInput.focus();
          updatePreview();
      });
  }

  if (incomeAdjustmentRadios) {
    for (let r of incomeAdjustmentRadios) {
      if (r.value === criteria.incomeAdjustment) r.checked = true;
    }
    Array.from(incomeAdjustmentRadios).forEach(radio => {
       radio.addEventListener('change', () => {
           if (customIncomeContainer) customIncomeContainer.classList.remove('open');
           if (btnCustomIncome) btnCustomIncome.classList.remove('active');
           if (customIncomeInput) customIncomeInput.value = "";
       });
    });
  }
  
  if (btnCustomIncome && customIncomeContainer) {
      if (criteria.incomeAdjustment === 'custom') {
          Array.from(incomeAdjustmentRadios).forEach(r => r.checked = false);
          btnCustomIncome.classList.add('active');
          customIncomeContainer.classList.add('open', 'full-width');
          if (customIncomeInput) customIncomeInput.value = criteria.customIncome || '';
      }
      
      btnCustomIncome.addEventListener('click', () => {
          // Deselect radios
          Array.from(incomeAdjustmentRadios).forEach(r => r.checked = false);
          btnCustomIncome.classList.add('active');
          customIncomeContainer.classList.add('open', 'full-width');
          if (customIncomeInput) customIncomeInput.focus();
          updatePreview();
      });
  }

  if (expenseAdjustmentRadios) {
    for (let r of expenseAdjustmentRadios) {
      if (r.value === criteria.expenseAdjustment) r.checked = true;
    }
    Array.from(expenseAdjustmentRadios).forEach(radio => {
       radio.addEventListener('change', () => {
           if (customExpenseContainer) customExpenseContainer.classList.remove('open');
           if (btnCustomExpense) btnCustomExpense.classList.remove('active');
           if (customExpenseInput) customExpenseInput.value = "";
       });
    });
  }

  if (btnCustomExpense && customExpenseContainer) {
      if (criteria.expenseAdjustment === 'custom') {
          Array.from(expenseAdjustmentRadios).forEach(r => r.checked = false);
          btnCustomExpense.classList.add('active');
          customExpenseContainer.classList.add('open', 'full-width');
          if (customExpenseInput) customExpenseInput.value = criteria.customExpense || '';
      }
      
      btnCustomExpense.addEventListener('click', () => {
          // Deselect radios
          Array.from(expenseAdjustmentRadios).forEach(r => r.checked = false);
          btnCustomExpense.classList.add('active');
          customExpenseContainer.classList.add('open', 'full-width');
          if (customExpenseInput) customExpenseInput.focus();
          updatePreview();
      });
  }
  
  if (bufferRadios) {
    for (let r of bufferRadios) {
      if (r.value === criteria.bufferLevel) r.checked = true;
    }
  }
  
  if (extraIncomeInput && criteria.extraIncome) {
    extraIncomeInput.value = criteria.extraIncome;
  }
  
  if (extraExpenseInput && criteria.extraExpense) {
    extraExpenseInput.value = criteria.extraExpense;
  }

  // Accordion Logic
  let isAccordionOpen = false;
  
  // if values exist, open by default
  if (criteria.extraIncome || criteria.extraExpense) {
      isAccordionOpen = true;
      if (accordionContent) accordionContent.classList.add('open');
      if (accordionToggle) accordionToggle.classList.add('open');
      if (accordionIcon) accordionIcon.style.transform = 'rotate(180deg)';
  }

  if (accordionToggle) {
    accordionToggle.addEventListener('click', () => {
      isAccordionOpen = !isAccordionOpen;
      if (accordionContent) {
        accordionContent.classList.toggle('open', isAccordionOpen);
      }
      accordionToggle.classList.toggle('open', isAccordionOpen);
      if (accordionIcon) {
        accordionIcon.style.transform = isAccordionOpen ? 'rotate(180deg)' : 'rotate(0)';
      }
    });
  }

  const getFormCriteria = () => {
      const isCustomPeriod = btnCustomPeriod && btnCustomPeriod.classList.contains('active');
      const isCustomIncome = btnCustomIncome && btnCustomIncome.classList.contains('active');
      const isCustomExpense = btnCustomExpense && btnCustomExpense.classList.contains('active');
      
      return {
          periodType: isCustomPeriod ? 'custom' : ((Array.from(periodRadios).find(r => r.checked) || {}).value || '30days'),
          customDays: parseInt(customPeriodInput ? customPeriodInput.value || 0 : 0, 10),
          incomeAdjustment: isCustomIncome ? 'custom' : ((Array.from(incomeAdjustmentRadios).find(r => r.checked) || {}).value || 'normal'),
          expenseAdjustment: isCustomExpense ? 'custom' : ((Array.from(expenseAdjustmentRadios).find(r => r.checked) || {}).value || 'normal'),
          customIncome: isCustomIncome ? parseInt(customIncomeInput ? customIncomeInput.value || 0 : 0, 10) : 0,
          customExpense: isCustomExpense ? parseInt(customExpenseInput ? customExpenseInput.value || 0 : 0, 10) : 0,
          bufferLevel: (Array.from(bufferRadios).find(r => r.checked) || {}).value || 'normal',
          extraIncome: parseInt(extraIncomeInput ? extraIncomeInput.value || 0 : 0, 10),
          extraExpense: parseInt(extraExpenseInput ? extraExpenseInput.value || 0 : 0, 10)
      };
  };
  
  const updatePreview = () => {
    const currentFormCriteria = getFormCriteria();
    const result = Calculator.calculateDailySpendable(state.linkedData, currentFormCriteria);
    if (previewAmount) {
        previewAmount.textContent = Calculator.formatCurrency(result.dailyAmount);
    }
  };
  
  // Attach events
  form.addEventListener('change', updatePreview);
  if (customPeriodInput) {
      customPeriodInput.addEventListener('input', () => {
          updatePreview();
      });
  }
  if (customIncomeInput) customIncomeInput.addEventListener('input', updatePreview);
  if (customExpenseInput) customExpenseInput.addEventListener('input', updatePreview);
  if (extraIncomeInput) extraIncomeInput.addEventListener('input', updatePreview);
  if (extraExpenseInput) extraExpenseInput.addEventListener('input', updatePreview);
  
  // Init
  updatePreview();
  
  // Actions
  btnCancel.addEventListener('click', () => {
    window.location.href = 'index.html'; // Go back without changing
  });
  
  btnApply.addEventListener('click', () => {
    const newCriteria = getFormCriteria();

    // Map log strings
    const strMap = {
        'tight': '조금 덜',
        'normal': '평소 수준',
        'relaxed': '조금 더',
        '30days': '30일',
        'next-2-weeks': '다음 2주',
        'next-payday': '다음 급여일까지',
        'this-month': '이번 달',
        'custom': '직접 입력'
    };
    
    // Simplistic log: log first change matched
    let historyLog = null;
    if (state.criteria.periodType !== newCriteria.periodType) {
      historyLog = { type: '기준 기간', oldValue: strMap[state.criteria.periodType] || state.criteria.periodType, newValue: strMap[newCriteria.periodType] || newCriteria.periodType };
    } else if (state.criteria.incomeAdjustment !== newCriteria.incomeAdjustment) {
      historyLog = { type: '앞으로 들어올 돈', oldValue: strMap[state.criteria.incomeAdjustment], newValue: strMap[newCriteria.incomeAdjustment] };
    } else if (state.criteria.expenseAdjustment !== newCriteria.expenseAdjustment) {
      historyLog = { type: '앞으로 나갈 돈', oldValue: strMap[state.criteria.expenseAdjustment], newValue: strMap[newCriteria.expenseAdjustment] };
    } else if (state.criteria.bufferLevel !== newCriteria.bufferLevel) {
      historyLog = { type: '여유 기준', oldValue: strMap[state.criteria.bufferLevel], newValue: strMap[newCriteria.bufferLevel] };
    }
    
    AppState.updateCriteria(newCriteria, historyLog);
    window.location.href = 'index.html'; // go to home
  });
});
