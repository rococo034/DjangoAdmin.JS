class DjangoAdminJS {
  static ALERT_SEVERITY = {
    INFO: 'info',
    SUCCESS: 'success',
    WARN: 'warning',
    ERROR: 'error'
  };

  static showAlert(message, severity, duration = 5000) {
    if (!severity) {
      severity = DjangoAdminJS.ALERT_SEVERITY.INFO;
    }
    // 1. Get or create toast-container
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-2 right-2 z-[99999] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0';
      document.body.appendChild(toastContainer);
    }

    // 2. Create the toast element
    const toast = document.createElement('div');
    toast.className = 'django-toast pointer-events-auto flex items-start p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ease-out transform translate-x-[120%] opacity-0';
    toast.setAttribute('data-duration', duration);

    // Apply severity specific styles and icons
    let severityClass = '';
    let iconSvg = '';
    let closeBtnClass = '';
    let linkClass = '';

    const sev = (severity || '').toLowerCase();

    if (sev === 'success') {
      severityClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/20';
      iconSvg = '<svg class="w-5 h-5 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
      closeBtnClass = 'text-emerald-500/80 hover:text-emerald-700 dark:text-emerald-400/80 dark:hover:text-emerald-300';
      linkClass = '[&_a]:text-emerald-700 dark:[&_a]:text-emerald-400';
    } else if (sev === 'warning' || sev === 'warn') {
      severityClass = 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 dark:bg-amber-950/20';
      iconSvg = '<svg class="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
      closeBtnClass = 'text-amber-500/80 hover:text-amber-700 dark:text-amber-400/80 dark:hover:text-amber-300';
      linkClass = '[&_a]:text-amber-700 dark:[&_a]:text-amber-400';
    } else if (sev === 'error') {
      severityClass = 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300 dark:bg-red-950/20';
      iconSvg = '<svg class="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
      closeBtnClass = 'text-red-500/80 hover:text-red-700 dark:text-red-400/80 dark:hover:text-red-300';
      linkClass = '[&_a]:text-red-700 dark:[&_a]:text-red-400';
    } else { // info / default
      severityClass = 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300 dark:bg-blue-950/20';
      iconSvg = '<svg class="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
      closeBtnClass = 'text-blue-500/80 hover:text-blue-700 dark:text-blue-400/80 dark:hover:text-blue-300';
      linkClass = '[&_a]:text-blue-700 dark:[&_a]:text-blue-400';
    }

    toast.className += ' ' + severityClass;

    toast.innerHTML = `
      <div class="mr-3 mt-0.5 shrink-0">
        ${iconSvg}
      </div>
      <div class="flex-1 text-sm font-medium pr-2 leading-5 ${linkClass} [&_a]:font-bold [&_a]:underline hover:[&_a]:opacity-80">
        ${message}
      </div>
      <button type="button" class="close-toast-btn ml-3 transition-colors duration-150 cursor-pointer shrink-0 ${closeBtnClass}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    `;

    toastContainer.appendChild(toast);

    // Call animateToast from toast.js if available
    if (typeof window.animateToast === 'function') {
      window.animateToast(toast);
    } else {
      // Fallback in case toast.js is not loaded
      setTimeout(() => {
        toast.classList.remove('translate-x-[120%]', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
      }, 50);

      let dismissTimeout = setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-[120%]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, duration);

      const closeBtn = toast.querySelector('.close-toast-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          clearTimeout(dismissTimeout);
          toast.classList.remove('translate-x-0', 'opacity-100');
          toast.classList.add('translate-x-[120%]', 'opacity-0');
          setTimeout(() => toast.remove(), 300);
        });
      }
    }
  }
}

window.DjangoAdminJS = DjangoAdminJS;
