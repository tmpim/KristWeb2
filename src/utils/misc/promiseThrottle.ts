// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Dispatch, SetStateAction } from "react";
import { throttle as lodashThrottle } from "lodash-es";

/**
 * Based on lodash _.throttle, returns a throttled Promise.
 *
 * The original function, `F`, must return a Promise. The throttled function's
 * first parameter is a callback function, `cb`, which will be invoked with the
 * promise returned by `F` when it is actually called. The remaining arguments
 * will be passed directly to `F`.
 *
 * @param fn - The function to be throttled.
 * @param timeout - The timeout of the throttle, in milliseconds.
 * @param trailing - Whether or not to throttle on the trailing edge of the
 *   timeout.
 */
export function throttle<F extends (...args: any) => P, P extends Promise<any>>(fn: F, timeout: number, trailing?: boolean): (cb: (res: P) => void, ...args: Parameters<F>) => void {
  return lodashThrottle((cb: (res: P) => void, ...args: Parameters<F>) => {
    cb(fn(...args));
  }, timeout, { leading: !trailing, trailing });
}

/**
 * Based on lodash _.throttle, returns a function throttled on its trailing
 * edge.
 *
 * The original function, `F`, must return a Promise. The throttled function's
 * arguments will be passed to `F` if/when it is invoked. The parameters
 * `setResult`, `setError`, and `setLoading` can be provided to dispatch React
 * state changes based on the fulfillment of the Promise returned by `F`.
 *
 * @param fn - The function to be throttled.
 * @param timeout - The timeout of the throttle, in milliseconds.
 * @param trailing - Whether or not to throttle on the trailing edge of the
 *   timeout.
 * @param setResult - React setState hook to call if the original function's
 *   Promise resolves.
 * @param setError - React setState hook to call if the original function's
 *   Promise fails.
 * @param setLoading - React setState hook to call when the original function's
 *   Promise settles.
 */
export function trailingThrottleState<F extends (...args: any) => P, P extends Promise<R>, R>(
  fn: F,
  timeout: number,
  trailing?: boolean,
  setResult?: Dispatch<SetStateAction<R>>,
  setError?: Dispatch<SetStateAction<Error | undefined>>,
  setLoading?: Dispatch<SetStateAction<boolean>>
): (...args: Parameters<F>) => void {
  return lodashThrottle((...args: Parameters<F>) => {
    fn(...args)
      .then(r => { if (setResult) setResult(r); })
      .catch(err => { if (setError) setError(err); })
      .finally(() => { if (setLoading) setLoading(false); });
  }, timeout, { leading: !trailing, trailing });
}
