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
        toastContainer.className = 'fixed top-2 right-2 z-[99999] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0';
        document.body.appendChild(toastContainer);
      }
      newToasts.forEach((toast, idx) => {
        toastContainer.appendChild(toast);
        window.animateToast(toast, idx);
      });
    }
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
