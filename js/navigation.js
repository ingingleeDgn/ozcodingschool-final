// js/navigation.js

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.bottom-nav__item');
  
  // Set active state
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPath) {
      item.classList.add('bottom-nav__item--active');
    }
  });

  // Back navigation
  const fallbackMap = {
    'result.html': 'index.html',
    'history.html': 'index.html',
    'profile.html': 'index.html',
    'criteria.html': 'result.html',
    'data-connections.html': 'profile.html'
  };

  const backButtons = document.querySelectorAll('.btn-back');
  backButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fallback = fallbackMap[currentPath] || 'index.html';
      
      // Strict fallback logic to guarantee correct flow for prototype
      // Real apps might check history.length, but for this prototype structure
      // going directly to the defined map is often safer to avoid infinite loops
      // if history gets messy.
      
      // If we are strictly relying on the map as per req 9
      if (document.referrer && document.referrer.includes(fallback)) {
          window.history.back();
      } else {
          window.location.href = fallback;
      }
    });
  });

  // Sitemap Drawer logic
  const hamburgerBtn = document.querySelector('.btn-hamburger');
  const sitemapDrawer = document.getElementById('sitemap-drawer');
  const sitemapOverlay = document.getElementById('sitemap-overlay');
  const sitemapContent = document.getElementById('sitemap-content');

  function openDrawer() {
    if (!sitemapDrawer) return;
    sitemapDrawer.classList.remove('hidden');
  }

  function closeDrawer() {
    if (!sitemapDrawer) return;
    // Add closing animation classes
    if (sitemapContent) sitemapContent.classList.add('closing');
    if (sitemapOverlay) sitemapOverlay.classList.add('closing');
    
    // Wait for animation frame then hide
    setTimeout(() => {
      sitemapDrawer.classList.add('hidden');
      if (sitemapContent) sitemapContent.classList.remove('closing');
      if (sitemapOverlay) sitemapOverlay.classList.remove('closing');
    }, 300); // 300ms matches CSS transition
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openDrawer);
  }

  if (sitemapOverlay) {
    sitemapOverlay.addEventListener('click', closeDrawer);
  }
});
