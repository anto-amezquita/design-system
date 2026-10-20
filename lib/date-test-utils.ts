/**
 * The full date label a Calendar day cell carries, built with the same Intl
 * options the component uses. Tests compare against this instead of a literal
 * like 'Thursday 22 October 2026', because whether there's a comma after the
 * weekday depends on the browser's ICU data: Chromium builds disagree, so a
 * literal passes on one machine and fails in CI.
 */
export function fullDate(year: number, month: number, day: number, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}
