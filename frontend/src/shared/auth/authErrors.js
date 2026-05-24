export function normalizeAuthError(error) {
  if (!error) return "Something went wrong";

  if (typeof error === "string") return error;

  const message = error?.message || error?.detail;
  if (message) return message;

  const status = error?.status;
  if (status === 401) return "Invalid credentials. Please try again.";
  if (status === 403) return "Your session has expired. Please sign in again.";
  if (status === 429) return "Too many attempts. Please slow down.";

  return "Something went wrong";
}
