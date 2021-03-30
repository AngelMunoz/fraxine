const currencyFormat = new Intl.NumberFormat('default');
const dateFormat = new Intl.DateTimeFormat('default');

export function formatCurrency(
  value: number | bigint,
  options?: { locales: string | string[]; options?: Intl.NumberFormatOptions }
) {
  let format = currencyFormat;
  if (options) {
    format = new Intl.NumberFormat(options.locales, options.options);
  }
  return format.format(value);
}

export function formatDateTime(
  value: Date,
  options?: { locales: string | string[]; options?: Intl.DateTimeFormatOptions }
) {
  let format = dateFormat;
  if (options) {
    format = new Intl.DateTimeFormat(options.locales, options.options);
  }
  return format.format(value);
}
