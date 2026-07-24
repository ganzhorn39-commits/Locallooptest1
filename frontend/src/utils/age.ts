// Compute age (whole years) from an ISO birthdate string "YYYY-MM-DD".
export function getAge(birthdate?: string | null): number | null {
  if (!birthdate) return null;
  const d = new Date(birthdate + (birthdate.length <= 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export const isMinor = (birthdate?: string | null): boolean => {
  const a = getAge(birthdate);
  return a !== null && a < 18;
};
