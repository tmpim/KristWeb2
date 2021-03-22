// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

// Implementation sourced from:
// https://github.com/developit/workerize-loader/issues/3#issuecomment-393165124

type WorkerType<T> = T & Pick<Worker, "terminate">
export function createWorker<T>(workerPath: T): WorkerType<T> {
  return (workerPath as any)();
}
export type createWorker<T> = WorkerType<T>;
