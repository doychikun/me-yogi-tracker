import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  validatePhoneNumberLength,
} from "libphonenumber-js/min";

export const DEFAULT_COUNTRY = "BG";

const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const countryName = (iso) => {
  try {
    return regionNames?.of(iso) || iso;
  } catch {
    return iso;
  }
};

// Every country libphonenumber knows, sorted by name, e.g.
// { iso: "BG", name: "Bulgaria", dialCode: "+359" }
export const COUNTRIES = getCountries()
  .map((iso) => ({
    iso,
    name: countryName(iso),
    dialCode: `+${getCountryCallingCode(iso)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const findCountry = (iso) =>
  COUNTRIES.find((country) => country.iso === iso) ||
  COUNTRIES.find((country) => country.iso === DEFAULT_COUNTRY);

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

// Loose check: only the number of digits is validated, per country, so people
// aren't blocked by a fixed "10 digits" rule. Returns an error message or null.
export const phoneError = (national, iso) => {
  const raw = String(national ?? "").trim();
  if (!raw) return null;
  if (/[^\d\s\-().]/.test(raw)) {
    return "Use digits only (spaces and dashes are fine).";
  }
  const reason = validatePhoneNumberLength(digitsOnly(raw), iso);
  if (reason === "TOO_SHORT") return "This number looks too short.";
  if (reason === "TOO_LONG") return "This number looks too long.";
  if (reason) return "Please check the phone number.";
  return null;
};

// Builds the stored value, e.g. ("BG", "0888 123 456") -> "+359 888123456".
// A leading trunk 0 is dropped the way the country dials it from abroad.
export const formatPhone = (iso, national) => {
  const digits = digitsOnly(national);
  if (!digits) return "";
  try {
    const parsed = parsePhoneNumber(digits, iso);
    return `+${parsed.countryCallingCode} ${parsed.nationalNumber}`;
  } catch {
    return `${findCountry(iso).dialCode} ${digits}`;
  }
};

// Splits a stored value back into its parts for editing. Older profiles hold a
// bare number like "0888123456" with no country, so those keep the saved
// country (or the default) and the number exactly as it was typed.
export const splitPhone = (stored, savedIso) => {
  const value = String(stored ?? "").trim();
  if (value.startsWith("+")) {
    try {
      const parsed = parsePhoneNumber(value);
      const savedMatches =
        savedIso && getCountryCallingCode(savedIso) === parsed.countryCallingCode;
      return {
        iso: savedMatches ? savedIso : parsed.country || DEFAULT_COUNTRY,
        national: parsed.nationalNumber,
      };
    } catch {
      // fall through to the plain-number case
    }
  }
  return { iso: savedIso || DEFAULT_COUNTRY, national: value };
};
