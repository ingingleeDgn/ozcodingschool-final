// js/profile.js
document.addEventListener('DOMContentLoaded', () => {
  const state = AppState.getState();
  const btnDeleteHistory = document.getElementById('delete-history-button');
  
  // Render Dynamic Data Connections state
  const elSyncDate = document.getElementById('profile-sync-date');
  const elAccountSummary = document.getElementById('profile-account-summary');
  
  if (elSyncDate && state.linkedData && state.linkedData.lastSyncedAt) {
    const syncD = new Date(state.linkedData.lastSyncedAt);
    elSyncDate.textContent = `최근 동기화: ${syncD.getMonth() + 1}월 ${syncD.getDate()}일`;
  }
  
  if (elAccountSummary && state.linkedData) {
    const accLen = (state.linkedData.accounts || []).length;
    const cardLen = (state.linkedData.cards || []).length;
    let totalLen = accLen + cardLen;
    
    if (totalLen > 0) {
      let firstItemName = '';
      if (accLen > 0) firstItemName = state.linkedData.accounts[0].name;
      else if (cardLen > 0) firstItemName = state.linkedData.cards[0].name;
      
      if (totalLen === 1) {
        elAccountSummary.textContent = firstItemName;
      } else {
        elAccountSummary.textContent = `${firstItemName} 외 ${totalLen - 1}개`;
      }
    } else {
      elAccountSummary.textContent = '연결된 자산 없음';
    }
  }

  if (btnDeleteHistory) {
    btnDeleteHistory.addEventListener('click', () => {
      const isConfirmed = confirm('모든 기록을 삭제하시겠습니까? 데이터(기준 포함)는 유지됩니다.');
      if (isConfirmed) {
        AppState.clearHistory();
        window.location.href = 'history.html';
      }
    });
  }
});
