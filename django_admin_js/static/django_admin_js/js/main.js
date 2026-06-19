(function() {
  window.initLanguageSwitcher = function() {
    const langBtn = document.getElementById('language-switcher-btn');
    const langDropdown = document.getElementById('language-switcher-dropdown');
    if (langBtn && langDropdown) {
      if (!langBtn.hasAttribute('data-bound')) {
        langBtn.setAttribute('data-bound', 'true');
        langBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          langDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
          langDropdown.classList.add('hidden');
        });
        langDropdown.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }
  };

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
        if (href && href.includes('/change/')) {
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
        detailBtn.className = 'action-btn action-btn-warn';
        detailBtn.setAttribute('data-tooltip', 'Modifica');
        detailBtn.innerHTML = `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
        `;
        
        const deleteBtn = document.createElement('a');
        deleteBtn.href = deleteUrl;
        deleteBtn.className = 'action-btn action-btn-delete';
        deleteBtn.setAttribute('data-tooltip', 'Elimina');
        deleteBtn.innerHTML = `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
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

  window.initCollapsibleSidebarApps = function() {
    const settings = window.DJANGO_ADMIN_JS_SETTINGS || {};
    if (!settings.sidebarCollapsible) return;

    document.querySelectorAll('.sidebar-app-header').forEach(header => {
      if (header.hasAttribute('data-collapsible-init')) return;
      header.setAttribute('data-collapsible-init', 'true');

      const modelsList = header.nextElementSibling;
      const chevron = header.querySelector('.sidebar-app-chevron');
      if (!modelsList || !modelsList.classList.contains('sidebar-models-list')) return;

      // Check if there is an active item inside this app card
      const hasActive = modelsList.querySelector('.border-l-4') !== null || modelsList.querySelector('[aria-current="page"]') !== null;

      // Handle default collapsed state (unless it has active items)
      if (settings.sidebarCollapsedDefault && !hasActive) {
        modelsList.classList.add('hidden');
        if (chevron) {
          chevron.style.transform = 'rotate(-90deg)';
        }
      }

      // Add click listener
      header.addEventListener('click', () => {
        const isCollapsed = modelsList.classList.contains('hidden');
        if (isCollapsed) {
          modelsList.classList.remove('hidden');
          modelsList.classList.add('animate-fade-in');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
          modelsList.classList.add('hidden');
          modelsList.classList.remove('animate-fade-in');
          if (chevron) chevron.style.transform = 'rotate(-90deg)';
        }
      });
    });
  };

  window.initPillBreadcrumbs = function() {
    document.querySelectorAll('.breadcrumbs').forEach(container => {
      if (container.hasAttribute('data-pills-init')) return;
      container.setAttribute('data-pills-init', 'true');

      const items = [];
      container.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'A') {
            items.push({
              type: 'link',
              text: node.textContent.trim(),
              href: node.getAttribute('href')
            });
          } else if (node.tagName === 'SPAN') {
            const text = node.textContent.trim();
            if (text && text !== '/' && text !== '›' && text !== '»' && text !== '>') {
              items.push({
                type: 'text',
                text: text
              });
            }
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text && text !== '/' && text !== '›' && text !== '»' && text !== '>') {
            items.push({
              type: 'text',
              text: text
            });
          }
        }
      });

      if (items.length === 0) return;

      container.className = 'breadcrumbs flex flex-wrap items-center gap-2 text-xs font-semibold';
      container.innerHTML = '';

      items.forEach((item, index) => {
        if (index > 0) {
          const sep = document.createElement('span');
          sep.className = 'text-slate-300 dark:text-zinc-700 mx-0.5 flex items-center shrink-0';
          sep.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>';
          container.appendChild(sep);
        }

        const pill = document.createElement(item.type === 'link' ? 'a' : 'span');
        pill.textContent = item.text;
        
        if (item.type === 'link') {
          pill.href = item.href;
          pill.className = 'px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-zinc-800/50 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-apple-blue border border-slate-300/30 dark:border-zinc-700/30 transition-all duration-200 text-zinc-650 dark:text-zinc-350';
        } else {
          pill.className = 'px-3 py-1.5 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 text-apple-blue border border-apple-blue/20';
        }
        container.appendChild(pill);
      });
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

    const safeCall = (fn, name) => {
      if (typeof fn === 'function') {
        try {
          fn();
        } catch (e) {
          console.error(`Error executing ${name}:`, e);
        }
      }
    };

    safeCall(window.initCustomSelects, 'initCustomSelects');
    safeCall(window.initDragAndDropSelectors, 'initDragAndDropSelectors');
    safeCall(window.initDragAndDropUploaders, 'initDragAndDropUploaders');
    safeCall(window.convertDateTimeInputs, 'convertDateTimeInputs');
    safeCall(window.initObjectTools, 'initObjectTools');
    safeCall(window.initChangeFormTabs, 'initChangeFormTabs');
    safeCall(window.initChangeListTable, 'initChangeListTable');
    safeCall(window.initCollapsibleSidebarApps, 'initCollapsibleSidebarApps');
    safeCall(window.initPillBreadcrumbs, 'initPillBreadcrumbs');
    safeCall(window.initLanguageSwitcher, 'initLanguageSwitcher');

    // Adjust TOTAL_FORMS for inline formsets to match the actual rendered rows
    document.querySelectorAll('.inline-group').forEach(group => {
      const totalFormsInput = group.querySelector('input[name$="-TOTAL_FORMS"]');
      if (totalFormsInput) {
        const rowsCount = group.querySelectorAll('tbody tr.form-row').length;
        totalFormsInput.value = rowsCount;
      }
    });

    // Re-initialize Django Related Object Lookups links (edit/view) after PJAX load
    document.querySelectorAll('.related-widget-wrapper').forEach(wrapper => {
      const select = wrapper.querySelector('select');
      if (!select) return;
      
      const updateLinks = () => {
        const val = select.value;
        wrapper.querySelectorAll('.related-widget-wrapper-link').forEach(link => {
          if (link.classList.contains('add-related')) return;
          const template = link.getAttribute('data-href-template');
          if (template) {
            if (val) {
              link.href = template.replace('__fk__', val);
              link.style.setProperty('display', 'inline-flex', 'important');
            } else {
              link.removeAttribute('href');
              link.style.setProperty('display', 'none', 'important');
            }
          }
        });
      };

      updateLinks();

      if (!select.hasAttribute('data-related-links-bound')) {
        select.setAttribute('data-related-links-bound', 'true');
        select.addEventListener('change', updateLinks);
      }
    });

    // Define and apply custom actions.js override for Django Admin list views
    if (window.django && window.django.jQuery) {
      const $ = window.django.jQuery;
      
      // Override default actions plugin to be safe for PJAX re-loading
      $.fn.actions = function(opts) {
        const actionCheckboxes = this;
        const $actionToggle = $('#action-toggle');
        const $counter = $('.action-counter');
        const $question = $('.actions .question');
        const $clear = $('.actions .clear');
        const $allSpan = $('.actions .all');
        const $selectAcrossInput = $('input[name="select_across"]');
        let lastChecked = null;

        function updateCounter() {
          const checkedCount = actionCheckboxes.filter(':checked').length;
          const total = actionCheckboxes.length;
          
          if ($counter.length) {
            $counter.text(checkedCount + ' of ' + total + ' selected');
          }

          $actionToggle.prop('checked', checkedCount === total);
          
          if ($question.length && $clear.length && $allSpan.length) {
            if (checkedCount === total) {
              if ($selectAcrossInput.val() === '1') {
                $question.addClass('hidden');
                $clear.removeClass('hidden');
                $allSpan.removeClass('hidden');
              } else {
                $question.removeClass('hidden');
                $clear.addClass('hidden');
                $allSpan.addClass('hidden');
              }
            } else {
              $question.addClass('hidden');
              $clear.addClass('hidden');
              $allSpan.addClass('hidden');
              $selectAcrossInput.val('0');
            }
          }

          actionCheckboxes.each(function() {
            const $row = $(this).closest('tr');
            if (this.checked) {
              $row.addClass('selected bg-apple-blue/5 dark:bg-apple-blue/10');
            } else {
              $row.removeClass('selected bg-apple-blue/5 dark:bg-apple-blue/10');
            }
          });
        }

        $actionToggle.off('click.django_admin_js').on('click.django_admin_js', function() {
          const checked = this.checked;
          actionCheckboxes.prop('checked', checked);
          updateCounter();
        });

        actionCheckboxes.off('click.django_admin_js').on('click.django_admin_js', function(e) {
          const index = actionCheckboxes.index(this);
          if (e.shiftKey && lastChecked !== null) {
            const start = Math.min(index, lastChecked);
            const end = Math.max(index, lastChecked);
            actionCheckboxes.slice(start, end + 1).prop('checked', this.checked);
          }
          lastChecked = index;
          updateCounter();
        });

        $question.find('a').off('click.django_admin_js').on('click.django_admin_js', function(e) {
          e.preventDefault();
          $selectAcrossInput.val('1');
          updateCounter();
        });

        $clear.find('a').off('click.django_admin_js').on('click.django_admin_js', function(e) {
          e.preventDefault();
          $selectAcrossInput.val('0');
          actionCheckboxes.prop('checked', false);
          updateCounter();
        });

        updateCounter();
        return this;
      };

      const $actionsPattern = $('tr input.action-select');
      if ($actionsPattern.length) {
        try {
          $actionsPattern.actions();
        } catch (e) {
          console.error("Failed to execute overridden actions:", e);
        }
      }
    }
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
            // Check if the added node itself is a SELECT or contains a SELECT that hasn't been initialized yet
            const isUninitializedSelect = (n) => n.tagName === 'SELECT' && !n.hasAttribute('data-custom-select');
            if (isUninitializedSelect(node) || Array.from(node.querySelectorAll('select')).some(isUninitializedSelect)) {
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

    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form && typeof form.querySelectorAll === 'function') {
        form.querySelectorAll('.inline-group').forEach(group => {
          const totalFormsInput = group.querySelector('input[name$="-TOTAL_FORMS"]');
          if (totalFormsInput) {
            const rowsCount = group.querySelectorAll('tbody tr.form-row').length;
            totalFormsInput.value = rowsCount;
          }
        });
      }
    }, true);

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

    // Intercept Django popup dismissals to reload the page via PJAX and update inline lists
    const originalDismissAddRelatedObjectPopup = window.dismissAddRelatedObjectPopup;
    window.dismissAddRelatedObjectPopup = function(win, newId, newRepr) {
      if (originalDismissAddRelatedObjectPopup) {
        try {
          originalDismissAddRelatedObjectPopup(win, newId, newRepr);
        } catch (e) {
          console.warn("Failed calling original dismissAddRelatedObjectPopup:", e);
        }
      }
      // Only reload if this popup was opened from our inline table action
      if (win && win.name && win.name.includes('_inline_')) {
        if (window.loadAdminPage) {
          window.loadAdminPage(window.location.href, false);
        } else {
          window.location.reload();
        }
      }
    };

    const originalDismissChangeRelatedObjectPopup = window.dismissChangeRelatedObjectPopup;
    window.dismissChangeRelatedObjectPopup = function(win, objId, newRepr, newVal) {
      if (originalDismissChangeRelatedObjectPopup) {
        try {
          originalDismissChangeRelatedObjectPopup(win, objId, newRepr, newVal);
        } catch (e) {
          console.warn("Failed calling original dismissChangeRelatedObjectPopup:", e);
        }
      }
      // Only reload if this popup was opened from our inline table action
      if (win && win.name && win.name.includes('_inline_')) {
        if (window.loadAdminPage) {
          window.loadAdminPage(window.location.href, false);
        } else {
          window.location.reload();
        }
      }
    };

    // Handle in-page modals for tabular inline add/edit buttons to bypass window.open completely
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-related-inline-btn, a[href*="/change/"]');
      if (!btn || !btn.closest('.tabular')) return;
      
      const href = btn.getAttribute('href');
      if (!href || !href.includes('_popup=1')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      openInPageModal(href, btn.title || 'Aggiungi / Modifica Elemento');
    });

    function openInPageModal(url, titleText) {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay-popup fixed inset-0 bg-black/60 backdrop-blur-md z-[999998] flex items-center justify-center p-4 opacity-0 transition-opacity duration-200 ease-out';
      
      const dialog = document.createElement('div');
      dialog.className = 'modal-dialog bg-white dark:bg-[#1c1c1e] border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] overflow-hidden transform scale-95 transition-transform duration-200 ease-out flex flex-col';
      
      const header = document.createElement('div');
      header.className = 'px-6 py-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/50 dark:border-zinc-800/80 flex items-center justify-between shrink-0';
      
      const title = document.createElement('h3');
      title.className = 'text-sm font-bold text-slate-800 dark:text-zinc-150';
      title.textContent = titleText;
      
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer';
      closeBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>';
      closeBtn.onclick = function() {
        overlay.classList.add('opacity-0');
        dialog.classList.add('scale-95');
        setTimeout(() => overlay.remove(), 200);
      };
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      dialog.appendChild(header);
      
      const body = document.createElement('div');
      body.className = 'flex-1 relative bg-slate-50/50 dark:bg-zinc-950/20';
      
      const loader = document.createElement('div');
      loader.className = 'absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1c1c1e] transition-opacity duration-300';
      loader.innerHTML = `
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;
      body.appendChild(loader);
      
      const iframe = document.createElement('iframe');
      const iframeName = 'iframe_popup_inline_' + Date.now();
      iframe.name = iframeName;
      iframe.id = iframeName;
      iframe.className = 'w-full h-full border-none opacity-0 transition-opacity duration-300';
      iframe.src = url;
      
      iframe.onload = function() {
        try {
          iframe.contentWindow.opener = window;
          if (iframe.contentWindow.document.title) {
            title.textContent = iframe.contentWindow.document.title;
          }
        } catch(e) {
          console.error("Iframe opener linking error:", e);
        }
        loader.classList.add('opacity-0');
        setTimeout(() => loader.remove(), 300);
        iframe.classList.remove('opacity-0');
      };
      
      body.appendChild(iframe);
      dialog.appendChild(body);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      setTimeout(() => {
        overlay.classList.remove('opacity-0');
        dialog.classList.remove('scale-95');
      }, 10);
      
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeBtn.click();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    }
  });
})();

