import { check, type Update } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";

export type UpdateStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; version: string; update: Update }
  | { state: "downloading"; progress: number }
  | { state: "ready" }
  | { state: "up-to-date" }
  | { state: "error"; message: string };

export async function getCurrentVersion(): Promise<string> {
  return getVersion();
}

export async function checkForAppUpdate(): Promise<UpdateStatus> {
  try {
    const update = await check();

    if (update) {
      return {
        state: "available",
        version: update.version,
        update,
      };
    }

    return { state: "up-to-date" };
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
