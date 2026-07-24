(function() {
  window.dismissToast = function(toast) {
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-[120%]', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  };

  window.animateToast = function(toast, idx = 0) {
    setTimeout(() => {
      toast.classList.remove('translate-x-[120%]', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    }, 150 * idx);

    const duration = parseInt(toast.getAttribute('data-duration')) || 5000;
    let dismissTimeout = setTimeout(() => {
      window.dismissToast(toast);
    }, duration + (150 * idx));

    const closeBtn = toast.querySelector('.close-toast-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        window.dismissToast(toast);
      });
    }
  };

  window.showToastsFromDocument = function(sourceDoc) {
    const newToasts = sourceDoc.querySelectorAll('.django-toast');
    const newToastContainer = sourceDoc.querySelector('#toast-container');
    if (newToastContainer) {
      newToastContainer.remove();
    }
    if (newToasts.length > 0) {
      let toastContainer = document.getElementById('toast-container');
      if (toastContainer && toastContainer.closest('#content-start')) {
        document.body.appendChild(toastContainer);
      }
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-2 right-2 z-[99999] flex flex-col items-end gap-2 w-full max-w-full pointer-events-none px-4 sm:px-0';
        document.body.appendChild(toastContainer);
      }
      newToasts.forEach((toast, idx) => {
        toast.classList.add('w-full', 'max-w-sm');
        toastContainer.appendChild(toast);
        window.animateToast(toast, idx);
      });
    }
  };

  window.showCustomToast = function(message, type = 'info', duration = 8000, extraClass = '') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-2 right-2 z-[99999] flex flex-col items-end gap-2 w-full max-w-full pointer-events-none px-4 sm:px-0';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `django-toast pointer-events-auto flex items-start p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ease-out transform translate-x-[120%] opacity-0 w-full ${extraClass || 'max-w-sm'}`;
    toast.setAttribute('data-duration', duration);

    let colors = '';
    let svgIcon = '';
    if (type === 'error') {
      colors = 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300 dark:bg-red-950/20';
      svgIcon = '<svg class="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    } else if (type === 'success') {
      colors = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/20';
      svgIcon = '<svg class="w-5 h-5 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    } else {
      colors = 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300 dark:bg-blue-950/20';
      svgIcon = '<svg class="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    }
    toast.className += ` ${colors}`;

    const textLinkColors = type === 'error' ? '[&_a]:text-red-700 dark:[&_a]:text-red-400' : (type === 'success' ? '[&_a]:text-emerald-700 dark:[&_a]:text-emerald-400' : '[&_a]:text-blue-700 dark:[&_a]:text-blue-400');
    
    toast.innerHTML = `
      <div class="mr-3 mt-0.5 shrink-0">${svgIcon}</div>
      <div class="flex-1 min-w-0 text-sm font-medium pr-2 leading-5 ${textLinkColors} [&_a]:font-bold [&_a]:underline hover:[&_a]:opacity-80">${message}</div>
      <button type="button" class="close-toast-btn ml-3 transition-colors duration-150 cursor-pointer shrink-0 ${type === 'error' ? 'text-red-500/80 hover:text-red-700 dark:text-red-400/80 dark:hover:text-red-300' : (type === 'success' ? 'text-emerald-500/80 hover:text-emerald-700 dark:text-emerald-400/80 dark:hover:text-emerald-300' : 'text-blue-500/80 hover:text-blue-700 dark:text-blue-400/80 dark:hover:text-blue-300')}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    `;

    toastContainer.appendChild(toast);
    window.animateToast(toast);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const initialToastContainer = document.getElementById('toast-container');
    if (initialToastContainer) {
      document.body.appendChild(initialToastContainer);
    }
    const toasts = document.querySelectorAll('.django-toast');
    toasts.forEach((toast, idx) => {
      window.animateToast(toast, idx);
    });
  });
})();
