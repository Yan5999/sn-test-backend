export type Unit =
  | 'Years'
  | 'Year'
  | 'Yrs'
  | 'Yr'
  | 'Y'
  | 'Weeks'
  | 'Week'
  | 'W'
  | 'Days'
  | 'Day'
  | 'D'
  | 'Hours'
  | 'Hour'
  | 'Hrs'
  | 'Hr'
  | 'H'
  | 'Minutes'
  | 'Minute'
  | 'Mins'
  | 'Min'
  | 'M'
  | 'Seconds'
  | 'Second'
  | 'Secs'
  | 'Sec'
  | 'S'
  | 'Milliseconds'
  | 'Millisecond'
  | 'Msecs'
  | 'Msec'
  | 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

export type StringValue =
  `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;

interface Options {
  /** Set to `true` to use long formats (e.g. "60 minutes" instead of "60m") */
  readonly long?: boolean;
}

const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * @param val - The string or number to convert
 * @param options - Options for the conversion
 * @returns The converted value
 */
export function ms(val: StringValue, options?: Options): number;
export function ms(val: number, options?: Options): string;
export function ms(
  val: StringValue | number,
  options?: Options,
): string | number {
  try {
    if (typeof val === 'string' && val.length > 0 && val.length < 100) {
      return parse(val);
    }
    if (typeof val === 'number' && isFinite(val)) {
      return options?.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      'Value provided to ms() must be a string or a finite number.',
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.message} [Error thrown from ms]`
        : 'An unknown error occured in ms().';
    throw new Error(message);
  }
}

/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str: string): number {
  if (str.length > 100) {
    throw new Error(
      'Value provided to ms() must be a string with length less than 100.',
    );
  }

  const match =
    /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str,
    );

  if (!match || !match.groups) {
    return NaN;
  }

  const value = parseFloat(match.groups.value);
  const type = (match.groups.type || 'ms').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return value * y;
    case 'weeks':
    case 'week':
    case 'w':
      return value * w;
    case 'days':
    case 'day':
    case 'd':
      return value * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return value * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return value * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return value * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return value;
    default:
      return NaN;
  }
}

/**
 * Short format for `ms`.
 */
function fmtShort(ms: number): string {
  const msAbs = Math.abs(ms);
  if (msAbs >= d) return `${Math.round(ms / d)}d`;
  if (msAbs >= h) return `${Math.round(ms / h)}h`;
  if (msAbs >= m) return `${Math.round(ms / m)}m`;
  if (msAbs >= s) return `${Math.round(ms / s)}s`;
  return `${ms}ms`;
}

/**
 * Long format for `ms`.
 */
function fmtLong(ms: number): string {
  const msAbs = Math.abs(ms);
  if (msAbs >= d) return plural(ms, msAbs, d, 'day');
  if (msAbs >= h) return plural(ms, msAbs, h, 'hour');
  if (msAbs >= m) return plural(ms, msAbs, m, 'minute');
  if (msAbs >= s) return plural(ms, msAbs, s, 'second');
  return `${ms} ms`;
}

/**
 * Pluralization helper.
 */
function plural(ms: number, msAbs: number, n: number, name: string): string {
  const isPlural = msAbs >= n * 1.5;
  return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}

export default ms;
