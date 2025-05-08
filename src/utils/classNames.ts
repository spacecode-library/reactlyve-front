/**
 * Concatenates multiple class names, filtering out falsy values.
 *
 * @param classes - Array or list of class name strings, which can include undefined or falsy values
 * @returns A string of concatenated class names
 *
 * @example
 * // Returns "btn btn-primary"
 * classNames('btn', 'btn-primary');
 *
 * @example
 * // Returns "btn btn-large"
 * classNames('btn', isError ? 'btn-error' : null, isLarge && 'btn-large');
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
  }