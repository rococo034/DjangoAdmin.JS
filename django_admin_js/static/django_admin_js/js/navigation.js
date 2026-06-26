(function() {
  function showProgressBar() {
    let bar = document.getElementById('changelist-loading-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'changelist-loading-bar';
      document.body.appendChild(bar);
    }
    bar.style.width = '0%';
    bar.style.opacity = '1';
    bar.offsetWidth; // Force reflow
    bar.style.width = '30%';
    
    if (window.loadingBarInterval) clearInterval(window.loadingBarInterval);
    window.loadingBarInterval = setInterval(() => {
      const width = parseFloat(bar.style.width);
      if (width < 90) {
        bar.style.width = (width + Math.random() * 8) + '%';
      }
    }, 150);
  }

  function hideProgressBar() {
    if (window.loadingBarInterval) clearInterval(window.loadingBarInterval);
    const bar = document.getElementById('changelist-loading-bar');
    if (bar) {
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.opacity = '0';
        setTimeout(() => {
          bar.style.width = '0%';
        }, 200);
      }, 100);
    }
  }

  function loadScriptsSequentially(scriptElements) {
    if (scriptElements.length === 0) return Promise.resolve();
    
    const script = scriptElements[0];
    const remaining = scriptElements.slice(1);
    
    const src = script.getAttribute('src');
    if (!src) {
      return loadScriptsSequentially(remaining);
    }
    
    const existing = Array.from(document.querySelectorAll('script[src]')).find(s => {
      return s.getAttribute('src') === src || s.src === script.src;
    });
    
    if (existing) {
      return loadScriptsSequentially(remaining);
    }
    
    return new Promise((resolve, reject) => {
      const newScript = document.createElement('script');
      Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.onload = () => {
        loadScriptsSequentially(remaining).then(resolve).catch(reject);
      };
      newScript.onerror = () => {
        loadScriptsSequentially(remaining).then(resolve).catch(reject);
      };
      document.head.appendChild(newScript);
    });
  }

  window.loadAdminPage = function(url, pushToHistory = true, restoreState = null) {
    const contentStart = document.getElementById('content-start');
    if (!contentStart) {
      window.location.href = url;
      return;
    }

    contentStart.classList.add('opacity-50', 'pointer-events-none');
    showProgressBar();

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load page');
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContentStart = doc.getElementById('content-start');
        
        if (newContentStart) {
          if (typeof window.showToastsFromDocument === 'function') {
            window.showToastsFromDocument(doc);
          }
          
          const currentDetails = contentStart.querySelector('details');
          const newDetails = newContentStart.querySelector('details');
          if (currentDetails && newDetails && currentDetails.hasAttribute('open')) {
            newDetails.setAttribute('open', '');
          }

          const externalScripts = [
            ...Array.from(doc.querySelectorAll('head script[src]')),
            ...Array.from(newContentStart.querySelectorAll('script[src]'))
          ];

          loadScriptsSequentially(externalScripts).then(() => {
            contentStart.innerHTML = newContentStart.innerHTML;

            contentStart.querySelectorAll('script:not([src])').forEach(oldScript => {
              const newScript = document.createElement('script');
              Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
              newScript.textContent = oldScript.textContent;
              oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            window.dispatchEvent(new Event('DOMContentLoaded'));
            window.dispatchEvent(new Event('load'));

            if (doc.title) {
              document.title = doc.title;
            }

            const newSidebar = doc.getElementById('nav-sidebar') || doc.querySelector('.nav-sidebar');
            const currentSidebar = document.getElementById('nav-sidebar') || document.querySelector('.nav-sidebar');
            if (newSidebar && currentSidebar) {
              currentSidebar.innerHTML = newSidebar.innerHTML;
            }

            if (pushToHistory) {
              window.history.pushState({ pjax: true, url: url }, '', url);
            }

            if (typeof window.reinitializePageComponents === 'function') {
              window.reinitializePageComponents();
            }

            if (restoreState && restoreState.searchbarActive) {
              const newSearchbar = document.getElementById('searchbar');
              if (newSearchbar) {
                newSearchbar.value = restoreState.value;
                newSearchbar.focus();
                newSearchbar.setSelectionRange(restoreState.cursorStart, restoreState.cursorEnd);
              }
            }

            document.dispatchEvent(new CustomEvent('page:updated', { detail: { url: url } }));
            
            contentStart.classList.remove('opacity-50', 'pointer-events-none');
            hideProgressBar();
          }).catch(err => {
            console.error('Script load error, falling back:', err);
            window.location.href = url;
          });
        } else {
          window.location.href = url;
        }
      })
      .catch(err => {
        console.error('AJAX navigation error, falling back:', err);
        window.location.href = url;
      });
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.history.state) {
      window.history.replaceState({ pjax: true, url: window.location.href }, '', window.location.href);
    }

    let searchDebounceTimeout = null;
    document.addEventListener('input', (e) => {
      const settings = window.DJANGO_ADMIN_JS_SETTINGS || {};
      if (!settings.liveSearch) return;
      const searchbar = e.target.closest('#searchbar');
      if (!searchbar) return;

      const form = searchbar.closest('form');
      if (!form) return;

      const cursorStart = searchbar.selectionStart;
      const cursorEnd = searchbar.selectionEnd;
      const value = searchbar.value;

      const minChars = typeof settings.liveSearchMinChars === 'number' ? settings.liveSearchMinChars : 3;
      const debounceMs = typeof settings.liveSearchDebounceMs === 'number' ? settings.liveSearchDebounceMs : 300;

      if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);

      // Only perform search if value is empty (to reset/clear search) OR >= minChars
      if (value.length > 0 && value.length < minChars) {
        return;
      }

      searchDebounceTimeout = setTimeout(() => {
        const formData = new FormData(form);
        const params = new URLSearchParams();
        for (const [key, val] of formData.entries()) {
          if (val) params.append(key, val);
        }
        const url = window.location.pathname + '?' + params.toString();

        window.loadAdminPage(url, true, {
          searchbarActive: true,
          cursorStart,
          cursorEnd,
          value
        });
      }, debounceMs);
    });

    document.addEventListener('click', (e) => {
      if (window.location.search.includes('_popup=1') || document.body.classList.contains('popup')) {
        return;
      }

      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      if (href.includes('/logout/') || href.includes('/login/') || href.includes('/password_change/')) {
        return;
      }

      if (link.hostname && link.hostname !== window.location.hostname) {
        return;
      }

      if (
        link.classList.contains('related-lookup') ||
        link.classList.contains('add-another') ||
        link.classList.contains('add-related') ||
        link.classList.contains('change-related') ||
        link.classList.contains('delete-related') ||
        link.classList.contains('related-widget-wrapper-link') ||
        link.getAttribute('data-popup') === 'yes' ||
        href.includes('_popup=1')
      ) {
        return;
      }

      e.preventDefault();
      window.loadAdminPage(link.href);
    });

    document.addEventListener('submit', (e) => {
      if (window.location.search.includes('_popup=1') || document.body.classList.contains('popup')) {
        return;
      }

      const form = e.target;
      if (!form.id || !form.id.endsWith('_form')) {
        form.querySelectorAll('.selector-chosen select').forEach(select => {
          Array.from(select.options).forEach(opt => opt.selected = true);
        });
        return;
      }

      form.querySelectorAll('.selector-chosen select').forEach(select => {
        Array.from(select.options).forEach(opt => {
          opt.selected = true;
        });
      });

      e.preventDefault();
      showProgressBar();

      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      submitButtons.forEach(btn => btn.disabled = true);

      // Clean up extra forms and adjust TOTAL_FORMS for inline formsets
      form.querySelectorAll('.inline-group').forEach(group => {
        const totalFormsInput = group.querySelector('input[name$="-TOTAL_FORMS"]');
        if (totalFormsInput) {
          // Count only non-hidden rows (original ones)
          const rows = group.querySelectorAll('tbody tr:not(.hidden)');
          totalFormsInput.value = rows.length;
          
          // Remove the hidden extra rows completely from the DOM so they aren't submitted
          group.querySelectorAll('tr.hidden').forEach(r => r.remove());
        }
      });

      const formData = new FormData(form);
      const clickedBtn = form._clickedSubmitButton;
      if (clickedBtn && clickedBtn.name) {
        formData.append(clickedBtn.name, clickedBtn.value || 'yes');
      }

      fetch(form.action || window.location.href, {
        method: 'POST',
        body: formData
      })
      .then(res => {
        if (!res.ok) throw new Error('Submission failed');
        return res.text().then(html => ({ url: res.url, html }));
      })
      .then(({ url, html }) => {
        hideProgressBar();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const errorBanner = doc.querySelector('.p-4.bg-red-50, .bg-red-50');
        const errorLists = doc.querySelectorAll('.errorlist');

        if (errorBanner || errorLists.length > 0) {
          submitButtons.forEach(btn => btn.disabled = false);

          const newForm = doc.querySelector('form[id$="_form"]');
          if (newForm) {
            form.replaceWith(newForm);
          }

          if (typeof window.reinitializePageComponents === 'function') {
            window.reinitializePageComponents();
          }

          if (typeof window.showToastsFromDocument === 'function') {
            window.showToastsFromDocument(doc);
          }

          const contentStart = document.getElementById('content-start');
          if (contentStart) {
            contentStart.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          if (typeof window.showToastsFromDocument === 'function') {
            window.showToastsFromDocument(doc);
          }
          const newContentStart = doc.getElementById('content-start');
          const currentContentStart = document.getElementById('content-start');
          if (newContentStart && currentContentStart) {
            const externalScripts = [
              ...Array.from(doc.querySelectorAll('head script[src]')),
              ...Array.from(newContentStart.querySelectorAll('script[src]'))
            ];

            loadScriptsSequentially(externalScripts).then(() => {
              currentContentStart.innerHTML = newContentStart.innerHTML;

              currentContentStart.querySelectorAll('script:not([src])').forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
              });

              window.dispatchEvent(new Event('DOMContentLoaded'));
              window.dispatchEvent(new Event('load'));

              if (doc.title) {
                document.title = doc.title;
              }

              const newSidebar = doc.getElementById('nav-sidebar') || doc.querySelector('.nav-sidebar');
              const currentSidebar = document.getElementById('nav-sidebar') || document.querySelector('.nav-sidebar');
              if (newSidebar && currentSidebar) {
                currentSidebar.innerHTML = newSidebar.innerHTML;
              }

              window.history.pushState({ pjax: true, url: url }, '', url);

              if (typeof window.reinitializePageComponents === 'function') {
                window.reinitializePageComponents();
              }
            }).catch(err => {
              console.error('Post-submit script loading error, falling back:', err);
              window.location.href = url;
            });
          } else {
            window.location.href = url;
          }
        }
      })
      .catch(err => {
        console.error('Change form AJAX error:', err);
        submitButtons.forEach(btn => btn.disabled = false);
        hideProgressBar();
      });
    });

    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.pjax) {
        window.loadAdminPage(e.state.url, false);
      } else if (e.state && e.state.url) {
        window.loadAdminPage(e.state.url, false);
      } else {
        window.loadAdminPage(window.location.href, false);
      }
    });
  });
})();
