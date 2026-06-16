(function() {
  window.initCollapsibleInlines = function() {
    document.querySelectorAll('.inline-related').forEach(item => {
      const toggleBtn = item.querySelector('.inline-collapsible-toggle');
      const content = item.querySelector('.inline-related-content');
      if (!toggleBtn || !content || item.hasAttribute('data-collapsible-init')) return;
      
      item.setAttribute('data-collapsible-init', 'true');
      
      const svg = toggleBtn.querySelector('svg');
      if (svg) svg.style.transform = 'rotate(0deg)';
      
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isCollapsed = content.classList.contains('hidden');
        if (isCollapsed) {
          content.classList.remove('hidden');
          content.classList.add('animate-fade-in');
          if (svg) svg.style.transform = 'rotate(0deg)';
        } else {
          content.classList.add('hidden');
          content.classList.remove('animate-fade-in');
          if (svg) svg.style.transform = 'rotate(-90deg)';
        }
      });
    });
  };

  window.initChangeFormTabs = function() {
    const form = document.getElementById('content-main')?.querySelector('form');
    if (!form) return;
    
    if (form.querySelector('.change-form-tabs')) return;
    
    const inlines = Array.from(form.querySelectorAll('.inline-group'));
    const fieldsetsContainer = form.querySelector('div > div.bg-white, div > div.dark\\:bg-apple-darkcard');
    
    if (!fieldsetsContainer || inlines.length === 0) return;
    
    const generalFieldsWrapper = document.createElement('div');
    generalFieldsWrapper.className = 'space-y-6 animate-fade-in';
    const originalChildren = Array.from(fieldsetsContainer.childNodes);
    originalChildren.forEach(child => generalFieldsWrapper.appendChild(child));
    fieldsetsContainer.appendChild(generalFieldsWrapper);
    
    inlines.forEach(inline => {
      inline.className = 'inline-group space-y-6 hidden';
      inline.style.background = 'transparent';
      inline.style.border = 'none';
      inline.style.boxShadow = 'none';
      inline.style.padding = '0';
      fieldsetsContainer.appendChild(inline);
    });
    
    const tabHeader = document.createElement('div');
    tabHeader.className = 'change-form-tabs relative flex items-center gap-6 border-b border-gray-200/80 dark:border-gray-800/60 pt-5 pb-3 -mt-6 -mx-6 px-6 mb-6 z-10 bg-slate-50/20 dark:bg-zinc-900/10 rounded-t-2xl';
    
    const indicator = document.createElement('div');
    indicator.className = 'absolute bottom-0 h-0.5 bg-apple-blue transition-all duration-200 ease-out z-0';
    tabHeader.appendChild(indicator);
    
    const tabItems = [];
    
    tabItems.push({
      name: 'General Info',
      element: generalFieldsWrapper
    });
    
    inlines.forEach((inline, idx) => {
      const titleEl = inline.querySelector('h2');
      const title = titleEl ? titleEl.textContent.trim() : `Related Items ${idx + 1}`;
      if (titleEl) titleEl.style.display = 'none';
      
      tabItems.push({
        name: title,
        element: inline
      });
    });
    
    function moveIndicator(btn) {
      indicator.style.left = `${btn.offsetLeft}px`;
      indicator.style.width = `${btn.offsetWidth}px`;
    }
    
    tabItems.forEach((tab, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = tab.name;
      
      const updateBtnStyle = (b, isActive) => {
        if (isActive) {
          b.className = 'active-tab relative z-10 px-1 pb-3 text-sm font-semibold transition-colors duration-200 cursor-pointer select-none text-apple-blue';
        } else {
          b.className = 'relative z-10 px-1 pb-3 text-sm font-medium transition-colors duration-200 cursor-pointer select-none text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200';
        }
      };
      
      btn.addEventListener('click', () => {
        tabHeader.querySelectorAll('button').forEach(b => {
          b.classList.remove('active-tab');
          updateBtnStyle(b, false);
        });
        btn.classList.add('active-tab');
        updateBtnStyle(btn, true);
        moveIndicator(btn);
        
        tabItems.forEach(t => {
          if (t === tab) {
            t.element.classList.remove('hidden');
            t.element.classList.add('animate-fade-in');
          } else {
            t.element.classList.add('hidden');
            t.element.classList.remove('animate-fade-in');
          }
        });
      });
      
      tabHeader.appendChild(btn);
      
      if (index === 0) {
        btn.classList.add('active-tab');
        updateBtnStyle(btn, true);
        tab.element.classList.remove('hidden');
        setTimeout(() => moveIndicator(btn), 50);
      } else {
        updateBtnStyle(btn, false);
        tab.element.classList.add('hidden');
      }
    });
    
    window.addEventListener('resize', () => {
      const activeBtn = tabHeader.querySelector('.active-tab');
      if (activeBtn) moveIndicator(activeBtn);
    });
    
    fieldsetsContainer.insertBefore(tabHeader, fieldsetsContainer.firstChild);
    window.initCollapsibleInlines();
  };
})();
