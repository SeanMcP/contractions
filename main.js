(() => {
  const {
    el,
    formatDuration,
    formatTimerTime,
    getStart,
    Store,
    wrapTextContent,
  } = window._app;

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

  el.clear.addEventListener("click", () => {
    Store.setData([]);
  });

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
      el.clear.removeAttribute("hidden");
      el.description.hidden = true;
      el.table.removeAttribute("hidden");
    }

    reverseChron.forEach((entry, i) => {
      const last = reverseChron[i + 1];
      const start = parseInt(entry.start);
      const stop = parseInt(entry.stop);

      const row = document.createElement("tr");
      el.record.appendChild(row);
      const actionsContainer = document.createElement("div");
      actionsContainer.classList.add("actions-container");

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
      wrapTextContent(
        startCell,
        `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(
          startDate.getMinutes()
        ).padStart(2, "0")}${h > 11 ? "pm" : "am"}`
      );
      row.appendChild(startCell);
      const startField = document.createElement("div");
      startField.dataset.fieldEdit = true;

      const newHourInput = document.createElement("input");
      newHourInput.setAttribute("aria-label", "Start hour");
      newHourInput.max = 12;
      newHourInput.min = 1;
      newHourInput.name = "start-h";
      newHourInput.type = "number";
      newHourInput.value = h > 12 ? h - 12 : h === 0 ? 12 : h;
      startField.appendChild(newHourInput);

      const newMinuteInput = document.createElement("input");
      newMinuteInput.setAttribute("aria-label", "Start minute");
      newMinuteInput.max = 59;
      newMinuteInput.min = 0;
      newMinuteInput.name = "start-m";
      newMinuteInput.type = "number";
      newMinuteInput.value = startDate.getMinutes();
      startField.appendChild(newMinuteInput);

      const newMeridemSelect = document.createElement("select");
      newMeridemSelect.setAttribute("aria-label", "Start meridiem");
      newMeridemSelect.name = "start-d";
      newMeridemSelect.innerHTML = `
        <option value="am" ${h < 12 ? "selected" : ""}>AM</option>
        <option value="pm" ${h > 11 ? "selected" : ""}>PM</option>
      `;
      startField.appendChild(newMeridemSelect);

      [newHourInput, newMinuteInput, newMeridemSelect].forEach((node) => {
        node.addEventListener("change", () => {
          if (!row.dataset.changed) {
            row.dataset.changed = true;
          }
        });
      });

      actionsContainer.appendChild(startField);

      const lengthCell = document.createElement("td");
      wrapTextContent(lengthCell, formatDuration(stop - start));
      row.appendChild(lengthCell);

      const lengthInput = document.createElement("input");
      lengthInput.dataset.fieldEdit = true;
      lengthInput.max = 5 * 60;
      lengthInput.min = 1;
      lengthInput.step = 1;
      lengthInput.type = "number";
      lengthInput.value = Math.round((stop - start) / 1000);
      actionsContainer.appendChild(lengthInput);

      const frequencyCell = document.createElement("td");
      frequencyCell.textContent = last
        ? formatDuration(start - parseInt(last.start))
        : "First";
      row.appendChild(frequencyCell);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.dataset.action = "delete";
      deleteButton.textContent = "🗑";
      deleteButton.setAttribute("aria-label", "Delete");
      deleteButton.classList.add("button--ghost");
      deleteButton.addEventListener("click", () => {
        deleteEntry(stop);
        renderRecord();
      });
      actionsContainer.appendChild(deleteButton);
      row.appendChild(deleteCell);

      const editButton = document.createElement("button");
      editButton.setAttribute("aria-label", "Edit record");
      editButton.dataset.action = "edit";
      editButton.textContent = "✏️";
      editButton.addEventListener("click", (event) => {
        event.preventDefault();
        // TODO: Enter Edit mode
        if (row.dataset.editing) return row.removeAttribute('data-editing')
        row.dataset.editing = true;
      });
      deleteCell.appendChild(editButton);

      const saveButton = document.createElement("button");
      saveButton.setAttribute("aria-label", "Save changes");
      saveButton.dataset.action = "save";
      saveButton.textContent = "💾";
      saveButton.addEventListener("click", () => {
        if (!row.dataset.changed) return;

        // TODO: Grab values
        let newHour = parseInt(newHourInput.value),
          newMinutes = parseInt(newMinuteInput.value),
          newLength = parseInt(lengthInput.value);
        if (newHour < 12 && newMeridemSelect.value === "pm") newHour += 12;
        // TODO: Process
        const newStart = new Date(start);
        newStart.setHours(newHour, newMinutes);
        const newStartTime = newStart.getTime();
        const newStopTime = new Date(newStartTime + newLength * 1000).getTime();
        // TODO: Save
        Store.setData(
          Store.getData()
            .map((record) => {
              if (record.start == start) {
                return {
                  ...record,
                  start: newStartTime,
                  stop: newStopTime,
                };
              }
              return record;
            })
            .sort((a, b) => a.start - b.start)
        );

        // TODO: Reload page
        location.reload();
      });
      actionsContainer.appendChild(saveButton);

      const cancelButton = document.createElement("button");
      cancelButton.setAttribute("aria-label", "Cancel editing");
      cancelButton.dataset.action = "cancel";
      cancelButton.textContent = "↪️";
      cancelButton.addEventListener("click", () => {
        // TODO: Exit Edit mode
        // TODO: Reset values?
        // Reloading the page might be easier
        location.reload();
      });

      actionsContainer.appendChild(cancelButton);
      deleteCell.appendChild(actionsContainer);
    });
  }

  renderRecord();
})();
