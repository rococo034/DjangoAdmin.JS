(function() {
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  window.initDragAndDropUploaders = function() {
    const fileInputs = document.querySelectorAll('input[type="file"]:not([data-drag-uploader-init])');
    fileInputs.forEach(input => {
      input.setAttribute('data-drag-uploader-init', 'true');
      
      input.style.position = 'absolute';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.padding = '0';
      input.style.margin = '-1px';
      input.style.overflow = 'hidden';
      input.style.clip = 'rect(0,0,0,0)';
      input.style.border = '0';

      const wrapper = document.createElement('div');
      wrapper.className = 'drag-drop-wrapper w-full max-w-lg mt-1';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const parent = wrapper.parentNode;
      let existingFileUrl = null;
      let existingFileName = null;
      let clearCheckbox = null;

      const links = parent.querySelectorAll('a');
      links.forEach(link => {
        if (link.href && (link.href.includes('/media/') || link.href.includes('/static/') || link.href.includes('product') || link.href.includes('upload') || link.href.includes('products') || /\.(jpg|jpeg|png|gif|svg|webp|pdf|txt|doc|docx|xls|xlsx|zip|tar|gz|mp4|avi)$/i.test(link.href))) {
          existingFileUrl = link.href;
          existingFileName = link.textContent.trim();
        }
      });

      const checkboxes = parent.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.name && cb.name.includes('-clear')) {
          clearCheckbox = cb;
        }
      });

      const mainLabel = parent.querySelector(`label[for="${input.id}"]`) || parent.querySelector('label:not([for*="-clear"])');
      
      Array.from(parent.childNodes).forEach(node => {
        if (node === wrapper || node === mainLabel) {
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList.contains('errorlist') || node.classList.contains('help')) {
            return;
          }
          if (node === clearCheckbox) {
            node.style.display = 'none';
            return;
          }
          node.style.display = 'none';
        } else if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = '';
        }
      });

      const dropzone = document.createElement('div');
      dropzone.className = 'drag-drop-zone border-2 border-dashed border-gray-300 dark:border-gray-700/85 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500/80 dark:hover:border-indigo-400/80 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/5 transition-all duration-250 flex flex-col items-center justify-center gap-2 select-none min-h-[140px]';
      dropzone.innerHTML = `
        <svg class="w-8 h-8 text-gray-400 dark:text-zinc-550 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <span class="text-xs font-bold text-gray-700 dark:text-zinc-350">Trascina un file qui o clicca per caricare</span>
        <span class="text-[10px] text-gray-450 dark:text-zinc-500">Supporta qualsiasi tipo di file (max 10MB)</span>
      `;
      wrapper.appendChild(dropzone);

      const preview = document.createElement('div');
      preview.className = 'drag-drop-preview hidden border border-gray-200 dark:border-gray-800/80 rounded-2xl p-4 bg-gray-50/50 dark:bg-zinc-950/20 backdrop-blur-md flex items-center justify-between gap-4';
      
      const previewInfo = document.createElement('div');
      previewInfo.className = 'flex items-center gap-3 min-w-0';
      
      const previewThumb = document.createElement('div');
      previewThumb.className = 'w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-gray-150 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm';
      previewThumb.innerHTML = `<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`;
      
      const previewMeta = document.createElement('div');
      previewMeta.className = 'min-w-0';
      
      const previewName = document.createElement('p');
      previewName.className = 'text-xs font-bold text-gray-800 dark:text-zinc-200 truncate leading-tight';
      
      const previewSize = document.createElement('p');
      previewSize.className = 'text-[10px] text-gray-450 dark:text-zinc-500 font-semibold leading-none mt-1';
      
      previewMeta.appendChild(previewName);
      previewMeta.appendChild(previewSize);
      previewInfo.appendChild(previewThumb);
      previewInfo.appendChild(previewMeta);
      
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'p-1.5 rounded-lg text-red-650 dark:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer flex items-center justify-center';
      removeBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
      
      preview.appendChild(previewInfo);
      preview.appendChild(removeBtn);
      wrapper.appendChild(preview);

      if (existingFileUrl) {
        dropzone.classList.add('hidden');
        preview.classList.remove('hidden');
        
        const fileLink = document.createElement('a');
        fileLink.href = existingFileUrl;
        fileLink.target = '_blank';
        fileLink.className = 'hover:underline text-indigo-600 dark:text-indigo-400 font-bold';
        fileLink.textContent = existingFileName || 'Allegato esistente';
        
        previewName.innerHTML = '';
        previewName.appendChild(fileLink);
        previewSize.textContent = 'Già salvato (Clicca per aprire)';
        
        const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(existingFileUrl);
        if (isImage) {
          previewThumb.innerHTML = `<a href="${existingFileUrl}" target="_blank" class="w-full h-full block"><img src="${existingFileUrl}" class="w-full h-full object-cover hover:opacity-80 transition-opacity"></a>`;
        }
      }

      dropzone.addEventListener('click', () => {
        input.click();
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-indigo-500', 'bg-indigo-50/10', 'dark:bg-indigo-950/5');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/10', 'dark:bg-indigo-950/5');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/10', 'dark:bg-indigo-950/5');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          input.files = e.dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      input.addEventListener('change', () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          dropzone.classList.add('hidden');
          preview.classList.remove('hidden');
          previewName.textContent = file.name;
          previewSize.textContent = formatBytes(file.size);
          
          if (clearCheckbox) {
            clearCheckbox.checked = false;
          }

          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              previewThumb.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
          } else {
            previewThumb.innerHTML = `<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`;
          }
        }
      });

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = '';
        
        if (clearCheckbox) {
          clearCheckbox.checked = true;
        }

        preview.classList.add('hidden');
        dropzone.classList.remove('hidden');
        previewThumb.innerHTML = '';
      });
    });
  };
})();
