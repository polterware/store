import type { OpsBridge } from "../../../electron/shared/ops-api";

export function getOpsBridge(): OpsBridge | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.ops ?? null;
}

export function isOpsDesktop(): boolean {
  return getOpsBridge() !== null;
}
