(function() {
  window.closeAllCustomSelects = function(exceptDropdown = null) {
    document.querySelectorAll('.custom-select-dropdown').forEach(dropdown => {
      if (dropdown !== exceptDropdown) {
        dropdown.classList.add('hidden');
        const container = dropdown.closest('.custom-select-container');
        if (container) container.classList.remove('z-50');
        const arrow = dropdown.previousElementSibling.querySelector('svg');
        if (arrow) arrow.classList.remove('rotate-180');
      }
    });
  };

  document.addEventListener('click', () => {
    window.closeAllCustomSelects();
  });

  window.initCustomSelects = function() {
    const selects = document.querySelectorAll('select:not([multiple]):not([data-custom-select])');
    
    selects.forEach(select => {
      // Exclude filter boxes, autocomplete select2 widgets, and standard admin raw id fields
      if (
        select.closest('#nav-filter') || 
        select.id === 'nav-filter' || 
        select.closest('.nav-filter') ||
        select.classList.contains('admin-autocomplete') ||
        select.getAttribute('data-autocomplete-light-url') ||
        select.classList.contains('select2-hidden-accessible')
      ) {
        return;
      }
      
      select.setAttribute('data-custom-select', 'true');
      select.classList.add('custom-select-hidden');
      
      const container = document.createElement('div');
      container.className = 'custom-select-container relative w-full inline-block min-w-[200px]';
      
      // Insert container right BEFORE the select, keeping the select in its original spot so nextAll works
      select.parentNode.insertBefore(container, select);
      
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger w-full flex items-center justify-between bg-white dark:bg-[#111827] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-left text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out cursor-pointer';
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'custom-select-label truncate pr-4';
      
      const arrowContainer = document.createElement('div');
      arrowContainer.className = 'shrink-0 flex items-center';
      arrowContainer.innerHTML = '<svg class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>';
      const arrow = arrowContainer.firstElementChild;
      
      trigger.appendChild(labelSpan);
      trigger.appendChild(arrowContainer);
      container.appendChild(trigger);
      
      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown hidden absolute left-0 right-0 z-[999] mt-1 w-full bg-white dark:bg-[#111827] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto';
      
      const updateTriggerLabel = () => {
        const selectedOption = select.options[select.selectedIndex];
        labelSpan.textContent = selectedOption ? selectedOption.text : '---------';
      };
      updateTriggerLabel();
      
      let searchInput = null;
      if (select.options.length > 10) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'custom-select-search-container p-2 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#111827] z-10';
        
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
        searchInput.placeholder = 'Cerca...';
        
        searchContainer.appendChild(searchInput);
        dropdown.appendChild(searchContainer);
      }
      
      const optionsList = document.createElement('ul');
      optionsList.className = 'custom-select-options w-full py-1 text-sm';
      
      let optionElements = [];
      
      const buildOptions = () => {
        optionsList.innerHTML = '';
        optionElements = [];
        
        Array.from(select.options).forEach((opt, index) => {
          const li = document.createElement('li');
          li.className = 'custom-select-option w-full px-4 py-2.5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors duration-150';
          li.setAttribute('data-value', opt.value);
          li.setAttribute('data-index', index);
          
          const span = document.createElement('span');
          span.textContent = opt.text;
          li.appendChild(span);
          
          const checkIconContainer = document.createElement('div');
          checkIconContainer.innerHTML = '<svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          const checkSvg = checkIconContainer.firstElementChild;
          li.appendChild(checkSvg);
          
          if (select.selectedIndex === index) {
            checkSvg.classList.remove('hidden');
            li.classList.add('bg-indigo-50/50', 'dark:bg-indigo-950/20', 'font-medium', 'text-indigo-600', 'dark:text-indigo-400');
          }
          
          li.addEventListener('click', (e) => {
            e.stopPropagation();
            select.selectedIndex = index;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            if (window.django && window.django.jQuery) {
              window.django.jQuery(select).trigger('change');
            }
            updateTriggerLabel();
            closeDropdown();
          });
          
          optionsList.appendChild(li);
          optionElements.push({ element: li, text: opt.text.toLowerCase(), checkSvg: checkSvg });
        });
      };
      
      buildOptions();
      dropdown.appendChild(optionsList);
      container.appendChild(dropdown);
      
      const toggleDropdown = () => {
        const isHidden = dropdown.classList.contains('hidden');
        window.closeAllCustomSelects(dropdown);
        
        if (isHidden) {
          dropdown.classList.remove('hidden');
          container.classList.add('z-50');
          arrow.classList.add('rotate-180');
          if (searchInput) {
            searchInput.value = '';
            filterOptions('');
            setTimeout(() => searchInput.focus(), 50);
          }
        } else {
          closeDropdown();
        }
      };
      
      const closeDropdown = () => {
        dropdown.classList.add('hidden');
        container.classList.remove('z-50');
        arrow.classList.remove('rotate-180');
      };
      
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
      });
      
      const filterOptions = (term) => {
        optionElements.forEach(item => {
          if (item.text.includes(term.toLowerCase())) {
            item.element.classList.remove('hidden');
          } else {
            item.element.classList.add('hidden');
          }
        });
      };
      
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          filterOptions(e.target.value);
        });
        searchInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
      
      const observer = new MutationObserver((mutations) => {
        // Only rebuild if the options elements inside the select actually changed
        let optionsChanged = false;
        mutations.forEach(mut => {
          if (mut.type === 'childList') {
            optionsChanged = true;
          }
        });
        if (optionsChanged) {
          buildOptions();
          updateTriggerLabel();
        }
      });
      observer.observe(select, { childList: true });
      
      select.addEventListener('change', () => {
        updateTriggerLabel();
        const idx = select.selectedIndex;
        optionElements.forEach((item, index) => {
          if (index === idx) {
            item.checkSvg.classList.remove('hidden');
            item.element.classList.add('bg-indigo-50/50', 'dark:bg-indigo-950/20', 'font-medium', 'text-indigo-600', 'dark:text-indigo-400');
          } else {
            item.checkSvg.classList.add('hidden');
            item.element.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-950/20', 'font-medium', 'text-indigo-600', 'dark:text-indigo-400');
          }
        });
      });

      // Force triggering Django's jQuery change listener to update sibling action links (add/change/delete/view)
      if (window.django && window.django.jQuery) {
        window.django.jQuery(select).trigger('change');
      }
    });
  };
})();
