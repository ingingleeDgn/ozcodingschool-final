export function renderTopbar(container) {
  container.innerHTML = `
    <header class="top-navbar" id="top-navbar">
      <div class="left" id="topbar-left"></div>
      <div class="center" id="topbar-center"></div>
      <div class="right" id="topbar-right">
        <!-- Bell Icon -->
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
      </div>
    </header>
  `;

  // Delegate click for dynamic back button
  document.getElementById('topbar-left').addEventListener('click', (e) => {
    const backBtn = e.target.closest('#btn-top-back');
    if (backBtn) {
      window.history.back();
    }
  });
}

export function updateTopbar(hash) {
  const leftEl = document.getElementById('topbar-left');
  const centerEl = document.getElementById('topbar-center');
  
  if (hash === '' || hash === '#home') {
    // Home configuration
    leftEl.innerHTML = `
      <button class="icon-btn">
        <!-- Hamburger Icon -->
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    `;
    centerEl.innerHTML = `<span class="logo">W</span>`;
  } else {
    // Subpages configuration
    leftEl.innerHTML = `
      <button class="icon-btn" id="btn-top-back">
        <!-- Back Icon -->
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
    `;
    
    let title = '';
    if (hash === '#history') title = '히스토리';
    else if (hash === '#criteria') title = '기준 조정';
    else if (hash === '#profile') title = '내 정보';
    else if (hash === '#explanation') title = '계산 구조';
    
    centerEl.innerHTML = `<span class="title">${title}</span>`;
  }
}
