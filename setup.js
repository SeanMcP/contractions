(() => {
  const Store = {
    KEY: "contraction",
    getData() {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    },
    setData(data) {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    },
  };

  function getTimeParts(ms) {
    let h,
      m,
      s;
    h = Math.floor(ms / 1000 / 60 / 60);
    m = Math.floor((ms / 1000 / 60 / 60 - h) * 60);
    s = Math.floor(((ms / 1000 / 60 / 60 - h) * 60 - m) * 60);

    return { h, m, s }
  }

  function formatDuration(ms) {
    const { h, m, s } = getTimeParts(ms)

    if (h) return `${h}h ${m}m`
    if (m) return `${m}m ${s}s`
    return `${s}s`
  }

  function formatTimerTime(ms) {
    const { h, m, s } = getTimeParts(ms)
    let output = ''

    if (h) output += h + ":";
    output += String(m).padStart(2, "0");
    output += ":";
    output += String(s).padStart(2, "0");

    return output;
  }

  function getStart() {
    return new URLSearchParams(window.location.search).get("start");
  }

  window._app = {
    el: {
      clear: document.getElementById('clear'),
      description: document.getElementById('description'),
      record: document.getElementById('record'),
      start: document.getElementById('start'),
      stop: document.getElementById('stop'),
      table: document.getElementById('table'),
      timer: document.getElementById('timer')
    },
    formatDuration,
    formatTimerTime,
    getStart,
    Store,
    timerInterval: null,
  };
})();
