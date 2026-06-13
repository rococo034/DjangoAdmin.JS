(function() {
  window.updateThemeUI = function(theme) {
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const container = document.querySelector('.theme-toggle-switch');
    if (!container) return;

    const slider = container.querySelector('.theme-slider');
    const activeBtn = container.querySelector(`button[data-theme-val="${theme}"]`);
    if (slider && activeBtn) {
      slider.style.left = `${activeBtn.offsetLeft}px`;
      slider.style.width = `${activeBtn.offsetWidth}px`;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme') || 'auto';
    window.updateThemeUI(currentTheme);

    document.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('.theme-btn');
      if (themeBtn) {
        e.stopPropagation();
        const nextTheme = themeBtn.getAttribute('data-theme-val');
        localStorage.setItem('theme', nextTheme);
        window.updateThemeUI(nextTheme);
      }
    });

    window.addEventListener('resize', () => {
      const currentTheme = localStorage.getItem('theme') || 'auto';
      window.updateThemeUI(currentTheme);
    });
  });
})();
