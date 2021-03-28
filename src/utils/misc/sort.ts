// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
/** Sort an array in-place in a human-friendly manner. */
export function localeSort(arr: any[]): void {
  arr.sort((a, b) => a.localeCompare(b, undefined, {
    sensitivity: "base",
    numeric: true
  }));
}

/**
 * Sorting function that pushes nullish to the end of the array.
 *
 * @param key - The property of T to sort by.
 * @param human - Whether or not to use a human-friendly locale sort for
 *   string values.
*/
export const keyedNullSort = <T>(key: keyof T, human?: boolean) => (a: T, b: T, sortOrder?: "ascend" | "descend" | null): number => {
  // We effectively reverse the sort twice when sorting in 'descend' mode, as
  // ant-design will internally reverse the array, but we always want to push
  // nullish values to the end.
  const va = sortOrder === "descend" ? b[key] : a[key];
  const vb = sortOrder === "descend" ? a[key] : b[key];

  // Push nullish values to the end
  if (va === vb) return 0;
  if (va === undefined || va === null) return 1;
  if (vb === undefined || vb === null) return -1;

  if (typeof va === "string" && typeof vb === "string") {
    // Use localeCompare for strings
    const ret = va.localeCompare(vb, undefined, human ? {
      sensitivity: "base",
      numeric: true
    } : undefined);
    return sortOrder === "descend" ? -ret : ret;
  } else {
    // Use the built-in comparison for everything else (mainly numbers)
    return sortOrder === "descend"
      ? (vb as any) - (va as any)
      : (va as any) - (vb as any);
  }
};
