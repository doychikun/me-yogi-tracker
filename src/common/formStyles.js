// Shared look for the account forms (join, login, profile edit):
// soft rounded fields with the site's lavender focus and a gold call to action.
export const LAVENDER = "#9494B6";
export const GOLD = "#F8C55C";
export const INK = "#272727";

export const fieldsSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    "&:hover fieldset": { borderColor: LAVENDER },
    "&.Mui-focused fieldset": { borderColor: LAVENDER },
  },
  "& label.Mui-focused": { color: LAVENDER },
};

export const primaryButtonSx = {
  backgroundColor: GOLD,
  color: INK,
  borderRadius: "999px",
  padding: "12px 24px",
  fontWeight: 700,
  letterSpacing: "1px",
  boxShadow: "0 6px 18px rgba(248, 197, 92, 0.35)",
  "&:hover": { backgroundColor: LAVENDER, color: "#fff", boxShadow: "none" },
};

export const secondaryButtonSx = {
  color: INK,
  borderColor: GOLD,
  borderRadius: "999px",
  padding: "11px 24px",
  fontWeight: 700,
  letterSpacing: "1px",
  "&:hover": { borderColor: LAVENDER, color: LAVENDER, backgroundColor: "#F9FAF4" },
};

export const TOAST_OPTIONS = { position: "top-center", autoClose: 3000 };
