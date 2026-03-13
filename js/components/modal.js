export function renderModal(htmlContent) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        ${htmlContent}
      </div>
    </div>
  `;
  
  const overlay = modalContainer.querySelector('.modal-overlay');
  
  // 강제 리플로우
  void overlay.offsetWidth;
  
  overlay.classList.add('active');

  // 배경 클릭 시 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
}

export function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  const overlay = modalContainer.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    // 애니메이션이 끝난 후 DOM 제거
    setTimeout(() => {
      modalContainer.innerHTML = '';
    }, 300);
  }
}
