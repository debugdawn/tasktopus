document.addEventListener("DOMContentLoaded", function () {
  const calendarDays = document.getElementById("calendar-days");
  const monthYear = document.getElementById("month-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const eventList = document.getElementById("event-list");
  const toggleFormBtn = document.getElementById("toggle-form");
  const eventForm = document.getElementById("event-form");
  const eventTitleInput = document.getElementById("event-title");
  const eventDescInput = document.getElementById("event-desc");
  const eventDueDateInput = document.getElementById("event-due-date");
  const eventPrioritySelect = document.getElementById("event-priority");
  const selectedDateTitle = document.getElementById("selected-date-title");
  const closeEventFormBtn = document.getElementById("close-event-form");
  const formSubmitBtn = document.getElementById("form-submit-btn");

  const viewAllTasksBtn = document.getElementById("view-all-tasks-btn");
  const sortBySelect = document.getElementById("sort-by");

  const recurrenceTypeSelect = document.getElementById("event-recurrence-type");
  const recurrenceDailyOptions = document.getElementById(
    "recurrence-daily-options"
  );
  const dailyIntervalInput = document.getElementById("daily-interval");
  const recurrenceWeeklyOptions = document.getElementById(
    "recurrence-weekly-options"
  );
  const weeklyIntervalInput = document.getElementById("weekly-interval");
  const weeklyDayCheckboxes = document.querySelectorAll(
    '#recurrence-weekly-options input[type="checkbox"]'
  );
  const recurrenceMonthlyOptions = document.getElementById(
    "recurrence-monthly-options"
  );
  const monthlyTypeSelect = document.getElementById("monthly-type");
  const monthlyDayOfMonthDiv = document.getElementById("monthly-day-of-month");
  const monthlyDayInput = document.getElementById("monthly-day-input");
  const monthlyDayOfWeekDiv = document.getElementById("monthly-day-of-week");
  const monthlyWeekNumberSelect = document.getElementById(
    "monthly-week-number"
  );
  const monthlyDayOfWeekDaySelect = document.getElementById(
    "monthly-day-of-week-day"
  );
  const monthlyIntervalInput = document.getElementById("monthly-interval");
  const recurrenceYearlyOptions = document.getElementById(
    "recurrence-yearly-options"
  );
  const yearlyIntervalInput = document.getElementById("yearly-interval");
  const yearlyMonthSelect = document.getElementById("yearly-month-select");
  const yearlyDayInput = document.getElementById("yearly-day-input");

  const recurrenceEndDateOptions = document.getElementById(
    "recurrence-end-date-options"
  );
  const recurrenceEndTypeSelect = document.getElementById(
    "recurrence-end-type"
  );
  const recurrenceEndOnDateInput = document.getElementById(
    "recurrence-end-on-date"
  );
  const recurrenceEndAfterOccurrencesInput = document.getElementById(
    "recurrence-end-after-occurrences"
  );
  const recurrenceEndAfterOccurrencesLabel = document.getElementById(
    "recurrence-end-after-occurrences-label"
  );

  const miniCalendarDropdown = document.getElementById(
    "mini-calendar-dropdown"
  );
  const miniPrevNav = document.getElementById("mini-prev-nav");
  const miniNextNav = document.getElementById("mini-next-nav");
  const miniCurrentDisplay = document.getElementById("mini-current-display");
  const miniCalendarGrid = document.getElementById("mini-calendar-grid");

  let currentDate = new Date();
  let displayedYear = currentDate.getFullYear();
  let displayedMonth = currentDate.getMonth();
  let selectedDate = new Date().toISOString().split("T")[0];

  let miniCalendarView = "month";

  let miniDisplayedYear = currentDate.getFullYear();
  let miniDisplayedMonth = currentDate.getMonth();

  let events = {};
  let currentView = "daily";
  let currentSort = "dueDate";

  let isEditing = false;
  let editingTask = null;

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateString) {
    if (!dateString) return "No due date";

    const today = formatDate(new Date());
    const tomorrowDate = new Date();
    tomorrowDate.setDate(new Date().getDate() + 1);
    const tomorrow = formatDate(tomorrowDate);

    if (dateString === today) {
      return "Today";
    } else if (dateString === tomorrow) {
      return "Tomorrow";
    } else {
      const date = new Date(dateString + "T00:00:00");
      const day = date.getDate();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = monthNames[date.getMonth()];

      let daySuffix;
      if (day > 3 && day < 21) daySuffix = "th";
      else {
        switch (day % 10) {
          case 1:
            daySuffix = "st";
            break;
          case 2:
            daySuffix = "nd";
            break;
          case 3:
            daySuffix = "rd";
            break;
          default:
            daySuffix = "th";
        }
      }

      const displayYearCheck = new Date().getFullYear();
      if (date.getFullYear() !== displayYearCheck) {
        return `${day}${daySuffix} ${month} ${date.getFullYear()}`;
      } else {
        return `${day}${daySuffix} ${month}`;
      }
    }
  }

  function renderHeader() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    monthYear.textContent = `${monthNames[displayedMonth]} ${displayedYear}`;
  }

  function renderCalendar() {
    calendarDays.innerHTML = "";

    const firstDay = new Date(displayedYear, displayedMonth, 1).getDay();
    const lastDate = new Date(displayedYear, displayedMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.classList.add("empty");
      calendarDays.appendChild(emptyDiv);
    }

    for (let date = 1; date <= lastDate; date++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = date;

      const fullDate = formatDate(
        new Date(displayedYear, displayedMonth, date)
      );
      dayDiv.dataset.date = fullDate;

      if (fullDate === formatDate(new Date())) {
        dayDiv.classList.add("curr-date");
      }

      if (currentView === "daily" && fullDate === selectedDate) {
        dayDiv.classList.add("selected-date");
      } else {
        dayDiv.classList.remove("selected-date");
      }

      const eventsForDate = getTasksForDate(fullDate);
      if (eventsForDate.length > 0) {
        dayDiv.style.fontWeight = "bold";
        dayDiv.style.color = "#3f51b5";
        dayDiv.style.backgroundColor = "#e0e7ff";
      } else {
        dayDiv.style.fontWeight = "";
        dayDiv.style.color = "";
        dayDiv.style.backgroundColor = "";
      }

      dayDiv.addEventListener("click", () => {
        selectedDate = fullDate;
        currentView = "daily";
        renderCalendar();
        renderEvents();
        hideForm();
      });

      calendarDays.appendChild(dayDiv);
    }
  }

  function renderEvents() {
    eventList.innerHTML = "";
    let eventsToDisplay = [];

    if (currentView === "daily") {
      selectedDateTitle.textContent = `Events on ${formatDisplayDate(
        selectedDate
      )}`;
      eventsToDisplay = getTasksForDate(selectedDate);
      sortBySelect.style.display = "none";
      document.querySelector(
        '.view-controls label[for="sort-by"]'
      ).style.display = "none";
    } else {
      selectedDateTitle.textContent = "All Tasks";
      eventsToDisplay = getAllTasks();
      eventsToDisplay = sortTasks(eventsToDisplay, currentSort);
      sortBySelect.style.display = "block";
      document.querySelector(
        '.view-controls label[for="sort-by"]'
      ).style.display = "block";
    }

    if (eventsToDisplay.length === 0) {
      eventList.innerHTML = "<p class='no-events'>No tasks for this date.</p>";
      if (currentView === "all") {
        eventList.innerHTML = "<p class='no-events'>No tasks found.</p>";
      }
      return;
    }

    eventsToDisplay.forEach((event) => {
      const eventDiv = document.createElement("div");
      eventDiv.classList.add("event");
      if (event.completed) eventDiv.classList.add("completed");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("event-content");

      const title = document.createElement("h4");
      title.innerHTML = `📝 ${event.title}`;
      contentDiv.appendChild(title);

      if (event.description) {
        const desc = document.createElement("p");
        desc.textContent = event.description;
        contentDiv.appendChild(desc);
      }

      const dueDatePara = document.createElement("p");
      dueDatePara.innerHTML = `📅 Due: ${formatDisplayDate(event.dueDate)}`;
      contentDiv.appendChild(dueDatePara);

      // Display recurrence info if it's a recurring task
      if (event.recurrence && event.recurrence.type !== "none") {
        const recurrenceInfo = document.createElement("p");
        let recurrenceText = `🔁 Repeats: ${event.recurrence.type}`;
        if (event.recurrence.type === "daily") {
          recurrenceText += ` every ${event.recurrence.interval} day(s)`;
        } else if (event.recurrence.type === "weekly") {
          const days = event.recurrence.days
            .map((d) => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d])
            .join(", ");
          recurrenceText += ` every ${event.recurrence.interval} week(s) on ${days}`;
        } else if (event.recurrence.type === "monthly") {
          if (event.recurrence.monthlyType === "dayOfMonth") {
            recurrenceText += ` on day ${event.recurrence.dayOfMonth} every ${event.recurrence.interval} month(s)`;
          } else if (event.recurrence.monthlyType === "dayOfWeek") {
            const weekNum = ["First", "Second", "Third", "Fourth", "Last"][
              event.recurrence.weekNumber - 1
            ];
            const dayName = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ][event.recurrence.dayOfWeek];
            recurrenceText += ` on the ${weekNum} ${dayName} every ${event.recurrence.interval} month(s)`;
          }
        } else if (event.recurrence.type === "yearly") {
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const monthName = monthNames[event.recurrence.month];
          recurrenceText += ` on ${monthName} ${event.recurrence.dayOfMonth} every ${event.recurrence.interval} year(s)`;
        }

        if (event.recurrence.endType === "onDate") {
          recurrenceText += ` until ${formatDisplayDate(
            event.recurrence.endDate
          )}`;
        } else if (event.recurrence.endType === "afterOccurrences") {
          recurrenceText += ` for ${event.recurrence.occurrences} occurrences`;
        }
        recurrenceInfo.innerHTML = recurrenceText;
        contentDiv.appendChild(recurrenceInfo);
      }

      const priority = document.createElement("p");
      let priorityEmoji = "";
      if (event.priority === "High") priorityEmoji = "🔥";
      else if (event.priority === "Medium") priorityEmoji = "⏳";
      else if (event.priority === "Low") priorityEmoji = "✨";
      priority.innerHTML = `<span class="priority-label">${priorityEmoji} ${event.priority} Priority</span>`;
      contentDiv.appendChild(priority);

      eventDiv.appendChild(contentDiv);

      const actionsDiv = document.createElement("div");
      actionsDiv.classList.add("event-actions");

      const completeBtn = document.createElement("span");
      completeBtn.classList.add("action-emoji");
      completeBtn.textContent = event.completed ? "🔄" : "✓";
      completeBtn.title = event.completed
        ? "Mark as Incomplete"
        : "Mark as Complete";
      completeBtn.addEventListener("click", () =>
        toggleTaskCompletion(event.id)
      );
      actionsDiv.appendChild(completeBtn);

      const editBtn = document.createElement("span");
      editBtn.classList.add("action-emoji");
      editBtn.textContent = "✏️";
      editBtn.title = "Edit Task";
      editBtn.addEventListener("click", () => editTask(event.id));
      actionsDiv.appendChild(editBtn);

      const deleteBtn = document.createElement("span");
      deleteBtn.classList.add("action-emoji");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete Task";
      deleteBtn.addEventListener("click", () =>
        deleteTask(event.id, event.dueDate)
      );
      actionsDiv.appendChild(deleteBtn);

      eventDiv.appendChild(actionsDiv);
      eventList.appendChild(eventDiv);
    });
  }

  function calculateRecurrenceDates(event) {
    const startDate = new Date(event.dueDate + "T00:00:00");
    const recurringDates = [];
    const MAX_RECURRENCES = 365 * 5;

    if (event.recurrence.type === "none") {
      recurringDates.push(event.dueDate);
      return recurringDates;
    }

    let currentDateIterator = new Date(startDate);
    let occurrencesCount = 0;

    while (true) {
      const formattedDate = formatDate(currentDateIterator);
      if (
        event.recurrence.endType === "onDate" &&
        new Date(formattedDate) > new Date(event.recurrence.endDate)
      ) {
        break;
      }
      if (
        event.recurrence.endType === "afterOccurrences" &&
        occurrencesCount >= event.recurrence.occurrences
      ) {
        break;
      }
      if (occurrencesCount >= MAX_RECURRENCES) {
        console.warn("Max recurrences reached for event:", event);
        break;
      }

      let shouldAdd = false;
      if (event.recurrence.type === "daily") {
        shouldAdd = true;
      } else if (event.recurrence.type === "weekly") {
        const dayOfWeek = currentDateIterator.getDay();
        if (event.recurrence.days.includes(dayOfWeek)) {
          shouldAdd = true;
        }
      } else if (event.recurrence.type === "monthly") {
        if (event.recurrence.monthlyType === "dayOfMonth") {
          if (currentDateIterator.getDate() === event.recurrence.dayOfMonth) {
            shouldAdd = true;
          }
        } else if (event.recurrence.monthlyType === "dayOfWeek") {
          const monthDate = currentDateIterator.getDate();
          const dayOfWeek = currentDateIterator.getDay();
          const weekOfMonth = Math.floor((monthDate - 1) / 7) + 1;
          if (event.recurrence.weekNumber === 5) {
            const nextWeekDate = new Date(currentDateIterator);
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);
            if (
              nextWeekDate.getMonth() !== currentDateIterator.getMonth() &&
              dayOfWeek === event.recurrence.dayOfWeek
            ) {
              shouldAdd = true;
            }
          } else if (
            weekOfMonth === event.recurrence.weekNumber &&
            dayOfWeek === event.recurrence.dayOfWeek
          ) {
            shouldAdd = true;
          }
        }
      } else if (event.recurrence.type === "yearly") {
        if (
          currentDateIterator.getMonth() === event.recurrence.month &&
          currentDateIterator.getDate() === event.recurrence.dayOfMonth
        ) {
          shouldAdd = true;
        }
      }

      if (shouldAdd) {
        recurringDates.push(formattedDate);
        occurrencesCount++;
      }

      if (event.recurrence.type === "daily") {
        currentDateIterator.setDate(
          currentDateIterator.getDate() + event.recurrence.interval
        );
      } else if (event.recurrence.type === "weekly") {
        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
        if (
          currentDateIterator.getDay() === 0 &&
          currentDateIterator.getDate() !== startDate.getDate()
        ) {
          const daysToAdd = (event.recurrence.interval - 1) * 7;
          currentDateIterator.setDate(
            currentDateIterator.getDate() + daysToAdd
          );
        }
      } else if (event.recurrence.type === "monthly") {
        if (event.recurrence.monthlyType === "dayOfMonth") {
          currentDateIterator.setMonth(
            currentDateIterator.getMonth() + event.recurrence.interval
          );
          if (currentDateIterator.getDate() !== event.recurrence.dayOfMonth) {
            currentDateIterator.setDate(0);
            currentDateIterator.setDate(event.recurrence.dayOfMonth);
          }
        } else if (event.recurrence.monthlyType === "dayOfWeek") {
          currentDateIterator.setDate(currentDateIterator.getDate() + 1);
          const currentMonth = currentDateIterator.getMonth();
          const currentYear = currentDateIterator.getFullYear();
          const daysInMonth = new Date(
            currentYear,
            currentMonth + 1,
            0
          ).getDate();
          if (currentDateIterator.getDate() > daysInMonth) {
            currentDateIterator.setMonth(
              currentDateIterator.getMonth() + event.recurrence.interval
            );
            currentDateIterator.setDate(1);
          }

          let targetDate = new Date(
            currentDateIterator.getFullYear(),
            currentDateIterator.getMonth(),
            1
          );
          let count = 0;
          while (count < event.recurrence.weekNumber) {
            while (
              targetDate.getDay() !== event.recurrence.dayOfWeek &&
              targetDate.getMonth() === currentDateIterator.getMonth()
            ) {
              targetDate.setDate(targetDate.getDate() + 1);
            }
            if (targetDate.getMonth() !== currentDateIterator.getMonth()) break;
            count++;
            if (count < event.recurrence.weekNumber) {
              targetDate.setDate(targetDate.getDate() + 7);
            }
          }
          currentDateIterator = targetDate;
        }
      } else if (event.recurrence.type === "yearly") {
        currentDateIterator.setFullYear(
          currentDateIterator.getFullYear() + event.recurrence.interval
        );
        currentDateIterator.setMonth(event.recurrence.month);
        currentDateIterator.setDate(event.recurrence.dayOfMonth);
      }
    }
    return recurringDates;
  }

  function getAllTasks() {
    let allTasks = [];
    for (const date in events) {
      events[date].forEach((event) => {
        if (event.recurrence && event.recurrence.type !== "none") {
          const recurrenceDates = calculateRecurrenceDates(event);
          recurrenceDates.forEach((rDate) => {
            allTasks.push({
              ...event,
              dueDate: rDate,
              id: event.id + "_" + rDate,
            });
          });
        } else {
          allTasks.push(event);
        }
      });
    }

    const uniqueTasks = [];
    const seenTaskIds = new Set();
    allTasks.forEach((task) => {
      if (!seenTaskIds.has(task.id)) {
        uniqueTasks.push(task);
        seenTaskIds.add(task.id);
      }
    });
    return uniqueTasks;
  }

  function getTasksForDate(dateString) {
    const dailyTasks = events[dateString] || [];
    let recurringTasksForDate = [];

    for (const date in events) {
      events[date].forEach((event) => {
        if (event.recurrence && event.recurrence.type !== "none") {
          const recurrenceDates = calculateRecurrenceDates(event);
          if (recurrenceDates.includes(dateString)) {
            recurringTasksForDate.push({
              ...event,
              dueDate: dateString,
              id: event.id + "_" + dateString,
            });
          }
        }
      });
    }
    const combinedTasks = [...dailyTasks, ...recurringTasksForDate];
    const uniqueTasks = [];
    const seenTaskIds = new Set();
    combinedTasks.forEach((task) => {
      if (!seenTaskIds.has(task.id)) {
        uniqueTasks.push(task);
        seenTaskIds.add(task.id);
      }
    });
    return uniqueTasks;
  }

  function sortTasks(tasks, sortType) {
    return tasks.sort((a, b) => {
      if (sortType === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortType === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortType === "status") {
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      }
      return 0;
    });
  }

  function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  function loadEvents() {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      events = JSON.parse(storedEvents);
    }
  }

  function toggleTaskCompletion(taskId) {
    let found = false;
    for (const date in events) {
      events[date] = events[date].map((event) => {
        if (event.id === taskId) {
          found = true;
          return { ...event, completed: !event.completed };
        }
        if (
          taskId.startsWith(event.id + "_") &&
          taskId.endsWith(event.dueDate)
        ) {
          found = true;
          return { ...event, completed: !event.completed };
        }
        return event;
      });
      if (found) break;
    }
    saveEvents();
    renderCalendar();
    renderEvents();
  }

  function deleteTask(taskId, taskDueDate) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    let originalTaskId = taskId;
    if (taskId.includes("_")) {
      originalTaskId = taskId.substring(0, taskId.lastIndexOf("_"));
    }

    if (events[taskDueDate]) {
      events[taskDueDate] = events[taskDueDate].filter(
        (event) => event.id !== originalTaskId
      );
      if (events[taskDueDate].length === 0) {
        delete events[taskDueDate];
      }
    }
    saveEvents();
    renderCalendar();
    renderEvents();
  }

  function showForm(editMode = false, task = null) {
    eventForm.style.display = "flex";
    toggleFormBtn.textContent = "Close Form";
    formSubmitBtn.textContent = editMode ? "Save Changes" : "➕ Add Task";
    isEditing = editMode;
    editingTask = task;

    if (editMode && task) {
      eventTitleInput.value = task.title;
      eventDescInput.value = task.description || "";
      eventDueDateInput.value = task.dueDate;
      eventPrioritySelect.value = task.priority;

      const recurrence = task.recurrence || { type: "none" };
      recurrenceTypeSelect.value = recurrence.type;
      showRecurrenceOptions();

      if (recurrence.type === "daily") {
        dailyIntervalInput.value = recurrence.interval || 1;
      } else if (recurrence.type === "weekly") {
        weeklyIntervalInput.value = recurrence.interval || 1;
        weeklyDayCheckboxes.forEach((cb) => {
          cb.checked =
            recurrence.days && recurrence.days.includes(parseInt(cb.value));
        });
      } else if (recurrence.type === "monthly") {
        monthlyTypeSelect.value = recurrence.monthlyType || "dayOfMonth";
        monthlyDayInput.value =
          recurrence.dayOfMonth || new Date(task.dueDate).getDate();
        monthlyWeekNumberSelect.value = recurrence.weekNumber || 1;
        monthlyDayOfWeekDaySelect.value =
          recurrence.dayOfWeek || new Date(task.dueDate).getDay();
        monthlyIntervalInput.value = recurrence.interval || 1;
        toggleMonthlyOptions();
      } else if (recurrence.type === "yearly") {
        yearlyIntervalInput.value = recurrence.interval || 1;
        yearlyMonthSelect.value =
          recurrence.month || new Date(task.dueDate).getMonth();
        yearlyDayInput.value =
          recurrence.dayOfMonth || new Date(task.dueDate).getDate();
      }

      const endRecurrence = recurrence;
      recurrenceEndTypeSelect.value = endRecurrence.endType || "never";
      if (endRecurrence.endType === "onDate") {
        recurrenceEndOnDateInput.value = endRecurrence.endDate || "";
      } else if (endRecurrence.endType === "afterOccurrences") {
        recurrenceEndAfterOccurrencesInput.value =
          endRecurrence.occurrences || 1;
      }
      showRecurrenceEndOptions();
    } else {
      eventTitleInput.value = "";
      eventDescInput.value = "";
      eventDueDateInput.value = selectedDate;
      eventPrioritySelect.value = "Medium";
      recurrenceTypeSelect.value = "none";
      dailyIntervalInput.value = 1;
      weeklyIntervalInput.value = 1;
      weeklyDayCheckboxes.forEach((cb) => (cb.checked = false));
      monthlyTypeSelect.value = "dayOfMonth";
      monthlyDayInput.value = 1;
      monthlyWeekNumberSelect.value = 1;
      monthlyDayOfWeekDaySelect.value = 0;
      monthlyIntervalInput.value = 1;
      yearlyIntervalInput.value = 1;
      yearlyMonthSelect.value = 0;
      yearlyDayInput.value = 1;
      recurrenceEndTypeSelect.value = "never";
      recurrenceEndOnDateInput.value = "";
      recurrenceEndAfterOccurrencesInput.value = 1;
      showRecurrenceOptions();
      showRecurrenceEndOptions();
    }
  }

  function hideForm() {
    eventForm.style.display = "none";
    toggleFormBtn.textContent = "Add Task";
    isEditing = false;
    editingTask = null;
  }

  toggleFormBtn.addEventListener("click", () => {
    if (eventForm.style.display === "flex") {
      hideForm();
    } else {
      showForm();
    }
  });

  closeEventFormBtn.addEventListener("click", hideForm);

  eventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = eventTitleInput.value.trim();
    const description = eventDescInput.value.trim();
    const dueDate = eventDueDateInput.value;
    const priority = eventPrioritySelect.value;
    const recurrenceType = recurrenceTypeSelect.value;

    if (!title || !dueDate) {
      alert("Please enter a task title and due date.");
      return;
    }

    let recurrence = { type: recurrenceType };
    if (recurrenceType === "daily") {
      recurrence.interval = parseInt(dailyIntervalInput.value);
    } else if (recurrenceType === "weekly") {
      recurrence.interval = parseInt(weeklyIntervalInput.value);
      recurrence.days = Array.from(weeklyDayCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => parseInt(cb.value));
      if (recurrence.days.length === 0) {
        alert("Please select at least one day for weekly recurrence.");
        return;
      }
    } else if (recurrenceType === "monthly") {
      recurrence.interval = parseInt(monthlyIntervalInput.value);
      recurrence.monthlyType = monthlyTypeSelect.value;
      if (recurrence.monthlyType === "dayOfMonth") {
        recurrence.dayOfMonth = parseInt(monthlyDayInput.value);
      } else if (recurrence.monthlyType === "dayOfWeek") {
        recurrence.weekNumber = parseInt(monthlyWeekNumberSelect.value);
        recurrence.dayOfWeek = parseInt(monthlyDayOfWeekDaySelect.value);
      }
    } else if (recurrenceType === "yearly") {
      recurrence.interval = parseInt(yearlyIntervalInput.value);
      recurrence.month = parseInt(yearlyMonthSelect.value);
      recurrence.dayOfMonth = parseInt(yearlyDayInput.value);
    }

    const recurrenceEndType = recurrenceEndTypeSelect.value;
    recurrence.endType = recurrenceEndType;
    if (recurrenceEndType === "onDate") {
      recurrence.endDate = recurrenceEndOnDateInput.value;
      if (!recurrence.endDate) {
        alert("Please select an end date for recurrence.");
        return;
      }
    } else if (recurrenceEndType === "afterOccurrences") {
      recurrence.occurrences = parseInt(
        recurrenceEndAfterOccurrencesInput.value
      );
      if (isNaN(recurrence.occurrences) || recurrence.occurrences <= 0) {
        alert("Please enter a valid number of occurrences.");
        return;
      }
    }

    if (isEditing && editingTask) {
      for (const dateKey in events) {
        events[dateKey] = events[dateKey].map((task) => {
          if (task.id === editingTask.id) {
            return {
              ...task,
              title: title,
              description: description,
              dueDate: dueDate,
              priority: priority,
              recurrence: recurrence,
            };
          }
          return task;
        });
      }
      if (editingTask.dueDate !== dueDate) {
        events[editingTask.dueDate] = events[editingTask.dueDate].filter(
          (task) => task.id !== editingTask.id
        );
        if (events[editingTask.dueDate].length === 0) {
          delete events[editingTask.dueDate];
        }
        if (!events[dueDate]) {
          events[dueDate] = [];
        }
        events[dueDate].push({
          id: editingTask.id,
          title: title,
          description: description,
          dueDate: dueDate,
          priority: priority,
          completed: editingTask.completed,
          recurrence: recurrence,
        });
      }
    } else {
      if (!events[dueDate]) {
        events[dueDate] = [];
      }
      events[dueDate].push({
        id: Date.now().toString(),
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        completed: false,
        recurrence: recurrence,
      });
    }

    saveEvents();
    hideForm();
    renderCalendar();
    renderEvents();
  });

  function editTask(taskId) {
    let taskToEdit = null;
    let originalTaskId = taskId;
    if (taskId.includes("_")) {
      originalTaskId = taskId.substring(0, taskId.lastIndexOf("_"));
    }

    for (const dateKey in events) {
      const foundTask = events[dateKey].find(
        (event) => event.id === originalTaskId
      );
      if (foundTask) {
        taskToEdit = foundTask;
        break;
      }
    }

    if (taskToEdit) {
      showForm(true, taskToEdit);
    } else {
      console.error("Task not found for editing:", taskId);
    }
  }

  function showRecurrenceOptions() {
    recurrenceDailyOptions.style.display = "none";
    recurrenceWeeklyOptions.style.display = "none";
    recurrenceMonthlyOptions.style.display = "none";
    recurrenceYearlyOptions.style.display = "none";
    recurrenceEndDateOptions.style.display = "none";

    if (recurrenceTypeSelect.value === "daily") {
      recurrenceDailyOptions.style.display = "flex";
      recurrenceEndDateOptions.style.display = "flex";
    } else if (recurrenceTypeSelect.value === "weekly") {
      recurrenceWeeklyOptions.style.display = "flex";
      recurrenceEndDateOptions.style.display = "flex";
    } else if (recurrenceTypeSelect.value === "monthly") {
      recurrenceMonthlyOptions.style.display = "flex";
      toggleMonthlyOptions();
      recurrenceEndDateOptions.style.display = "flex";
    } else if (recurrenceTypeSelect.value === "yearly") {
      recurrenceYearlyOptions.style.display = "flex";
      recurrenceEndDateOptions.style.display = "flex";
    }
  }

  function toggleMonthlyOptions() {
    if (monthlyTypeSelect.value === "dayOfMonth") {
      monthlyDayOfMonthDiv.style.display = "block";
      monthlyDayOfWeekDiv.style.display = "none";
    } else {
      monthlyDayOfMonthDiv.style.display = "none";
      monthlyDayOfWeekDiv.style.display = "block";
    }
  }

  function showRecurrenceEndOptions() {
    recurrenceEndOnDateInput.style.display = "none";
    recurrenceEndAfterOccurrencesInput.style.display = "none";
    recurrenceEndAfterOccurrencesLabel.style.display = "none";

    if (recurrenceEndTypeSelect.value === "onDate") {
      recurrenceEndOnDateInput.style.display = "block";
    } else if (recurrenceEndTypeSelect.value === "afterOccurrences") {
      recurrenceEndAfterOccurrencesInput.style.display = "block";
      recurrenceEndAfterOccurrencesLabel.style.display = "inline";
    }
  }

  recurrenceTypeSelect.addEventListener("change", showRecurrenceOptions);
  monthlyTypeSelect.addEventListener("change", toggleMonthlyOptions);
  recurrenceEndTypeSelect.addEventListener("change", showRecurrenceEndOptions);

  showRecurrenceOptions();

  prevMonthBtn.addEventListener("click", () => {
    displayedMonth--;
    if (displayedMonth < 0) {
      displayedMonth = 11;
      displayedYear--;
    }
    renderHeader();
    renderCalendar();
    renderEvents();
  });

  nextMonthBtn.addEventListener("click", () => {
    displayedMonth++;
    if (displayedMonth > 11) {
      displayedMonth = 0;
      displayedYear++;
    }
    renderHeader();
    renderCalendar();
    renderEvents();
  });

  viewAllTasksBtn.addEventListener("click", () => {
    currentView = "all";
    renderEvents();
    document.querySelectorAll(".calendar-days div").forEach((day) => {
      day.classList.remove("selected-date");
    });
    hideForm();
  });

  sortBySelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderEvents();
  });

  //Mini-Calendar Logic
  function renderMiniCalendar() {
    miniCalendarGrid.innerHTML = "";
    miniCalendarGrid.className = "mini-calendar-grid";

    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    if (miniCalendarView === "month") {
      miniCurrentDisplay.textContent = `${monthNamesShort[miniDisplayedMonth]} ${miniDisplayedYear}`;
      miniCalendarGrid.classList.add("month-view");

      const firstDay = new Date(
        miniDisplayedYear,
        miniDisplayedMonth,
        1
      ).getDay();
      const lastDate = new Date(
        miniDisplayedYear,
        miniDisplayedMonth + 1,
        0
      ).getDate();

      const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      weekDaysShort.forEach((day) => {
        const div = document.createElement("div");
        div.classList.add("day-label");
        div.textContent = day;
        miniCalendarGrid.appendChild(div);
      });

      for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("inactive");
        miniCalendarGrid.appendChild(emptyDiv);
      }

      for (let date = 1; date <= lastDate; date++) {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = date;
        dayDiv.classList.add("date-cell");

        const fullDate = formatDate(
          new Date(miniDisplayedYear, miniDisplayedMonth, date)
        );

        if (fullDate === formatDate(new Date())) {
          dayDiv.classList.add("current-year-month");
        }
        if (fullDate === selectedDate) {
          dayDiv.classList.add("selected-month");
        }

        dayDiv.addEventListener("click", () => {
          selectedDate = fullDate;
          displayedYear = miniDisplayedYear;
          displayedMonth = miniDisplayedMonth;
          currentView = "daily";
          renderHeader();
          renderCalendar();
          renderEvents();
          miniCalendarDropdown.style.display = "none";
        });
        miniCalendarGrid.appendChild(dayDiv);
      }
    } else if (miniCalendarView === "year") {
      miniCurrentDisplay.textContent = miniDisplayedYear;
      miniCalendarGrid.classList.add("month-picker");

      monthNamesShort.forEach((month, index) => {
        const monthDiv = document.createElement("div");
        monthDiv.textContent = month;
        monthDiv.classList.add("month-cell");

        if (
          miniDisplayedYear === new Date().getFullYear() &&
          index === new Date().getMonth()
        ) {
          monthDiv.classList.add("current-year-month");
        }
        if (miniDisplayedYear === displayedYear && index === displayedMonth) {
          monthDiv.classList.add("selected-month");
        }

        monthDiv.addEventListener("click", () => {
          miniDisplayedMonth = index;
          miniCalendarView = "month";
          renderMiniCalendar();
        });
        miniCalendarGrid.appendChild(monthDiv);
      });
    } else if (miniCalendarView === "decade") {
      const startYear = Math.floor(miniDisplayedYear / 10) * 10;
      const endYear = startYear + 9;
      miniCurrentDisplay.textContent = `${startYear} - ${endYear}`;
      miniCalendarGrid.classList.add("year-picker");

      for (let i = -1; i <= 10; i++) {
        const year = startYear + i;
        const yearDiv = document.createElement("div");
        yearDiv.textContent = year;
        yearDiv.classList.add("year-cell");

        if (i === -1 || i === 10) {
          yearDiv.classList.add("inactive");
        }

        if (year === new Date().getFullYear()) {
          yearDiv.classList.add("current-year-month");
        }
        if (year === displayedYear) {
          yearDiv.classList.add("selected-month");
        }

        yearDiv.addEventListener("click", () => {
          if (i === -1) {
            miniDisplayedYear = startYear - 10;
          } else if (i === 10) {
            miniDisplayedYear = endYear + 1;
          } else {
            miniDisplayedYear = year;
          }
          miniCalendarView = "year";
          renderMiniCalendar();
        });
        miniCalendarGrid.appendChild(yearDiv);
      }
    }
  }

  monthYear.addEventListener("click", (event) => {
    miniCalendarDropdown.style.display =
      miniCalendarDropdown.style.display === "block" ? "none" : "block";
    miniDisplayedYear = displayedYear;
    miniDisplayedMonth = displayedMonth;
    miniCalendarView = "month";
    renderMiniCalendar();
  });

  miniPrevNav.addEventListener("click", (event) => {
    event.stopPropagation();
    if (miniCalendarView === "month") {
      miniDisplayedMonth--;
      if (miniDisplayedMonth < 0) {
        miniDisplayedMonth = 11;
        miniDisplayedYear--;
      }
    } else if (miniCalendarView === "year") {
      miniDisplayedYear--;
    } else if (miniCalendarView === "decade") {
      miniDisplayedYear -= 10;
    }
    renderMiniCalendar();
  });

  miniNextNav.addEventListener("click", (event) => {
    event.stopPropagation();
    if (miniCalendarView === "month") {
      miniDisplayedMonth++;
      if (miniDisplayedMonth > 11) {
        miniDisplayedMonth = 0;
        miniDisplayedYear++;
      }
    } else if (miniCalendarView === "year") {
      miniDisplayedYear++;
    } else if (miniCalendarView === "decade") {
      miniDisplayedYear += 10;
    }
    renderMiniCalendar();
  });

  miniCurrentDisplay.addEventListener("click", (event) => {
    event.stopPropagation();
    if (miniCalendarView === "month") {
      miniCalendarView = "year";
    } else if (miniCalendarView === "year") {
      miniCalendarView = "decade";
    }
    renderMiniCalendar();
  });

  document.addEventListener("click", (event) => {
    if (
      !miniCalendarDropdown.contains(event.target) &&
      event.target !== monthYear
    ) {
      miniCalendarDropdown.style.display = "none";
    }
  });

  loadEvents();
  renderHeader();
  renderCalendar();
  renderEvents();
});
