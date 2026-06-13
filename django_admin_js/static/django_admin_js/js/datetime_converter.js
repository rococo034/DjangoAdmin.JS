(function() {
  window.convertDateTimeInputs = function() {
    document.querySelectorAll('input.vDateField:not([type="date"])').forEach(input => {
      input.type = 'date';
      input.classList.add('max-w-[150px]');
    });
    document.querySelectorAll('input.vTimeField:not([type="time"])').forEach(input => {
      input.type = 'time';
      input.classList.add('max-w-[120px]');
    });
    document.querySelectorAll('.datetimeshortcuts').forEach(el => {
      el.style.display = 'none';
    });
  };
})();
