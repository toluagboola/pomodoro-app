document.addEventListener("DOMContentLoaded", function () {
  if ("Notification" in window) {
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification(
            "Awesome! You will be notified at the star of each session."
          );
        }
      });
    }
  }
  switchMode("pomodoro");
});

var timer = {
  pomodoro: 1,
  shortBreak: 1,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0,
};

var interval;

var buttonSound = new Audio("button-sound.mp3");
var mainButton = document.querySelector("#js-btn");
mainButton.addEventListener("click", function () {
  buttonSound.play();

  var action = mainButton.dataset.action;
  if (action === "start") {
    startTimer();
  } else {
    stopTimer();
  }
});

var modeButtons = document.querySelector("#js-mode-buttons");
modeButtons.addEventListener("click", handleMode);
function handleMode(event) {
  var mode = event.target.dataset.mode;
  if (!mode) return;
  switchMode(mode);
  stopTimer();
}

function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  document.querySelectorAll("button[data-mode]").forEach(function (e) {
    return e.classList.remove("active");
  });

  document.querySelector('[data-mode="' + mode + '"]').classList.add("active");
  document.body.style.backgroundColor = "var(--" + mode + ")";
  document
    .querySelector("#js-progress")
    .setAttribute("max", timer.remainingTime.total);

  updateClock();
}

function updateClock() {
  var remainingTime = timer.remainingTime;
  var minutes = ("" + remainingTime.minutes).padStart(2, "0");
  var seconds = ("" + remainingTime.seconds).padStart(2, "0");

  var min = document.querySelector("#js-minutes");
  var sec = document.querySelector("#js-seconds");
  min.textContent = minutes;
  sec.textContent = seconds;

  var text = timer.mode === "pomodoro" ? "Get back to work!" : "Take a break!";
  document.title = minutes + ":" + seconds + " \u2014 " + text;

  var progress = document.getElementById("js-progress");
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function startTimer() {
  var total = timer.remainingTime.total;
  var endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === "pomodoro") timer.sessions++;

  mainButton.dataset.action = "stop";
  mainButton.textContent = "stop";
  mainButton.classList.add("active");

  interval = setInterval(function () {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      switch (timer.mode) {
        case "pomodoro":
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode("longBreak");
          } else {
            switchMode("shortBreak");
          }
          break;
        default:
          switchMode("pomodoro");
      }

      if (Notification.permission === "granted") {
        var text =
          timer.mode === "pomodoro" ? "Get back to work!" : "Take a break!";
        new Notification(text);
      }

      document.querySelector('[data-sound="' + timer.mode + '"]').play();
      startTimer();
    }
  }, 1000);
}

function getRemainingTime(endTime) {
  var currentTime = Date.parse(new Date());
  var difference = endTime - currentTime;

  var total = Number.parseInt(difference / 1000, 10);
  var minutes = Number.parseInt((total / 60) % 60, 10);
  var seconds = Number.parseInt(total % 60, 10);

  return {
    total: total,
    minutes: minutes,
    seconds: seconds,
  };
}

function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action = "start";
  mainButton.textContent = "start";
  mainButton.classList.remove("active");
}
