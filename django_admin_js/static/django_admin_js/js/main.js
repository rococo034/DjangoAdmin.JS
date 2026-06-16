(function() {
  window.initObjectTools = function() {
    document.querySelectorAll('.object-tools a').forEach(a => {
      if (a.querySelector('svg')) return;
      
      a.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150 cursor-pointer shadow-sm';
      
      if (a.classList.contains('historylink')) {
        const svg = document.createElement('div');
        svg.innerHTML = '<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        a.insertBefore(svg.firstElementChild, a.firstChild);
      } else if (a.classList.contains('viewsitelink')) {
        const svg = document.createElement('div');
        svg.innerHTML = '<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>';
        a.insertBefore(svg.firstElementChild, a.firstChild);
      }
    });
  };

  window.initChangeListTable = function() {
    const table = document.getElementById('result_list');
    if (!table) return;
    
    const theadRow = table.querySelector('thead tr');
    if (theadRow && !theadRow.querySelector('.actions-header')) {
      const actionsHeader = document.createElement('th');
      actionsHeader.scope = 'col';
      actionsHeader.className = 'actions-header text-right p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 w-32';
      actionsHeader.innerHTML = '<div class="text text-right">Actions</div>';
      theadRow.appendChild(actionsHeader);
    }
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      if (row.querySelector('.actions-cell')) return;

      let detailUrl = null;
      let originalLink = null;
      
      const links = row.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.endsWith('/change/') || href.includes('/change/?') || href.includes('/change/&') || /\/\d+\/change\//.test(href))) {
          detailUrl = href;
          originalLink = link;
        }
      });
      
      if (detailUrl && originalLink) {
        originalLink.classList.add('font-semibold');
        
        const deleteUrl = detailUrl.replace('/change/', '/delete/');
        
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions-cell p-4 text-right align-middle whitespace-nowrap space-x-2';
        
        const detailBtn = document.createElement('a');
        detailBtn.href = detailUrl;
        detailBtn.className = 'inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors';
        detailBtn.setAttribute('data-tooltip', 'Dettaglio');
        detailBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
        `;
        
        const deleteBtn = document.createElement('a');
        deleteBtn.href = deleteUrl;
        deleteBtn.className = 'inline-flex items-center justify-center p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors';
        deleteBtn.setAttribute('data-tooltip', 'Elimina');
        deleteBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        `;
        
        actionsCell.appendChild(detailBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
      } else {
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions-cell';
        row.appendChild(actionsCell);
      }
    });
  };

  window.reinitializePageComponents = function() {
    if (window.SelectBox && !window.SelectBox.add_to_cache.__patched) {
      const origAddToCache = window.SelectBox.add_to_cache;
      window.SelectBox.add_to_cache = function(field_id, option) {
        if (!window.SelectBox.cache[field_id]) {
          window.SelectBox.cache[field_id] = [];
        }
        return origAddToCache.apply(this, arguments);
      };
      window.SelectBox.add_to_cache.__patched = true;
    }

    if (typeof window.initCustomSelects === 'function') window.initCustomSelects();
    if (typeof window.initDragAndDropSelectors === 'function') window.initDragAndDropSelectors();
    if (typeof window.initDragAndDropUploaders === 'function') window.initDragAndDropUploaders();
    if (typeof window.convertDateTimeInputs === 'function') window.convertDateTimeInputs();
    if (typeof window.initObjectTools === 'function') window.initObjectTools();
    if (typeof window.initChangeFormTabs === 'function') window.initChangeFormTabs();
    if (typeof window.initChangeListTable === 'function') window.initChangeListTable();
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.reinitializePageComponents();
    
    const docObserver = new MutationObserver((mutations) => {
      let hasSelects = false;
      let hasSelectors = false;
      let hasDateTime = false;
      let hasTools = false;
      let hasInlines = false;
      let hasFileInputs = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SELECT' || node.querySelector('select')) {
              hasSelects = true;
            }
            if (node.classList.contains('selector') || node.querySelector('.selector')) {
              hasSelectors = true;
            }
            if (node.classList.contains('vDateField') || node.querySelector('.vDateField') || node.classList.contains('vTimeField') || node.querySelector('.vTimeField')) {
              hasDateTime = true;
            }
            if (node.classList.contains('object-tools') || node.querySelector('.object-tools')) {
              hasTools = true;
            }
            if (node.classList.contains('inline-related') || node.querySelector('.inline-related')) {
              hasInlines = true;
            }
            if ((node.tagName === 'INPUT' && node.type === 'file') || node.querySelector('input[type="file"]')) {
              hasFileInputs = true;
            }
          }
        });
      });
      
      if (hasSelects && typeof window.initCustomSelects === 'function') {
        window.initCustomSelects();
      }
      if (hasSelectors && typeof window.initDragAndDropSelectors === 'function') {
        window.initDragAndDropSelectors();
      }
      if (hasDateTime && typeof window.convertDateTimeInputs === 'function') {
        window.convertDateTimeInputs();
      }
      if (hasTools && typeof window.initObjectTools === 'function') {
        window.initObjectTools();
      }
      if (hasInlines && typeof window.initCollapsibleInlines === 'function') {
        window.initCollapsibleInlines();
      }
      if (hasFileInputs && typeof window.initDragAndDropUploaders === 'function') {
        window.initDragAndDropUploaders();
      }
    });
    
    docObserver.observe(document.body, { childList: true, subtree: true });
    
    document.addEventListener('formset:added', () => {
      if (typeof window.initCollapsibleInlines === 'function') {
        window.initCollapsibleInlines();
      }
    });
    
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button[type="submit"], input[type="submit"]');
      if (btn && btn.form) {
        btn.form._clickedSubmitButton = btn;
      }
    });

    // --- Mobile Sidebar Toggle (Dropdown style) ---
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#sidebar-toggle');
      const sidebar = document.getElementById('nav-sidebar');
      
      if (toggleBtn && sidebar) {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
      } else if (sidebar && sidebar.classList.contains('mobile-open')) {
        // Close if click is outside sidebar and not on the toggle button
        if (!e.target.closest('#nav-sidebar') && !e.target.closest('#header')) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });

    document.addEventListener('page:updated', () => {
      const sidebar = document.getElementById('nav-sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');
    });
  });
})();

