// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Relative time (e.g. "2 hours ago")
export const timeAgo = (dateString) => {
  if (!dateString) return "—";
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

// Get initials from full name
export const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Format GPA
export const formatGpa = (gpa) => {
  if (gpa === null || gpa === undefined) return "0.00";
  return parseFloat(gpa).toFixed(2);
};

// Get grade points label
export const getGradeLabel = (grade) => {
  const map = {
    A: "4.0",
    B: "3.0",
    C: "2.0",
    D: "1.0",
    F: "0.0",
    I: "Inc",
    W: "W/D",
  };
  return map[grade] || "—";
};

// Truncate long text
export const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

// Get available seats color
export const getSeatsBadgeClass = (available, total) => {
  const pct = (available / total) * 100;
  if (available === 0) return "badge-red";
  if (pct <= 20) return "badge-amber";
  return "badge-green";
};
