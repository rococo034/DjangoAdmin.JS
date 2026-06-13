(function() {
  window.initDragAndDropSelectors = function() {
    const selectors = document.querySelectorAll('.selector:not([data-drag-init])');
    
    selectors.forEach(selector => {
      selector.setAttribute('data-drag-init', 'true');
      
      const availableSelect = selector.querySelector('.selector-available select');
      const chosenSelect = selector.querySelector('.selector-chosen select');
      
      if (!availableSelect || !chosenSelect) return;
      
      const availableList = document.createElement('ul');
      availableList.className = 'custom-drag-list space-y-1.5 p-2 bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800/80 rounded-xl min-h-[200px] max-h-60 overflow-y-auto w-full mt-2';
      
      const chosenList = document.createElement('ul');
      chosenList.className = 'custom-drag-list space-y-1.5 p-2 bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800/80 rounded-xl min-h-[200px] max-h-60 overflow-y-auto w-full mt-2';
      
      availableSelect.style.display = 'none';
      chosenSelect.style.display = 'none';
      
      availableSelect.parentNode.insertBefore(availableList, availableSelect.nextSibling);
      chosenSelect.parentNode.insertBefore(chosenList, chosenSelect.nextSibling);
      
      let lastClickedIndex = null;
      let lastClickedList = null;
      
      const renderList = (selectElement, listElement, targetSelectElement) => {
        listElement.innerHTML = '';
        
        Array.from(selectElement.options).forEach((opt, index) => {
          const li = document.createElement('li');
          li.className = 'custom-drag-item flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm cursor-grab hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all text-sm text-gray-800 dark:text-gray-200 select-none';
          li.draggable = true;
          li.setAttribute('data-value', opt.value);
          li.setAttribute('data-index', index);
          li.textContent = opt.text;
          
          li.addEventListener('click', (e) => {
            e.stopPropagation();
            const items = Array.from(listElement.querySelectorAll('.custom-drag-item'));
            
            const otherList = listElement === availableList ? chosenList : availableList;
            otherList.querySelectorAll('.custom-drag-item').forEach(el => el.classList.remove('!bg-indigo-50', 'dark:!bg-indigo-950/40', '!border-indigo-300', 'dark:!border-indigo-700', 'is-selected'));
            
            if (e.ctrlKey || e.metaKey) {
              li.classList.toggle('is-selected');
              li.classList.toggle('!bg-indigo-50');
              li.classList.toggle('dark:!bg-indigo-950/40');
              li.classList.toggle('!border-indigo-300');
              li.classList.toggle('dark:!border-indigo-700');
            } else if (e.shiftKey && lastClickedList === listElement && lastClickedIndex !== null) {
              const start = Math.min(lastClickedIndex, index);
              const end = Math.max(lastClickedIndex, index);
              items.forEach((item, idx) => {
                if (idx >= start && idx <= end) {
                  item.classList.add('is-selected', '!bg-indigo-50', 'dark:!bg-indigo-950/40', '!border-indigo-300', 'dark:!border-indigo-700');
                }
              });
            } else {
              items.forEach(item => item.classList.remove('!bg-indigo-50', 'dark:!bg-indigo-950/40', '!border-indigo-300', 'dark:!border-indigo-700', 'is-selected'));
              li.classList.add('is-selected', '!bg-indigo-50', 'dark:!bg-indigo-950/40', '!border-indigo-300', 'dark:!border-indigo-700');
            }
            
            lastClickedIndex = index;
            lastClickedList = listElement;
          });
          
          li.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const selectedItems = Array.from(listElement.querySelectorAll('.is-selected'));
            if (selectedItems.length > 0 && selectedItems.includes(li)) {
              const values = selectedItems.map(item => item.getAttribute('data-value'));
              moveMultipleItems(values, selectElement, targetSelectElement);
            } else {
              moveMultipleItems([opt.value], selectElement, targetSelectElement);
            }
          });
          
          li.addEventListener('dragstart', (e) => {
            const selectedItems = Array.from(listElement.querySelectorAll('.is-selected'));
            let values = [];
            
            if (selectedItems.length > 0 && selectedItems.includes(li)) {
              values = selectedItems.map(item => item.getAttribute('data-value'));
              selectedItems.forEach(item => item.classList.add('opacity-50'));
            } else {
              values = [opt.value];
              li.classList.add('opacity-50');
            }
            
            e.dataTransfer.setData('text/plain', JSON.stringify(values));
            e.dataTransfer.effectAllowed = 'move';
          });
          
          li.addEventListener('dragend', () => {
            const items = Array.from(listElement.querySelectorAll('.custom-drag-item'));
            items.forEach(item => item.classList.remove('opacity-50'));
          });
          
          listElement.appendChild(li);
        });
      };
      
      const moveMultipleItems = (values, fromSelect, toSelect) => {
        values.forEach(value => {
          const option = Array.from(fromSelect.options).find(o => o.value === value);
          if (option) {
            if (window.SelectBox) {
              SelectBox.add_to_cache(toSelect.id, {value: option.value, text: option.text});
              SelectBox.delete_from_cache(fromSelect.id, option.value);
            } else {
              toSelect.appendChild(option);
              if (toSelect === chosenSelect) {
                option.selected = true;
              } else {
                option.selected = false;
              }
            }
          }
        });
        
        if (window.SelectBox) {
          SelectBox.redisplay(fromSelect.id);
          SelectBox.redisplay(toSelect.id);
        }
        
        fromSelect.dispatchEvent(new Event('change', { bubbles: true }));
        toSelect.dispatchEvent(new Event('change', { bubbles: true }));
        syncLists();
      };
      
      const syncLists = () => {
        renderList(availableSelect, availableList, chosenSelect);
        renderList(chosenSelect, chosenList, availableSelect);
      };
      
      const setupDragOver = (listElement, selectElement, targetSelectElement) => {
        listElement.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          listElement.classList.add('border-indigo-500/50', 'bg-indigo-50/20', 'dark:bg-indigo-950/10');
        });
        
        listElement.addEventListener('dragleave', () => {
          listElement.classList.remove('border-indigo-500/50', 'bg-indigo-50/20', 'dark:bg-indigo-950/10');
        });
        
        listElement.addEventListener('drop', (e) => {
          e.preventDefault();
          listElement.classList.remove('border-indigo-500/50', 'bg-indigo-50/20', 'dark:bg-indigo-950/10');
          try {
            const values = JSON.parse(e.dataTransfer.getData('text/plain'));
            const otherSelect = selectElement === availableSelect ? chosenSelect : availableSelect;
            if (Array.isArray(values)) {
              moveMultipleItems(values, otherSelect, selectElement);
            } else {
              moveMultipleItems([values], otherSelect, selectElement);
            }
          } catch (err) {
            const value = e.dataTransfer.getData('text/plain');
            const otherSelect = selectElement === availableSelect ? chosenSelect : availableSelect;
            moveMultipleItems([value], otherSelect, selectElement);
          }
        });
      };
      
      setupDragOver(availableList, availableSelect, chosenSelect);
      setupDragOver(chosenList, chosenSelect, availableSelect);
      
      syncLists();
      
      const selectObserver = new MutationObserver(() => {
        syncLists();
      });
      selectObserver.observe(availableSelect, { childList: true });
      selectObserver.observe(chosenSelect, { childList: true });
    });
  };
})();
