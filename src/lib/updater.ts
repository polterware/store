import { getOpsBridge } from "@/lib/desktop/ops-bridge";
import type {
  UpdaterCheckResult,
  UpdaterStatusEvent,
} from "../../electron/shared/ops-api";

export type UpdateStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "downloading"; progress: number }
  | { state: "ready" }
  | { state: "up-to-date" }
  | { state: "error"; message: string };

function toUpdateStatus(status: UpdaterStatusEvent | UpdaterCheckResult): UpdateStatus {
  if (status.state === "available") {
    return {
      state: "available",
      version: status.version,
    };
  }

  return status;
}

export async function getCurrentVersion(): Promise<string> {
  const bridge = getOpsBridge();
  if (!bridge) {
    return "0.0.0";
  }

  return bridge.app.getVersion();
}

export async function checkForAppUpdate(): Promise<UpdateStatus> {
  const bridge = getOpsBridge();
  if (!bridge) {
    return {
      state: "error",
      message: "Update checks require the desktop app.",
    };
  }

  try {
    return toUpdateStatus(await bridge.updater.check());
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function downloadAndInstallAppUpdate(): Promise<UpdateStatus> {
  const bridge = getOpsBridge();
  if (!bridge) {
    return {
      state: "error",
      message: "Update installation requires the desktop app.",
    };
  }

  try {
    return toUpdateStatus(await bridge.updater.downloadAndInstall());
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export function subscribeToAppUpdateStatus(
  listener: (status: UpdateStatus) => void,
): () => void {
  const bridge = getOpsBridge();
  if (!bridge) {
    return () => {};
  }

  return bridge.updater.onStatus((status) => {
    listener(toUpdateStatus(status));
  });
}
