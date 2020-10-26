(() => {
  const { el, formatDuration, formatTimerTime, getStart, Store } = window._app;

  const startTime = getStart();

  if (startTime) {
    el.start.hidden = true;

    function writeTimer() {
      el.timer.textContent = formatTimerTime(new Date().getTime() - startTime);
    }

    writeTimer();

    window._app.timerInterval = setInterval(writeTimer, 1000);
  } else {
    el.stop.hidden = true;
    clearInterval(window._app.timerInterval);
  }

  el.start.addEventListener("click", (event) => {
    event.target.href += "?start=" + new Date().getTime();
  });

  el.stop.addEventListener("click", () => {
    const stop = new Date().getTime();
    const start = getStart();

    Store.setData([
      ...Store.getData(),
      {
        start,
        stop,
        rating: 1,
      },
    ]);
  });

  el.clear.addEventListener('click', () => {
    Store.setData([])
  })

  function changeRating(stop, rating) {
    const data = Store.getData();
    const next = data.map((entry) => {
      if (entry.stop == stop) {
        return {
          ...entry,
          rating,
        };
      }
      return entry;
    });

    Store.setData(next);
  }

  function deleteEntry(stop) {
    const data = Store.getData();
    const next = data.filter((entry) => entry.stop != stop);

    Store.setData(next);
  }

  function renderRecord() {
    const reverseChron = Store.getData().reverse();
    el.record.innerHTML = "";

    if (reverseChron.length > 0) {
      el.clear.removeAttribute('hidden')
      el.description.hidden = true;
      el.table.removeAttribute('hidden')
    }

    reverseChron.forEach((entry, i) => {
      const last = reverseChron[i + 1];
      const start = parseInt(entry.start);
      const stop = parseInt(entry.stop);

      const row = document.createElement("tr");
      el.record.appendChild(row);

      const ratingCell = document.createElement("td");
      const select = document.createElement("select");
      select.setAttribute("aria-label", "rating");
      select.dataset.rating = entry.rating;
      select.addEventListener("change", (event) => {
        select.dataset.rating = event.target.value;
        changeRating(stop, event.target.value);
      });

      for (let i = 1; i <= 3; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = "⚡️".repeat(i);
        option.selected = i == entry.rating;
        select.appendChild(option);
      }

      ratingCell.appendChild(select);
      row.appendChild(ratingCell);

      const startCell = document.createElement("td");
      const startDate = new Date(start);
      const h = startDate.getHours();
      startCell.textContent = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(
        startDate.getMinutes()
      ).padStart(2, "0")}${h > 11 ? "pm" : "am"}`;
      row.appendChild(startCell);

      const lengthCell = document.createElement("td");
      lengthCell.textContent = formatDuration(stop - start);
      row.appendChild(lengthCell);

      const frequencyCell = document.createElement("td");
      frequencyCell.textContent = last
        ? formatDuration(start - parseInt(last.start))
        : "First";
      row.appendChild(frequencyCell);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "🗑";
      deleteButton.setAttribute('aria-label', 'Delete')
      deleteButton.classList.add('button--ghost')
      deleteButton.addEventListener("click", () => {
        deleteEntry(stop);
        renderRecord();
      });
      deleteCell.appendChild(deleteButton);
      row.appendChild(deleteCell);
    });
  }

  renderRecord();
})();
