import { fetchHtmlAsText } from '../utils.js';
import { store } from '../store.js';

export async function renderProfile(container) {
  const html = await fetchHtmlAsText('pages/profile.html');
  container.innerHTML = html;

  const user = store.get('user') || {};

  document.getElementById('profile-name').textContent = user.name || '사용자';
  const emailEl = document.getElementById('profile-email');
  if (user.email) {
    emailEl.textContent = user.email;
    emailEl.href = `mailto:${user.email}`;
  } else {
    emailEl.textContent = '이메일 없음';
    emailEl.removeAttribute('href');
  }

  let lastSyncStr = '-';
  if (user.lastSync) {
    const d = new Date(user.lastSync);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const d2 = String(d.getDate()).padStart(2, '0');
    lastSyncStr = `마지막 동기화 ${d.getFullYear()}.${m}.${d2}`;
  }
  document.getElementById('profile-lastsync').textContent = lastSyncStr;

  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('모든 히스토리와 설정 데이터를 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      store.remove('criteria');
      store.remove('history');
      store.remove('user'); // 유저 정보도 삭제할 수 있지만, 기본값 복원을 위해 남길수도
      alert('데이터가 초기화되었습니다. 홈 화면으로 이동합니다.');
      
      // 스토어 재초기화
      import('../store.js').then(module => {
        module.initStore();
        window.location.hash = '#home';
      });
    }
  });
}
