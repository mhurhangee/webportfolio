// Helper function to format time remaining
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} minutes`;
  } else if (seconds < 86400) {
    return `${Math.ceil(seconds / 3600)} hours`;
  } else {
    return `${Math.ceil(seconds / 86400)} days`;
  }
}
