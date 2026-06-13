(function() {
  window.closePopupModal = function() {
    const modal = document.querySelector('.modal-overlay-popup');
    if (!modal) return;
    
    const dialog = modal.querySelector('.modal-dialog');
    modal.classList.add('opacity-0');
    if (dialog) dialog.classList.add('scale-95');
    setTimeout(() => modal.remove(), 200);
  };

  window.initIframePopupHijacker = function() {
    const originalWindowOpen = window.open;
    
    window.open = function(url, name, specs) {
      const urlStr = url ? url.toString() : '';
      if (urlStr && (urlStr.includes('_popup=1') || urlStr.includes('?_popup=1') || urlStr.includes('&_popup=1'))) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay-popup fixed inset-0 bg-black/60 backdrop-blur-md z-[999998] flex items-center justify-center p-4 opacity-0 transition-opacity duration-200 ease-out';
        
        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog bg-white dark:bg-[#1c1c1e] border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] overflow-hidden transform scale-95 transition-transform duration-200 ease-out flex flex-col';
        
        const header = document.createElement('div');
        header.className = 'px-6 py-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/50 dark:border-zinc-800/80 flex items-center justify-between shrink-0';
        
        const title = document.createElement('h3');
        title.className = 'text-sm font-bold text-slate-800 dark:text-zinc-150';
        title.textContent = 'Aggiungi / Modifica Elemento';
        
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer';
        closeBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>';
        closeBtn.onclick = window.closePopupModal;
        
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
        if (name) {
          iframe.name = name;
          iframe.id = name;
        }
        iframe.className = 'w-full h-full border-none opacity-0 transition-opacity duration-300';
        iframe.src = urlStr;
        
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
            window.closePopupModal();
            document.removeEventListener('keydown', escHandler);
          }
        };
        document.addEventListener('keydown', escHandler);
        
        return {
          closed: false,
          focus: function() {},
          close: function() {
            window.closePopupModal();
          }
        };
      }
      return originalWindowOpen.apply(this, arguments);
    };
    
    const interceptAndWrap = (propName) => {
      let val = window[propName];
      Object.defineProperty(window, propName, {
        get: () => {
          return val;
        },
        set: (newVal) => {
          if (typeof newVal === 'function' && !newVal.__wrapped) {
            const wrapped = function() {
              newVal.apply(this, arguments);
              window.closePopupModal();
            };
            wrapped.__wrapped = true;
            val = wrapped;
          } else {
            val = newVal;
          }
        },
        configurable: true,
        enumerable: true
      });
      if (typeof val === 'function') {
        window[propName] = val;
      }
    };
    
    interceptAndWrap('dismissAddAnotherPopup');
    interceptAndWrap('dismissChangeRelatedObjectPopup');
    interceptAndWrap('dismissDeleteRelatedObjectPopup');
  };

  // Run automatically immediately
  window.initIframePopupHijacker();

  window.showDeleteModal = function(deleteUrl) {
    if (document.getElementById('custom-delete-modal')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'custom-delete-modal';
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[999999] flex items-center justify-center p-4 opacity-0 transition-opacity duration-200 ease-out';
    
    const dialog = document.createElement('div');
    dialog.className = 'bg-white dark:bg-[#1c1c1e] border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden transform scale-95 transition-transform duration-200 ease-out flex flex-col max-h-[85vh]';
    
    const header = document.createElement('div');
    header.className = 'px-6 py-4 bg-red-500 text-white flex items-center gap-3 shrink-0';
    header.innerHTML = `
      <svg class="w-6 h-6 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <div>
        <h3 class="text-base font-bold text-white leading-tight">Confirm Deletion</h3>
        <p class="text-red-105 text-xs mt-0.5 font-medium">This action cannot be undone.</p>
      </div>
    `;
    
    const body = document.createElement('div');
    body.className = 'p-6 overflow-y-auto flex-1 text-slate-800 dark:text-zinc-200';
    body.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    `;
    
    const footer = document.createElement('div');
    footer.className = 'px-6 py-4 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-150 dark:border-zinc-800/80 flex items-center justify-end gap-3 shrink-0';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'px-4 py-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-750 rounded-lg shadow-sm transition-colors cursor-pointer';
    cancelBtn.textContent = 'Cancel';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.disabled = true;
    confirmBtn.className = 'px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer';
    confirmBtn.textContent = 'Yes, Delete';
    
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    
    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      dialog.classList.remove('scale-95');
    }, 10);
    
    const closeModal = () => {
      overlay.classList.add('opacity-0');
      dialog.classList.add('scale-95');
      setTimeout(() => overlay.remove(), 200);
    };
    
    cancelBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
    
    fetch(deleteUrl)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const lackingPerms = doc.querySelector('.p-4.bg-red-50, div > div.bg-red-50');
        const summary = doc.querySelector('#deleted-objects')?.closest('div.border') || doc.querySelector('#deleted-objects');
        
        body.innerHTML = '';
        
        if (lackingPerms) {
          body.appendChild(lackingPerms.cloneNode(true));
          confirmBtn.style.display = 'none';
        } else if (summary) {
          const promptText = document.createElement('p');
          promptText.className = 'text-sm font-medium text-slate-700 dark:text-zinc-300 mb-4';
          promptText.textContent = 'Are you sure you want to delete this item? All of the following related items will be deleted:';
          body.appendChild(promptText);
          body.appendChild(summary.cloneNode(true));
          confirmBtn.disabled = false;
        } else {
          const p = document.createElement('p');
          p.className = 'text-sm font-medium text-slate-700 dark:text-zinc-300';
          p.textContent = 'Are you sure you want to delete this item?';
          body.appendChild(p);
          confirmBtn.disabled = false;
        }
        
        confirmBtn.onclick = () => {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Deleting...';
          
          const csrf = doc.querySelector('input[name="csrfmiddlewaretoken"]')?.value || document.querySelector('[name=csrfmiddlewaretoken]')?.value;
          const formData = new FormData();
          if (csrf) {
            formData.append('csrfmiddlewaretoken', csrf);
          }
          formData.append('post', 'yes');
          
          fetch(deleteUrl, {
            method: 'POST',
            body: formData
          })
          .then(res => {
            if (!res.ok) throw new Error('Delete failed');
            return res.text();
          })
          .then(html => {
            closeModal();
            
            const parser = new DOMParser();
            const responseDoc = parser.parseFromString(html, 'text/html');
            window.showToastsFromDocument(responseDoc);
            
            if (typeof loadChangelistPage === 'function') {
              loadChangelistPage(window.location.href, false);
            } else {
              window.location.reload();
            }
          })
          .catch(err => {
            console.error('Delete error:', err);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Yes, Delete';
            const errorMsg = document.createElement('p');
            errorMsg.className = 'text-sm text-red-500 font-medium mt-4';
            errorMsg.textContent = 'Error executing deletion. Please try again.';
            body.appendChild(errorMsg);
          });
        };
      })
      .catch(err => {
        body.innerHTML = '<p class="text-sm text-red-500 font-medium">Error loading deletion data. Please try again.</p>';
      });
  };

  document.addEventListener('click', (e) => {
    const deleteLink = e.target.closest('a[href*="/delete/"]');
    if (!deleteLink) return;
    if (document.body.classList.contains('delete-confirmation')) return;
    
    e.preventDefault();
    e.stopPropagation();
    window.showDeleteModal(deleteLink.href);
  });
})();
