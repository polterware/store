import type { OpsBridge } from "../../electron/shared/ops-api";

declare global {
  interface Window {
    ops?: OpsBridge;
  }
}

export {};
