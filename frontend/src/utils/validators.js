export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function validateRoomPayload(payload) {
  const errors = {};

  if (!payload.topic || payload.topic.trim().length < 5) {
    errors.topic = "Topic must be at least 5 characters.";
  }

  if (!payload.timerMinutes || Number(payload.timerMinutes) < 5) {
    errors.timerMinutes = "Timer must be at least 5 minutes.";
  }

  if (!payload.participantLimit || Number(payload.participantLimit) < 2) {
    errors.participantLimit = "At least 2 participants required.";
  }

  return errors;
}
