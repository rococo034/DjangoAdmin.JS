(function() {
  function parseDateToISO(val) {
    if (!val) return '';
    val = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }
    
    const match = val.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
    if (match) {
      let day = parseInt(match[1], 10);
      let month = parseInt(match[2], 10);
      const year = match[3];
      
      const lang = document.documentElement.lang || 'en';
      const isUS = lang.startsWith('en') && !lang.startsWith('en-gb') && !lang.startsWith('en-ca') && !lang.startsWith('en-au');
      
      if (isUS) {
        if (day > 12) {
          const temp = day;
          day = month;
          month = temp;
        }
      } else {
        if (month > 12) {
          const temp = day;
          day = month;
          month = temp;
        }
      }
      
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    
    return '';
  }

  function parseTimeToISO(val) {
    if (!val) return '';
    val = val.trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(val)) {
      return val;
    }
    const ampmMatch = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.m\.|p\.m\.|am|pm)?$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = ampmMatch[2];
      const seconds = ampmMatch[3] || '00';
      const ampm = ampmMatch[4] ? ampmMatch[4].toLowerCase() : '';
      
      if (ampm.includes('p') && hours < 12) {
        hours += 12;
      } else if (ampm.includes('a') && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
    }
    return val;
  }

  window.convertDateTimeInputs = function() {
    document.querySelectorAll('input.vDateField:not([type="date"])').forEach(input => {
      const origValue = input.value;
      if (origValue) {
        const isoValue = parseDateToISO(origValue);
        if (isoValue) {
          input.value = isoValue;
        }
      }
      input.type = 'date';
      input.classList.add('max-w-[150px]');
    });
    
    document.querySelectorAll('input.vTimeField:not([type="time"])').forEach(input => {
      const origValue = input.value;
      if (origValue) {
        const isoValue = parseTimeToISO(origValue);
        if (isoValue) {
          input.value = isoValue;
        }
      }
      input.type = 'time';
      input.classList.add('max-w-[120px]');
    });
    
    document.querySelectorAll('.datetimeshortcuts').forEach(el => {
      el.style.display = 'none';
    });
  };
})();
