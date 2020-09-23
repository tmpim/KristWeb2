/* eslint-disable react/display-name */
import React, { ReactNode } from "react";

import { ColumnKey } from "./DataProvider";
import { KristValue } from "@components/krist-value/KristValue";

function verify<DataT, T>(key: ColumnKey<DataT>, formatKey: ColumnKey<DataT>, value: DataT): T | undefined {
  const val = value[formatKey];
  if (key !== formatKey) return;
  return val as unknown as T; // I'm sorry
}

export function formatKristValue<T>(key: ColumnKey<T>): ((formatKey: ColumnKey<T>, value: T) => ReactNode) {
  return (formatKey, value) => {
    const val = verify<T, number>(key, formatKey, value);
    return val && <KristValue value={val} />;
  };
}

export function formatNumber<T>(key: ColumnKey<T>): ((formatKey: ColumnKey<T>, value: T) => ReactNode) {
  return (formatKey, value) => {
    const val = verify<T, number>(key, formatKey, value);
    return val && <span>{val.toLocaleString()}</span>;
  };
}

export function formatDateTime<T>(key: ColumnKey<T>): ((formatKey: ColumnKey<T>, value: T) => ReactNode) {
  return (formatKey, value) => {
    const val = verify<T, string>(key, formatKey, value);
    if (!val) return;
    const date = new Date(val);
    return <span title={val}>{date.toLocaleString()}</span>;
  };
}
