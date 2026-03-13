import { initStore } from './store.js';
// 모달 컴포넌트는 추후 생성될 예정이라 지금은 제외
import { renderNavbar, updateNavbarActive } from './components/navbar.js';

// Page Renderers
import { renderHome } from './pages/home.js';
import { renderHistory } from './pages/history.js';
import { renderCriteria } from './pages/criteria.js';
import { renderProfile } from './pages/profile.js';
import { renderExplanation } from './pages/explanation.js';

const routes = {
  '': renderHome,
  '#home': renderHome,
  '#history': renderHistory,
  '#criteria': renderCriteria,
  '#profile': renderProfile,
  '#explanation': renderExplanation
};

// Pages will use utils.js for fetchHtmlAsText

async function loadPage() {
  const hash = window.location.hash || '#home';
  const renderer = routes[hash] || routes['#home'];
  
  const appEl = document.getElementById('app');
  appEl.innerHTML = '<div class="flex-center" style="height: 100vh;">로딩 중...</div>';
  
  // 페이지 렌더링 호출 (fetchHtmlAsText 등을 내부에서 호출)
  await renderer(appEl);
  
  // 네비게이션 활성화 상태 업데이트
  updateNavbarActive(hash);
  import('./components/topbar.js').then(module => module.updateTopbar(hash));
}

function initApp() {
  initStore();
  
  // 의무 사항: 페이지 로드 시(오늘 첫 로드) History에 기록을 남기도록 처리
  // store.js와 calculator.js 연동:
  import('./calculator.js').then(module => {
     module.saveHistoryRecord();
  });
  
  // 렌더링 네비게이션
  import('./components/topbar.js').then(module => {
    module.renderTopbar(document.getElementById('top-navbar-container'));
  });
  renderNavbar(document.getElementById('navbar-container'));
  
  window.addEventListener('hashchange', loadPage);
  loadPage(); // 초기 페이지 로드
}

// 앱 초기화 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
