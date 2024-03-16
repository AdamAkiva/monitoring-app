/**
 * Generics allows for VSCode type completion
 * The compare disregard case (more formally known as case-insensitive compare)
 * @returns 0 if s1 and s2 are lexicographic equal.
 * A negative value if s1 is lexicographic less than s2.
 * A positive value if s1 is lexicographic greater than s2.
 */
export const strcasecmp = <T extends string>(s1: T, s2: T) => {
  return s1.localeCompare(s2, undefined, {
    sensitivity: 'accent'
  });
};

export const filterNullAndUndefined = <T>(
  value?: T | null | undefined
): value is T => {
  return value != null;
};

export const isProductionMode = (env?: string) => {
  return env === 'production';
};
