/**
 * Option lists for the salon profile form: supported countries and currencies,
 * plus the timezone list from the Intl API. Labels are localised with
 * `Intl.DisplayNames` so no translation keys are needed for 30+ countries.
 */

/** ISO-3166 alpha-2 codes offered in the country select (EU/EEA + common markets). */
export const COUNTRY_CODES = [
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "US",
  "CA",
  "AU",
  "VN",
] as const;

/** ISO-4217 currencies supported by the payment providers of this platform. */
export const CURRENCY_CODES = [
  "EUR",
  "GBP",
  "CHF",
  "USD",
  "CAD",
  "AUD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "ISK",
  "VND",
] as const;

/** `{ value, label }` items for a Base UI Select. */
export interface SelectOption {
  value: string;
  label: string;
}

/** Country options with names in the UI locale. */
export function countryOptions(locale: string): SelectOption[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code })).sort(
    (a, b) => a.label.localeCompare(b.label, locale)
  );
}

/** Currency options ("EUR — Euro") in the UI locale. */
export function currencyOptions(locale: string): SelectOption[] {
  const names = new Intl.DisplayNames([locale], { type: "currency" });
  return CURRENCY_CODES.map((code) => ({
    value: code,
    label: `${code} — ${names.of(code) ?? code}`,
  }));
}

/** Every IANA timezone the browser knows, as select options. */
export function timezoneOptions(): SelectOption[] {
  return Intl.supportedValuesOf("timeZone").map((zone) => ({ value: zone, label: zone }));
}
