
import { useEffect, useState } from "react";
import Card from "../common/Card.jsx";

function getTimestampMilliseconds(timestamp) {
  if (typeof timestamp?.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (typeof timestamp?.seconds === "number") {
    return timestamp.seconds * 1000;
  }

  return timestamp instanceof Date ? timestamp.getTime() : null;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Timer({ minutes = 15, startedAt, status = "waiting" }) {
  const durationSeconds = Math.max(0, Number(minutes) || 15) * 60;
  const startedAtMilliseconds = getTimestampMilliseconds(startedAt);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  useEffect(() => {
    if (status !== "live") {
      setRemainingSeconds(status === "ended" ? 0 : durationSeconds);
      return undefined;
    }

    if (startedAtMilliseconds === null) {
      setRemainingSeconds(null);
      return undefined;
    }

    function updateRemainingTime() {
      const endTime = startedAtMilliseconds + durationSeconds * 1000;
      setRemainingSeconds(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    }

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationSeconds, startedAtMilliseconds, status]);

  const timeLabel = remainingSeconds === null ? "--:--" : formatTime(remainingSeconds);
  const description = status === "ended"
    ? "Session ended"
    : status !== "live"
      ? "Waiting to start"
      : remainingSeconds === null
        ? "Starting timer..."
        : remainingSeconds === 0
          ? "Time is up"
          : "Time remaining";

  return (
    <Card className="space-y-4 p-6 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Timer</p>
      <p
        className="text-5xl font-semibold text-white"
        role="timer"
        aria-label={remainingSeconds === null ? "Timer starting" : `${timeLabel} ${description.toLowerCase()}`}
      >
        {timeLabel}
      </p>
      <p className="text-sm text-slate-400">{description}</p>
    </Card>
  );
}
