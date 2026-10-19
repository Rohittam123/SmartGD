import { formatDistanceToNow } from "date-fns";

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name = "User") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(timestamp) {
  if (!timestamp) {
    return "Just now";
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return formatDistanceToNow(date, {
    addSuffix: true
  });
}

export function createRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function calculateAverage(numbers = []) {
  if (!numbers.length) {
    return 0;
  }

  return Math.round(numbers.reduce((sum, value) => sum + Number(value || 0), 0) / numbers.length);
}

export function sanitizeText(text = "") {
  return text.trim().replace(/[<>]/g, "");
}
